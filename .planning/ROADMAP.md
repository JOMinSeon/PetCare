# Roadmap: PetCare

## Overview

PetCare는 AI 기반 반려동물 건강 관리 서비스입니다. 증상 체크리스트 → AI 상담 → 병원 예약까지一体化されたワークフローを段階的に構築します。

## Phases

- [x] **Phase 1: 증상 체크리스트** - 증상 입력 및 질병 진단
- [ ] **Phase 2: AI 상담** - AI 기반 상담 기능
- [ ] **Phase 3: 병원 예약** - 동물병원 예약 및 관리

## Phase Details

### Phase 1: 증상 체크리스트
**Goal**: 증상 체크리스트 페이지를 구현하여 사용자가 강아지/고양이의 증상을 빠르고 정확하게 입력하고, 가능한 질병 리스트와 응급도를 확인하며, AI 상담으로 원활하게 연결할 수 있게 합니다.
**Depends on**: Nothing (first phase)
**Success Criteria** (what must be TRUE):
  1. `/symptom-checker` 경로에서 증상 체크리스트 페이지 접근 가능
  2. 강아지/고양이 선택 후 해당 동물 증상 표시
  3. 5개 카테고리(소화기, 피부, 호흡기, 눈/귀, 행동변화) 모두 표시
  4. 증상 선택 → 질병 리스트 및 응급도 결과 표시
  5. AI 상담 모달 연결
**Plans**: 1 plan

Plans:
- [x] 01-01: 증상 체크리스트 기능 구현 (완료)

