# TODO

- [ ] **既存エンドポイントのモデル移行を計画**(別セッションで計画的に): `server/index.js` の gpt-4o×13箇所(Yardie / culture / quiz / patwa 等)を現行世代へ。品質チューニング済みプロンプトのため一括置換せず、エンドポイントごとに検品しながら移行する。あわせて**廃止済み `gpt-4o-search-preview` 5箇所の整理**(searchWithFallbackの死んだ2段目 + /debug-ai)も行う。※digestは gpt-5.4-mini 移行済み(de9a3f1)
- [ ] **urbanislandz.com/feed を再確認**(2026-09-01時点で HTTP 522 = Cloudflare背後のオリジンサーバーがダウン。一時障害の可能性が高い)
  → ブラウザUAのcurlで `200` + `<item>` あり + 直近1週間の記事を確認できたら、`server/index.js` の `DIGEST_FEEDS` に1行追加:
  `{ name: 'Urban Islandz', url: 'https://urbanislandz.com/feed' },`
  (DancehallMagは403のままリストに残してある=ブロック解除時に自然復帰する)
