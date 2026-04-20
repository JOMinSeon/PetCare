-- ============================================================
-- 수의사 1:1 채팅 기능 (vet-chat)
-- ============================================================

-- consultation_messages Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE consultation_messages;

-- vet_consultations status에 'chat' 추가
ALTER TABLE vet_consultations DROP CONSTRAINT IF EXISTS vet_consultations_status_check;
ALTER TABLE vet_consultations ADD CONSTRAINT vet_consultations_status_check
  CHECK (status IN ('pending', 'confirmed', 'chat', 'completed', 'cancelled', 'no_show'));

-- conversation_id 인덱스 추가 (채팅방 조회 성능 향상)
CREATE INDEX IF NOT EXISTS consultation_messages_conversation_idx
  ON consultation_messages (consultation_id, created_at ASC);

-- 메시지 읽음 처리 트리거 (선택적)
DROP TRIGGER IF EXISTS mark_messages_read ON consultation_messages;
CREATE TRIGGER mark_messages_read
  AFTER INSERT ON consultation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();

-- 알림: 새 메시지 발생 시 vet_consultations.updated_at 갱신
DROP TRIGGER IF EXISTS consultation_message_notify ON consultation_messages;
CREATE TRIGGER consultation_message_notify
  AFTER INSERT ON consultation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();