#!/usr/bin/env python3
"""defeat_kamishibai.py — 敗北演出を紙芝居化"""

path = 'App.tsx'
with open(path, 'r') as f:
    c = f.read()

changes = 0

# 1. Add defeatPhase state after showDefeatModal
old_state = "const [showDefeatModal, setShowDefeatModal] = useState(false);"
new_state = """const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [defeatPhase, setDefeatPhase] = useState(0);
  const DEFEAT_QUOTES = [
    '武士は七転び八起き。立て。',
    '負けを知らぬ者に、本当の強さは宿らぬ',
    '今日の敗北は、明日の勝利の種だ',
    '刀は折れても、魂は折れん',
    '恥じるな。逃げた者だけが本当の敗者だ',
  ];
  const [defeatQuote, setDefeatQuote] = useState('');"""

if old_state in c:
    c = c.replace(old_state, new_state)
    changes += 1
    print('✅ 1. defeatPhase state added')

# 2. Update handleDefeat to set phase 0 and pick random quote
old_defeat = """  const handleDefeat = () => {
    setShowDefeatModal(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);"""

new_defeat = """  const handleDefeat = () => {
    setDefeatPhase(0);
    setDefeatQuote(DEFEAT_QUOTES[Math.floor(Math.random() * DEFEAT_QUOTES.length)]);
    setShowDefeatModal(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);"""

if old_defeat in c:
    c = c.replace(old_defeat, new_defeat)
    changes += 1
    print('✅ 2. handleDefeat → defeatPhase reset')

# 3. Replace defeat modal UI with kamishibai
old_modal = """          {showDefeatModal && (
            <Pressable
              onPress={dismissDefeat}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
            >
              <Text style={{ color: '#e74c3c', fontSize: 48, marginBottom: 16 }}>{'💀'}</Text>
              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', marginBottom: 8 }}>{'敗北…'}</Text>
              <Text style={{ color: '#888', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                {'「' + (BOSS_ATTACK_CONFIG[w1BossIndex]?.attackQuote || 'ほら、また負けた') + '」'}
              </Text>
              <View style={{ backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#D4AF3744', marginBottom: 24, alignItems: 'center' }}>
                <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '800', marginBottom: 8 }}>{'武士は七転び八起き'}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>{'ボスのHPが全回復した。もう一度挑め。'}</Text>
                <Text style={{ color: '#2ecc71', fontSize: 12, marginTop: 8 }}>{'君のHPは全回復した'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12 }}>{'タップで戻る'}</Text>
            </Pressable>
          )}"""

new_modal = """          {showDefeatModal && (
            <Pressable
              onPress={() => {
                if (defeatPhase < 3) {
                  setDefeatPhase(defeatPhase + 1);
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
                } else {
                  dismissDefeat();
                }
              }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.97)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
            >
              {/* Phase 0: 暗転 → 敗北 */}
              {defeatPhase === 0 && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#e74c3c', fontSize: 64, marginBottom: 20 }}>{'💀'}</Text>
                  <Text style={{ color: '#e74c3c', fontSize: 28, fontWeight: '900', letterSpacing: 4 }}>{'敗北…'}</Text>
                  <Text style={{ color: '#555', fontSize: 12, marginTop: 30 }}>{'タップして続ける'}</Text>
                </View>
              )}
              {/* Phase 1: ボスの嘲笑 */}
              {defeatPhase === 1 && (
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#e74c3c', overflow: 'hidden', marginBottom: 20, backgroundColor: '#1a0808' }}>
                    <Image source={YOKAI_IMAGES[WORLD1_BOSSES[w1BossIndex]?.yokaiId]} style={{ width: 120, height: 120 }} resizeMode="contain" />
                  </View>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 12 }}>
                    {WORLD1_BOSSES[w1BossIndex]?.name || ''}
                  </Text>
                  <Text style={{ color: '#e74c3c', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 }}>
                    {'「' + (BOSS_ATTACK_CONFIG[w1BossIndex]?.attackQuote || 'ほら、また負けた') + '」'}
                  </Text>
                  <Text style={{ color: '#555', fontSize: 12, marginTop: 30 }}>{'タップして続ける'}</Text>
                </View>
              )}
              {/* Phase 2: サムライキングの励まし */}
              {defeatPhase === 2 && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', letterSpacing: 3, marginBottom: 16 }}>
                    {'── サムライキング ──'}
                  </Text>
                  <Text style={{ color: '#D4AF37', fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginBottom: 20 }}>
                    {'「' + defeatQuote + '」'}
                  </Text>
                  <Text style={{ color: '#555', fontSize: 12, marginTop: 20 }}>{'タップして続ける'}</Text>
                </View>
              )}
              {/* Phase 3: 回復通知 → 戻る */}
              {defeatPhase === 3 && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 24 }}>{'再起の刻'}</Text>
                  <View style={{ backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#D4AF3744', marginBottom: 16, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#e74c3c', fontSize: 14, marginBottom: 12 }}>
                      {'👹 ' + (WORLD1_BOSSES[w1BossIndex]?.name || '') + 'のHPが全回復した'}
                    </Text>
                    <View style={{ height: 1, backgroundColor: '#333', width: '80%', marginVertical: 8 }} />
                    <Text style={{ color: '#2ecc71', fontSize: 14, marginTop: 4 }}>
                      {'⚔️ 君のHPも全回復した'}
                    </Text>
                    <View style={{ height: 1, backgroundColor: '#333', width: '80%', marginVertical: 8 }} />
                    <Text style={{ color: '#3b82f6', fontSize: 14, marginTop: 4 }}>
                      {'🔄 ミッションが復活した'}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, marginTop: 16 }}>
                    <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{'もう一度挑む'}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          )}"""

if old_modal in c:
    c = c.replace(old_modal, new_modal)
    changes += 1
    print('✅ 3. Defeat modal → kamishibai (4 phases)')
else:
    print('⚠  Defeat modal not found')

# 4. Need YOKAI_IMAGES import check
if 'YOKAI_IMAGES' not in c:
    print('⚠  YOKAI_IMAGES not imported - may need to add')
else:
    print('✅ 4. YOKAI_IMAGES already imported')

with open(path, 'w') as f:
    f.write(c)

print(f'\n✅ Done! {changes} changes')
print('npx expo start --clear')
