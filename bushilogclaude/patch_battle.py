#!/usr/bin/env python3
"""BUSHIDO LOG - Battle System Patch"""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ENEMY IMAGES & DATA (after CHARACTER_IMAGES)
# ============================================
enemy_code = '''
// ===== BATTLE SYSTEM: Enemy Data =====
const ENEMY_IMAGES: { [key: string]: any } = {
  enemy01: require('./assets/enemies/enemy01.png'),
  enemy02: require('./assets/enemies/enemy02.png'),
  enemy03: require('./assets/enemies/enemy03.png'),
  enemy04: require('./assets/enemies/enemy04.png'),
  enemy05: require('./assets/enemies/enemy05.png'),
  dragon_boss01: require('./assets/enemies/dragon_boss01.png'),
  dragon_boss02: require('./assets/enemies/dragon_boss02.png'),
  dragon_boss03: require('./assets/enemies/dragon_boss03.png'),
  dragon_boss04: require('./assets/enemies/dragon_boss04.png'),
};

const ENEMIES = [
  { id: 'enemy01', name: '\\u98a8\\u306e\\u5fcd', image: ENEMY_IMAGES.enemy01, minLv: 1, maxLv: 3, power: 18, isBoss: false, quote: '\\u5f71\\u306b\\u6f5c\\u3080\\u8005\\u3001\\u5149\\u3092\\u6050\\u308c\\u308b' },
  { id: 'enemy02', name: '\\u7d05\\u306e\\u4f8d', image: ENEMY_IMAGES.enemy02, minLv: 2, maxLv: 5, power: 30, isBoss: false, quote: '\\u5203\\u306b\\u8ff7\\u3044\\u306a\\u3057' },
  { id: 'enemy03', name: '\\u91d1\\u525b\\u306e\\u5c06', image: ENEMY_IMAGES.enemy03, minLv: 3, maxLv: 7, power: 45, isBoss: false, quote: '\\u93e7\\u306f\\u5fc3\\u306e\\u58c1\\u306a\\u308a' },
  { id: 'enemy04', name: '\\u84bc\\u7a79\\u306e\\u50e7\\u5175', image: ENEMY_IMAGES.enemy04, minLv: 4, maxLv: 8, power: 58, isBoss: false, quote: '\\u7948\\u308a\\u306f\\u5203\\u3088\\u308a\\u3082\\u92ed\\u3057' },
  { id: 'enemy05', name: '\\u9ed2\\u9244\\u306e\\u6b66\\u5c06', image: ENEMY_IMAGES.enemy05, minLv: 5, maxLv: 9, power: 72, isBoss: false, quote: '\\u5929\\u4e0b\\u3092\\u671b\\u3080\\u8005\\u3001\\u307e\\u305a\\u5df1\\u306b\\u52dd\\u3066' },
  { id: 'dragon_boss01', name: '\\u84bc\\u9f8d', image: ENEMY_IMAGES.dragon_boss01, minLv: 7, maxLv: 10, power: 85, isBoss: true, quote: '\\u9f8d\\u306e\\u6012\\u308a\\u3001\\u5929\\u3092\\u88c2\\u304f' },
  { id: 'dragon_boss02', name: '\\u7d2b\\u9f8d', image: ENEMY_IMAGES.dragon_boss02, minLv: 7, maxLv: 10, power: 90, isBoss: true, quote: '\\u6642\\u306e\\u679c\\u3066\\u306b\\u3001\\u6211\\u306f\\u5f85\\u3064' },
  { id: 'dragon_boss03', name: '\\u7fe0\\u9f8d', image: ENEMY_IMAGES.dragon_boss03, minLv: 8, maxLv: 10, power: 95, isBoss: true, quote: '\\u98a8\\u306f\\u81ea\\u7531\\u3001\\u3055\\u308c\\u3069\\u5bb9\\u8d66\\u306a\\u3057' },
  { id: 'dragon_boss04', name: '\\u7d05\\u9f8d', image: ENEMY_IMAGES.dragon_boss04, minLv: 8, maxLv: 10, power: 100, isBoss: true, quote: '\\u708e\\u306f\\u5168\\u3066\\u3092\\u6d44\\u5316\\u3059\\u308b' },
];

const BATTLE_WIN_QUOTES = [
  '\\u898b\\u4e8b\\u3002\\u3060\\u304c\\u3001\\u6162\\u5fc3\\u3059\\u308b\\u306a\\u3002',
  '\\u305d\\u306e\\u4e00\\u592a\\u5200\\u3001\\u4f8d\\u306e\\u9b42\\u3092\\u611f\\u3058\\u305f\\u3002',
  '\\u52dd\\u5229\\u306f\\u4fee\\u884c\\u306e\\u8a3c\\u3002\\u9a55\\u308b\\u3053\\u3068\\u306a\\u304b\\u308c\\u3002',
  '\\u5f37\\u304f\\u306a\\u3063\\u305f\\u306a\\u3002\\u3060\\u304c\\u9053\\u306f\\u307e\\u3060\\u7d9a\\u304f\\u3002',
  '\\u4eca\\u65e5\\u306e\\u52dd\\u5229\\u3092\\u3001\\u660e\\u65e5\\u306e\\u7ce7\\u3068\\u305b\\u3088\\u3002',
];

const BATTLE_LOSE_QUOTES = [
  '\\u5263\\u306f\\u5f37\\u3044\\u3002\\u3060\\u304c\\u3001\\u5fc3\\u304c\\u8ffd\\u3044\\u3064\\u3044\\u3066\\u3044\\u306a\\u3044\\u3002',
  '\\u6557\\u5317\\u3082\\u307e\\u305f\\u4fee\\u884c\\u3002\\u7acb\\u3061\\u4e0a\\u304c\\u308c\\u3002',
  '\\u8ca0\\u3051\\u3092\\u6050\\u308c\\u308b\\u306a\\u3002\\u6050\\u308c\\u3088\\u3001\\u5b66\\u3070\\u306c\\u3053\\u3068\\u3092\\u3002',
  '\\u4eca\\u306f\\u307e\\u3060\\u65e9\\u3044\\u3002\\u4fee\\u884c\\u3092\\u7a4d\\u3081\\u3002',
  '\\u75db\\u307f\\u3092\\u77e5\\u308b\\u8005\\u3060\\u3051\\u304c\\u3001\\u771f\\u306e\\u5f37\\u3055\\u3092\\u5f97\\u308b\\u3002',
];

'''

