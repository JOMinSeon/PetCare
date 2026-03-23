import { redirect } from 'next/navigation';
import { getServerDb } from '@/lib/supabase-server';
import { updatePet, deletePet } from '@/app/actions/pet';
import DeletePetButton from '@/components/DeletePetButton';

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: pet } = await db.from('pets').select('*').eq('id', id).eq('user_id', user.id).single();
  if (!pet) redirect('/pets');

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{pet.name} 정보 수정</h1>
      <form action={updatePet} className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <div>
          <label className="block text-sm font-medium mb-1">이름</label>
          <input
            name="name"
            defaultValue={pet.name}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종</label>
          <select
            name="species"
            defaultValue={pet.species}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="dog">개</option>
            <option value="cat">고양이</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">나이 (세)</label>
          <input
            name="age"
            type="number"
            step="0.1"
            min="0"
            defaultValue={pet.age}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">체중 (kg)</label>
          <input
            name="weight"
            type="number"
            step="0.1"
            min="0"
            defaultValue={pet.weight}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            name="neutered"
            type="checkbox"
            id="neutered"
            defaultChecked={pet.neutered}
            className="rounded"
          />
          <label htmlFor="neutered" className="text-sm font-medium">중성화</label>
        </div>
        <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-500">
          수정하기
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400 mb-3">위험 구역</p>
        <DeletePetButton petId={id} petName={pet.name} deletePet={deletePet} />
      </div>
    </div>
  );
}
