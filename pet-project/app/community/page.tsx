'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';
import { Heart, MessageCircle, Search, Plus, Stethoscope, BookOpen, TrendingUp } from 'lucide-react';

type TabKey = 'feed' | 'qa';

interface Post {
  id: string;
  author: string;
  avatar: string;
  pet: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  liked: boolean;
  tags: string[];
}

interface QAItem {
  id: string;
  question: string;
  author: string;
  answer?: string;
  answeredBy?: string;
  time: string;
  status: 'pending' | 'answered';
  votes: number;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: '뭉치맘',
    avatar: '🐕',
    pet: '뭉치 (말티즈, 4살)',
    content: '오늘 뭉치가 처음으로 사료를 거부했어요 😰 혹시 비슷한 경험 있으신 분 계세요? 갑자기 먹기를 싫어하네요.',
    likes: 12,
    comments: 8,
    time: '2시간 전',
    liked: false,
    tags: ['식욕부진', '말티즈', '사료'],
  },
  {
    id: '2',
    author: '나비집사',
    avatar: '🐈',
    pet: '나비 (코숏, 2살)',
    content: '나비가 드디어 체중 목표 달성했어요! 펫헬스 칼로리 계산으로 3개월 관리해서 1.2kg 감량 성공! 💪',
    likes: 34,
    comments: 15,
    time: '5시간 전',
    liked: true,
    tags: ['다이어트성공', '체중관리', '코숏'],
  },
  {
    id: '3',
    author: '초코아빠',
    avatar: '🐕',
    pet: '초코 (푸들, 7살)',
    content: '노령견 관절 영양제 추천해주실 분 계세요? 요즘 계단 오를 때 힘들어하는 것 같아서...',
    likes: 9,
    comments: 21,
    time: '1일 전',
    liked: false,
    tags: ['노령견', '관절', '영양제'],
  },
];

const MOCK_QA: QAItem[] = [
  {
    id: '1',
    question: '강아지가 풀을 자꾸 먹으려 하는데 괜찮은가요?',
    author: '멍멍이맘',
    answer: '강아지가 풀을 먹는 것은 매우 흔한 행동입니다. 소화 불량 시 스스로 구토를 유발하기 위해, 또는 섬유질이 부족할 때 나타날 수 있습니다. 독성 식물만 주의하시면 크게 걱정하지 않으셔도 됩니다.',
    answeredBy: '수의사 김민준',
    time: '3일 전',
    status: 'answered',
    votes: 24,
  },
  {
    id: '2',
    question: '고양이 중성화 수술 적정 시기가 언제인가요?',
    author: '야옹집사',
    answer: '일반적으로 생후 4~6개월이 권장됩니다. 첫 발정 전에 수술하면 유선 종양 예방 효과가 높습니다.',
    answeredBy: '수의사 이수진',
    time: '1주 전',
    status: 'answered',
    votes: 31,
  },
  {
    id: '3',
    question: '노령견 건강검진은 얼마나 자주 받아야 하나요?',
    author: '시니어독파파',
    time: '1시간 전',
    status: 'pending',
    votes: 5,
  },
];

export default function CommunityPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('feed');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/auth/login');
      else setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  if (!authChecked) return null;

  const toggleLike = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

  const filteredPosts = posts.filter(
    (p) =>
      p.content.includes(search) ||
      p.tags.some((t) => t.includes(search)) ||
      p.author.includes(search)
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>커뮤니티</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                보호자들의 이야기를 나눠요
              </p>
            </div>
            <button
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white"
              style={{ background: 'var(--color-primary-500)' }}
            >
              <Plus size={16} />
              글쓰기
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="키워드, 태그, 작성자 검색"
              className="w-full rounded-xl border pl-9 pr-4 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 rounded-xl p-1" style={{ background: 'var(--color-bg)' }}>
            {([
              { key: 'feed', label: '피드', icon: BookOpen },
              { key: 'qa',   label: '수의사 Q&A', icon: Stethoscope },
            ] as { key: TabKey; label: string; icon: typeof BookOpen }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all"
                style={{
                  background: activeTab === key ? 'var(--color-surface)' : 'transparent',
                  color: activeTab === key ? 'var(--color-primary-500)' : 'var(--color-text-muted)',
                  boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        {/* Feed Tab */}
        {activeTab === 'feed' && (
          filteredPosts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed p-12 text-center space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-4xl">🐾</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>아직 게시물이 없어요</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>첫 번째 이야기를 나눠보세요!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border p-5 space-y-4 transition-all hover:shadow-sm"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0"
                    style={{ background: 'var(--color-primary-50)' }}
                  >
                    {post.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {post.author}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {post.pet} · {post.time}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1.5 text-sm transition-all hover:scale-110"
                    style={{ color: post.liked ? 'var(--color-rose)' : 'var(--color-text-muted)' }}
                  >
                    <Heart size={16} fill={post.liked ? 'var(--color-rose)' : 'none'} />
                    {post.likes}
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <MessageCircle size={16} />
                    {post.comments}
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          MOCK_QA.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border p-5 space-y-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all hover:scale-110"
                    style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
                  >
                    ▲
                  </button>
                  <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.votes}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        background: item.status === 'answered' ? 'var(--color-primary-50)' : '#fffbeb',
                        color: item.status === 'answered' ? 'var(--color-primary-600)' : 'var(--color-accent-500)',
                      }}
                    >
                      {item.status === 'answered' ? '✓ 답변완료' : '⏳ 답변대기'}
                    </span>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {item.question}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {item.author} · {item.time}
                  </p>
                </div>
              </div>

              {item.answer && (
                <div
                  className="rounded-xl p-4 space-y-1"
                  style={{ background: 'var(--color-primary-50)', borderLeft: `3px solid var(--color-primary-500)` }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Stethoscope size={13} style={{ color: 'var(--color-primary-500)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-primary-600)' }}>
                      {item.answeredBy}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
