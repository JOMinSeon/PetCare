'use server';
import { revalidatePath } from 'next/cache';
import { getServerDb } from '@/lib/supabase-server';

export async function saveHealthLog(formData: FormData) {
  const weight = Number(formData.get('weight'));
  const petId = formData.get('petId') as string;

  const rer = 70 * Math.pow(weight, 0.75);
  const mer = rer * 1.6;

  const db = await getServerDb();
  await db.from('health_logs').insert({
    pet_id: petId,
    weight,
    rer,
    mer,
    recorded_at: new Date().toISOString(),
  });

  revalidatePath(`/pets/${petId}`);
}
