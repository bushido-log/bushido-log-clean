import re

with open("App.tsx", "r") as f:
    content = f.read()

old = """const handleSend = async () => {
    // デバッグ: 使用回数確認
    alert("isPro: " + isPro + ", uses: " + samuraiKingUses);
    // 課金チェック: Proでない場合、2回目以降はPaywall表示
    if (!isPro && samuraiKingUses >= 1) {
      setShowPaywall(true);
      return;
    }"""

new = """const handleSend = async () => {
    // 課金チェック: Proでない場合、2回目以降はPaywall表示
    if (!isPro && samuraiKingUses >= 1) {
      setShowPaywall(true);
      return;
    }"""

content = content.replace(old, new)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")
