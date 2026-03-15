'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';
import { Heart, MessageCircle, Search, Plus, Stethoscope, BookOpen, X } from 'lucide-react';

type TabKey = 'feed' | 'qa';

interface Post {
  id: string;
  user_id: string;
  author: string;
  avatar: string;
  pet: string;
  content: string;
  tags: string[];
  created_at: string;
  post_likes: { user_id: string }[];
}

interface QAItem {
  id: string;
  user_id: string;
  question: string;
  author: string;
  answer?: string;
  answered_by?: string;
  status: 'pending' | 'answered';
  votes: number;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

export default function CommunityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userNick, setUserNick] = useState('보호자');
  const [activeTab, setActiveTab] = useState<TabKey>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 글쓰기 모달
  const [showWritePost, setShowWritePost] = useState(false);
  const [newPost, setNewPost] = useState({ pet: '', content: '', tags: '' });
  const [postSaving, setPostSaving] = useState(false);

  // Q&A 작성 모달
  const [showWriteQA, setShowWriteQA] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [qaSaving, setQaSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }
      setUserId(user.id);
      setUserNick(user.email?.split('@')[0] ?? '보호자');

      const [{ data: postsData }, { data: qaData }] = await Promise.all([
        supabase
          .from('posts')
          .select('*, post_likes(user_id)')
          .order('created_at', { ascending: false }),
        supabase
          .from('qa_items')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      setPosts(postsData ?? []);
      setQaItems(qaData ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>불러오는 중...</p>
    </div>
  );

  // 좋아요 토글
  const toggleLike = async (postId: string) => {
    if (!userId) return;
    const supabase = getBrowserDb();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const liked = post.post_likes.some((l) => l.user_id === userId);
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      setPosts((prev) => prev.map((p) =>
        p.id === postId ? { ...p, post_likes: p.post_likes.filter((l) => l.user_id !== userId) } : p
      ));
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      setPosts((prev) => prev.map((p) =>
        p.id === postId ? { ...p, post_likes: [...p.post_likes, { user_id: userId }] } : p
      ));
    }
  };

  // 글 작성
  const submitPost = async () => {
    if (!newPost.content.trim() || !userId) return;
    setPostSaving(true);
    const supabase = getBrowserDb();
    const tags = newPost.tags
      .split(/[,\s#]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        author: userNick,
        avatar: '🐾',
        pet: newPost.pet.trim() || '우리 아이',
        content: newPost.content.trim(),
        tags,
      })
      .select('*, post_likes(user_id)')
      .single();
    if (!error && data) setPosts((prev) => [data, ...prev]);
    setNewPost({ pet: '', content: '', tags: '' });
    setShowWritePost(false);
    setPostSaving(false);
  };

  // Q&A 작성
  const submitQA = async () => {
    if (!newQuestion.trim() || !userId) return;
    setQaSaving(true);
    const supabase = getBrowserDb();
    const { data, error } = await supabase
      .from('qa_items')
      .insert({
        user_id: userId,
        question: newQuestion.trim(),
        author: userNick,
        status: 'pending',
        votes: 0,
      })
      .select()
      .single();
    if (!error && data) setQaItems((prev) => [data, ...prev]);
    setNewQuestion('');
    setShowWriteQA(false);
    setQaSaving(false);
  };

  // 투표
  const voteQA = async (id: string) => {
    const supabase = getBrowserDb();
    const item = qaItems.find((q) => q.id === id);
    if (!item) return;
    await supabase.from('qa_items').update({ votes: item.votes + 1 }).eq('id', id);
    setQaItems((prev) => prev.map((q) => q.id === id ? { ...q, votes: q.votes + 1 } : q));
  };

  const filteredPosts = posts.filter((p) =>
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
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>보호자들의 이야기를 나눠요</p>
            </div>
            <button
              onClick={() => activeTab === 'feed' ? setShowWritePost(true) : setShowWriteQA(true)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-primary-500)' }}
            >
              <Plus size={16} />
              {activeTab === 'feed' ? '글쓰기' : '질문하기'}
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
              { key: 'feed', label: '피드',        icon: BookOpen    },
              { key: 'qa',   label: '수의사 Q&A',  icon: Stethoscope },
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
            filteredPosts.map((post) => {
              const liked = post.post_likes.some((l) => l.user_id === userId);
              return (
                <div
                  key={post.id}
                  className="rounded-2xl border p-5 space-y-4 transition-all hover:shadow-sm"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0"
                      style={{ background: 'var(--color-primary-50)' }}
                    >
                      {post.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{post.author}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {post.pet} · {timeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                    {post.content}
                  </p>

                  {post.tags.length > 0 && (
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
                  )}

                  <div className="flex items-center gap-4 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5 text-sm transition-all hover:scale-110"
                      style={{ color: liked ? 'var(--color-rose)' : 'var(--color-text-muted)' }}
                    >
                      <Heart size={16} fill={liked ? 'var(--color-rose)' : 'none'} />
                      {post.post_likes.length}
                    </button>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <MessageCircle size={16} />
                      0
                    </span>
                  </div>
                </div>
              );
            })
          )
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          qaItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed p-12 text-center space-y-3" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-4xl">🩺</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>아직 질문이 없어요</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>궁금한 점을 질문해보세요!</p>
            </div>
          ) : (
            qaItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border p-5 space-y-3"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => voteQA(item.id)}
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
                      {item.author} · {timeAgo(item.created_at)}
                    </p>
                  </div>
                </div>

                {item.answer && (
                  <div
                    className="rounded-xl p-4 space-y-1"
                    style={{ background: 'var(--color-primary-50)', borderLeft: '3px solid var(--color-primary-500)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Stethoscope size={13} style={{ color: 'var(--color-primary-500)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-primary-600)' }}>
                        {item.answered_by}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>

      {/* 글쓰기 모달 */}
      {showWritePost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWritePost(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>글쓰기</h3>
              <button onClick={() => setShowWritePost(false)}>
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>반려동물 (선택)</label>
              <input
                value={newPost.pet}
                onChange={(e) => setNewPost({ ...newPost, pet: e.target.value })}
                placeholder="예: 뭉치 (말티즈, 4살)"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>내용</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="보호자들과 이야기를 나눠보세요!"
                rows={4}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none resize-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>태그 (선택, 쉼표로 구분)</label>
              <input
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                placeholder="예: 식욕부진, 말티즈, 사료"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowWritePost(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
              >
                취소
              </button>
              <button
                onClick={submitPost}
                disabled={!newPost.content.trim() || postSaving}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {postSaving ? '게시 중...' : '게시하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Q&A 작성 모달 */}
      {showWriteQA && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWriteQA(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>질문하기</h3>
              <button onClick={() => setShowWriteQA(false)}>
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>질문 내용</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="반려동물 건강에 대해 궁금한 점을 질문해보세요!"
                rows={4}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none resize-none"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowWriteQA(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
              >
                취소
              </button>
              <button
                onClick={submitQA}
                disabled={!newQuestion.trim() || qaSaving}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {qaSaving ? '등록 중...' : '질문 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
