with open("App.tsx", "r") as f:
    content = f.read()

# 1. handleSend関数に課金チェック追加（相談送信時）
old1 = "const handleSend = async () => {"
new1 = """const handleSend = async () => {
    // 課金チェック: Proでない場合、2回目以降はPaywall表示
    if (!isPro && samuraiKingUses >= 1) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old1, new1)

# 2. handleSend内の成功時に使用回数カウントアップを追加
# これはメッセージ送信成功後に追加する必要がある
old2 = "setMessages((prev) => [...prev, newMsg]);"
new2 = """setMessages((prev) => [...prev, newMsg]);
      // 使用回数カウントアップ
      if (!isPro) {
        const today = new Date().toISOString().split('T')[0];
        const newUses = samuraiKingUses + 1;
        setSamuraiKingUses(newUses);
        AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: newUses }));
      }"""
content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 4 done - consultation limit added!")