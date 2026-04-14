#!/usr/bin/env node

const { spawn } = require('child_process');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

let server;

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting dev server...\n');
    server = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready in')) {
        console.log('Server ready!\n');
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    setTimeout(() => resolve(), 8000);
  });
}

function stopServer() {
  if (server) {
    server.kill();
    console.log('\nServer stopped.');
  }
}

const tests = [
  {
    name: 'HR-02: SQL ILIKE Injection (special chars)',
    method: 'GET',
    path: '/api/hospitals/search?search=test%25',
    expectStatus: 200,
  },
  {
    name: 'HR-02: SQL ILIKE Injection (underscore wildcard)',
    method: 'GET',
    path: '/api/hospitals/search?search=_test',
    expectStatus: 200,
  },
  {
    name: 'LR-02: Invalid coordinates (lat > 90)',
    method: 'GET',
    path: '/api/hospitals/search?lat=999&lng=127.0',
    expectStatus: 400,
  },
  {
    name: 'LR-02: Invalid coordinates (lng > 180)',
    method: 'GET',
    path: '/api/hospitals/search?lat=37.5&lng=999',
    expectStatus: 400,
  },
  {
    name: 'LR-02: Invalid coordinates (negative out of range)',
    method: 'GET',
    path: '/api/hospitals/search?lat=-91&lng=-181',
    expectStatus: 400,
  },
  {
    name: 'Valid coordinates',
    method: 'GET',
    path: '/api/hospitals/search?lat=37.5&lng=127.0',
    expectStatus: 200,
  },
  {
    name: 'MR-02: Unknown webhook event',
    method: 'POST',
    path: '/api/lemonsqueezy/webhook',
    headers: { 'x-signature': 'test', 'x-event-name': 'unknown_event' },
    body: '{}',
    expectStatus: 400,
  },
  {
    name: 'XSS in search parameter',
    method: 'GET',
    path: '/api/hospitals/search?search=<script>alert(1)</script>',
    expectStatus: 200,
  },
  {
    name: 'SQL injection attempt in search',
    method: 'GET',
    path: "/api/hospitals/search?search='OR'1'='1",
    expectStatus: 200,
  },
  {
    name: 'No auth for EMR sync',
    method: 'POST',
    path: '/api/emr/sync',
    body: JSON.stringify({ hospital_id: 'test' }),
    expectStatus: 401,
  },
];

async function runTest(test) {
  const url = `${BASE_URL}${test.path}`;
  const options = {
    method: test.method,
    headers: {
      'Content-Type': 'application/json',
      ...test.headers,
    },
  };

  if (test.body) {
    options.body = test.body;
  }

  try {
    const response = await fetch(url, options);
    const status = response.status;
    const passed = status === test.expectStatus;

    console.log(`${passed ? '✓' : '✗'} ${test.name}`);
    console.log(`  URL: ${test.method} ${test.path}`);
    console.log(`  Status: ${status} (expected: ${test.expectStatus})`);

    if (!passed) {
      console.log(`  FAILED: Expected ${test.expectStatus}, got ${status}`);
    }

    return passed;
  } catch (error) {
    console.log(`✗ ${test.name}`);
    console.log(`  ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  process.on('exit', () => stopServer());

  await startServer();

  console.log('=== Burp Suite API Security Tests ===\n');
  console.log(`Target: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await runTest(test);
    if (success) passed++;
    else failed++;
    console.log('');
  }

  console.log('=== Summary ===');
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);

  stopServer();
  process.exit(failed > 0 ? 1 : 0);
}

main();
