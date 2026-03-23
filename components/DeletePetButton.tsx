'use client';

import { useState } from 'react';

interface DeletePetButtonProps {
  petId: string;
  petName: string;
  deletePet: (petId: string) => Promise<void>;
}

export default function DeletePetButton({ petId, petName, deletePet }: DeletePetButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setDeleteError('');
    try {
      await deletePet(petId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError('삭제에 실패했습니다: ' + msg);
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div
        className="rounded-lg border p-4 space-y-3"
        role="alertdialog"
        aria-modal="false"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-desc"
        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-danger)' }}
      >
        <p id="delete-confirm-title" className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          정말 삭제하시겠습니까?
        </p>
        <p id="delete-confirm-desc" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          &apos;{petName}&apos;의 모든 건강 기록이 함께 삭제되며, 이 작업은 되돌릴 수 없습니다.
        </p>
        {deleteError && (
          <p role="alert" className="text-xs" style={{ color: 'var(--color-danger)' }}>{deleteError}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="flex-1 rounded-lg border py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-lg py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--color-danger)' }}
          >
            {loading ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full rounded-lg border py-2 text-sm transition-colors"
      style={{
        borderColor: 'var(--color-danger)',
        color: 'var(--color-danger)',
      }}
    >
      {petName} 삭제하기
    </button>
  );
}
