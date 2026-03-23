'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerDb } from '@/lib/supabase-server';

const PLAN_PET_LIMITS: Record<string, number> = {
  free: 1,
  premium: 3,
  clinic: Infinity,
};

const PLAN_LABELS: Record<string, string> = {
  free: '무료',
  premium: '프리미엄',
  clinic: '병원용',
};

export async function createPet(formData: FormData) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  // 플랜별 반려동물 수 제한
  const { data: profile } = await db.from('profiles').select('subscription_plan, is_admin').eq('user_id', user.id).single();
  const plan = profile?.subscription_plan ?? 'free';
  const limit = PLAN_PET_LIMITS[plan] ?? 1;

  if (!profile?.is_admin && isFinite(limit)) {
    const { count } = await db.from('pets').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if ((count ?? 0) >= limit) {
      throw new Error(
        `${PLAN_LABELS[plan]} 플랜은 반려동물을 최대 ${limit}마리까지 등록할 수 있어요. 설정에서 플랜을 업그레이드해주세요.`
      );
    }
  }

  const name = (formData.get('name') as string)?.trim();
  const species = formData.get('species') as string;
  const age = Number(formData.get('age'));
  const weight = Number(formData.get('weight'));
  const neutered = formData.get('neutered') === 'on';

  if (!name || name.length < 1 || name.length > 50) {
    throw new Error('이름은 1~50자 사이여야 합니다.');
  }
  if (!['dog', 'cat'].includes(species)) {
    throw new Error('종류는 dog 또는 cat이어야 합니다.');
  }
  if (!Number.isFinite(age) || age < 0 || age > 30) {
    throw new Error('나이는 0~30 사이여야 합니다.');
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 200) {
    throw new Error('체중은 0~200kg 사이여야 합니다.');
  }

  const { data: newPet, error } = await db.from('pets').insert({
    user_id: user.id,
    name,
    species,
    age,
    weight,
    neutered,
  }).select('id').single();

  if (error) throw new Error(error.message);

  revalidatePath('/pets');
  redirect(`/pets/${newPet.id}`);
}

export async function updatePet(formData: FormData) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const species = formData.get('species') as string;
  const age = Number(formData.get('age'));
  const weight = Number(formData.get('weight'));
  const neutered = formData.get('neutered') === 'on';

  if (!name || name.length < 1 || name.length > 50) {
    throw new Error('이름은 1~50자 사이여야 합니다.');
  }
  if (!['dog', 'cat'].includes(species)) {
    throw new Error('종류는 dog 또는 cat이어야 합니다.');
  }
  if (!Number.isFinite(age) || age < 0 || age > 30) {
    throw new Error('나이는 0~30 사이여야 합니다.');
  }
  if (!Number.isFinite(weight) || weight <= 0 || weight > 200) {
    throw new Error('체중은 0~200kg 사이여야 합니다.');
  }

  await db.from('pets').update({ name, species, age, weight, neutered })
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/pets');
  revalidatePath(`/pets/${id}`);
  redirect(`/pets/${id}`);
}

export async function deletePet(petId: string) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  await db.from('pets').delete().eq('id', petId).eq('user_id', user.id);
  revalidatePath('/pets');
  redirect('/pets');
}
