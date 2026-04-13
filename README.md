# 오늘 뭐 입지?

아침마다 날씨 확인하고 옷 고르기 귀찮은 사람을 위한 서비스. 현재 위치의 날씨·미세먼지·자외선을 분석해서 외출 점수와 옷 추천을 한 화면에 보여줍니다.

**https://what-should-i-wear-today-ochre.vercel.app**

## Screenshots

<!-- 스크린샷 추가 예정 -->
<!-- ![메인 화면](docs/screenshots/main.png) -->

## Features

- **실시간 날씨** — 현재 위치 기반 기온, 체감온도, 강수, 습도, 바람 표시
- **외출 점수** — 6가지 요소를 가중치 기반으로 산출 (0~100점)
- **의류 추천** — 기온대별 구체적 옷차림 추천 + 비/미세먼지 대응 아이템
- **시간별 예보** — 오늘 하루의 시간대별 기온·날씨 변화
- **미세먼지·자외선** — PM2.5/PM10 등급 + UV 지수 표시
- **57개 도시 페이지** — 국내 43개 + 해외 14개 도시별 날씨 페이지
- **다크/라이트 모드** — 시간대에 따라 자동 전환
- **AI 한줄평** — 오늘 날씨에 대한 짧은 AI 코멘트

## 외출 점수 알고리즘

총 100점 만점으로 6가지 요소를 가중 합산합니다.

| 요소 | 비중 | 설명 |
|------|------|------|
| 체감온도 | 65% | 계절별 적정 온도 대비 쾌적도 |
| 날씨 | 15% | 맑음 → 비/눈 순으로 감점 |
| 미세먼지 (PM2.5) | 10% | 좋음(0~15) → 매우나쁨(76+) |
| 자외선 | 5% | 낮음(0~2) → 위험(11+) |
| 습도 | 5% | 계절별 적정 범위 기준 |
| 바람 | -10점 | 8m/s 이상 시 최대 -10점 감점 |

**등급**: perfect(90+) · excellent(80+) · good(70+) · fair(60+) · moderate(45+) · poor(25+) · bad(0~24)

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + DaisyUI |
| Animation | Framer Motion |
| 날씨 API | 기상청 단기예보 + Open-Meteo (해외) |
| 대기질 API | 에어코리아 |
| 주소 변환 | Kakao Local API |
| AI | OpenAI GPT |
| 배포 | Vercel (ISR 10분) |
| 테스트 | Vitest + Testing Library |

## Project Structure

```
src/
├── app/            # 페이지 및 API 라우트
│   ├── api/        # 날씨, AI 등 API 엔드포인트
│   └── [city]/     # 도시별 동적 페이지
├── components/     # UI 컴포넌트
├── lib/            # 유틸리티, API 호출, 점수 계산
└── types/          # TypeScript 타입 정의
```

## License

MIT