content = content.replace(
    '// レベル別称号',
    enemy_code + '// レベル別称号'
)
print('1/6 敵データ追加OK')

# ============================================
# 2. ADD 'battle' TO TAB TYPE
# ============================================
content = content.replace(
    "useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm' | 'character'>",
    "useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus' | 'alarm' | 'character' | 'battle'>"
)
print('2/6 タブ型追加OK')

# ============================================
# 3. ADD BATTLE STATES (after totalXp state)
# ============================================
battle_states = """
  // ===== Battle System State =====
  const [battleMode, setBattleMode] = useState<'select' | 'fighting' | 'result' | null>(null);
  const [battleEnemy, setBattleEnemy] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [battleWinStreak, setBattleWinStreak] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [battleTurnLog, setBattleTurnLog] = useState<string[]>([]);
  const [battleAnimating, setBattleAnimating] = useState(false);
  const [battleQuote, setBattleQuote] = useState('');
  const [battleXpGained, setBattleXpGained] = useState(0);
  const battleShakeAnim = useRef(new Animated.Value(0)).current;
  const playerShakeAnim = useRef(new Animated.Value(0)).current;
"""

content = content.replace(
    '  const [totalXp, setTotalXp] = useState(0);',
    '  const [totalXp, setTotalXp] = useState(0);\n' + battle_states
)
print('3/6 バトルState追加OK')

