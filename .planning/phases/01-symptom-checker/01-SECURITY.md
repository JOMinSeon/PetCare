---
phase: 1
slug: symptom-checker
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-21
---

# Phase 1 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| User → symptom-checker page | 사용자가 증상 입력 페이지 접근 | 증상 선택 데이터 (로컬 상태) |
| symptom-checker → AI consultation | 증상 컨텍스트를 `/pets?context=` 파라미터로 전달 | URL 인코딩된 증상 텍스트 |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-01-01 | Information Disclosure | `symptoms-data.ts` | mitigate | 증상/질병 매핑 데이터는 공개的健康情報, 별도 보호 불필요 | closed |
| T-01-02 | Input Validation | `page.tsx` customInput | mitigate | 텍스트 입력은 free-text 필드, 진단 결과에만 사용, XSS防护 via React 기본 이스케이프 | closed |
| T-01-03 | URL Injection | `AIConsultModal.tsx` router.push | mitigate | `encodeURIComponent()` 사용, 증상 이름은 정적 데이터에서 파싱 | closed |
| T-01-04 | Client-Side Only | 전체 Phase 1 | mitigate | 서버 사이드 처리 없음, API routes 없음, 인증/인가 관련 없음 | closed |

*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Cross-Reference: Project SECURITY.md Vulnerabilities

| Vuln ID | Severity | Applies to Phase 1? | Rationale |
|---------|----------|---------------------|-----------|
| CR-01 | Critical | No | `.env.local` — 프로젝트 수준, Phase 1 코드와 무관 |
| HR-01 | High | No | `emr/sync/route.ts` — Phase 1에 해당 API 없음 |
| HR-02 | High | No | `hospitals/search/route.ts` — Phase 1에 해당 API 없음 |
| HR-03 | Medium | Yes (부분) | `layout.tsx` security headers — 모든 페이지에 영향, Phase 1도 포함. 별도 완화 필요. |
| MR-01 | Medium | No | `rate-limit.ts` — Phase 1에 API 호출 없음 |
| MR-02 | Medium | No | `lemonsqueezy/webhook/route.ts` — Phase 1에 해당 API 없음 |
| MR-03 | Medium | No | `emr/sync/route.ts` — Phase 1에 해당 API 없음 |
| LR-01 | Low | No | API routes 없음, 클라이언트 사이드만 |
| LR-02 | Low | No | `hospitals/search/route.ts` — Phase 1에 해당 API 없음 |

**HR-03 (Missing Security Headers) 주의:** Phase 1 페이지는 동일 `layout.tsx`에서 서비스되므로, 프로젝트 수준 문제로 별도 tracking.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| HR-03-01 | HR-03 | Security headers (`layout.tsx`)는 Phase 1이 아닌 프로젝트 전체 문제 — 별도 이슈로 관리 | GSD | 2026-04-21 |

*If none: "No accepted risks."*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-21 | 4 | 4 | 0 | GSD Security Audit |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-21
