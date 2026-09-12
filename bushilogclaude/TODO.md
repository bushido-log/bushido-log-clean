# TODO

- [ ] **Yardie×マップ連携(build 76以降の弾)**:
  - **案A(先行)**: /yardie-guide のプロンプトにspotsテーブル実データ(名前+parish)を注入して登録スポット優先で推薦させる+回答中の登録スポット名をサーバーが照合し `mentioned_spots: [{id, name}]` をレスポンスに添付 → クライアントに「🗺️ マップで見る」ボタン(タップでJamaicaGuideへ遷移+該当ピンにズーム)。実データのみ=ハルシネーション構造的に不可
  - **案B(本命)**: 回答中の未登録スポットをサーバーがNominatim(OSM)照合(既存の座標検証ポリシーと同方式)→「このスポットをマップに追加する?」承認UI → OKでspotsにINSERT(重複チェック込み)。チャットで見つけた場所がマップに蓄積される
- [ ] **既存エンドポイントのモデル移行を計画**(別セッションで計画的に): `server/index.js` の gpt-4o×残り(Yardie / culture / quiz 等)を現行世代へ。品質チューニング済みプロンプトのため一括置換せず、エンドポイントごとに検品しながら移行する。あわせて**廃止済み `gpt-4o-search-preview` 5箇所の整理**(searchWithFallbackの死んだ2段目 + /debug-ai)も行う。※digest(de9a3f1)と**patwa/Ras Tutor(e6bdcd4)は移行済み**。移行時の注意: 5.4-miniはMarkdown記号を出すので「no markdown」ルール必須、max_tokens→max_completion_tokens、キャッシュキーのバージョンbumpを忘れずに
- [ ] **urbanislandz.com/feed を再確認**(2026-09-01時点で HTTP 522 = Cloudflare背後のオリジンサーバーがダウン。一時障害の可能性が高い)
  → ブラウザUAのcurlで `200` + `<item>` あり + 直近1週間の記事を確認できたら、`server/index.js` の `DIGEST_FEEDS` に1行追加:
  `{ name: 'Urban Islandz', url: 'https://urbanislandz.com/feed' },`
  (DancehallMagは403のままリストに残してある=ブロック解除時に自然復帰する)
