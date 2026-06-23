# Ultimate Question Builder

AI에게 더 잘 물어볼 수 있는 궁극의 질문을 만드는 Next.js 앱입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:3000`입니다. 원하는 포트로 실행하려면:

```bash
npm run dev -- -p 54892
```

## 웹 배포

이 앱은 Next.js API Route를 사용하므로 GitHub Pages 단독 배포가 아니라 Vercel 같은 Next.js 서버 지원 플랫폼이 필요합니다.

1. GitHub에 새 저장소를 만들고 이 프로젝트를 push합니다.
2. Vercel에서 `Add New Project`를 누릅니다.
3. GitHub 저장소를 선택합니다.
4. Framework는 `Next.js`로 인식됩니다.
5. `Deploy`를 누르면 `https://프로젝트명.vercel.app` 주소가 만들어집니다.

## API 키 저장 방식

- 로컬 개발: 같은 PC에서 편하게 쓰도록 서버 파일 저장도 지원합니다.
- 웹 배포: 다른 사용자와 키가 섞이지 않도록 브라우저 localStorage에만 저장합니다.

배포 후 사용자는 각자 메뉴에서 OpenAI API 키를 한 번 입력하면 같은 브라우저에서 계속 사용할 수 있습니다.

## Vercel 설정

`vercel.json`이 포함되어 있어 기본 설정 그대로 배포할 수 있습니다.

## CI

GitHub Actions에서 다음을 확인합니다.

```bash
npm test
npm run typecheck
npm run build
```
