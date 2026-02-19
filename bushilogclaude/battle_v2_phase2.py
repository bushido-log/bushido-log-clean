#!/usr/bin/env python3
"""
battle_v2_phase2.py — App.tsxにバトルv2ロジックを追加

追加内容:
1. 新import（quizData, BOSS_ATTACK_CONFIG等）
2. プレイヤーバトルstate
3. クイズ出題・判定ロジック
4. HP回復（感謝・振り返り等）
5. 敗北処理
6. handleBattleMissionComplete後にクイズトリガー
"""

import shutil
from datetime import datetime

path = 'App.tsx'
shutil.copy2(path, path + f'.bak_bv2_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ──────────────────────────────────────
# 0. Fix battleWorldData.ts: technique -> skill
# ──────────────────────────────────────
try:
    bwd_path = 'src/data/battleWorldData.ts'
    with open(bwd_path, 'r', encoding='utf-8') as f:
        bwd = f.read()
    if "'technique'" in bwd:
        bwd = bwd.replace("'technique'", "'skill'")
        with open(bwd_path, 'w', encoding='utf-8') as f:
            f.write(bwd)
        print('✅ 0. battleWorldData.ts: technique → skill fixed')
    else:
        print('⏭  battleWorldData.ts already correct')
except Exception as e:
    print(f'⚠  battleWorldData.ts fix failed: {e}')

# ──────────────────────────────────────
# 1. Add imports
# ──────────────────────────────────────
old_import = "import { WORLD1_BOSSES, BATTLE_MISSIONS, getAvailableOugi, RUN_RECOVERY_RATE } from './src/data/battleWorldData';"
new_import = """import { WORLD1_BOSSES, BATTLE_MISSIONS, getAvailableOugi, RUN_RECOVERY_RATE, BOSS_ATTACK_CONFIG, calculatePlayerMaxHp, calculateActualDamage, HEAL_AMOUNTS } from './src/data/battleWorldData';
import { getRandomQuiz, BossQuiz } from './src/data/quizData';"""

if old_import in content:
    content = content.replace(old_import, new_import)
    changes += 1
    print('✅ 1. Imports added')
else:
    print('⚠  Import line not found (may already be modified)')

# ──────────────────────────────────────
# 2. Add player battle state (after playerHp)
# ──────────────────────────────────────
old_playerHp = "const [playerHp, setPlayerHp] = useState(100);"
new_playerState = """const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(200);
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<BossQuiz | null>(null);
  const [quizTimer, setQuizTimer] = useState(0);
  const [quizCombo, setQuizCombo] = useState(0);
  const [quizUsedIds, setQuizUsedIds] = useState<string[]>([]);
  const [battleTurnCount, setBattleTurnCount] = useState(0);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [quizSelectedIndex, setQuizSelectedIndex] = useState<number | null>(null);
  const [healedToday, setHealedToday] = useState<Record<string, boolean>>({});
  const [lastHealDate, setLastHealDate] = useState('');
  const [showDefeatModal, setShowDefeatModal] = useState(false);"""

if old_playerHp in content and 'quizActive' not in content:
    content = content.replace(old_playerHp, new_playerState)
    changes += 1
    print('✅ 2. Player battle state added')
elif 'quizActive' in content:
    print('⏭  Player battle state already exists')
else:
    print('⚠  playerHp state not found')

# ──────────────────────────────────────
# 3. Add battle v2 functions (before applyBattleDamage)
# ──────────────────────────────────────
marker = "  const applyBattleDamage = (dmg: number) => {"
if marker in content and 'triggerBossQuiz' not in content:
    v2_functions = """
  // === Battle V2: プレイヤーHP計算 ===
  useEffect(() => {
    const level = getLevelFromXp(totalXp).level;
    const mind = samuraiStats.mind || 0;
    const maxHp = calculatePlayerMaxHp(difficulty as 'easy' | 'normal' | 'hard', level, mind);
    setPlayerMaxHp(maxHp);
    // 初回やレベルアップ時はHPを上限に
    setPlayerHp(prev => Math.min(prev, maxHp) || maxHp);
  }, [totalXp, difficulty, samuraiStats.mind]);

  // === Battle V2: 1日1回回復リセット ===
  useEffect(() => {
    const today = getTodayStr();
    if (lastHealDate !== today) {
      setHealedToday({});
      setLastHealDate(today);
    }
  }, []);

  // === Battle V2: HP回復関数 ===
  const healPlayerHp = (source: string) => {
    if (healedToday[source]) return false;
    const amount = HEAL_AMOUNTS[source] || 0;
    if (amount <= 0) return false;
    setPlayerHp(prev => Math.min(playerMaxHp, prev + amount));
    setHealedToday(prev => ({ ...prev, [source]: true }));
    // Save
    AsyncStorage.setItem('bushilog.playerBattle', JSON.stringify({
      hp: Math.min(playerMaxHp, playerHp + amount),
      healedToday: { ...healedToday, [source]: true },
      lastHealDate: getTodayStr(),
    })).catch(() => {});
    return true;
  };

  // === Battle V2: ボスのクイズ攻撃トリガー ===
  const triggerBossQuiz = () => {
    if (w1BossIndex >= WORLD1_BOSSES.length) return;
    const config = BOSS_ATTACK_CONFIG[w1BossIndex];
    if (!config) return;

    const newTurn = battleTurnCount + 1;
    setBattleTurnCount(newTurn);

    // 攻撃頻度チェック
    if (newTurn % config.attackFrequency !== 0) return;

    // クイズ出題
    const quiz = getRandomQuiz(w1BossIndex, quizUsedIds);
    setCurrentQuiz(quiz);
    setQuizUsedIds(prev => [...prev, quiz.id]);
    setQuizTimer(config.quizTimeLimit);
    setQuizResult(null);
    setQuizSelectedIndex(null);
    setQuizActive(true);
  };

  // === Battle V2: クイズタイマー ===
  useEffect(() => {
    if (!quizActive || quizTimer <= 0 || quizResult) return;
    const timer = setTimeout(() => {
      if (quizTimer <= 1) {
        handleQuizTimeout();
      } else {
        setQuizTimer(prev => prev - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [quizActive, quizTimer, quizResult]);

  // === Battle V2: クイズ回答処理 ===
  const handleQuizAnswer = (selectedIndex: number) => {
    if (quizResult || !currentQuiz) return;
    setQuizSelectedIndex(selectedIndex);

    if (selectedIndex === currentQuiz.correctIndex) {
      // 正解！回避
      setQuizResult('correct');
      setQuizCombo(prev => {
        const newCombo = prev + 1;
        // コンボボーナス
        if (newCombo === 3) {
          healPlayerHp('comboBonus3');
          showSaveSuccess('🔥 3コンボ！ +' + HEAL_AMOUNTS.comboBonus3 + 'HP回復！');
        } else if (newCombo === 5) {
          healPlayerHp('comboBonus5');
          showSaveSuccess('⚡ 5コンボ！ +' + HEAL_AMOUNTS.comboBonus5 + 'HP回復！');
        } else if (newCombo === 10) {
          healPlayerHp('comboBonus10');
          showSaveSuccess('🌊 10コンボ！覚醒！ +' + HEAL_AMOUNTS.comboBonus10 + 'HP回復！');
        }
        return newCombo;
      });

      // 三日坊主IIの特殊能力: 正解でも10%で追加攻撃
      const config = BOSS_ATTACK_CONFIG[w1BossIndex];
      if (config?.specialAbility === 'sneakAttack' && Math.random() < 0.1) {
        const halfDmg = calculateActualDamage(
          Math.floor(config.attackDamage / 2),
          samuraiStats[config.weaknessStat] || 0
        );
        setTimeout(() => {
          setPlayerHp(prev => {
            const newHp = Math.max(0, prev - halfDmg);
            if (newHp <= 0) handleDefeat();
            return newHp;
          });
          showSaveSuccess('😈 「どうせまた…」不意打ち！ -' + halfDmg + 'HP');
        }, 1500);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // 不正解！ダメージ
      setQuizResult('wrong');
      setQuizCombo(0);
      applyQuizDamage();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // 2秒後にクイズを閉じる
    setTimeout(() => {
      setQuizActive(false);
      setCurrentQuiz(null);
    }, 2500);
  };

  // === Battle V2: タイムアウト処理 ===
  const handleQuizTimeout = () => {
    if (quizResult) return;
    setQuizResult('timeout');
    setQuizCombo(0);
    applyQuizDamage();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => {
      setQuizActive(false);
      setCurrentQuiz(null);
    }, 2500);
  };

  // === Battle V2: クイズダメージ適用 ===
  const applyQuizDamage = () => {
    const config = BOSS_ATTACK_CONFIG[w1BossIndex];
    if (!config) return;
    const statValue = samuraiStats[config.weaknessStat] || 0;
    const dmg = calculateActualDamage(config.attackDamage, statValue);
    setPlayerHp(prev => {
      const newHp = Math.max(0, prev - dmg);
      // Save HP
      AsyncStorage.setItem('bushilog.playerBattle', JSON.stringify({
        hp: newHp,
        healedToday,
        lastHealDate: getTodayStr(),
      })).catch(() => {});
      if (newHp <= 0) {
        setTimeout(() => handleDefeat(), 500);
      }
      return newHp;
    });
  };

  // === Battle V2: 敗北処理 ===
  const handleDefeat = () => {
    setShowDefeatModal(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // ボスHP全回復
    const boss = WORLD1_BOSSES[w1BossIndex];
    if (boss) {
      setW1BossHp(boss.hp);
      setW1CompletedMissions([]);
      saveW1Battle({ bossHp: boss.hp, completedMissions: [] });
    }
    // プレイヤーHP全回復
    setPlayerHp(playerMaxHp);
    setQuizCombo(0);
    setBattleTurnCount(0);
    setQuizUsedIds([]);
  };

  // === Battle V2: 敗北モーダルを閉じる ===
  const dismissDefeat = () => {
    setShowDefeatModal(false);
  };

  // === Battle V2: プレイヤーHP保存・読み込み ===
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('bushilog.playerBattle');
        if (raw) {
          const data = JSON.parse(raw);
          if (data.hp != null) setPlayerHp(data.hp);
          if (data.healedToday) setHealedToday(data.healedToday);
          if (data.lastHealDate) setLastHealDate(data.lastHealDate);
        }
      } catch(e) {}
    })();
  }, []);

""" + "  " + marker
    content = content.replace(marker, v2_functions)
    changes += 1
    print('✅ 3. Battle v2 functions added')
elif 'triggerBossQuiz' in content:
    print('⏭  Battle v2 functions already exist')
else:
    print('⚠  applyBattleDamage marker not found')

# ──────────────────────────────────────
# 4. Trigger quiz after mission complete
# ──────────────────────────────────────
old_mission_end = """    // XP reward
    const xpGain = Math.max(5, Math.floor(damage / 500));
    try { await addXpWithLevelCheck(xpGain); } catch(e) {}"""

new_mission_end = """    // XP reward
    const xpGain = Math.max(5, Math.floor(damage / 500));
    try { await addXpWithLevelCheck(xpGain); } catch(e) {}

    // v2: ボスの反撃（クイズ攻撃）
    setTimeout(() => triggerBossQuiz(), 1000);"""

if old_mission_end in content and 'triggerBossQuiz()' not in content.split(old_mission_end)[0]:
    content = content.replace(old_mission_end, new_mission_end, 1)
    changes += 1
    print('✅ 4. Quiz trigger after mission added')
elif 'triggerBossQuiz()' in content:
    print('⏭  Quiz trigger already exists')
else:
    print('⚠  Mission end marker not found')

# ──────────────────────────────────────
# 5. Add HP healing to gratitude/review/consult
# ──────────────────────────────────────

# Gratitude heal
gratitude_marker = "showSaveSuccess('⚔️ 感謝を記録！');"
if gratitude_marker in content:
    content = content.replace(
        gratitude_marker,
        gratitude_marker + "\n      if (healPlayerHp('gratitude')) showSaveSuccess('💚 +' + HEAL_AMOUNTS.gratitude + 'HP回復！');"
    )
elif 'healPlayerHp' not in content or "healPlayerHp('gratitude')" not in content:
    # Try alternative markers
    pass

# Review heal
review_marker = "showSaveSuccess('⚔️ 振り返りを記録！');"
if review_marker in content:
    content = content.replace(
        review_marker,
        review_marker + "\n      if (healPlayerHp('review')) showSaveSuccess('💚 +' + HEAL_AMOUNTS.review + 'HP回復！');"
    )

# Goal heal
goal_marker = "showSaveSuccess('⚔️ 目標を刻んだ！');"
if goal_marker in content:
    content = content.replace(
        goal_marker,
        goal_marker + "\n      if (healPlayerHp('goal')) showSaveSuccess('💚 +' + HEAL_AMOUNTS.goal + 'HP回復！');"
    )

changes += 1
print('✅ 5. HP healing hooks added')

# ──────────────────────────────────────
# Write
# ──────────────────────────────────────
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\n✅ Phase 2 done! {changes} changes.')
print('Next: Phase 3 — UI（クイズカード、プレイヤーHPバー、敗北モーダル）')
print('npx expo start --clear')
