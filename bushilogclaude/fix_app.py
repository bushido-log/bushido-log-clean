import re

with open("App.tsx", "r") as f:
    content = f.read()

old1 = """const usesJson = await AsyncStorage.getItem(SAMURAI_KING_USES_KEY);
      const uses = usesJson ? parseInt(usesJson, 10) : 0;
      setSamuraiKingUses(uses);"""

new1 = """// 日付ごとの使用回数管理
      const today = new Date().toISOString().split('T')[0];
      const usesJson = await AsyncStorage.getItem(SAMURAI_KING_USES_KEY);
      if (usesJson) {
        try {
          const parsed = JSON.parse(usesJson);
          if (parsed.date === today) {
            setSamuraiKingUses(parsed.count);
          } else {
            setSamuraiKingUses(0);
            await AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: 0 }));
          }
        } catch {
          setSamuraiKingUses(0);
        }
      } else {
        setSamuraiKingUses(0);
      }"""

content = content.replace(old1, new1)

old2 = """speakSamurai(replyText);      // 使用回数をカウントアップ      if (!isPro) {        const newUses = samuraiKingUses + 1;        setSamuraiKingUses(newUses);        AsyncStorage.setItem(SAMURAI_KING_USES_KEY, String(newUses));      }"""

new2 = """speakSamurai(replyText);
      // 使用回数をカウントアップ
      if (!isPro) {
        const today = new Date().toISOString().split('T')[0];
        const newUses = samuraiKingUses + 1;
        setSamuraiKingUses(newUses);
        AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: newUses }));
      }"""

content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")