# ============================================
# 4. ADD BATTLE FUNCTIONS & RENDER (before renderCharacterTab)
# ============================================
battle_functions = """
  // ===== Battle System Functions =====
  const getAvailableEnemies = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const lv = Math.max(1, levelInfo.level);
    return ENEMIES.filter(e => lv >= e.minLv && lv <= e.maxLv);
  };

  const shakeAnimation = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const startBattle = (enemy: any) => {
    setBattleEnemy(enemy);
    setBattleMode('fighting');
    setPlayerHp(100);
    setEnemyHp(100);
    setBattleTurnLog([]);
    setBattleResult(null);
    setBattleAnimating(false);
    setBattleXpGained(0);
    setTab('battle');
    playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const executeBattleTurn = async () => {
    if (battleAnimating || !battleEnemy) return;
    setBattleAnimating(true);

    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const levelInfo = getLevelFromXp(totalXp);
    const playerLevel = Math.max(1, levelInfo.level);

    const playerAtk = playerLevel * 11 + Math.floor(Math.random() * 15) + 5;
    const enemyAtk = battleEnemy.power * 0.7 + Math.floor(Math.random() * battleEnemy.power * 0.4);

    const dmgToEnemy = Math.max(8, Math.round(playerAtk - battleEnemy.power * 0.2));
    const dmgToPlayer = Math.max(5, Math.round(enemyAtk - playerLevel * 2));

    shakeAnimation(battleShakeAnim);

    const newEnemyHp = Math.max(0, enemyHp - dmgToEnemy);
    setEnemyHp(newEnemyHp);

    const turnText = '\\u2694\\ufe0f ' + dmgToEnemy + '\\u30c0\\u30e1\\u30fc\\u30b8\\uff01';
    setBattleTurnLog(prev => [...prev, turnText]);

    setTimeout(() => {
      shakeAnimation(playerShakeAnim);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newPlayerHp = Math.max(0, playerHp - dmgToPlayer);
      setPlayerHp(newPlayerHp);

      const enemyTurnText = '\\ud83d\\udd25 ' + battleEnemy.name + '\\u306e\\u53cd\\u6483\\uff01 ' + dmgToPlayer + '\\u30c0\\u30e1\\u30fc\\u30b8';
      setBattleTurnLog(prev => [...prev, enemyTurnText]);

      if (newEnemyHp <= 0) {
        setBattleResult('win');
        setBattleMode('result');
        const baseXp = battleEnemy.isBoss ? 50 : 25;
        const streakBonus = battleWinStreak >= 5 ? 25 : battleWinStreak >= 3 ? 15 : battleWinStreak >= 1 ? 5 : 0;
        const totalGain = baseXp + streakBonus;
        setBattleXpGained(totalGain);
        setBattleQuote(BATTLE_WIN_QUOTES[Math.floor(Math.random() * BATTLE_WIN_QUOTES.length)]);
        setBattleWinStreak(prev => prev + 1);
        addXpWithLevelCheck(totalGain);
        playWinSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (newPlayerHp <= 0) {
        setBattleResult('lose');
        setBattleMode('result');
        setBattleXpGained(5);
        setBattleQuote(BATTLE_LOSE_QUOTES[Math.floor(Math.random() * BATTLE_LOSE_QUOTES.length)]);
        setBattleWinStreak(0);
        addXpWithLevelCheck(5);
        playFailSound();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setBattleAnimating(false);
    }, 800);
  };

  const renderBattleTab = () => {
    const levelInfo = getLevelFromXp(totalXp);
    const characterImage = CHARACTER_IMAGES[Math.max(1, Math.min(10, levelInfo.level))] || CHARACTER_IMAGES[1];

    if (battleMode === 'select' || battleMode === null) {
      const available = getAvailableEnemies();
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
            \\u4fee\\u884c\\u5bfe\\u6226
          </Text>
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
            \\u5df1\\u306e\\u529b\\u3092\\u8a66\\u305b
          </Text>

          {battleWinStreak > 0 && (
            <View style={{ backgroundColor: '#2a1a00', borderRadius: 8, padding: 10, marginBottom: 16, alignItems: 'center' }}>
              <Text style={{ color: '#D4AF37', fontSize: 14, fontWeight: '600' }}>
                \\ud83d\\udd25 {battleWinStreak}\\u9023\\u52dd\\u4e2d\\uff01
              </Text>
            </View>
          )}

          {available.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#888', fontSize: 16 }}>\\u4fee\\u884c\\u3092\\u7a4d\\u307f\\u3001\\u30ec\\u30d9\\u30eb\\u3092\\u4e0a\\u3052\\u3088</Text>
            </View>
          ) : (
            available.map((enemy, idx) => (
              <Pressable
                key={enemy.id}
                onPress={() => startBattle(enemy)}
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: pressed ? '#2a2a3e' : (enemy.isBoss ? '#1a0a1a' : '#1a1a2e'),
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: enemy.isBoss ? 2 : 1,
                  borderColor: enemy.isBoss ? '#8B0000' : '#333',
                }]}
              >
                <View style={{
                  width: 70, height: 70, borderRadius: 12, overflow: 'hidden',
                  borderWidth: 2, borderColor: enemy.isBoss ? '#8B0000' : '#D4AF37',
                  backgroundColor: '#0a0a1a',
                }}>
                  <Image source={enemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {enemy.isBoss && <Text style={{ color: '#8B0000', fontSize: 12, marginRight: 6 }}>\\ud83d\\udc79 BOSS</Text>}
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{enemy.name}</Text>
                  </View>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    \\u300c{enemy.quote}\\u300d
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <Text style={{ color: '#D4AF37', fontSize: 12 }}>
                      \\u6226\\u529b: {'\\u2694\\ufe0f'.repeat(Math.ceil(enemy.power / 25))}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#D4AF37', fontSize: 20 }}>\\u2694\\ufe0f</Text>
              </Pressable>
            ))
          )}

          <Pressable
            onPress={() => { playTapSound(); setTab('character'); setBattleMode(null); }}
            style={{ marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#444', alignItems: 'center' }}
          >
            <Text style={{ color: '#888', fontSize: 14 }}>\\u80b2\\u6210\\u753b\\u9762\\u306b\\u623b\\u308b</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (battleMode === 'fighting' && battleEnemy) {
      return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {battleEnemy.isBoss && <Text style={{ color: '#8B0000', fontSize: 14, marginRight: 6 }}>\\ud83d\\udc79</Text>}
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{battleEnemy.name}</Text>
            </View>
            <View style={{ width: '80%', height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              <View style={{ height: '100%', width: Math.max(0, enemyHp) + '%', backgroundColor: enemyHp > 50 ? '#ef4444' : enemyHp > 25 ? '#f59e0b' : '#dc2626', borderRadius: 5 }} />
            </View>
            <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>HP: {enemyHp}/100</Text>

            <Animated.View style={{
              transform: [{ translateX: battleShakeAnim }],
              width: 160, height: 160, borderRadius: 16, overflow: 'hidden',
              borderWidth: 3, borderColor: battleEnemy.isBoss ? '#8B0000' : '#ef4444',
              backgroundColor: '#1a1a2e',
            }}>
              <Image source={battleEnemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </Animated.View>
          </View>

          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Text style={{ color: '#D4AF37', fontSize: 32, fontWeight: '900' }}>\\u2694\\ufe0f VS \\u2694\\ufe0f</Text>
            {battleTurnLog.length > 0 && (
              <View style={{ marginTop: 8, maxHeight: 60 }}>
                {battleTurnLog.slice(-2).map((log, i) => (
                  <Text key={i} style={{ color: '#ccc', fontSize: 13, textAlign: 'center' }}>{log}</Text>
                ))}
              </View>
            )}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Animated.View style={{
              transform: [{ translateX: playerShakeAnim }],
              width: 130, height: 130, borderRadius: 16, overflow: 'hidden',
              borderWidth: 3, borderColor: '#D4AF37',
              backgroundColor: '#1a1a2e',
            }}>
              <Image source={characterImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </Animated.View>
            <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 8 }}>HP: {playerHp}/100</Text>
            <View style={{ width: '80%', height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden', marginTop: 4 }}>
              <View style={{ height: '100%', width: Math.max(0, playerHp) + '%', backgroundColor: playerHp > 50 ? '#22c55e' : playerHp > 25 ? '#f59e0b' : '#ef4444', borderRadius: 5 }} />
            </View>
            <Text style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>
              Lv.{levelInfo.level} {levelInfo.title}
            </Text>
          </View>

          <Pressable
            onPress={executeBattleTurn}
            disabled={battleAnimating}
            style={({ pressed }) => [{
              backgroundColor: battleAnimating ? '#444' : (pressed ? '#8B6914' : '#D4AF37'),
              paddingVertical: 18,
              borderRadius: 14,
              alignItems: 'center',
              marginTop: 12,
              opacity: battleAnimating ? 0.6 : 1,
            }]}
          >
            <Text style={{ color: battleAnimating ? '#888' : '#000', fontSize: 22, fontWeight: '900' }}>
              {battleAnimating ? '...' : '\\u2694\\ufe0f \\u65ac\\u308b\\uff01'}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (battleMode === 'result' && battleEnemy) {
      const won = battleResult === 'win';
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{
            fontSize: 48, fontWeight: '900',
            color: won ? '#D4AF37' : '#ef4444',
            marginBottom: 16,
          }}>
            {won ? '\\u52dd\\u5229' : '\\u6557\\u5317'}
          </Text>

          <View style={{
            width: 120, height: 120, borderRadius: 16, overflow: 'hidden',
            borderWidth: 3, borderColor: won ? '#D4AF37' : '#555',
            backgroundColor: '#1a1a2e', marginBottom: 20,
            opacity: won ? 0.6 : 1,
          }}>
            <Image source={battleEnemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>

          <Text style={{ color: '#888', fontSize: 16, marginBottom: 4 }}>
            {won ? battleEnemy.name + '\\u3092\\u5012\\u3057\\u305f' : battleEnemy.name + '\\u306b\\u6557\\u308c\\u305f'}
          </Text>

          <View style={{
            backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20,
            marginVertical: 20, width: '100%',
            borderLeftWidth: 3, borderLeftColor: '#D4AF37',
          }}>
            <Text style={{ color: '#D4AF37', fontSize: 12, marginBottom: 8 }}>\\u30b5\\u30e0\\u30e9\\u30a4\\u30ad\\u30f3\\u30b0\\u306e\\u8a00\\u8449</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontStyle: 'italic', lineHeight: 24 }}>
              \\u300c{battleQuote}\\u300d
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#D4AF37', fontSize: 20, fontWeight: 'bold' }}>
              +{battleXpGained} XP
            </Text>
            {battleWinStreak > 1 && won && (
              <Text style={{ color: '#f59e0b', fontSize: 14, marginLeft: 8 }}>
                \\ud83d\\udd25 {battleWinStreak}\\u9023\\u52dd\\u30dc\\u30fc\\u30ca\\u30b9\\uff01
              </Text>
            )}
          </View>
          {!won && (
            <Text style={{ color: '#666', fontSize: 12 }}>\\u6557\\u5317\\u3067\\u30825XP\\u7372\\u5f97</Text>
          )}

          <View style={{ width: '100%', marginTop: 24 }}>
            <Pressable
              onPress={() => { playTapSound(); setBattleMode('select'); setTab('battle'); }}
              style={{ backgroundColor: '#D4AF37', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
            >
              <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>\\u3082\\u3046\\u4e00\\u5ea6\\u5bfe\\u6226\\u3059\\u308b</Text>
            </Pressable>
            <Pressable
              onPress={() => { playTapSound(); setTab('character'); setBattleMode(null); }}
              style={{ borderWidth: 1, borderColor: '#444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#888', fontSize: 14 }}>\\u80b2\\u6210\\u753b\\u9762\\u306b\\u623b\\u308b</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return null;
  };

"""

