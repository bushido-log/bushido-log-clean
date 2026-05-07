#!/usr/bin/env python3
"""fix_victory.py — handleBattleVictoryを既存撃破関数に接続"""

path = 'App.tsx'
with open(path, 'r') as f:
    c = f.read()

# 1. Replace handleBattleVictory
old_victory = """  // === Battle V2: 勝利ハンドラー ===
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
  };"""

new_victory = """  // === Battle V2: 勝利ハンドラー ===
  const triggerNidoneelDefeat = async () => {
    setStoryStage(6);
    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    await addXpWithLevelCheck(50);
    setTimeout(() => { if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } setStoryPhase('defeat'); playVoice(VOICE_NIDONEEL_DEFEAT); }, 1500);
  };

  const handleBattleVictory = async () => {
    // バトル終了
    setBattleActive(false);
    
    // 既存の撃破イベント発動
    const bossIndex = w1BossIndex;
    
    // 次のボスへ進行
    const nextIndex = bossIndex + 1;
    if (nextIndex < WORLD1_BOSSES.length) {
      setW1BossIndex(nextIndex);
      setW1BossHp(WORLD1_BOSSES[nextIndex].hp);
      setW1CompletedMissions([]);
      saveW1Battle({ bossIndex: nextIndex, bossHp: WORLD1_BOSSES[nextIndex].hp, completedMissions: [] });
    } else {
      saveW1Battle({ bossIndex: nextIndex, bossHp: 0, completedMissions: [] });
    }
    
    // 撃破演出（紙芝居）
    switch(bossIndex) {
      case 0: await triggerNidoneelDefeat(); break;
      case 1: await triggerAtodeyaruDefeat(); break;
      case 2: await triggerDeebuDefeat(); break;
      case 3: await triggerMoumuriDefeat(); break;
      case 4: await triggerMk2Defeat(); break;
    }
  };"""

if old_victory in c:
    c = c.replace(old_victory, new_victory)
    print('✅ handleBattleVictory → 既存撃破関数を使用')
else:
    print('⚠  handleBattleVictory not found')

with open(path, 'w') as f:
    f.write(c)

print('npx expo start --clear')
