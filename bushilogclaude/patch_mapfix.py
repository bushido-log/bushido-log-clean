#!/usr/bin/env python3
"""
修正:
1. ステージマップ: 戻るボタン削除
2. ノードY座標調整 (画面内に収まるように)
3. テストモード: AsyncStorageフラグクリア追加
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    count = 0

    # 1. Remove back button from stage map
    old_back = """          <Pressable onPress={() => { playTapSound(); setInnerWorldView('menu'); }} style={{ position: 'absolute', top: 54, left: 16, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 14 }}>{'\u2190 \u623B\u308B'}</Text>
          </Pressable>
          <View style={{ position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>"""

    new_title = """          <View style={{ position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>"""

    if old_back in content:
        content = content.replace(old_back, new_title, 1)
        print("[OK] Back button removed")
        count += 1

    # 2. Adjust node Y positions (shift up to fit screen)
    # Old: 0.82, 0.66, 0.50, 0.34, 0.18
    # New: 0.75, 0.60, 0.47, 0.34, 0.21
    old_nodes = "        { id: 1, name: '\u4E09\u65E5\u574A\u4E3B', icon: NODE_FIST, cleared: mikkabozuEventDone, x: 0.5, y: 0.82 },"
    new_nodes = "        { id: 1, name: '\u4E09\u65E5\u574A\u4E3B', icon: NODE_FIST, cleared: mikkabozuEventDone, x: 0.5, y: 0.75 },"
    if old_nodes in content:
        content = content.replace(old_nodes, new_nodes, 1)
        count += 1

    content = content.replace(
        "{ id: 2, name: '\u30A2\u30C8\u30C7\u30E4\u30EB', icon: NODE_KATANA, cleared: false, x: 0.3, y: 0.66 },",
        "{ id: 2, name: '\u30A2\u30C8\u30C7\u30E4\u30EB', icon: NODE_KATANA, cleared: false, x: 0.3, y: 0.60 },", 1)
    content = content.replace(
        "{ id: 3, name: '\u30C7\u30FC\u30D6', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.50 },",
        "{ id: 3, name: '\u30C7\u30FC\u30D6', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.47 },", 1)
    content = content.replace(
        "{ id: 5, name: '\u4E09\u65E5\u574A\u4E3BII', icon: NODE_BOSS, cleared: false, x: 0.5, y: 0.18 },",
        "{ id: 5, name: '\u4E09\u65E5\u574A\u4E3BII', icon: NODE_BOSS, cleared: false, x: 0.5, y: 0.21 },", 1)
    print("[OK] Node positions adjusted")

    # 3. Fix test mode: clear event flag before triggering
    old_test = "      // TEMP_TEST: skip day check\n      setTimeout(() => startStoryEvent(), 500); return;"
    new_test = "      // TEMP_TEST: skip day check\n      await AsyncStorage.removeItem(MIKKABOZU_EVENT_KEY); setMikkabozuEventDone(false); setInnerWorldUnlocked(false); setTimeout(() => startStoryEvent(), 500); return;"

    if old_test in content:
        content = content.replace(old_test, new_test, 1)
        print("[OK] Test mode clears event flag")
        count += 1

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n[DONE] {count} fixes applied")

if __name__ == "__main__":
    main()
