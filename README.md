# 요구사항 명세서

# 지역 기반 날씨 웹앱 기능 명세서

## 1. 프로젝트 개요

### 1.1 서비스 목적

사용자가 원하는 지역을 선택하면 해당 지역의 **현재 날씨 및 단기 예보 정보**를 직관적으로 확인할 수 있는 반응형 웹서비스를 개발한다.

### 1.2 개발 방향

* 모던하고 심플한 UI

* 모바일/태블릿/PC 반응형 지원

* `shadcn/ui` 기반 컴포넌트 구성

* `Tailwind CSS` 기반 스타일링

* 날씨 정보를 빠르게 인지할 수 있는 카드 중심 UI

* 지역 검색 및 선택 중심의 간단한 사용자 흐름

---

## 2. 권장 기술 스택

| 구분          | 기술                                    |

| ----------- | ------------------------------------- |

| Frontend    | Next.js                               |

| Language    | TypeScript                            |

| UI          | shadcn/ui                             |

| CSS         | Tailwind CSS                          |

| Icon        | Lucide React                          |

| Weather API | OpenWeatherMap / WeatherAPI / 기상청 API |

| 지역 검색       | Geo API 또는 날씨 API Location Search     |

| 상태관리        | React State / Zustand                 |

| 날짜 처리       | date-fns                              |

| 배포          | Vercel                                |

---

## 3. 주요 사용자 흐름

```text

웹사이트 접속

    ↓

기본 지역 날씨 표시

    ↓

지역 검색 또는 지역 선택

    ↓

검색 결과 목록 표시

    ↓

지역 선택

    ↓

현재 날씨 조회

    ↓

시간대별 / 일별 예보 조회

    ↓

최근 조회 지역 저장

```

---

## 4. 화면 구성

### 4.1 Header

#### 구성 요소

* 서비스 로고

* 서비스명

* 지역 검색 버튼 또는 검색창

* 다크모드 전환 버튼

#### 예시

```text

Weatherly                     [지역 검색] [☀ / 🌙]

```

---

## 5. 지역 검색 기능

### 5.1 검색창

사용자가 도시 또는 지역명을 입력하여 원하는 지역을 검색한다.

#### 입력 예시

```text

서울

부산

제주

Tokyo

New York

```

#### 기능

* 검색어 입력

* 검색 결과 자동완성

* 지역명 / 국가명 표시

* 검색 결과 선택

* Enter 키 검색 지원

* 검색 결과가 없을 경우 안내 메시지 표시

#### UI 예시

```text

┌─────────────────────────────┐

│ 🔍 지역을 검색하세요       │

└─────────────────────────────┘

서울특별시, 대한민국

서울 강남구, 대한민국

서울 송파구, 대한민국

```

---

## 6. 현재 날씨 영역

선택된 지역의 현재 날씨를 가장 강조해서 표시한다.

### 표시 정보

* 지역명

* 현재 날짜

* 현재 시간

* 날씨 아이콘

* 현재 기온

* 체감 온도

* 날씨 상태

* 최고 기온

* 최저 기온

### UI 예시

```text

서울특별시

2026년 9월 15일 화요일

        ☀️

       24°

맑음

최고 27° / 최저 18°

체감온도 25°

```

---

## 7. 상세 날씨 정보

현재 날씨 하단에 카드 형태로 주요 기상 정보를 표시한다.

### 표시 항목

| 항목     | 예시       |

| ------ | -------- |

| 습도     | 62%      |

| 풍속     | 2.4 m/s  |

| 강수확률   | 10%      |

| 자외선 지수 | 5        |

| 기압     | 1013 hPa |

| 가시거리   | 10 km    |

### UI 구조

```text

┌────────────┐ ┌────────────┐ ┌────────────┐

│ 💧 습도   │ │ 💨 풍속   │ │ ☔ 강수   │

│   62%      │ │ 2.4 m/s   │ │   10%     │

└────────────┘ └────────────┘ └────────────┘

```

모바일에서는 2열, PC에서는 3~6열 Grid 구조를 사용한다.

