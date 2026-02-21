# 🔦 Lumos (Front-end)

## 1. 프로젝트 소개 (introduction)

**Lumos**는 사용자가 웹 서핑 중 마주치는 기만적인 디자인(Dark Patterns)을 실시간으로 탐지하고 삭제, 혹은 시각적으로 표시해주는 **AI 기반 다크 패턴 탐지 및 사용자 보호 크롬 익스텐션**입니다. 

<br>

## 2. 주요 기능 (Key Features)

- **실시간 다크 패턴 탐지**
    - 웹 페이지 내의 기만적인 UI/UX 요소를 실시간으로 분석하여 사용자가 합리적인 의사결정을 내릴 수 있도록 돕습니다.
    - 사전에 정의된 다크 패턴 알고리즘을 통해 사용자의 인지적 편향을 악용하는 요소를 즉각 포착합니다.

- **스마트 경고 모달**
    - 탐지된 다크 패턴의 위험도(주의/경고/위험)와 상세 설명을 직관적인 모달 창으로 제공합니다.
    - 현재 직면한 디자인이 어떤 방식으로 사용자를 기만하고 있는지 구체적인 근거를 안내합니다.

- **약관 데이터 요약 분석**
    - 길고 복잡한 서비스 이용 약관 및 개인정보 처리방침에서 핵심 독소 조항이나 중요 데이터를 추출합니다.
    - 추출된 데이터를 사용자 친화적인 팝업 형태로 요약하여 정보 불균형 문제를 해결합니다.

- **시각적 강조 표시**
    - 다크 패턴이 의심되는 영역에 직접적인 시각적 효과(테두리, 오버레이 등)를 부여하여 가독성을 높입니다.
    - 페이지 전체를 훑지 않아도 주의해야 할 위치를 한눈에 파악할 수 있는 환경을 조성합니다.

<br>

## 3. 기술 스택 (Technology Stack)

- **Core**: `Vanilla JavaScript (ES6+)`, `Chrome Extension API (Manifest v3)`
- **Logic & Content**: `Content Scripts`, `Background Service Workers`
- **HTTP Client**: `Fetch API (for server-side data)`
- **State Management**: `Chrome Storage API`, `Local Variables`
- **UI/UX**: `HTML5`, `CSS3`, `DOM Manipulation (Custom Modal Logic)`
- **Build Tool**: `Chrome Extension Developer Mode`

<br>

## 4. 프로젝트 구조 (Project Structure)

```
Lumos-Front/
├── public/
│   ├── assets/             # 이미지 및 아이콘 리소스
│   ├── datas/              
│   │   └── policy.json     # 개인정보 처리방침 및 이용약관 내용
│   └── manifest.json       # 크롬 익스텐션 설정 파일
├── src/                    
│   ├── assets/             # 이미지 및 아이콘 리소스
│   ├── detector/           # 다크 패턴 시각적 표현 기능 (웹 페이지 DOM 조작)
│   ├── policy/             # 개인정보 처리방침 및 이용약관 페이지
│   ├── modal/              # 개인정보 처리방침 및 이용약관 동의용 모달
│   └── popup/              # 익스텐션 상단 팝업
├── .gitignore     
├── package.json 
├── vite.config.js 
└── README.md    
```

<br>

## 5. 로컬 개발 환경 설정
