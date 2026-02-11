#!/usr/bin/env python3
"""
World 1 ステージマップ追加
- innerWorldViewに'stageMap'追加
- 坂道背景 + 5ステージノード
- Stage 1クリア済み、2-5ロック
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    count = 0

    # 1. Expand innerWorldView type
    old_type = "'menu' | 'yokaiDex'"
    new_type = "'menu' | 'yokaiDex' | 'stageMap'"
    content = content.replace(old_type, new_type)
    count += 1
    print("[OK] innerWorldView type expanded")

    # 2. Add stage map assets at top (after existing requires)
    old_assets = "const CONSULT_BG = require('./assets/images/consult_bg.png');"
    new_assets = """const CONSULT_BG = require('./assets/images/consult_bg.png');
const WORLD1_BG = require('./assets/map/bg/world1_bg.png');
const NODE_FIST = require('./assets/map/nodes/node_fist.png');
const NODE_KATANA = require('./assets/map/nodes/node_katana.png');
const NODE_SCROLL = require('./assets/map/nodes/node_scroll.png');
const NODE_BRAIN = require('./assets/map/nodes/node_brain.png');
const NODE_BOSS = require('./assets/map/nodes/node_boss.png');
const NODE_LOCKED = require('./assets/map/nodes/node_locked.png');
const NODE_DIAMOND = require('./assets/map/nodes/node_diamond.png');"""
    if old_assets in content:
        content = content.replace(old_assets, new_assets, 1)
        count += 1
        print("[OK] Map assets added")

    # 3. Add stage map view in renderInnerWorldTab (before yokaiDex check)
    old_yokai_check = "    if (innerWorldView === 'yokaiDex') {"
    stage_map_view = """    if (innerWorldView === 'stageMap') {
      const W1_STAGES = [
        { id: 1, name: '\u4e09\u65e5\u574a\u4e3b', sub: '\u8155\u7acb\u3066\u3075\u305b 10\u56de', icon: NODE_FIST, cleared: mikkabozuEventDone, x: 0.5, y: 0.82 },
        { id: 2, name: '\u30a2\u30c8\u30c7\u30e4\u30eb', sub: '\u203b\u6e96\u5099\u4e2d', icon: NODE_KATANA, cleared: false, x: 0.3, y: 0.66 },
        { id: 3, name: '\u30c7\u30fc\u30d6', sub: '\u203b\u6e96\u5099\u4e2d', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.50 },
        { id: 4, name: '\u30e2\u30a6\u30e0\u30ea', sub: '\u203b\u6e96\u5099\u4e2d', icon: NODE_BRAIN, cleared: false, x: 0.35, y: 0.34 },
        { id: 5, name: '\u4e09\u65e5\u574a\u4e3b\u2161', sub: 'BOSS', icon: NODE_BOSS, cleared: false, x: 0.5, y: 0.18 },
      ];
      return (
        <ImageBackground source={WORLD1_BG} style={{ flex: 1 }} resizeMode="cover">
          <View style={{ position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 6 }}>
              WORLD 1 \u300c\u76ee\u899a\u3081\u300d
            </Text>
          </View>
          <Pressable
            onPress={() => { playTapSound(); setInnerWorldView('menu'); }}
            style={{ position: 'absolute', top: 50, left: 16, zIndex: 20 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 }}>\u2190 \u623b\u308b</Text>
          </Pressable>
          {W1_STAGES.map((stage) => {
            const isNext = !stage.cleared && W1_STAGES.filter(s => s.id < stage.id).every(s => s.cleared);
            const isLocked = !stage.cleared && !isNext;
            return (
              <Pressable
                key={stage.id}
                onPress={() => {
                  playTapSound();
                  if (stage.cleared) {
                    showSaveSuccess('CLEAR\u6e08\u307f');
                  } else if (isNext) {
                    showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');
                  } else {
                    showSaveSuccess('\ud83d\udd12 \u524d\u306e\u30b9\u30c6\u30fc\u30b8\u3092\u30af\u30ea\u30a2\u3057\u3066\u304f\u3060\u3055\u3044');
                  }
                }}
                style={{
                  position: 'absolute',
                  left: SCREEN_W * stage.x - 35,
                  top: SCREEN_H * stage.y - 35,
                  alignItems: 'center',
                  opacity: isLocked ? 0.4 : 1,
                }}
              >
                <View style={{
                  width: 70, height: 70, borderRadius: 35,
                  borderWidth: 3,
                  borderColor: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#555',
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  shadowColor: stage.cleared ? '#DAA520' : '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: stage.cleared ? 0.8 : 0.3,
                  shadowRadius: stage.cleared ? 12 : 4,
                }}>
                  <Image source={isLocked ? NODE_LOCKED : stage.icon} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
                <Text style={{
                  color: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#888',
                  fontSize: 11, fontWeight: '900', marginTop: 4,
                  textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 4,
                }}>
                  {stage.id + '. ' + stage.name}
                </Text>
                {stage.cleared && (
                  <Text style={{ color: '#DAA520', fontSize: 9, fontWeight: 'bold' }}>\u2714 CLEAR</Text>
                )}
                {stage.id === 5 && (
                  <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', marginTop: 1 }}>BOSS</Text>
                )}
              </Pressable>
            );
          })}
        </ImageBackground>
      );
    }

    if (innerWorldView === 'yokaiDex') {"""

    if old_yokai_check in content:
        content = content.replace(old_yokai_check, stage_map_view, 1)
        count += 1
        print("[OK] Stage map view added")

    # 4. Add stage map button in menu (before battle button)
    old_battle_btn = """        <Pressable
          onPress={() => {
            playTapSound();
            if (!isPro && levelInfo.level < 3) {
              showSaveSuccess('Lv.3「足軽」で解放');
              return;
            }
            setBattleMode('select');
            setTab('battle');
          }}"""

    new_map_btn = """        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('stageMap'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a1a0a' : '#0a0a1a',
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: '#DAA520',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>\ud83d\uddfa\ufe0f</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900' }}>\u30b9\u30c6\u30fc\u30b8\u30de\u30c3\u30d7</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>World 1\u300c\u76ee\u899a\u3081\u300d</Text>
            </View>
            <Text style={{ color: '#DAA520', fontSize: 18 }}>\u203a</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            playTapSound();
            if (!isPro && levelInfo.level < 3) {
              showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');
              return;
            }
            setBattleMode('select');
            setTab('battle');
          }}"""

    if old_battle_btn in content:
        content = content.replace(old_battle_btn, new_map_btn, 1)
        count += 1
        print("[OK] Stage map button added to menu")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n[DONE] {count} changes")

if __name__ == "__main__":
    main()