---

## 8. 시간대별 날씨

현재 시점부터 약 24시간의 시간별 예보를 표시한다.

### 표시 정보

* 시간

* 날씨 아이콘

* 기온

* 강수확률

### UI 형태

가로 스크롤 카드 형식

```text

지금     11시     12시     13시     14시

☀️       ☀️       🌤       ☁️       🌧

24°      25°      26°      26°      24°

10%      10%      20%      30%      60%

```

### 모바일

`overflow-x-auto` 적용

---

## 9. 일별 예보

최소 5일, 권장 7일간의 날씨를 표시한다.

### 표시 정보

* 날짜

* 요일

* 날씨 상태

* 날씨 아이콘

* 최저 기온

* 최고 기온

* 강수확률

### UI 예시

```text

오늘     ☀️ 맑음        18° / 27°

수요일   🌤 구름 조금   19° / 26°

목요일   🌧 비          18° / 23°

금요일   ☁️ 흐림        17° / 24°

토요일   ☀️ 맑음        18° / 26°

```

---

## 10. 최근 조회 지역

사용자가 최근 검색한 지역을 저장한다.

### 기능

* 최근 조회 지역 최대 5개 저장

* 브라우저 LocalStorage 활용

* 지역 클릭 시 즉시 날씨 조회

* 개별 삭제 또는 전체 삭제

### 예시

```text

최근 조회

[ 서울 ] [ 부산 ] [ 제주 ] [ 도쿄 ] [ 오사카 ]

```

---

## 11. 즐겨찾기 기능

자주 조회하는 지역을 저장한다.

### 기능

* 별표 버튼으로 등록

* 최대 10개 저장

* LocalStorage 활용

* 즐겨찾기 지역 클릭 시 해당 지역 날씨 조회

예시

```text

서울특별시                     ☆

```

클릭 후

```text

서울특별시                     ★

```

---

## 12. 현재 위치 기능

사용자의 브라우저 위치정보 사용 동의를 받아 현재 위치의 날씨를 조회한다.

### 버튼

```text

📍 현재 위치 날씨

```

### 처리 흐름

```text

버튼 클릭

↓

브라우저 위치 권한 요청

↓

Latitude / Longitude 조회

↓

지역 정보 조회

↓

날씨 API 호출

↓

현재 위치 날씨 표시

```

### 예외 처리

위치 권한 거부 시

```text

현재 위치 정보를 사용할 수 없습니다.

지역을 직접 검색해주세요.

```

---

## 13. 날씨별 UI 표현

날씨 상태에 따라 배경 또는 그래픽을 변경한다.

### 예시

| 날씨 | UI            |

| -- | ------------- |

| 맑음 | 밝은 Gradient   |

| 흐림 | Gray Gradient |

| 비  | Blue Gray     |

| 눈  | Light Blue    |

| 밤  | Dark Navy     |

단, 콘텐츠 가독성을 우선하여 배경 효과는 과도하게 사용하지 않는다.

---

## 14. 다크모드

`shadcn/ui` 및 Tailwind CSS의 Dark Mode를 적용한다.

### 기능

* Light

* Dark

* System 설정

### 권장 방식

```text

next-themes

```

---

## 15. API 처리

### 기본 API 흐름

```text

지역 검색

↓

Latitude / Longitude 조회

↓

Weather API 호출

↓

데이터 가공

↓

UI 표시

```

### 데이터 모델 예시

```ts

interface WeatherData {

  location: string

  temperature: number

  feelsLike: number

  minTemp: number

  maxTemp: number

  humidity: number

  windSpeed: number

  precipitation: number

  pressure: number

  visibility: number

  condition: string

  icon: string

}

```

---

## 16. 로딩 UI

API 조회 중 Skeleton UI를 표시한다.

shadcn의 `Skeleton` 컴포넌트를 활용한다.

```text

┌───────────────────────────┐

│ █████████████             │

│                           │

│       █████               │

│                           │

│ ███████████████████       │

└───────────────────────────┘

```

---

## 17. 오류 처리

