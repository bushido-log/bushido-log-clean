#!/usr/bin/env python3
"""battle_victory.py — ボス撃破→ストーリーイベント発動"""

# 1. BattleScreen: onVictory prop追加、勝利時にonVictory()呼ぶ
# 2. App.tsx: handleBattleVictory関数追加、次のボスへ進行

bs_path = 'src/components/BattleScreen.tsx'
app_path = 'App.tsx'

# === BattleScreen ===
with open(bs_path, 'r') as f:
    bs = f.read()

# Add onVictory prop
if 'onVictory' not in bs:
    bs = bs.replace(
        'onConsult?: (text: string) => Promise<string>;',
        'onConsult?: (text: string) => Promise<string>;\n  onVictory?: () => void;'
    )
    print('✅ BattleScreen: onVictory prop added')

    # Destructure
    bs = bs.replace(
        'onMissionComplete, onOugi, onRun, onClose, onConsult, onSetAlarm,',
        'onMissionComplete, onOugi, onRun, onClose, onConsult, onSetAlarm, onVictory,'
    )
    print('✅ BattleScreen: onVictory destructured')

    # Replace onClose() in victory phase with onVictory()
    bs = bs.replace(
        "onPress={() => { playTapSound(); onClose(); }} style={({ pressed }) => [{ backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, opacity: pressed ? 0.7 : 1 }]}>\n                    <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>続ける</Text>",
        "onPress={() => { playTapSound(); if (onVictory) onVictory(); else onClose(); }} style={({ pressed }) => [{ backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, opacity: pressed ? 0.7 : 1 }]}>\n                    <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>続ける</Text>"
    )
    print('✅ BattleScreen: victory → onVictory()')

with open(bs_path, 'w') as f:
    f.write(bs)

# === App.tsx ===
with open(app_path, 'r') as f:
    app = f.read()

# Add handleBattleVictory function before handleBattleMissionComplete
if 'handleBattleVictory' not in app:
    victory_fn = """
  // === Battle V2: 勝利ハンドラー ===
  const handleBattleVictory = () => {
    // w1BossIndex → storyStage マッピング
    const bossToStory: Record<number, number> = { 0: 6, 1: 2, 2: 3, 3: 4, 4: 5 };
    const storyStageNum = bossToStory[w1BossIndex];
    
    // バトル終了
    setBattleActive(false);
    
    // 次のボスへ進行
    const nextIndex = w1BossIndex + 1;
    if (nextIndex < WORLD1_BOSSES.length) {
      setW1BossIndex(nextIndex);
      setW1BossHp(WORLD1_BOSSES[nextIndex].hp);
      setW1CompletedMissions([]);
      saveW1Battle({ bossIndex: nextIndex, bossHp: WORLD1_BOSSES[nextIndex].hp, completedMissions: [] });
    } else {
      // 全ボス撃破
      saveW1Battle({ bossIndex: nextIndex, bossHp: 0, completedMissions: [] });
    }
    
    // ストーリーイベント発動
    if (storyStageNum) {
      setStoryStage(storyStageNum);
      setStoryActive(true);
      setStoryPhase('dark');
      setSceneIndex(0);
      setMissionCount(0);
      Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
      setTimeout(() => {
        setStoryPhase('eyes');
        Animated.timing(storyEyesOpacity, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
      }, 1000);
    }
  };

"""
    # Insert before handleBattleMissionComplete
    app = app.replace(
        '  const handleBattleMissionComplete = async',
        victory_fn + '  const handleBattleMissionComplete = async'
    )
    print('✅ App.tsx: handleBattleVictory added')

    # Add onVictory prop to BattleScreen
    app = app.replace(
        "onClose={() => { setBattleActive(false); setShowStartScreen(false); setInnerWorldView('menu'); setTab('innerWorld'); }}",
        "onClose={() => { setBattleActive(false); setShowStartScreen(false); setInnerWorldView('menu'); setTab('innerWorld'); }}\n            onVictory={handleBattleVictory}"
    )
    print('✅ App.tsx: onVictory prop passed')

with open(app_path, 'w') as f:
    f.write(app)

print('\n✅ Done! ボス撃破→ストーリー紙芝居→次のボスへ')
print('npx expo start --clear')
