'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/supabase';

export async function saveHealthLog(formData: FormData) {
  const weight = Number(formData.get('weight'));
  const petId = formData.get('petId') as string;

  // RER/MER 계산 (서버에서만 실행 → 보안 우수)
  const rer = 70 * Math.pow(weight, 0.75);
  // TODO: pet 테이블의 activity_factor 컬럼 기반으로 동적 처리 필요
  const mer = rer * 1.6;

  await getDb().from('health_logs').insert({
    pet_id: petId,
    weight,
    rer,
    mer,
    recorded_at: new Date().toISOString(),
  });

  revalidatePath(`/pets/${petId}`);
}
