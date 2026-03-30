-- ============================================================
-- profiles 테이블 RLS 정책 완벽 설정
-- ============================================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기존 policies 삭제 (DROP POLICY로 하나씩)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- SELECT: 본인 프로필만 조회
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: 본인 프로필만 생성
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 본인 프로필만 수정
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 확인
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
