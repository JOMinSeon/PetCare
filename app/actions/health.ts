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

  // IDOR 방지 + 로그 조회를 병렬 실행
  const [{ data: pet }, { data }] = await Promise.all([
    db.from('pets').select('id, species').eq('id', petId).eq('user_id', user.id).single(),
    db.from('health_logs').select('id, pet_id, weight, rer, mer, recorded_at').eq('pet_id', petId).order('recorded_at', { ascending: true }),
  ]);

  if (!pet || !data) return [];

  return data.map((log) => ({
    ...log,
    rer: log.rer ?? calcRer(log.weight),
    mer: log.mer ?? calcMer(log.weight, pet.species),
  }));
}

// 초기 데이터를 한 번의 서버 액션으로 가져오는 함수
export async function getInitialTrackingData() {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { authenticated: false, pets: [], logs: [], firstPetId: null } as const;

  const { data: pets } = await db
    .from('pets')
    .select('id, name, species, age, weight')
    .eq('user_id', user.id)
    .order('name');

  if (!pets || pets.length === 0) {
    return { authenticated: true, pets: [], logs: [], firstPetId: null } as const;
  }

  const firstPet = pets[0];
  const { data: logsRaw } = await db
    .from('health_logs')
    .select('id, pet_id, weight, rer, mer, recorded_at')
    .eq('pet_id', firstPet.id)
    .order('recorded_at', { ascending: true });

  const logs = (logsRaw ?? []).map((log) => ({
    ...log,
    rer: log.rer ?? calcRer(log.weight),
    mer: log.mer ?? calcMer(log.weight, firstPet.species),
  }));

  return { authenticated: true, pets, logs, firstPetId: firstPet.id } as const;
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
    rer: calcRer(weight),
    mer: calcMer(weight, pet.species),
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
    rer: calcRer(weight),
    mer: calcMer(weight, pet.species),
    recorded_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath(`/pets/${petId}`);
  return { ok: true };
}
