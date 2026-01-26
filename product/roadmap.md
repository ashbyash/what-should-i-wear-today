# What Should I Wear Today - Product Roadmap

## Version
- Version: 1.1
- Last Updated: 2026-01-26

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

### Focus: SEO 색인 + 국내 여행지 확장

| Feature | Status | Note |
|---------|--------|------|
| Google 색인 완료 | 🔄 In Progress | 현재 1/34 페이지만 색인 |
| 키워드 확장 메타데이터 | ✅ Done | 10개 패턴 적용 |
| 국내 여행지 날씨 | 📋 Planned | 제주, 강릉, 속초, 경주, 여수 등 |

**Success Criteria (국내 여행지)**:
- Metric: 여행지 페이지 색인 수
- Target: 추가 페이지 100% 색인
- Period: 배포 후 30일

---

## Next (2026 Q2)

### Focus: 해외 여행지 + 사용자 경험

| Feature | Priority | Description |
|---------|----------|-------------|
| 해외 여행지 날씨 | High | 오사카, 도쿄, 방콕, 다낭 등 (별도 API 필요) |
| 시간대별 옷차림 | Medium | 아침/점심/저녁 기온 반영 |
| 즐겨찾기 도시 | Medium | localStorage 저장 |
| 공유 기능 | Medium | 오늘 옷차림 결과 공유 (카카오톡, 링크) |

---

## Later (Backlog)

### 고려 중인 기능

| Feature | Description | Trigger |
|---------|-------------|---------|
| PWA 지원 | 홈화면 추가, 오프라인 | 재방문율 20% 이상 시 |
| 주간 날씨 예보 | 7일 날씨 + 옷차림 미리보기 | 사용자 요청 시 |
| 개인화 옷장 | 내 옷 등록 → 맞춤 추천 | MAU 1K 이상 |
| 알림 기능 | 아침 출근 전 푸시 알림 | PWA 안정화 후 |
| 다국어 지원 | 영어, 일본어 | 해외 트래픽 발생 시 |
| 회원가입/로그인 | 개인화 기능 필요 시 | 개인화 옷장 진행 시 |
| 의류 쇼핑 연동 | 수익화 모델 | MAU 10K 이상 시 |

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
| 1.1 | 2026-01-26 | 국내/해외 여행지 추가, Not Doing → Later 이동 |
| 1.0 | 2026-01-26 | Initial roadmap |
