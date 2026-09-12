# TODO

- [ ] **Yardie×マップ連携(build 76以降の弾)**:
  - **案A(先行)**: /yardie-guide のプロンプトにspotsテーブル実データ(名前+parish)を注入して登録スポット優先で推薦させる+回答中の登録スポット名をサーバーが照合し `mentioned_spots: [{id, name}]` をレスポンスに添付 → クライアントに「🗺️ マップで見る」ボタン(タップでJamaicaGuideへ遷移+該当ピンにズーム)。実データのみ=ハルシネーション構造的に不可
  - **案B(本命)**: 回答中の未登録スポットをサーバーがNominatim(OSM)照合(既存の座標検証ポリシーと同方式)→「このスポットをマップに追加する?」承認UI → OKでspotsにINSERT(重複チェック込み)。チャットで見つけた場所がマップに蓄積される
- [x] ~~既存エンドポイントのモデル移行~~ **完了(2026-09-12, 56db053)**: 全gpt-4o箇所をgpt-5.4-mini+reasoning noneへ移行、search-preview死骸5箇所削除、Yardie/cultureにno-markdown+標準語ルール追加、本番検証済み。サーバーからgpt-4o参照は消滅
- [ ] **urbanislandz.com/feed を再確認**(2026-09-01時点で HTTP 522 = Cloudflare背後のオリジンサーバーがダウン。一時障害の可能性が高い)
  → ブラウザUAのcurlで `200` + `<item>` あり + 直近1週間の記事を確認できたら、`server/index.js` の `DIGEST_FEEDS` に1行追加:
  `{ name: 'Urban Islandz', url: 'https://urbanislandz.com/feed' },`
  (DancehallMagは403のままリストに残してある=ブロック解除時に自然復帰する)
