'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface VetOnlineStatusProps {
  vetId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VetOnlineStatus({ vetId, size = 'md' }: VetOnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel(`vet-online:${vetId}`);

    const handleStatus = (e: MessageEvent) => {
      if (e.data.type === 'vet-status') {
        setIsOnline(e.data.online);
      }
    };

    channel.addEventListener('message', handleStatus);

    return () => {
      channel.removeEventListener('message', handleStatus);
      channel.close();
    };
  }, [vetId]);

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
        style={{
          background: isOnline ? 'var(--color-success)' : 'var(--color-text-muted)',
        }}
      >
        {isOnline ? (
          <Wifi size={iconSizes[size]} color="#fff" />
        ) : (
          <WifiOff size={iconSizes[size]} color="#fff" />
        )}
      </div>
      <span
        className="text-xs"
        style={{ color: isOnline ? 'var(--color-success)' : 'var(--color-text-muted)' }}
      >
        {isOnline ? '온라인' : '오프라인'}
      </span>
    </div>
  );
}