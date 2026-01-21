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
| Temperature | 30% | 18~25℃(30) / 10~17℃, 26~30℃(20) / 5~9℃, 31~35℃(10) / else(0) |
| Fine dust | 30% | Good(30) / Moderate(20) / Bad(10) / Very bad(0) |
| Weather | 25% | Clear(25) / Cloudy(18) / Overcast(10) / Rain·Snow(0) |
| UV | 15% | Low(15) / Moderate(12) / High(6) / Very high(0) |

## Outfit Recommendation Logic
| Temperature | Recommendation |
|-------------|----------------|
| 28℃↑ | Sleeveless, t-shirt, shorts |
| 23~27℃ | T-shirt, thin shirt |
| 17~22℃ | Cardigan, sweatshirt |
| 12~16℃ | Jacket, knit |
| 6~11℃ | Coat, leather jacket |
| 5℃↓ | Padded jacket, heavy coat |

+) Daily temperature range ≥ 10℃ → Add "Bring a jacket"

## Folder Structure
```
/app          → Pages
/components   → UI components
/lib          → Utils, API calls
/types        → Type definitions
```