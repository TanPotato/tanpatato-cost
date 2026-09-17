# `bun run lint`이 스킬 eval 픽스처 때문에 항상 실패한다

## 증상

`bun run lint`가 18건의 오류로 실패한다. 오류는 모두
`@typescript-eslint/no-require-imports`이고, 대상은 제품 코드가 아니라 설치된
스킬의 eval 픽스처다.

- `.agents/skills/babysit-specs/evals/fixtures/queued-specs/server.js`
- `.agents/skills/shape-idea/evals/fixtures/notification-preview/server.js`
- `.agents/skills/shape-idea/evals/fixtures/notification-settings/server.js`
- 같은 파일들의 `.claude/skills/...` 복사본 세 개

각 파일의 1~3행에서 `require()`를 쓴다.

## 증거

`git log --oneline -1 -- .claude/skills/shape-idea/evals/fixtures/notification-preview/server.js`가
`e5edf62 Initial commit`을 가리킨다. 기록·진단 화면 작업 이전부터 있던 파일이고
이번 변경과 무관하다. 기록·진단 화면 작업 범위(`app/`, `features/finance-record/`)에서는
오류가 없다.

## 짐작하는 원인

`eslint.config.mjs`가 `.agents/`와 `.claude/` 아래를 검사 대상에서 빼지 않는다.
스킬 픽스처는 Node 스크립트라 CommonJS를 쓰는 것이 정상이므로, 파일을 고칠 것이
아니라 검사 대상에서 빼는 쪽이 맞아 보인다.

## 해 본 것

기록·진단 화면 구현 중 `bun run lint`를 돌려 확인했고, 제품 코드에서 나온 오류
두 건(사용하지 않는 import, effect 안의 setState)은 고쳤다. 픽스처 오류는 범위
밖이라 손대지 않았다.

## 다음 걸음

`eslint.config.mjs`의 `ignores`에 `.agents/**`와 `.claude/**`를 넣고
`bun run lint`가 통과하는지 확인한다. 스킬 디렉터리 전체를 빼는 것이 과하면
`**/evals/fixtures/**`만 빼는 선택지도 있다.
