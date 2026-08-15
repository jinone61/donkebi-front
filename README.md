# Donkebi

Donkebi는 전략을 과거 데이터로 검증하고 실제 운영 상태를 관찰하는 AI 에이전트 트레이딩 시스템의 프런트엔드입니다. 공개 브랜드 페이지와 운영 현황, 백테스트 도구를 하나의 Quasar SPA로 제공합니다.

## 주요 기능

- Donkebi의 원칙과 시스템 흐름을 소개하는 공개 랜딩 페이지
- 전략의 `PREPARE`, `APPLY`, `PLAN`, `SUBMIT` 운영 단계 조회
- 서울과 뉴욕 기준 시각, 다음 작업 예정 시각 및 자동 새로고침
- 미국 정규 휴장일을 고려한 다음 거래일 폴백 계산
- 공격·방어 전략 파라미터 기반 백테스트 실행
- 포트폴리오, 주문, 체결, 현금 흐름 및 성과 차트 조회
- 데스크톱과 모바일에 대응하는 반응형 인터페이스

## 화면

| 경로        | 설명                                                 |
| ----------- | ---------------------------------------------------- |
| `/`         | Donkebi 브랜드 및 시스템 소개                        |
| `/agent`    | 전략 1번의 운영 타임라인과 누적 성과 조회            |
| `/backtest` | 전략 설정, 백테스트 실행, 결과 및 다음 주문계획 조회 |
| 그 외 경로  | 브랜드 스타일의 404 페이지                           |

라우팅은 Quasar의 filename-based routing을 사용하며, 배포 방식은 hash 기반 SPA입니다.

## 기술 구성

- Vue 3와 `<script setup>`
- Quasar 2와 Vite
- Vue Router의 filename-based routing
- Axios
- Chart.js와 vue-chartjs
- Pinia
- SCSS, Oxfmt, Oxlint
- Node.js 내장 테스트 러너

## 개발 환경

Node.js 24.11 이상 25 미만과 npm을 사용합니다. 저장소 루트의 `.nvmrc`를 이용하면 동일한 Node 주 버전을 선택할 수 있습니다.

```bash
nvm use
npm install
npm run dev
```

개발 서버를 실행하면 Quasar 설정에 따라 브라우저가 자동으로 열립니다.

## 주요 명령

| 명령                 | 설명                                    |
| -------------------- | --------------------------------------- |
| `npm run dev`        | 개발 서버 실행 및 HMR 활성화            |
| `npm test`           | `tests/*.test.mjs` 전체 실행            |
| `npm run lint:check` | 포맷과 린트 규칙을 변경 없이 검사       |
| `npm run lint`       | Oxfmt 포맷 적용 및 Oxlint 자동 수정     |
| `npm run build`      | 프로덕션 SPA를 `dist/spa/`에 생성       |
| `npm run deploy`     | 빌드 결과를 `s3://donkebi-web`에 동기화 |

변경을 제출하기 전에는 다음 명령을 모두 실행합니다.

```bash
npm test
npm run lint:check
npm run build
```

`npm run deploy`는 AWS CLI 인증이 필요하며 원격 S3 버킷에서 불필요한 파일을 삭제하는 `--delete` 옵션을 사용합니다. 배포 대상과 자격 증명을 확인한 뒤 실행해야 합니다.

## 프로젝트 구조

```text
src/
├── assets/                  번들에 포함되는 이미지
├── boot/axios.js            Axios 인스턴스와 API 기본 주소
├── components/              재사용 UI와 주요 작업 화면
│   ├── agent/AgentPage.vue
│   └── backtest/BacktestPage.vue
├── content/                 정적 화면 콘텐츠
├── css/                     전역 스타일과 Quasar 변수
├── pages/                   파일명 기반 라우트
├── router/                  Vue Router 생성 설정
├── stores/                  Pinia 초기화 및 향후 공용 상태
└── utils/                   운영 일정과 미국 거래일 계산

tests/                       Node.js 테스트
docs/superpowers/            기능 설계와 구현 계획 기록
public/                      변환 없이 제공되는 정적 파일
quasar.config.js             Quasar 및 Vite 설정
```

## API 연결

공용 Axios 인스턴스는 `src/boot/axios.js`에서 생성합니다. 현재 API 기본 주소는 다음 값으로 코드에 직접 지정되어 있습니다.

```text
http://3.38.133.139:8080
```

주요 엔드포인트는 다음과 같습니다.

| 메서드 | 엔드포인트                                        | 용도                 |
| ------ | ------------------------------------------------- | -------------------- |
| `GET`  | `/api/dualsniper/operations/status?strategyId=1`  | Agent 운영 단계 조회 |
| `GET`  | `/api/dualsniper/strategies/results?strategyId=1` | Agent 누적 성과 조회 |
| `POST` | `/api/dualsniper/backtest`                        | 백테스트 실행        |

운영 화면은 최신 거래일의 네 단계가 모두 완료된 경우 다음 미국 정규 거래일을 프런트엔드에서 계산해 예정 카드로 표시합니다. 국가 애도일이나 재난에 따른 비정기 휴장은 이 계산 범위에 포함되지 않습니다.

## 테스트 범위

현재 테스트는 Node.js 내장 테스트 러너를 사용합니다.

- `tests/brand-pages.test.mjs`: 화면 구조, 콘텐츠, 반응형 스타일 및 데이터 처리 계약 검사
- `tests/operation-schedule.test.mjs`: 운영 단계 예정일과 자동 갱신 시점 계산 검사
- `tests/us-market-calendar.test.mjs`: 미국 주말과 정규 휴장일 계산 검사

브라우저 렌더링 기반 컴포넌트 테스트나 E2E 테스트는 아직 구성되어 있지 않습니다. 화면 변경 시 개발 서버에서 데스크톱과 모바일 흐름을 함께 확인합니다.

## 보안 및 환경 설정 주의사항

- `/agent`와 `/backtest`의 접근 비밀번호는 현재 클라이언트 코드에 포함되어 있습니다. 이는 화면 진입을 제한하는 수준이며 실제 인증이나 권한 검증을 대신할 수 없습니다.
- API 주소가 HTTP IP로 고정되어 있어 HTTPS 사이트에 배포할 경우 mixed content 정책의 영향을 받을 수 있습니다.
- 운영 환경으로 확장할 때는 API 주소를 환경별 설정으로 분리하고, 인증과 인가를 서버에서 처리해야 합니다.

## 빌드 문제 해결

macOS에서 개발 서버를 실행한 채 빌드를 동시에 수행할 때 파일 감시자 한도로 `EMFILE: too many open files, watch` 오류가 발생할 수 있습니다. 개발 서버를 유지해야 한다면 빌드 프로세스에만 폴링을 적용할 수 있습니다.

```bash
CHOKIDAR_USEPOLLING=true npm run build
```

Noto Serif KR 패키지는 존재하지 않는 `woff2` 경로에 대한 빌드 경고를 출력할 수 있습니다. 현재 배포 산출물에는 `woff` 폴백 파일이 포함됩니다.
