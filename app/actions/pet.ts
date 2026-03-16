'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerDb } from '@/lib/supabase-server';

export async function createPet(formData: FormData) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const age = Number(formData.get('age'));
  const weight = Number(formData.get('weight'));
  const neutered = formData.get('neutered') === 'on';

  const { error } = await db.from('pets').insert({
    user_id: user.id,
    name,
    species,
    age,
    weight,
    neutered,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/pets');
  redirect('/pets');
}

export async function updatePet(formData: FormData) {
  const db = await getServerDb();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/auth/login');

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const age = Number(formData.get('age'));
  const weight = Number(formData.get('weight'));
  const neutered = formData.get('neutered') === 'on';

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
