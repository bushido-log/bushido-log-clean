# TODO

- [ ] **urbanislandz.com/feed を再確認**(2026-09-01時点で HTTP 522 = Cloudflare背後のオリジンサーバーがダウン。一時障害の可能性が高い)
  → ブラウザUAのcurlで `200` + `<item>` あり + 直近1週間の記事を確認できたら、`server/index.js` の `DIGEST_FEEDS` に1行追加:
  `{ name: 'Urban Islandz', url: 'https://urbanislandz.com/feed' },`
  (DancehallMagは403のままリストに残してある=ブロック解除時に自然復帰する)
