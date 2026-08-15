# 저장소 작업 지침

## 프로젝트 구조와 모듈 구성

이 저장소는 Vue 3, Quasar, Vite로 만든 SPA입니다. 애플리케이션 코드는 `src/`에 둡니다.

- `src/pages/`: Quasar filename-based routing에 연결되는 라우트 컴포넌트
- `src/components/`: 재사용 UI와 Agent·Backtest 작업 화면
- `src/stores/`: Pinia 초기화와 공용 상태 모듈
- `src/utils/`: 운영 일정과 시장 달력 등 순수 유틸리티
- `src/content/`: 정적 화면 콘텐츠
- `src/css/`: 전역 스타일과 Quasar SCSS 변수
- `src/assets/`: 번들에 포함되는 이미지와 리소스
- `public/`: 변환 없이 그대로 제공할 정적 파일
- `tests/`: Node.js 내장 테스트 러너로 실행하는 테스트
- `docs/superpowers/`: 기능 설계와 구현 계획 기록

라우트 파일은 Vue Router 파일 라우팅 문법을 따릅니다. `src/pages/index.vue`는 공통 레이아웃이고, `src/pages/index/(home).vue`, `agent.vue`, `backtest.vue`가 하위 화면을 구성합니다. `src/pages/[...path].vue`는 404 화면입니다.

## 개발 환경과 명령

Node.js 24.11 이상 25 미만과 npm을 사용합니다. 작업을 시작할 때 저장소의 `.nvmrc`를 적용합니다.

```bash
nvm use
npm install
```

주요 명령은 다음과 같습니다.

- `npm run dev`: Quasar 개발 서버 실행
- `npm test`: `tests/*.test.mjs` 전체 실행
- `npm run lint:check`: 포맷과 린트 규칙 검사
- `npm run lint`: Oxfmt 포맷 적용 및 Oxlint 자동 수정
- `npm run build`: 프로덕션 SPA 빌드
- `npm run deploy`: `dist/spa/`를 S3에 동기화

변경을 제출하기 전에는 `npm test`, `npm run lint:check`, `npm run build`를 모두 실행합니다. 개발 서버와 빌드를 동시에 실행할 때 `EMFILE`이 발생하면 빌드 프로세스에만 `CHOKIDAR_USEPOLLING=true`를 적용합니다.

## 코딩 스타일과 이름 규칙

- Oxfmt와 Oxlint의 기존 출력을 따릅니다.
- JavaScript와 Vue SFC는 두 칸 들여쓰기, 작은따옴표, 세미콜론 생략을 사용합니다.
- Vue 컴포넌트는 가능한 경우 `<script setup>`을 사용합니다.
- 재사용 컴포넌트 이름은 PascalCase로 작성합니다. 예: `EssentialLink.vue`
- 스토어와 유틸리티 모듈 파일은 kebab-case로 작성합니다.
- 라우트 파일은 Vue Router filename-based routing 문법에 맞춥니다.
- 컴포넌트는 한 가지 역할에 집중하고, 여러 화면이 공유하는 상태는 Pinia나 별도 모듈로 이동합니다.
- 화면에 표시되는 날짜와 시각은 대상 시장과 시간대를 명시적으로 처리합니다. 날짜 전용 값은 불필요한 로컬 시간대 변환을 피합니다.

## 테스트 지침

현재 테스트는 다음 세 영역을 다룹니다.

- `tests/brand-pages.test.mjs`: 페이지 구조, 콘텐츠, 스타일 및 주요 데이터 처리 계약
- `tests/operation-schedule.test.mjs`: 운영 일정과 자동 새로고침 시점
- `tests/us-market-calendar.test.mjs`: 미국 정규 거래일과 휴장일

기능이나 버그를 변경할 때 관련 테스트를 먼저 추가하거나 갱신합니다. 새 순수 유틸리티 테스트는 `tests/*.test.mjs`에 두고 `npm test`에 포함합니다. Vue 컴포넌트 테스트 도구를 도입할 경우 소스와 가까운 위치에 `*.spec.js`를 두고, 실행 명령을 `package.json`, README, 이 문서에 함께 반영합니다.

자동 테스트만으로 브라우저 동작을 보장할 수 없으므로 화면 변경은 `npm run dev`에서 영향을 받는 흐름을 직접 확인합니다. 반응형 UI 변경은 데스크톱과 모바일 너비를 모두 확인하고, PR에 간단한 수동 검증 절차를 남깁니다.

## 아키텍처와 설정 원칙

- API 공용 설정은 `src/boot/axios.js`에서 관리합니다.
- 환경별로 달라지는 API 주소나 비밀 값은 새로 하드코딩하지 않습니다.
- 클라이언트 비밀번호를 실제 인증이나 권한 검증으로 취급하지 않습니다.
- 반복되는 차트, 포맷팅, 데이터 정규화 로직은 기능 경계가 분명할 때 공용 컴포넌트나 유틸리티로 분리합니다.
- 미국 시장 달력의 비정기 휴장처럼 프런트엔드만으로 확정할 수 없는 값은 서버 데이터를 우선합니다.
- 프레임워크와 빌드 설정은 특별한 이유가 없으면 `quasar.config.js`에 모읍니다.

## Git과 변경사항 관리

- 기존 작업 트리에 있는 사용자 변경사항을 보존하고, 요청 범위 밖의 파일을 수정하지 않습니다.
- 파괴적인 Git 명령이나 광범위한 파일 삭제를 사용하지 않습니다.
- 커밋 제목은 짧은 명령형 문장으로 작성합니다. 예: `Agent 운영 상태 새로고침 추가`
- 관련 없는 변경은 서로 다른 커밋으로 분리합니다.
- PR에는 목적과 접근 방법, 관련 이슈, 자동·수동 검증 결과를 작성합니다.
- 보이는 UI 변경에는 스크린샷이나 녹화를 첨부합니다.
- 설정 변경, 배포 영향, 후속 작업은 PR에 명시합니다.
