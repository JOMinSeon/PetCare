-- ============================================================
-- profiles 테이블 RLS 정책 완벽 설정
-- ============================================================
-- 실행: Supabase SQL 편집기에 붙여넣기 후 실행
-- ============================================================

-- 1. 기존 RLS 활성화 확인
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (깨진 정책 청소)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;

-- 3. SELECT 정책 (본인 프로필만 조회)
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 4. INSERT 정책 (본인 프로필만 생성, user_id는 auth.uid()로 고정)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE 정책 (본인 프로필만 수정, user_id는 변경 불가)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. DELETE 정책 (본인 프로필만 삭제 - 일반적으로 비활성화 권장)
-- DELETE는 관리자 또는 탈퇴 시에만 허용하므로 주석 처리
-- CREATE POLICY "profiles_delete_own"
--   ON profiles FOR DELETE
--   USING (auth.uid() = user_id);

-- 7. 서비스 키를 위한 정책 (서버사이드에서 Supabase 서비스 롤 키 사용 시)
-- 주의: 서비스 롤 키는 RLS를 우회하므로, 백엔드 API에서만 사용
-- DROP POLICY IF EXISTS "Service role can do anything" ON profiles;
-- CREATE POLICY "Service role can do anything"
--   ON profiles USING (true);

-- ============================================================
-- 테스트 쿼리 (실행 후 결과 확인)
-- ============================================================
-- SELECT * FROM profiles WHERE user_id = auth.uid();
-- 결과: 현재 로그인한 사용자의 프로필 1건 반환되어야 함

-- ============================================================
-- 프로필이 없을 때 처리 (upsert 예시)
-- ============================================================
-- 프로필이 없어도 406 에러가 나지 않도록:
-- 1. 클라이언트에서 .maybeSingle() 사용
-- 2. upsert 사용 시 onConflict: 'user_id'로 INSERT/UPDATE 자동 처리
--
-- 예시 (클라이언트):
--   await supabase.from('profiles').upsert(
--     { user_id: userId, name, phone },
--     { onConflict: 'user_id' }
--   );
--
-- 예시 (서버):
--   INSERT INTO profiles (user_id, name, phone)
--   VALUES (auth.uid(), '홍길동', '01012345678')
--   ON CONFLICT (user_id) DO UPDATE SET
--     name = EXCLUDED.name,
--     phone = EXCLUDED.phone,
--     updated_at = now();