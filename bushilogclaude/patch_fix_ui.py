#!/usr/bin/env python3
"""
修正パッチ:
1. マップ: 戻る/WORLDタイトル被り修正
2. ミッション: 妖怪名+説明追加
3. 吹き出し: テキスト位置下げ
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    count = 0

    # =========================================
    # 1. マップ: 戻るボタンを背景の中に、タイトル下げ
    # =========================================

    # 戻るボタン: top:50 → 背景の上に重ねる形でzIndex高く
    # WORLDタイトル: top:50 → もっと下に (top:100)
    # 戻るボタンは左上に小さく

    old_map_title = """          <View style={{ position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 6 }}>
              {'WORLD 1 \\u300C\\u76EE\\u899A\\u3081\\u300D'}
            </Text>
          </View>
          <Pressable
            onPress={() => { playTapSound(); setInnerWorldView('menu'); }}
            style={{ position: 'absolute', top: 50, left: 16, zIndex: 20 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 }}>{'\\u2190 \\u623B\\u308B'}</Text>
          </Pressable>"""

    new_map_title = """          <Pressable
            onPress={() => { playTapSound(); setInnerWorldView('menu'); }}
            style={{ position: 'absolute', top: 54, left: 16, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>{'\\u2190 \\u623B\\u308B'}</Text>
          </Pressable>
          <View style={{ position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: '#DAA520', fontSize: 13, fontWeight: '900', letterSpacing: 3, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6 }}>
              {'WORLD 1'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6, marginTop: 2 }}>
              {'\\u300C\\u76EE\\u899A\\u3081\\u300D'}
            </Text>
          </View>"""

    if old_map_title in content:
        content = content.replace(old_map_title, new_map_title, 1)
        print("[OK] Map title/back button fixed")
        count += 1
    else:
        print("[WARN] Map title not found")

    # =========================================
    # 2. ミッション: 妖怪名+説明追加
    # =========================================

    old_mission = """            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 2, marginBottom: 20 }}>{'\\u2694\\uFE0F \\u30DF\\u30C3\\u30B7\\u30E7\\u30F3'}</Text>
              <Text style={{ color: '#fff', fontSize: 64, fontWeight: '900', marginBottom: 10 }}>{missionCount}</Text>
              <Text style={{ color: '#888', fontSize: 16, marginBottom: 30 }}>{missionCount + ' / ' + MISSION_TARGET}</Text>"""

    new_mission = """            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\\u4E09\\u65E5\\u574A\\u4E3B'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{'\\u2694\\uFE0F \\u8155\\u7ACB\\u3066\\u3075\\u305B 10\\u56DE\\u3067\\u8A0E\\u4F10\\uFF01'}</Text>
              <Text style={{ color: '#fff', fontSize: 72, fontWeight: '900', marginBottom: 6 }}>{missionCount}</Text>
              <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{missionCount + ' / ' + MISSION_TARGET}</Text>"""

    if old_mission in content:
        content = content.replace(old_mission, new_mission, 1)
        print("[OK] Mission context added")
        count += 1
    else:
        print("[WARN] Mission section not found")

    # =========================================
    # 3. 吹き出し: テキスト位置 0.43 → 0.50
    # =========================================

    old_pos = "top: SCREEN_H * 0.43, left: 55, right: 55"
    new_pos = "top: SCREEN_H * 0.50, left: 55, right: 55"
    replaced = content.replace(old_pos, new_pos)
    if replaced != content:
        content = replaced
        print(f"[OK] Bubble text position: 0.43 -> 0.50")
        count += 1
    else:
        print("[WARN] Text position not found")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n[DONE] {count} fixes applied")

if __name__ == "__main__":
    main()
