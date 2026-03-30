-- ============================================================
-- profiles 테이블 RLS 정책 완벽 설정
-- 실행: Supabase SQL 편집기에 전체 붙여넣기
-- ============================================================

-- 1. RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. 기존 모든 profiles 정책 삭제
DELETE FROM pg_policies WHERE tablename = 'profiles';

-- 3. SELECT 정책 (本人プロフィールの照会만 허용)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- 4. INSERT 정책 (本人プロフィール作成만 허용)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE 정책 (本人プロフィール修正만 허용)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. 설정 확인
SELECT policyname, cmd, enabled
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. 테스트 (현재 로그인 사용자의 프로필만 반환되어야 함)
-- SELECT * FROM profiles WHERE user_id = auth.uid();
