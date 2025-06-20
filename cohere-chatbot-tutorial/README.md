# Cohere Chatbot Tutorial

이 프로젝트는 Cohere API를 사용하여 챗봇을 구축하는 튜토리얼입니다.

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

1. `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

2. [Cohere Dashboard](https://dashboard.cohere.com/)에서 API 키를 발급받습니다.

3. `.env` 파일에 API 키를 입력합니다:

```
COHERE_API_KEY=your_actual_api_key_here
```

### 3. 프로젝트 빌드

```bash
npm run build
```

### 4. 챗봇 실행

**개발 모드로 실행:**

```bash
npm run dev
```

**빌드된 버전 실행:**

```bash
npm start
```

## 📚 튜토리얼 내용

### 1. 기본 챗봇 구현

- Cohere API 클라이언트 설정
- 기본 채팅 기능
- 오류 처리

### 2. 고급 기능

- **Preamble (프리엠블)**: 챗봇의 성격과 역할 정의
- **Streaming**: 실시간 응답 스트리밍
- **State Management**: 대화 기록 관리
- **Temperature 조절**: 응답의 창의성 조절

### 3. 인터랙티브 명령어

- `quit` 또는 `exit`: 챗봇 종료
- `clear`: 대화 기록 삭제
- `history`: 대화 기록 조회
- `streaming`: 스트리밍 모드 토글
- `preamble`: 새로운 프리엠블 설정

## 🏗️ 프로젝트 구조

```
src/
├── chatbot.ts      # 메인 챗봇 클래스
├── index.ts        # CLI 인터페이스
└── examples.ts     # 기능 데모 예제
```

## 🔧 주요 클래스: `CohereChatbot`

### 구성 옵션 (`ChatbotConfig`)

- `model`: 사용할 Cohere 모델 (기본값: 'command-r-plus')
- `temperature`: 응답의 창의성 (0.0-1.0, 기본값: 0.7)
- `maxTokens`: 최대 토큰 수 (기본값: 500)
- `preamble`: 시스템 메시지/역할 정의
- `enableStreaming`: 스트리밍 모드 활성화 여부

### 주요 메서드

- `sendMessage(message: string)`: 메시지 전송 및 응답 받기
- `getConversationHistory()`: 대화 기록 조회
- `clearHistory()`: 대화 기록 삭제
- `setPreamble(preamble: string)`: 프리엠블 설정
- `updateConfig(config: Partial<ChatbotConfig>)`: 설정 업데이트

## 📝 사용 예제

### 기본 사용법

```typescript
import { CohereChatbot } from "./src/chatbot";

const chatbot = new CohereChatbot("your-api-key", {
  preamble: "You are a helpful assistant.",
  enableStreaming: false,
});

const response = await chatbot.sendMessage("Hello!");
console.log(response);
```

### 스트리밍 모드

```typescript
const streamingBot = new CohereChatbot("your-api-key", {
  enableStreaming: true,
});

// 응답이 실시간으로 출력됩니다
await streamingBot.sendMessage("Tell me a story");
```

## 🔑 API 키 발급

1. [Cohere Dashboard](https://dashboard.cohere.com/)에 접속
2. 계정 생성 또는 로그인
3. API Keys 섹션에서 새 키 생성
4. 생성된 키를 `.env` 파일에 추가

## 🛠️ 개발 스크립트

- `npm run dev`: 개발 모드로 실행 (ts-node 사용)
- `npm run build`: TypeScript 컴파일
- `npm run watch`: 파일 변경 감지하여 자동 컴파일
- `npm start`: 컴파일된 JavaScript 실행
- `npm run clean`: 빌드 폴더 삭제

## 🎯 학습 목표

이 튜토리얼을 통해 다음을 학습할 수 있습니다:

1. **Cohere API 기본 사용법**

   - API 클라이언트 설정
   - 채팅 엔드포인트 활용

2. **챗봇 아키텍처 설계**

   - 메시지 히스토리 관리
   - 상태 관리 패턴

3. **고급 기능 구현**

   - 실시간 스트리밍
   - 동적 설정 변경
   - 오류 처리

4. **TypeScript 모범 사례**
   - 타입 안전성
   - 인터페이스 설계
   - 에러 핸들링

## 🤝 기여하기

이 프로젝트에 기여하고 싶으시다면:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 라이선스

MIT License

## 🆘 도움말

문제가 발생하면:

1. `.env` 파일에 올바른 API 키가 설정되어 있는지 확인
2. 인터넷 연결 상태 확인
3. API 키의 유효성 및 권한 확인
4. Cohere API 사용량 한도 확인
