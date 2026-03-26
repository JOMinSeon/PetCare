'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    kakao?: typeof kakao;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadKakaoSDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (window.kakao) { resolve(); return; }

    const existingScript = document.getElementById('kakao-map-sdk') as HTMLScriptElement | null;
    if (existingScript) {
      // 이미 삽입됐지만 아직 로딩 중
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('SDK 로드 실패')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('SDK 로드 실패'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  is_24h?: boolean;
  departments?: string[];
}

interface Props {
  hospitals: Hospital[];
  onSelectHospital?: (hospital: Hospital) => void;
  selectedHospitalId?: string | null;
  center?: { lat: number; lng: number };
  className?: string;
}

export function HospitalMap({
  hospitals,
  onSelectHospital,
  selectedHospitalId,
  center,
  className = '',
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentLocationMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!mapKey) {
      setError('카카오맵 API 키가 설정되지 않았습니다.');
      return;
    }

    const timeout = setTimeout(() => {
      setError('카카오맵 로드 시간이 초과되었습니다.\nAPI 키 또는 도메인 설정을 확인해주세요.');
    }, 8000);

    loadKakaoSDK()
      .then(() => {
        if (!window.kakao || !mapRef.current) {
          clearTimeout(timeout);
          setError('카카오맵을 불러오지 못했습니다.');
          return;
        }
        window.kakao.maps.load(() => {
          clearTimeout(timeout);
          if (!mapRef.current) return;
          const initialCenter = new window.kakao!.maps.LatLng(37.5665, 126.978);
          const map = new window.kakao!.maps.Map(mapRef.current, {
            center: initialCenter,
            level: 4,
          });
          mapInstanceRef.current = map;
          setMapLoaded(true);
        });
      })
      .catch(() => {
        clearTimeout(timeout);
        setError('카카오맵 SDK를 불러오지 못했습니다.\nAPI 키를 확인해주세요.');
      });

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !center) return;
    const pos = new window.kakao!.maps.LatLng(center.lat, center.lng);
    mapInstanceRef.current.setCenter(pos);
  }, [mapLoaded, center]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof window.kakao === 'undefined') return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const map = mapInstanceRef.current;
    const bounds = new window.kakao!.maps.LatLngBounds();
    let markerCount = 0;

    const addMarker = (hospital: Hospital, position: kakao.maps.LatLng) => {
      bounds.extend(position);
      markerCount++;

      const isSelected = hospital.id === selectedHospitalId;
      const markerImage = createMarkerImage(map, isSelected);

      const marker = new window.kakao!.maps.Marker({
        position,
        title: hospital.name,
        image: markerImage || undefined,
      });

      const infoWindow = createInfoWindow(hospital);

      window.kakao!.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
        onSelectHospital?.(hospital);
      });

      marker.setMap(map);
      markersRef.current.push(marker);

      if (markerCount === hospitals.length) {
        map.setBounds(bounds, 40, 40, 40, 40);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geocoder = new (window.kakao!.maps as any).services.Geocoder();

    hospitals.forEach((hospital) => {
      if (hospital.latitude && hospital.longitude) {
        const position = new window.kakao!.maps.LatLng(hospital.latitude, hospital.longitude);
        addMarker(hospital, position);
      } else if (hospital.address) {
        geocoder.addressSearch(hospital.address, (result: kakao.maps.services.AddressResult[], status: kakao.maps.services.Status) => {
          if (status === 'OK' && result.length > 0) {
            const position = new window.kakao!.maps.LatLng(
              parseFloat(result[0].y),
              parseFloat(result[0].x)
            );
            addMarker(hospital, position);
          } else {
            markerCount++;
            if (markerCount === hospitals.length && markersRef.current.length > 0) {
              map.setBounds(bounds, 40, 40, 40, 40);
            }
          }
        });
      } else {
        markerCount++;
        if (markerCount === hospitals.length && markersRef.current.length > 0) {
          map.setBounds(bounds, 40, 40, 40, 40);
        }
      }
    });
  }, [mapLoaded, hospitals, selectedHospitalId, onSelectHospital]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !center || typeof window.kakao === 'undefined') return;

    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }

    const position = new window.kakao!.maps.LatLng(center.lat, center.lng);
    const content = `
      <div style="position:relative;width:24px;height:24px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(37,99,235,0.25);animation:pulse 1.8s ease-in-out infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
        <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.7);opacity:0.15}}</style>
      </div>
    `;

    const overlay = new window.kakao!.maps.CustomOverlay({
      position,
      content,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 10,
    });

    overlay.setMap(mapInstanceRef.current);
    currentLocationMarkerRef.current = overlay;
  }, [mapLoaded, center]);

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-xl ${className}`}
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', height: 400 }}>
        <div className="text-center p-4">
          <MapPin className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className={`rounded-xl overflow-hidden ${className}`}
        style={{ height: '400px', minHeight: '400px' }}
      />
      <style jsx>{`
        @media (min-width: 768px) {
          div.rounded-xl.overflow-hidden {
            height: 70vh !important;
            min-height: 500px !important;
          }
        }
      `}</style>
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--color-surface-2)' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
              style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>지도 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function createMarkerImage(map: kakao.maps.Map, isSelected: boolean): kakao.maps.MarkerImage | null {
  const size = isSelected ? 40 : 32;
  const color = isSelected ? '#dc2626' : '#2563eb';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return new window.kakao!.maps.MarkerImage(url, new window.kakao!.maps.Size(size, size));
}

function createInfoWindow(hospital: Hospital): kakao.maps.InfoWindow {
  const content = `
    <div style="padding: 12px; min-width: 180px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${hospital.name}</h4>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${hospital.address}</p>
      ${hospital.phone ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${hospital.phone}</p>` : ''}
      ${hospital.is_24h ? `<span style="display: inline-block; padding: 2px 6px; background: #fee2e2; color: #dc2626; font-size: 10px; border-radius: 4px; margin-top: 4px;">24시간</span>` : ''}
    </div>
  `;

  return new window.kakao!.maps.InfoWindow({
    content,
    removable: true,
  });
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
