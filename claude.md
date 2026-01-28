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
| Feels-like Temp | 65% | Ideal(65) / Good(47) / Caution(24) / Danger(0) - seasonal adjustment |
| Weather | 15% | Clear(15) / Cloudy(11) / Overcast(6) / Rain·Snow(0) |
| Fine dust (PM2.5) | 10% | Good 0~15(10) / Moderate 16~35(7) / Bad 36~75(3) / Very bad 76↑(0) |
| UV Index | 5% | Low 0~2(5) / Moderate 3~5(3) / High 6~7(2) / Very high 8~10(1) / Danger 11↑(0) |
| Humidity | 5% | Seasonal: Summer(50~65/40~75), Winter(35~55/25~65), Spring·Fall(40~60/30~70) |
| Wind Penalty | -10 max | Strong 8m/s↑(-10) / Moderate 5~7m/s(-5) / else(0) |

Level: perfect(90+) / excellent(80+) / good(70+) / fair(60+) / moderate(45+) / poor(25+) / bad(0-24)

## Outfit Recommendation Logic
| Temperature | Recommendation (Korean) |
|-------------|-------------------------|
| 28℃↑ | 린넨 반팔 셔츠, 면 반바지, 샌들 |
| 23~27℃ | 면 반팔 티셔츠, 얇은 면바지, 얇은 가디건 |
| 17~22℃ | 면 긴팔 티셔츠, 청바지, 나일론 바람막이 |
| 12~16℃ | 쭈리 맨투맨, 울 니트, 면 자켓 |
| 6~11℃ | 기모 맨투맨, 플란넬 셔츠, 울 코트, 목도리 |
| 5℃↓ | 기모 맨투맨, 다운 롱패딩, 울 니트, 목도리, 장갑, 비니 |

+) Rain/Drizzle → Add "레인부츠, 방수 자켓"
+) Daily temperature range ≥ 10℃ → Add "일교차가 커요, 겉옷 챙기세요"
+) PM2.5 ≥ 36 → Add "마스크 착용 권장"

## Folder Structure
```
/app          → Pages
/components   → UI components
/lib          → Utils, API calls
/types        → Type definitions
```