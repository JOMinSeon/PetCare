'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Phone, Clock, Calendar, X, Map as MapIcon, List } from 'lucide-react';
import { HospitalMap, getCurrentLocation } from './HospitalMap';

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  operating_hours?: Record<string, string>;
  departments?: string[];
  is_24h?: boolean;
  avg_price?: number;
  description?: string;
  image_url?: string;
  distance?: number;
}

interface Props {
  onSelectHospital?: (hospital: Hospital) => void;
}

const DEPARTMENTS = [
  { value: '', label: '전체 진료과목' },
  { value: '내과', label: '내과' },
  { value: '외과', label: '외과' },
  { value: '치과', label: '치과' },
  { value: '안과', label: '안과' },
  { value: '피부과', label: '피부과' },
  { value: '정형외과', label: '정형외과' },
  { value: '신경과', label: '신경과' },
  { value: '응급의학과', label: '응급의학과' },
];

export function HospitalSearch({ onSelectHospital }: Props) {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'list';
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [is24h, setIs24h] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialView);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  const searchHospitals = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (department) params.set('department', department);
      if (is24h) params.set('is24h', 'true');
      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
      }

      const res = await fetch(`/api/hospitals/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '병원 검색에 실패했습니다.');
      }

      setHospitals(data.hospitals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '병원 검색 중 오류가 발생했습니다.');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, is24h]);

  useEffect(() => {
    if (viewMode === 'map') {
      getCurrentLocation()
        .then(loc => {
          setUserLocation(loc);
          setLocationError(null);
          setLocationLoaded(true);
        })
        .catch(() => {
          setLocationError('위치 정보를 가져올 수 없습니다.');
        });
    }
  }, [viewMode]);

  useEffect(() => {
    if (locationLoaded && userLocation && viewMode === 'map') {
      setLocationLoaded(false);
      searchHospitals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationLoaded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchHospitals();
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowBooking(true);
    onSelectHospital?.(hospital);
  };

  const handleMapHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowBooking(true);
  };

  const formatDistance = (km?: number) => {
    if (!km) return null;
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  const formatHours = (hours?: Record<string, string>) => {
    if (!hours) return '정보 없음';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return hours[today] || '정보 없음';
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="병원명 또는 주소로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}>
            <input
              type="checkbox"
              checked={is24h}
              onChange={(e) => setIs24h(e.target.checked)}
              className="rounded"
            />
            24시간
          </label>

          <div className="flex items-center gap-1 ml-auto rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 px-3 py-2 text-sm transition-colors"
              style={{
                background: viewMode === 'list' ? 'var(--color-primary-500)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              <List size={14} />
              목록
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className="flex items-center gap-1 px-3 py-2 text-sm transition-colors"
              style={{
                background: viewMode === 'map' ? 'var(--color-primary-500)' : 'transparent',
                color: viewMode === 'map' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              <MapIcon size={14} />
              지도
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-[50px] md:mx-auto py-2.5 rounded-xl font-semibold text-white ripple"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))' }}
        >
          검색
        </button>
      </form>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border shimmer" style={{ borderColor: 'var(--color-border)' }}>
              <div className="h-5 w-32 rounded shimmer mb-2" />
              <div className="h-4 w-48 rounded shimmer mb-2" />
              <div className="h-4 w-24 rounded shimmer" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--color-danger-bg)' }}>
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
        </div>
      )}

      {!loading && !error && hospitals.length === 0 && viewMode === 'list' && (
        <div className="p-8 text-center">
          <MapPin className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            검색 결과가 없습니다
          </p>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="space-y-4">
          {locationError && (
            <p className="text-sm text-center py-2" style={{ color: 'var(--color-warning)' }}>
              {locationError}
            </p>
          )}
          <HospitalMap
            hospitals={hospitals}
            onSelectHospital={handleMapHospitalSelect}
            selectedHospitalId={selectedHospital?.id}
            center={userLocation || undefined}
          />
          {!loading && !error && hospitals.length === 0 && (
            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
              검색 결과가 없습니다
            </p>
          )}
          {selectedHospital && (
            <div className="card rounded-xl p-4 space-y-3 border-2 border-primary"
              style={{ borderColor: 'var(--color-primary-200)', background: 'var(--color-primary-50)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedHospital.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {selectedHospital.address}
                  </p>
                </div>
                {selectedHospital.distance !== undefined && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
                    {formatDistance(selectedHospital.distance)}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleMapHospitalSelect(selectedHospital)}
                className="w-full py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--color-primary-500)' }}
              >
                예약하기
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="card card-hover rounded-xl p-4 space-y-3 cursor-pointer"
            onClick={() => handleHospitalSelect(hospital)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {hospital.name}
                </h3>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  <MapPin size={12} className="inline mr-1" />
                  {hospital.address}
                </p>
              </div>
              {hospital.distance !== undefined && (
                <span className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                  {formatDistance(hospital.distance)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {hospital.is_24h && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600">
                  24시간
                </span>
              )}
              {hospital.departments?.slice(0, 3).map((dept) => (
                <span key={dept} className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}>
                  {dept}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {hospital.is_24h ? '24시간 운영' : formatHours(hospital.operating_hours)}
              </span>
              {hospital.phone && (
                <a
                  href={`tel:${hospital.phone}`}
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={12} />
                  {hospital.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {showBooking && selectedHospital && (
        <HospitalBookingModal
          hospital={selectedHospital}
          onClose={() => {
            setShowBooking(false);
            setSelectedHospital(null);
          }}
        />
      )}
    </div>
  );
}

function HospitalBookingModal({ hospital, onClose }: { hospital: Hospital; onClose: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [department, setDepartment] = useState(hospital.departments?.[0] || '');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/hospitals/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_id: hospital.id,
          reservation_date: date,
          reservation_time: time,
          department,
          chief_complaint: chiefComplaint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '예약에 실패했습니다.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--color-primary-100)' }}>
              <Calendar className="text-green-500" size={32} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              예약 완료
            </h3>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {hospital.name}에<br />
              {date} {time} 예약이 완료되었습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-white ripple"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))' }}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {hospital.name}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <MapPin size={12} className="inline mr-1" />
          {hospital.address}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              진료과목
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border"
              style={{ borderColor: 'var(--color-border)' }}
              required
            >
              {hospital.departments?.map((d) => (
                <option key={d} value={d}>{d}</option>
              )) ?? <option value="">진료과목 선택</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                예약 날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 rounded-xl border"
                style={{ borderColor: 'var(--color-border)' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                예약 시간
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border"
                style={{ borderColor: 'var(--color-border)' }}
                required
              >
                <option value="">시간 선택</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              증상 / 상담 내용
            </label>
            <textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="어떤方面的问题으로 내원하시나요?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border resize-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white ripple disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-600))' }}
          >
            {loading ? '예약 중...' : '예약하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