다음 상황에 대한 오류 UI를 구현한다.

### API 오류

```text

날씨 정보를 불러오지 못했습니다.

[다시 시도]

```

### 지역 검색 결과 없음

```text

검색 결과가 없습니다.

다른 지역명을 입력해주세요.

```

### 네트워크 오류

```text

인터넷 연결 상태를 확인해주세요.

```

---

## 18. 반응형 디자인

### Desktop

```text

┌─────────────────────────────────────────┐

│ Header                                  │

├─────────────────────────────────────────┤

│                                         │

│         현재 날씨                       │

│                                         │

├─────────────────────────────────────────┤

│ 상세 날씨 카드                          │

├─────────────────────────────────────────┤

│ 시간별 날씨                             │

├─────────────────────────────────────────┤

│ 주간 날씨                               │

└─────────────────────────────────────────┘

```

### Mobile

```text

Header

지역 검색

현재 날씨

상세 날씨

시간별 날씨

→ Horizontal Scroll

주간 예보

```

---

## 19. shadcn/ui 사용 컴포넌트

권장 컴포넌트

```text

Card

Button

Input

Command

Popover

Dialog

Sheet

Skeleton

Tooltip

Separator

ScrollArea

Badge

DropdownMenu

```

---

## 20. Tailwind CSS 디자인 기준

### 전체

```text

max-w-6xl

mx-auto

px-4

md:px-6

```

### 카드

```text

rounded-2xl

border

shadow-sm

bg-card

```

### 주요 온도

```text

text-6xl

font-semibold

tracking-tight

```

### 섹션 제목

```text

text-xl

font-semibold

```

---

## 21. 메인 페이지 구조

```tsx

<App>

  <Header />

  <Main>

    <LocationSearch />

    <CurrentWeather />

    <WeatherDetailGrid />

    <HourlyForecast />

    <WeeklyForecast />

    <RecentLocations />

  </Main>

</App>

```

---

## 22. 컴포넌트 구조

```text

components/

 ├─ header.tsx

 ├─ location-search.tsx

 ├─ current-weather.tsx

 ├─ weather-detail-card.tsx

 ├─ weather-detail-grid.tsx

 ├─ hourly-forecast.tsx

 ├─ hourly-weather-card.tsx

 ├─ weekly-forecast.tsx

 ├─ daily-weather-row.tsx

 ├─ recent-locations.tsx

 ├─ favorite-locations.tsx

 └─ weather-skeleton.tsx

```

---

## 23. 주요 개발 요구사항

### 필수 기능

* 지역 검색

* 지역 선택

* 현재 날씨

* 체감온도

* 최고/최저 기온

* 습도

* 풍속

* 강수확률

* 시간대별 날씨

* 5~7일 예보

* 최근 검색 지역

* 반응형 UI

* Dark Mode

* API 로딩 처리

* API 오류 처리

### 선택 기능

* 현재 위치 날씨

* 즐겨찾기 지역

* 자외선 지수

* 일출/일몰

* 대기질

* 미세먼지

* 날씨 알림

---

## 24. 개발 완료 기준

아래 조건 충족 시 1차 개발 완료로 정의한다.

* 사용자가 지역을 검색할 수 있을 것

* 선택 지역의 현재 날씨가 정상 표시될 것

* 시간대별 날씨가 조회될 것

* 최소 5일 이상의 일별 예보가 표시될 것

* 모바일/PC에서 정상적으로 레이아웃이 작동할 것

* API 호출 중 Loading UI가 표시될 것

* API 오류 발생 시 오류 메시지가 표시될 것

* 최근 검색 지역이 브라우저에 저장될 것

* shadcn/ui 및 Tailwind CSS 기반으로 UI가 구현될 것

* Light/Dark Mode가 정상 동작할 것

실제 개발 요청용으로는 여기에 **Next.js App Router 기준 폴더 구조, API 연동 규격, 화면별 와이어프레임, 개발자용 프롬프트**까지 추가하면 Cursor에서 바로 구현을 시작하기 좋은 수준이 됩니다.

