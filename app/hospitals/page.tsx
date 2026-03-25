import { Suspense } from 'react';
import { HospitalSearch } from '@/components/HospitalSearch';
import { List, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ view?: string }>;
}

export default async function HospitalsPage({ searchParams }: Props) {
  const params = await searchParams;
  const isMapView = params.view === 'map';

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Link
          href="/hospitals"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
          style={
            isMapView
              ? { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
              : { background: 'var(--color-primary-500)', borderColor: 'transparent', color: '#fff' }
          }
        >
          <List size={16} />
          목록
        </Link>
        <Link
          href="/hospitals?view=map"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
          style={
            isMapView
              ? { background: 'var(--color-primary-500)', borderColor: 'transparent', color: '#fff' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
          }
        >
          <MapIcon size={16} />
          지도
        </Link>
      </div>
      <Suspense fallback={null}>
        <HospitalSearch />
      </Suspense>
    </div>
  );
}