content = content.replace(
    '  const renderCharacterTab = () => {',
    battle_functions + '  const renderCharacterTab = () => {'
)
print('4/6 バトル関数+画面追加OK')

# ============================================
# 5. ADD BATTLE BUTTON IN CHARACTER TAB
# ============================================
battle_button = """
        {/* Battle Button */}
        <Pressable
          onPress={() => {
            playAttackSound();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setBattleMode('select');
            setTab('battle');
          }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#8B0000' : '#1a0a0a',
            borderWidth: 2,
            borderColor: '#8B0000',
            borderRadius: 16,
            padding: 20,
            marginTop: 24,
            width: '100%',
            alignItems: 'center',
          }]}
        >
          <Text style={{ fontSize: 28, marginBottom: 4 }}>\\u2694\\ufe0f</Text>
          <Text style={{ color: '#ef4444', fontSize: 20, fontWeight: '900' }}>\\u4fee\\u884c\\u5bfe\\u6226</Text>
          <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>\\u5df1\\u306e\\u529b\\u3092\\u8a66\\u305b</Text>
          {battleWinStreak > 0 && (
            <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 4 }}>\\ud83d\\udd25 {battleWinStreak}\\u9023\\u52dd\\u4e2d</Text>
          )}
        </Pressable>
"""

content = content.replace(
    "          </View>\n        )}\n      </ScrollView>\n    );\n  };\n  const renderAlarmTab",
    "          </View>\n        )}\n" + battle_button + "\n      </ScrollView>\n    );\n  };\n  const renderAlarmTab"
)
print('5/6 育成画面にバトルボタン追加OK')

# ============================================
# 6. ADD BATTLE TAB RENDERING
# ============================================
content = content.replace(
    "{tab === 'character' && renderCharacterTab()}",
    "{tab === 'character' && renderCharacterTab()}\n                      {tab === 'battle' && renderBattleTab()}"
)
print('6/6 バトルタブ描画追加OK')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== BATTLE SYSTEM PATCH COMPLETE ===')
print('  - Enemy characters: 5 + Dragon bosses: 4')
print('  - Turn-based battle with shake animations')
print('  - Win/Lose + Samurai King quotes')
print('  - XP rewards + Win streak bonus')
print('  - Battle button added to character tab')
