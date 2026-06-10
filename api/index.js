// Vercel 서버리스 진입점 — Expo Router 서버 출력(dist/server)을 Vercel로 위임.
// (앱의 API 라우트 app/api/*.ts 와는 별개. 이 파일은 Vercel 배포 전용.)
const { createRequestHandler } = require('@expo/server/adapter/vercel');

module.exports = createRequestHandler({
  build: require('path').join(__dirname, '../dist/server'),
});
