# 동물병원 1:1 채팅 기능 구현 플랜

## 1. 현재 상태

| 항목 | 상태 | 위치 |
|------|------|------|
| `vets` 테이블 | ✅ 존재 | `supabase/migrations/009_vet_consultations.sql` |
| `vet_consultations` 테이블 | ✅ 존재 | 상담 예약 테이블 |
| `consultation_messages` 테이블 | ✅ 존재 | 채팅 메시지 테이블 (RLS 정책 포함) |
| `doctors` 테이블 | ✅ 존재 | `018_vetclinic_core.sql` - 병원 소속 의사 |
| 수의사 프로필 UI | ❌ 없음 | - |
| 채팅 UI | ❌ 없음 | 기존 AI 챗봇만 존재 |
| Realtime 구독 | ❌ 미구현 | Supabase Realtime 미사용 |

---

## 2. 구현 범위

### 2.1 Database/Migration

| 파일 | 작업 내용 |
|------|----------|
| `supabase/migrations/NEW_vet_chat.sql` | `consultation_messages`에 Realtime 활성화, `status='chat'` 상태 추가 |

### 2.2 API Routes

| 파일 | 메서드 | 기능 |
|------|--------|------|
| `app/api/chat/route.ts` | GET | 채팅방 목록 조회 (유저의 모든 상담) |
| `app/api/chat/route.ts` | POST | 메시지 전송 |
| `app/api/chat/[consultationId]/route.ts` | GET | 특정 채팅방 메시지 조회 |
| `app/api/chat/route.ts` | PATCH | 상담 상태 변경 (pending→chat→completed) |

### 2.3 Pages

| 파일 | 기능 |
|------|------|
| `app/(main)/chat/page.tsx` | 채팅방 목록 (예약된/지난 상담) |
| `app/(main)/chat/[consultationId]/page.tsx` | 개별 채팅방 UI |

### 2.4 Components

| 파일 | 기능 |
|------|------|
| `components/ChatRoomList.tsx` | 채팅방 목록 (상태 뱃지, 최근 메시지 미리보기) |
| `components/ChatMessage.tsx` | 메시지 버블 (user/vet/system 별 다른 스타일) |
| `components/ChatInput.tsx` | 메시지 입력 + 전송 버튼 |
| `components/VetOnlineStatus.tsx` | 수의사 온라인/오프라인 상태 |

### 2.5 Navigation

| 파일 | 작업 |
|------|------|
| `components/NavLinks.tsx` | "채팅" 메뉴 추가 |
| `components/MobileNav.tsx` | 모바일 바텀내비 채팅 아이콘 추가 |

---

## 3. 데이터 플로우

```
[보호자] ──→ 채팅방 선택 ──→ 메시지 전송
                              │
                              ▼
                    [consultation_messages] 테이블
                              │
                              ▼
              Supabase Realtime ──→ [수의사] 화면에 실시간 표시
```

---

## 4. 구현 순서

### Phase 1: Database & API
- [ ] 4-1. Migration 파일 작성 (Realtime + status 추가)
- [ ] 4-2. `app/api/chat/route.ts` 메시지 CRUD
- [ ] 4-3. `app/api/chat/[consultationId]/route.ts`

### Phase 2: Core Components
- [ ] 4-4. `ChatMessage.tsx`
- [ ] 4-5. `ChatInput.tsx`
- [ ] 4-6. `ChatRoomList.tsx`

### Phase 3: Pages
- [ ] 4-7. `app/(main)/chat/page.tsx`
- [ ] 4-8. `app/(main)/chat/[consultationId]/page.tsx`

### Phase 4: Navigation & Integration
- [ ] 4-9. NavLinks.tsx + MobileNav.tsx 채팅 추가
- [ ] 4-10. 병원 페이지 → 수의사 선택 → 채팅 시작

---

## 5. 보안 고려

| 항목 | 처리 |
|------|------|
| 메시지 권한 | RLS: 상담 참여자(user/vet)만 조회/전송 |
| 채팅 시작 권한 | `premium`/`clinic` 플랜만 가능 |
| XSS 방지 | 메시지 content HTML 이스케이프 |
| Rate Limit | 메시지 전송 10초당 1회 제한 |

---

## 6. Clarifying Questions (답변待ち)

1. **채팅 시작 방식**: 예약 후 채팅만 가능한가요, 아니면 병원 목록에서 바로 시작도 가능하게?
2. **수의사 대시보드**: 보호자와 채팅할 수 있는 수의사 전용 UI가 필요한가요?
3. **파일 첨부**: 이미지/파일 전송 기능이 필요하신가요?
4. **오프라인 알림**: 수의사가 로그인하지 않았을 때 알림(메일/푸시)이 필요하신가요?

---

## 7. Migration SQL (초안)

```sql
-- consultation_messages Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE consultation_messages;

-- vet_consultations status에 'chat' 추가
ALTER TABLE vet_consultations DROP CONSTRAINT IF EXISTS vet_consultations_status_check;
ALTER TABLE vet_consultations ADD CONSTRAINT vet_consultations_status_check
  CHECK (status IN ('pending', 'confirmed', 'chat', 'completed', 'cancelled', 'no_show'));

-- 상담 시작 시 chat 상태로 변경
UPDATE vet_consultations SET status = 'chat' WHERE id = $1 AND status = 'confirmed';
```

---

## 8. API Response 형식

### GET /api/chat - 채팅방 목록
```json
{
  "consultations": [
    {
      "id": "uuid",
      "vet": { "id": "uuid", "name": "홍길동 수의사", "avatar_url": "..." },
      "pet": { "id": "uuid", "name": "뭉이", "species": "dog" },
      "status": "chat",
      "lastMessage": { "content": "안녕하세요", "created_at": "..." },
      "unreadCount": 2
    }
  ]
}
```

### POST /api/chat - 메시지 전송
```json
{
  "id": "uuid",
  "consultation_id": "uuid",
  "sender_id": "uuid",
  "sender_role": "user",
  "content": "안녕하세요",
  "created_at": "..."
}
```

---

## 9. 컴포넌트 설계

### ChatMessage.tsx
```
props: { message: Message, isOwn: boolean }
- user 메시지: 오른쪽 정렬, 오렌지 배경
- vet 메시지: 왼쪽 정렬, 흰색 배경
- system 메시지: 중앙 정렬, 회색 배경
- 시간 표시 (created_at)
```

### ChatRoomList.tsx
```
props: { consultations: Consultation[] }
- 각 방: 수의사 이름, 반려동물, 최근 메시지, 상태 뱃지
- unread 뱃지 표시
- 클릭 → /chat/[consultationId] 이동
```

### ChatInput.tsx
```
props: { consultationId: string, onSend: (content: string) => void }
- 텍스트 입력 (max 1000자)
- 전송 버튼
- 입력 중 상태 표시
```

---

## 10. 의존성

- 기존 `GeminiAdvicePanel` 패턴 참고 가능
- `vet_consultations` 테이블의 `status='chat'` 활용
- Supabase Realtime (`@supabase/supabase-js` 의존성已有)

---

## 11. 검증 방법

1. 수의사としてログイン → 유저와 1:1 채팅 가능
2. 메시지 전송 시 상대방 화면에 실시간 표시
3. 페이지 새로고침 없이 실시간 업데이트
4. 채팅방 목록에서 unread_count 정확히 표시
