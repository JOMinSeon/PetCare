'use client';

interface DeletePetButtonProps {
  petId: string;
  petName: string;
  deletePet: (petId: string) => Promise<void>;
}

export default function DeletePetButton({ petId, petName, deletePet }: DeletePetButtonProps) {
  const handleDelete = async () => {
    if (!confirm(`'${petName}'을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    await deletePet(petId);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="w-full rounded-lg border border-red-300 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
    >
      {petName} 삭제하기
    </button>
  );
}
