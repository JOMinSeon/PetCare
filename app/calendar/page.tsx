'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserDb } from '@/lib/supabase-browser';
import { Syringe, Pill, Scissors, Stethoscope, Plus, Bell } from 'lucide-react';

type EventType = 'vaccine' | 'deworming' | 'grooming' | 'hospital';

interface ScheduleEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  pet: string;
  done: boolean;
  note?: string;
}

const TYPE_META: Record<EventType, { icon: typeof Syringe; color: string; bg: string; label: string }> = {
  vaccine:   { icon: Syringe,     color: 'var(--color-primary-500)', bg: 'var(--color-primary-50)', label: '예방접종' },
  deworming: { icon: Pill,        color: 'var(--color-accent-500)',  bg: '#fffbeb',                 label: '구충제'   },
  grooming:  { icon: Scissors,    color: 'var(--color-info)',        bg: '#eff6ff',                 label: '미용'     },
  hospital:  { icon: Stethoscope, color: 'var(--color-rose)',        bg: 'var(--color-rose-light)', label: '병원'     },
};

const FILTER_TYPES: (EventType | 'all')[] = ['all', 'vaccine', 'deworming', 'grooming', 'hospital'];

export default function CalendarPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: 'vaccine' as EventType, title: '', date: '', pet: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = getBrowserDb();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/auth/login'); return; }
      setUserId(user.id);

      const [{ data: eventsData }, { data: petsData }] = await Promise.all([
        supabase
          .from('schedule_events')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('pets')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name'),
      ]);

      setEvents(eventsData ?? []);
      setPets(petsData ?? []);
      if (petsData && petsData.length > 0) {
        setNewEvent((prev) => ({ ...prev, pet: petsData[0].name }));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>불러오는 중...</p>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);
  const upcoming = filtered.filter((e) => !e.done && e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past     = filtered.filter((e) => e.done || e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const toggleDone = async (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const supabase = getBrowserDb();
    await supabase.from('schedule_events').update({ done: !event.done }).eq('id', id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, done: !e.done } : e));
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.pet || !userId) return;
    setSaving(true);
    const supabase = getBrowserDb();
    const { data, error } = await supabase
      .from('schedule_events')
      .insert({ user_id: userId, ...newEvent, done: false })
      .select()
      .single();
    if (!error && data) setEvents((prev) => [...prev, data]);
    setNewEvent({ type: 'vaccine', title: '', date: '', pet: '' });
    setShowAdd(false);
    setSaving(false);
  };

  const getDday = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - new Date(today).getTime()) / 86400000);
    if (diff === 0) return 'D-Day';
    if (diff > 0)  return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>일정 캘린더</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              예방접종·구충제·미용·병원 일정 통합 관리
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-primary-500)' }}
          >
            <Plus size={16} />
            일정 추가
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TYPES.map((type) => {
            const active = filter === type;
            const meta = type !== 'all' ? TYPE_META[type] : null;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: active ? 'var(--color-primary-500)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-secondary)',
                  border: `1px solid ${active ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                }}
              >
                {meta && <meta.icon size={13} />}
                {type === 'all' ? '전체' : TYPE_META[type].label}
              </button>
            );
          })}
        </div>

        {/* Upcoming events */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>예정된 일정</h2>
          {upcoming.length === 0 ? (
            <div
              className="rounded-2xl border-2 border-dashed p-10 text-center space-y-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-3xl">📅</p>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>예정된 일정이 없어요</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>우리 아이 건강 일정을 추가해보세요!</p>
            </div>
          ) : (
            upcoming.map((event) => {
              const meta = TYPE_META[event.type];
              const dday = getDday(event.date);
              const isToday = event.date === today;
              return (
                <div
                  key={event.id}
                  className="rounded-2xl border p-4 flex items-center gap-4 transition-all hover:shadow-sm"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: meta.bg }}
                  >
                    <meta.icon size={20} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {event.title}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold flex-shrink-0"
                        style={{
                          background: isToday ? 'var(--color-rose)' : 'var(--color-primary-50)',
                          color: isToday ? '#fff' : 'var(--color-primary-600)',
                        }}
                      >
                        {dday}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {event.pet} · {new Date(event.date).toLocaleDateString('ko-KR')} · {meta.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <button
                      onClick={() => toggleDone(event.id)}
                      className="rounded-lg px-3 py-1 text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}
                    >
                      완료
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Past events */}
        {past.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>지난 일정</h2>
            {past.map((event) => {
              const meta = TYPE_META[event.type];
              return (
                <div
                  key={event.id}
                  className="rounded-2xl border p-4 flex items-center gap-4 opacity-60"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: meta.bg }}
                  >
                    <meta.icon size={20} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-through truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {event.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {event.pet} · {new Date(event.date).toLocaleDateString('ko-KR')} · {meta.label}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDone(event.id)}
                    className="rounded-lg px-3 py-1 text-xs font-medium"
                    style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    복구
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>일정 추가</h3>

            {/* 종류 Segmented Control */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>종류</label>
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                {(Object.keys(TYPE_META) as EventType[]).map((type) => {
                  const meta = TYPE_META[type];
                  const active = newEvent.type === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setNewEvent({ ...newEvent, type })}
                      className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-all"
                      style={{
                        background: active ? 'var(--color-surface)' : 'transparent',
                        color: active ? meta.color : 'var(--color-text-muted)',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      <meta.icon size={16} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>제목</label>
              <input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="예: 5차 예방접종"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>날짜</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>반려동물</label>
                <select
                  value={newEvent.pet}
                  onChange={(e) => setNewEvent({ ...newEvent, pet: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: newEvent.pet ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  }}
                >
                  <option value="">반려동물 선택</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
              >
                취소
              </button>
              <button
                onClick={addEvent}
                disabled={!newEvent.title || !newEvent.date || !newEvent.pet || saving}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--color-primary-500)' }}
              >
                {saving ? '저장 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
