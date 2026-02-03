# What Should I Wear Today - Product Roadmap

## Version
- Version: 1.2
- Last Updated: 2026-02-03

---

## Vision

**"날씨 기반 개인화 패션 큐레이션 서비스"**

오늘 날씨에 딱 맞는, 나에게 딱 맞는 옷을 AI가 추천하고
마음에 드는 상품을 바로 구매할 수 있는 서비스

**단계**: 날씨 앱 → AI 스타일링 → 개인화 쇼핑

---

## Overview

위치 기반 날씨 + 대기질 → 외출 점수 + 옷차림 추천 서비스

---

## Done (MVP)

### Core Features
- [x] 자동 위치 감지 (Browser Geolocation)
- [x] 날씨 정보 표시 (기온, 날씨 상태)
- [x] 자외선 지수 표시
- [x] 미세먼지 표시 (PM10, PM2.5)
- [x] 외출 점수 (100점 만점)
- [x] 기온별 옷차림 추천

### SEO / Infrastructure
- [x] Programmatic SEO 페이지 (33개 도시)
- [x] SSG (Static Site Generation)
- [x] 도시별 고유 메타데이터
- [x] sitemap.xml, robots.txt
- [x] OG Image 자동 생성

---

## Now (2026 Q1)

### Focus: SEO 색인 + 국내 여행지 확장 + AI 기초

| Feature | Status | Note |
|---------|--------|------|
| Google 색인 완료 | 🔄 In Progress | 현재 1/34 페이지만 색인 |
| 키워드 확장 메타데이터 | ✅ Done | 10개 패턴 적용 |
| 국내 여행지 날씨 | 📋 Planned | 제주, 강릉, 속초, 경주, 여수 등 |
| AI 점수 메시지 | 📋 Planned | 날씨 조건 반영한 동적 메시지 (OpenAI) |
| AI 스타일링 팁 | 📋 Planned | 옷 추천에 맥락 있는 한줄 팁 추가 |
| 문의하기 | ✅ Done | 푸터에 이메일 링크 |

**Success Criteria (국내 여행지)**:
- Metric: 여행지 페이지 색인 수
- Target: 추가 페이지 100% 색인
- Period: 배포 후 30일

**Success Criteria (AI 메시지)**:
- Metric: API 비용 효율성
- Target: 캐싱으로 호출 90% 절감
- Period: 적용 후 7일

---

## Next (2026 Q2)

### Focus: 로그인 + AI 개인화 추천

| Feature | Priority | Description |
|---------|----------|-------------|
| 소셜 로그인 | High | 카카오 or Google (Supabase Auth) |
| 사용자 프로필 | High | 성별, 연령대, 스타일 저장 (DB) |
| AI 상황별 추천 | High | 출근/데이트/운동/일상 탭 선택 |
| AI 맞춤 추천 | High | 프로필 기반 옷 추천 개인화 |
| 해외 여행지 날씨 | Medium | 오사카, 도쿄, 방콕, 다낭 등 (별도 API 필요) |
| 시간대별 옷차림 | Medium | 아침/점심/저녁 기온 반영 |
| 공유 기능 | Medium | 오늘 옷차림 결과 공유 (카카오톡, 링크) |

**Success Criteria (AI 개인화)**:
- Metric: 프로필 설정 완료율
- Target: 로그인 사용자 중 80% 프로필 설정
- Period: 기능 출시 후 30일

---

## Later (Backlog)

### AI 패션 큐레이션 (장기 비전)

| Feature | Description | Trigger |
|---------|-------------|---------|
| 프로필 확장 | 가격대, 선호 컬러, 체형 추가 | 기본 프로필 반응 좋을 시 |
| 쿠팡 파트너스 연동 | 제휴 API 연결 | MAU 1K 이상 |
| AI 상품 큐레이션 | 프로필 기반 실제 상품 추천 + 링크 | 제휴 연동 완료 후 |
| 마이페이지 | 프로필 관리, 설정, 계정 삭제 | 사용자 요청 또는 기능 확장 시 |

### 기타 기능

| Feature | Description | Trigger |
|---------|-------------|---------|
| PWA 지원 | 홈화면 추가, 오프라인 | 재방문율 20% 이상 시 |
| 주간 날씨 예보 | 7일 날씨 + 옷차림 미리보기 | 사용자 요청 시 |
| 알림 기능 | 아침 출근 전 푸시 알림 | PWA 안정화 후 |
| 다국어 지원 | 영어, 일본어 | 해외 트래픽 발생 시 |
| 즐겨찾기 도시 | 자주 보는 도시 저장 | 로그인 기능 안정화 후 |

---

## Not Doing

제품 방향과 맞지 않아 하지 않는 것들:

| Feature | Reason |
|---------|--------|
| 날씨 상세 분석 | 기상청 앱과 경쟁 X, 옷차림에 집중 |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 일일 방문자 | 100+/day | Google Analytics |
| 재방문율 | 20%+ | GA Returning visitors |
| 페이지 색인 | 전체 페이지 100% | Search Console |
| Core Web Vitals | All Green | PageSpeed Insights |

---

## Change History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2026-02-03 | Vision 추가 (AI 패션 큐레이션), Q1 AI 기초 기능 추가, Q2 로그인/개인화 추가, Later 재구성 |
| 1.1 | 2026-01-26 | 국내/해외 여행지 추가, Not Doing → Later 이동 |
| 1.0 | 2026-01-26 | Initial roadmap |
