'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getBrowserDb } from '@/lib/supabase-browser';
import { FoodAnalyzer } from '@/components/FoodAnalyzer';

interface Pet {
  id: string;
  name: string;
  species: string;
  age: number;
  weight: number;
}

export default function AnalyzeFoodPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const supabase = getBrowserDb();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError?.code === 'refresh_token_not_found') {
          await supabase.auth.signOut();
          router.replace('/auth/login');
          return;
        }
        if (!user) {
          router.replace('/auth/login');
          return;
        }

        const { data, error: err } = await supabase
          .from('pets')
          .select('id, name, species, age, weight')
          .order('created_at', { ascending: false });

        if (err) throw err;

        if (!data || data.length === 0) {
          setError('등록된 반려동물이 없습니다. 먼저 반려동물을 등록해주세요.');
          setLoading(false);
          return;
        }

        setPets(data);
        setSelectedPet(data[0]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('반려동물 정보를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) {
    return (
      <main className="pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary-500)' }} />
              <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>로딩 중...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link
                href="/pets"
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:opacity-70"
                style={{ background: 'var(--color-border)' }}
              >
                <ArrowLeft size={20} style={{ color: 'var(--color-text-primary)' }} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  AI 사료 분석
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  반려동물의 사료를 분석하고 영양 정보를 확인하세요
                </p>
              </div>
            </div>
          </div>

          {/* Error state */}
          <div
            className="rounded-xl border p-4 flex items-start gap-3"
            style={{ background: '#FBE9E7', borderColor: '#FFCCBC' }}
          >
            <AlertCircle size={20} style={{ color: '#E65100', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p className="font-semibold" style={{ color: '#E65100' }}>오류</p>
              <p className="text-sm mt-1" style={{ color: '#BF360C' }}>{error}</p>
              <Link
                href="/pets/new"
                className="inline-block mt-3 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--color-primary-500)', color: '#fff' }}
              >
                반려동물 등록하기
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/pets"
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:opacity-70"
            style={{ background: 'var(--color-border)' }}
          >
            <ArrowLeft size={20} style={{ color: 'var(--color-text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              AI 사료 분석
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              반려동물의 사료를 분석하고 영양 정보를 확인하세요
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-xl border p-4 flex items-start gap-3"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <AlertCircle size={16} style={{ color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            제공되는 분석 정보는 참고용이며 실제와 다를 수 있습니다. 반려동물의 건강 상태에 따른 최종 판단은 반드시 수의사 등 전문가의 확인을 거쳐 결정해 주시기 바랍니다.
          </p>
        </div>

        {/* Pet selector */}
        {pets.length > 1 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              분석할 반려동물 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className="rounded-lg px-4 py-3 text-center transition-all"
                  style={{
                    background: selectedPet?.id === pet.id ? 'var(--color-primary-500)' : 'var(--color-surface)',
                    color: selectedPet?.id === pet.id ? '#fff' : 'var(--color-text-primary)',
                    border: `1px solid ${selectedPet?.id === pet.id ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                  }}
                >
                  <p className="text-sm font-semibold">{pet.name}</p>
                  <p className="text-xs mt-1" style={{ color: selectedPet?.id === pet.id ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                    {pet.species} · {pet.age}세
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Food Analyzer Component */}
        {selectedPet && (
          <FoodAnalyzer
            petInfo={{
              species: selectedPet.species,
              age: selectedPet.age,
              weight: selectedPet.weight,
            }}
          />
        )}
      </div>
    </main>
  );
}
