'use server';
import { revalidatePath } from 'next/cache';
import { getServerDb } from '@/lib/supabase-server';

const MER_MULTIPLIER: Record<string, number> = {
  dog: 1.6,
  cat: 1.2,
};

function calcRer(weight: number) {
  return 70 * Math.pow(weight, 0.75);
}
function calcMer(weight: number, species: string) {
  return calcRer(weight) * (MER_MULTIPLIER[species] ?? 1.6);
}

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
    .select('id, species')
    .eq('id', petId)
    .eq('user_id', user.id)
    .single();
  if (!pet) return [];

  const { data } = await db
    .from('health_logs')
    .select('id, pet_id, weight, recorded_at')
    .eq('pet_id', petId)
    .order('recorded_at', { ascending: true });

  if (!data) return [];

  return data.map((log) => ({
    ...log,
    rer: calcRer(log.weight),
    mer: calcMer(log.weight, pet.species),
  }));
}

export async function saveHealthLogFromTracking(
  petId: string,
  weight: number,
  recordedAt: string,
) {
  if (!Number.isFinite(weight) || weight <= 0 || weight > 200) {
    return { error: '유효하지 않은 체중 값입니다.' };
  }

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

  const parsedDate = new Date(recordedAt);
  if (isNaN(parsedDate.getTime())) {
    return { error: '유효하지 않은 날짜 형식입니다.' };
  }

  const { error } = await db.from('health_logs').insert({
    pet_id: petId,
    weight,
    recorded_at: parsedDate.toISOString(),
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function saveHealthLogAction(formData: FormData): Promise<void> {
  await saveHealthLog(formData);
}

export async function saveHealthLog(formData: FormData) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const weight = Number(formData.get('weight'));
  const petId = formData.get('petId') as string;

  if (!Number.isFinite(weight) || weight <= 0 || weight > 200) {
    return { error: '유효하지 않은 체중 값입니다.' };
  }

  const { data: pet } = await db
    .from('pets')
    .select('species')
    .eq('id', petId)
    .eq('user_id', user.id)
    .single();
  if (!pet) return { error: 'Pet not found' };

  const { error } = await db.from('health_logs').insert({
    pet_id: petId,
    weight,
    recorded_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/pets/${petId}`);
  return { ok: true };
}
