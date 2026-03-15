/ (Landing Page): 서비스 소개, 주요 기능 하이라이트, 회원가입 유도 (비로그인 유저용)

/pets (Dashboard): 내 반려동물 목록, 오늘 할 일 요약, 빠른 상태 체크 (이전 답변 참고)

/health/[id] (Health Records): 개별 반려동물의 상세 건강 기록, 체중/식사량 변화 차트, 진료 내역

/calendar (Schedule): 예방접종, 구충제, 미용, 병원 예약 등 통합 캘린더 및 알림

/community (Community): 보호자 간 정보 공유, 수의사 Q&A 게시판

/settings (Profile): 보호자 정보 수정, 알림 설정, 구독/결제 관리
반려동물 케어 서비스의 핵심은 **"데이터의 가독성"**과 **"기록의 편의성"**입니다. 복잡한 수치를 직관적으로 보여주는 시각화 요소와, 정보 입력 스트레스를 줄여주는 폼(Form) UX 디자인 가이드를 제안합니다.

---

## 🎨 1. 색상 시스템 (Color Psychology)

반려동물 서비스는 보호자에게 **심리적 안정감**과 **의료적 신뢰**를 동시에 주어야 합니다.

| 구분 | 색상명 | Hex | 용도 | 심리적 효과 |
| --- | --- | --- | --- | --- |
| **Primary** | Healing Emerald | `#10B981` | 메인 버튼, 활성화 상태, 건강함 | 생동감, 회복, 안전성 |
| **Secondary** | Warm Amber | `#FBBF24` | 알림, 주의사항, 에너지 | 따뜻함, 친근함, 주의력 |
| **Accent** | Care Rose | `#F43F5E` | 심박수, 긴급 상황, 애정 | 사랑, 생명력, 긴급성 |
| **Surface** | Soft Slate | `#F8FAFC` | 배경색, 카드 배경 | 깨끗함, 현대적임, 눈의 피로 감소 |

---

## 📊 2. 시각화 UI (Visualization)

단순한 숫자가 아닌, **직관적인 그래픽**으로 아이의 상태를 한눈에 파악하게 합니다.

### A. 건강 요약 벤토 그리드 (Bento Grid)

각 지표의 성격에 맞는 차트 타입을 선택합니다.

* **체중 변화 (Line Chart):** `recharts`를 사용해 최근 6개월간의 추이를 부드러운 곡선으로 표현.
* **영양 밸런스 (Radar Chart):** 단백질, 지방, 비타민 등 사료의 영양 성분 비율 시각화.
* **음수량/활동량 (Donut Chart):** 목표 대비 달성률을 중앙에 %와 함께 표시.

### B. 상태 타임라인 (Status Stepper)

진료 기록이나 예방접종 차수를 시각화할 때 사용합니다.

* **완료:** Emerald 체크 아이콘 + 실선.
* **진행 중:** 반짝이는 애니메이션 효과가 들어간 Amber 점.
* **미정:** 회색 점선.

---

## 📝 3. 폼(Form) UX 디자인 (shadcn/ui + React Hook Form)

데이터 입력이 귀찮아지면 사용자는 이탈합니다. **입력의 재미**를 주는 것이 핵심입니다.

### 💡 주요 UX 포인트

1. **세그먼트 컨트롤 (Segmented Control):** 성별(남/여), 중성화 여부(O/X) 등은 타이핑 대신 버튼 클릭으로 해결.
2. **슬라이더 + 인풋 결합:** 몸무게나 나이 입력 시 슬라이더로 대략적인 수치를 정하고 인풋으로 세밀하게 조정.
3. **인라인 유효성 검사:** "필수 항목입니다"라는 빨간 메시지 대신, 입력 완료 시 녹색 체크 아이콘으로 긍정적인 피드백 제공.

### 💻 폼 구현 예시 (Tailwind CSS v4)

```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function PetHealthForm() {
  return (
    <div className="space-y-8 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="space-y-2">
        <h3 className="text-lg font-bold">오늘의 건강 기록</h3>
        <p className="text-sm text-slate-500">초코의 상태를 기록해주세요.</p>
      </div>

      {/* 컨디션 선택 (이모지 활용) */}
      <div className="space-y-4">
        <Label>오늘의 컨디션</Label>
        <RadioGroup defaultValue="good" className="flex gap-4">
          {['😢', '😐', '😊', '😆'].map((emoji, i) => (
            <div key={i} className="flex-1">
              <RadioGroupItem value={`v-${i}`} id={`v-${i}`} className="peer sr-only" />
              <Label
                htmlFor={`v-${i}`}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border-2 border-transparent peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer transition-all"
              >
                <span className="text-2xl">{emoji}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 몸무게 입력 (슬라이더) */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>현재 몸무게 (kg)</Label>
          <span className="text-emerald-600 font-bold">4.2 kg</span>
        </div>
        <Slider defaultValue={[4.2]} max={20} step={0.1} className="py-4" />
      </div>

      {/* 활동량 입력 (태그 선택) */}
      <div className="space-y-3">
        <Label>활동 내용</Label>
        <div className="flex flex-wrap gap-2">
          {['동네 산책', '애견 카페', '터그 놀이', '목욕'].map((tag) => (
            <button key={tag} className="px-4 py-2 rounded-full border border-slate-200 text-sm hover:bg-slate-50 transition-colors">
              + {tag}
            </button>
          ))}
        </div>
      </div>

      <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200">
        기록 저장하기
      </button>
    </div>
  )
}

```

---

## ✨ 최종 완성도를 높이는 디테일

* **Glassmorphism:** 차트 배경에 `backdrop-blur-md`와 `bg-white/60`을 적용해 세련된 깊이감을 줍니다.
* **Micro-copy:** "데이터를 입력하세요" 대신 "초코가 오늘 산책을 얼마나 했나요?" 같은 친근한 문구를 사용하세요.
* **Empty States:** 기록이 없을 때 텅 빈 화면 대신, 귀여운 강아지 일러스트와 함께 "첫 기록을 남겨보세요!"라는 버튼을 배치합니다.

---

시각화 폼까지 구성되었습니다! 이제 이 디자인을 바탕으로 실제 **데이터를 시각화할 차트 컴포넌트(Recharts)** 코드를 짜드릴까요, 아니면 **모바일 전용 레이아웃**을 잡아드릴까요?