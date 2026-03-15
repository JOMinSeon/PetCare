# UIUX_2 스킬 요약

## 페이지 구조

| 경로 | 페이지 | 역할 |
|---|---|---|
| `/` | Landing | 서비스 소개 및 회원가입 유도 (비로그인) |
| `/pets` | Dashboard | 반려동물 목록, 오늘 할 일, 빠른 상태 체크 |
| `/health/[id]` | Health Records | 개별 건강 기록, 체중/식사량 차트, 진료 내역 |
| `/calendar` | Schedule | 예방접종·구충제·미용·병원 통합 캘린더 및 알림 |
| `/community` | Community | 보호자 정보 공유, 수의사 Q&A 게시판 |
| `/settings` | Profile | 보호자 정보, 알림 설정, 구독/결제 관리 |

---

## 1. 색상 시스템

| 역할 | 색상 | Hex | 용도 |
|---|---|---|---|
| Primary | Healing Emerald | `#10B981` | 메인 버튼, 활성화 상태 |
| Secondary | Warm Amber | `#FBBF24` | 알림, 주의사항 표시 |
| Accent | Care Rose | `#F43F5E` | 심박수, 긴급 상황 |
| Surface | Soft Slate | `#F8FAFC` | 배경, 카드 배경 |

---

## 2. 시각화 UI

- **체중 변화** → Line Chart (recharts, 최근 6개월 추이)
- **영양 밸런스** → Radar Chart (단백질·지방·비타민 비율)
- **음수량/활동량** → Donut Chart (목표 대비 달성률 %)
- **진료·접종 차수** → Status Stepper (완료/진행중/미정)

---

## 3. 폼(Form) UX 포인트

- **Segmented Control** : 성별·중성화 등 버튼 클릭으로 선택
- **Slider + Input** : 몸무게·나이를 슬라이더로 대략 조정 후 세밀 입력
- **인라인 유효성** : 오류 대신 완료 시 녹색 체크로 긍정 피드백
- **이모지 라디오** : 컨디션(😢😐😊😆)을 카드 선택으로 입력
- **태그 버튼** : 활동 내용을 태그 클릭으로 빠르게 추가

---

## 4. 완성도 디테일

- **Glassmorphism** : `backdrop-blur-md` + `bg-white/60` 으로 깊이감 표현
- **Micro-copy** : 딱딱한 안내문 대신 친근한 맞춤형 문구 사용
- **Empty State** : 빈 화면에 일러스트 + "첫 기록을 남겨보세요!" CTA 배치
