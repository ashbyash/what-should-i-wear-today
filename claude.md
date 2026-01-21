# Project: What Should I Wear Today

## Overview
Location-based weather + air quality check → Outing score + Outfit recommendation

## Tech Stack
| Area | Selection |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + DaisyUI |
| Backend | Vercel Functions (API Routes) |
| Deployment | Vercel |
| Cost | $0 (free tier) |

## External APIs
| API | Provider | Purpose |
|-----|----------|---------|
| 단기예보 API | 기상청 | Temperature, weather, precipitation |
| 자외선지수 API | 기상청 | UV index |
| 대기오염정보 API | 에어코리아 | Fine dust (PM10, PM2.5) |

## Core Features
1. Auto location detection (Browser Geolocation)
2. Weather + UV display
3. Fine dust display
4. Outing score
5. Outfit recommendation

## Outing Score Logic (100 points max)
| Factor | Weight | Score |
|--------|--------|-------|
| Temperature | 30% | 20~26℃(30) / 12~19℃, 27~32℃(20) / 5~11℃, 33~36℃(10) / else(0) |
| Fine dust (PM2.5) | 30% | Good 0~15(30) / Moderate 16~35(20) / Bad 36~75(10) / Very bad 76↑(0) |
| Weather | 25% | Clear(25) / Cloudy(18) / Overcast(10) / Rain·Snow(0) |
| UV Index | 15% | Low 0~2(15) / Moderate 3~5(10) / High 6~7(6) / Very high 8~10(3) / Danger 11↑(0) |

## Outfit Recommendation Logic
| Temperature | Recommendation (Korean) |
|-------------|-------------------------|
| 30℃↑ | 민소매, 반팔, 반바지, 린넨 |
| 26~29℃ | 반팔, 얇은 셔츠, 면바지 |
| 20~25℃ | 얇은 가디건, 맨투맨, 긴팔티 |
| 12~19℃ | 자켓, 가디건, 니트, 청바지 |
| 5~11℃ | 코트, 가죽자켓, 히트텍 |
| 4℃↓ | 패딩, 두꺼운 코트, 목도리 |

+) Daily temperature range ≥ 10℃ → Add "겉옷 챙기세요"
+) PM2.5 ≥ 36 → Add "마스크 착용 권장"

## Folder Structure
```
/app          → Pages
/components   → UI components
/lib          → Utils, API calls
/types        → Type definitions
```