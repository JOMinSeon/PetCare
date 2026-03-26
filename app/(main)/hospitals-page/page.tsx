'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HospitalSearch } from '@/components/HospitalSearch';
import { Calendar, Clock, MapPin, Phone, X } from 'lucide-react';

interface Reservation {
  id: string;
  hospital_id: string;
  reservation_date: string;
  reservation_time: string;
  department: string;
  chief_complaint?: string;
  status: string;
  hospital?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  pet?: {
    id: string;
    name: string;
  };
}

function ReservationSkeleton() {
  return (
    <div className="p-4 rounded-xl border animate-pulse" style={{ borderColor: 'var(--color-border)' }}>
      <div className="h-4 w-32 rounded shimmer mb-2" />
      <div className="h-3 w-48 rounded shimmer mb-2" />
      <div className="h-3 w-24 rounded shimmer" />
    </div>
  );
}

export default function HospitalsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'reservations'>('search');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/hospitals/reserve');
      const data = await res.json();
      if (res.ok) {
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm('정말로 이 예약을 취소하시겠습니까?')) return;

    try {
      const res = await fetch('/api/hospitals/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId }),
      });

      if (res.ok) {
        setReservations(prev =>
          prev.map(r => r.id === reservationId ? { ...r, status: 'cancelled' } : r)
        );
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' };
      case 'confirmed': return { bg: 'var(--color-primary-50)', text: 'var(--color-primary-600)' };
      case 'completed': return { bg: 'var(--color-success-bg)', text: 'var(--color-success)' };
      case 'cancelled': return { bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' };
      default: return { bg: 'var(--color-surface-2)', text: 'var(--color-text-muted)' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'confirmed': return '확정';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      <div
        className="px-6 py-5 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl md:max-w-5xl mx-auto">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>동물병원 검색</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            내 주변 제휴 병원을 검색하고 예약을 관리하세요
          </p>
        </div>
      </div>

      <div className="max-w-3xl md:max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === 'search' ? 'var(--color-primary-500)' : 'var(--color-surface)',
              color: activeTab === 'search' ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${activeTab === 'search' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
            }}
          >
            병원 검색
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              background: activeTab === 'reservations' ? 'var(--color-primary-500)' : 'var(--color-surface)',
              color: activeTab === 'reservations' ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${activeTab === 'reservations' ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
            }}
          >
            <Calendar size={16} />
            내 예약
            {reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'search' ? (
          <Suspense fallback={null}>
            <HospitalSearch />
          </Suspense>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <>
                <ReservationSkeleton />
                <ReservationSkeleton />
                <ReservationSkeleton />
              </>
            ) : reservations.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="mx-auto mb-3 text-gray-300" size={40} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  아직 예약 내역이 없습니다
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'var(--color-primary-500)' }}
                >
                  병원 검색하기
                </button>
              </div>
            ) : (
              reservations.map((res) => {
                const colors = getStatusColor(res.status);
                return (
                  <div
                    key={res.id}
                    className="card rounded-xl p-4 space-y-3"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {res.hospital?.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {res.department}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {getStatusLabel(res.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(res.reservation_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {res.reservation_time}
                      </span>
                    </div>

                    {res.chief_complaint && (
                      <p className="text-xs p-2 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                        {res.chief_complaint}
                      </p>
                    )}

                    {res.status === 'pending' || res.status === 'confirmed' ? (
                      <button
                        onClick={() => handleCancel(res.id)}
                        className="w-full py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        예약 취소
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
