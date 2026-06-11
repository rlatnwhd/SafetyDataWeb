# 🛡️ 안전한가봄

> 공공데이터 기반 자취방 안전 분석 서비스

자취방 주소 하나만 입력하면 반경 1km 내 **안전도 · 불편도 · 편의도** 점수를 전국 평균과 비교해 한눈에 보여주는 웹 애플리케이션입니다.

🔗 **배포 주소**: [https://safety-data-web.vercel.app](https://safety-data-web.vercel.app)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔍 주소 기반 안전 분석 | 도로명·지번 주소 입력 → 반경 1km 내 공공데이터 자동 수집 |
| 📊 3단계 점수 산출 | 안전도 / 불편도 / 편의도 0~100점 (전국 평균 대비 log₂ 상대 점수) |
| 🗺️ 지도 시각화 | CCTV·경찰서·편의점·병원·유흥업소·은행·대형마트 마커 표시 |
| 🏪 브랜드 로고 마커 | 편의점 5종 · 대형마트 8종 · 은행 17종 SVG 원형 로고 마커 |
| ⭕ 반경 원 표시 | 분석 범위 반경 1km 원 시각화 |
| 🔦 카테고리 필터 | 마커 카테고리별 표시/숨김 토글 |
| 📋 범죄 통계 테이블 | 5대 범죄(살인·강도·절도·폭력·성범죄) 지역별 발생 현황 |
| 📱 반응형 UI | 모바일 640px 이하 레이아웃 자동 전환 |

---

## 🧮 점수 계산 방식

```
점수 = 50 + 25 × log₂(내 동네 수 / 전국 평균 수)
범위: 5 ~ 95점 (100점 불가 설계)

시설 수 = 전국 평균  →  50점
시설 수 = 2배        →  75점
시설 수 = 4배        →  ~95점
```

| 점수 항목 | 구성 |
|----------|------|
| 안전도 | CCTV 60% + 경찰서·파출소 40% |
| 불편도 | 유흥업소 50% + 범죄 발생 건수 50% |
| 편의도 | 편의점 40% + 병원 40% + 대형마트 20% |

---

## 📂 사용 데이터

| 데이터 | 출처 | 형식 |
|--------|------|------|
| 전국 CCTV 설치 현황 | 행정안전부 (공공누리 제1유형) | CSV |
| 범죄 발생 지역별 통계 | 경찰청 (공공누리 제1유형) | CSV |
| 전국 금융기관(은행) 점포 정보 | 전국은행연합회 소비자포털 | DBF |
| 편의점·병원·유흥업소·대형마트 위치 | 카카오 로컬 API | REST API |

---

## 🛠️ 기술 스택

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)
![KakaoMap](https://img.shields.io/badge/Kakao_Maps_API-yellow?logo=kakao&logoColor=black)

- **프레임워크**: React 19 + Vite 8
- **라우팅**: React Router v7
- **스타일**: CSS Modules + CSS 변수 시스템
- **지도**: 카카오맵 JavaScript API (MarkerClusterer, Circle)
- **배포**: Vercel

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── CrimeTable/      # 범죄 통계 테이블
│   ├── FeatureCards/    # 홈 기능 소개 카드
│   ├── Footer/          # 푸터 (데이터 출처)
│   ├── Header/          # 헤더 + 네비게이션
│   ├── KakaoMap/        # 지도 + 필터 패널
│   ├── ResultSection/   # 분석 결과 전체 영역
│   ├── ScoreBar/        # 점수 막대 그래프
│   └── SearchForm/      # 주소 검색 폼
├── hooks/
│   ├── useAddressSearch.js  # 주소 분석 전체 흐름
│   ├── useKakaoMap.js       # 카카오맵 마커·클러스터 관리
│   └── useKakaoSdk.js       # SDK 동적 로드
├── pages/
│   ├── Home/    # 메인 홈
│   ├── About/   # 서비스 소개
│   └── Guide/   # 이용 방법
├── services/
│   ├── csvService.js       # CSV 파싱 (CCTV, 범죄 통계)
│   ├── bankService.js      # 은행 점포 JSON 로드
│   ├── kakaoMapService.js  # 카카오 API 호출
│   ├── scoreService.js     # 점수 계산 로직
│   └── storeService.js     # 카테고리별 시설 집계
└── constants/
    └── mapConfig.js        # 전국 평균값, 마커 설정 상수
```

---

## 🚀 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 📜 라이선스 및 데이터 출처

본 서비스는 공공데이터 및 오픈 API를 활용한 **비상업적 학습 목적의 2차 저작물**입니다.

- CCTV 설치 현황 · 범죄 발생 통계: 공공누리 제1유형 (출처 표시 조건)
- 전국 금융기관 점포 정보: 전국은행연합회 (비상업적 목적, 원 출처 명시)
- 카카오맵 API: 카카오 오픈 API 이용약관 준수
