'use server';
import { revalidatePath } from 'next/cache';
import { getServerDb } from '@/lib/supabase-server';

const MER_MULTIPLIER: Record<string, number> = {
  dog: 1.6,
  cat: 1.2,
};

export async function saveHealthLog(formData: FormData) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return;

  const weight = Number(formData.get('weight'));
  const petId = formData.get('petId') as string;

  const { data: pet } = await db
    .from('pets')
    .select('species')
    .eq('id', petId)
    .eq('user_id', user.id)
    .single();
  if (!pet) return;

  const rer = 70 * Math.pow(weight, 0.75);
  const mer = rer * (MER_MULTIPLIER[pet.species] ?? 1.6);

  await db.from('health_logs').insert({
    pet_id: petId,
    weight,
    rer,
    mer,
    recorded_at: new Date().toISOString(),
  });

  revalidatePath(`/pets/${petId}`);
}
