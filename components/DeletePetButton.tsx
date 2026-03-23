'use client';

import { useState } from 'react';

interface DeletePetButtonProps {
  petId: string;
  petName: string;
  deletePet: (petId: string) => Promise<void>;
}

export default function DeletePetButton({ petId, petName, deletePet }: DeletePetButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`'${petName}'을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setLoading(true);
    try {
      await deletePet(petId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('삭제에 실패했습니다: ' + msg);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="w-full rounded-lg border border-red-300 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? '삭제 중...' : `${petName} 삭제하기`}
    </button>
  );
}
