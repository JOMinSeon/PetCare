-- ================================================
-- 캘린더 일정 테이블
-- ================================================
create table if not exists schedule_events (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null check (type in ('vaccine', 'deworming', 'grooming', 'hospital')),
  title      text not null,
  date       date not null,
  pet        text not null,
  done       boolean default false not null,
  note       text,
  created_at timestamptz default now() not null
);

alter table schedule_events enable row level security;

create policy "Users manage own schedule events"
  on schedule_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================
-- 커뮤니티 게시글 테이블
-- ================================================
create table if not exists posts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  author     text not null,
  avatar     text default '🐾' not null,
  pet        text not null,
  content    text not null,
  tags       text[] default '{}' not null,
  created_at timestamptz default now() not null
);

alter table posts enable row level security;

create policy "Anyone can read posts"
  on posts for select using (true);

create policy "Users insert own posts"
  on posts for insert with check (auth.uid() = user_id);

create policy "Users delete own posts"
  on posts for delete using (auth.uid() = user_id);

-- ================================================
-- 좋아요 테이블
-- ================================================
create table if not exists post_likes (
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (post_id, user_id)
);

alter table post_likes enable row level security;

create policy "Anyone can read likes"
  on post_likes for select using (true);

create policy "Users manage own likes"
  on post_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================
-- Q&A 테이블
-- ================================================
create table if not exists qa_items (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  question    text not null,
  author      text not null,
  answer      text,
  answered_by text,
  status      text default 'pending' not null check (status in ('pending', 'answered')),
  votes       integer default 0 not null,
  created_at  timestamptz default now() not null
);

alter table qa_items enable row level security;

create policy "Anyone can read qa items"
  on qa_items for select using (true);

create policy "Users insert own questions"
  on qa_items for insert with check (auth.uid() = user_id);

create policy "Anyone can vote"
  on qa_items for update using (true) with check (true);

-- ================================================
-- 유저 프로필 테이블
-- ================================================
create table if not exists profiles (
  user_id           uuid references auth.users(id) on delete cascade primary key,
  nickname          text,
  notif_vaccination boolean default true not null,
  notif_weight      boolean default true not null,
  notif_community   boolean default false not null,
  notif_marketing   boolean default false not null,
  subscription_plan text default 'free' not null,
  updated_at        timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
