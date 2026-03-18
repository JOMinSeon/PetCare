'use server';
import { revalidatePath } from 'next/cache';
import { getServerDb } from '@/lib/supabase-server';

const MER_MULTIPLIER: Record<string, number> = {
  dog: 1.6,
  cat: 1.2,
};

export async function getUserPets() {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return [];

  const { data } = await db
    .from('pets')
    .select('id, name, species, age, weight')
    .eq('user_id', user.id)
    .order('name');

  return data ?? [];
}

export async function getHealthLogs(petId: string) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return [];

  // IDOR 방지: petId가 해당 유저 소유인지 확인
  const { data: pet } = await db
    .from('pets')
    .select('id')
    .eq('id', petId)
    .eq('user_id', user.id)
    .single();
  if (!pet) return [];

  const { data } = await db
    .from('health_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('recorded_at', { ascending: true });

  return data ?? [];
}

export async function saveHealthLogFromTracking(
  petId: string,
  weight: number,
  recordedAt: string,
) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: pet } = await db
    .from('pets')
    .select('species')
    .eq('id', petId)
    .eq('user_id', user.id)
    .single();
  if (!pet) return { error: 'Pet not found' };

  const rer = 70 * Math.pow(weight, 0.75);
  const mer = rer * (MER_MULTIPLIER[pet.species] ?? 1.6);

  const { error } = await db.from('health_logs').insert({
    pet_id: petId,
    weight,
    rer,
    mer,
    recorded_at: new Date(recordedAt).toISOString(),
  });

  if (error) return { error: error.message };
  return { ok: true };
}

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
