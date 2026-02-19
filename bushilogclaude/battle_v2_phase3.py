#!/usr/bin/env python3
"""
battle_v2_phase3.py — UI追加
1. プレイヤーHPバー（バトル画面上部）
2. クイズカードモーダル
3. 敗北モーダル
"""

import shutil
from datetime import datetime

path = 'App.tsx'
shutil.copy2(path, path + f'.bak_bv3_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# ──────────────────────────────────────
# Find the closing of BattleScreen overlay: </View>\n      )}
# Insert UI right after the BattleScreen View but inside the battleActive block
# Strategy: Add overlays right before the closing </View> of the battle container
# ──────────────────────────────────────

# Find: onClose={() => { setBattleActive(false)... />  then </View>  then )}
# We'll insert AFTER the battleActive block closes

battle_close = """          />
        </View>
      )}
      {renderPaywall()}"""

ui_overlay = """          />

          {/* === v2: Player HP Bar === */}
          <View style={{ position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', marginRight: 8 }}>{'HP'}</Text>
            <View style={{ flex: 1, height: 14, backgroundColor: '#333', borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: '#555' }}>
              <View style={{ 
                width: (playerHp / playerMaxHp * 100) + '%', 
                height: '100%', 
                backgroundColor: playerHp / playerMaxHp > 0.5 ? '#2ecc71' : playerHp / playerMaxHp > 0.25 ? '#f39c12' : '#e74c3c',
                borderRadius: 6,
              }} />
            </View>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', marginLeft: 8 }}>{playerHp + '/' + playerMaxHp}</Text>
            {quizCombo >= 3 && (
              <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '900', marginLeft: 8 }}>{'🔥' + quizCombo + 'combo'}</Text>
            )}
          </View>

          {/* === v2: Quiz Card Modal === */}
          {quizActive && currentQuiz && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              {/* Boss attack warning */}
              <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '900', marginBottom: 8 }}>
                {'⚔️ ' + WORLD1_BOSSES[w1BossIndex]?.name + 'の攻撃！'}
              </Text>
              <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
                {'「' + (BOSS_ATTACK_CONFIG[w1BossIndex]?.attackQuote || '') + '」'}
              </Text>

              {/* Timer */}
              <View style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: quizTimer <= 3 ? '#e74c3c' : '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: quizTimer <= 3 ? '#e74c3c' : '#D4AF37', fontSize: 22, fontWeight: '900' }}>{quizTimer}</Text>
              </View>

              {/* Question */}
              <View style={{ backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#D4AF3744', marginBottom: 16 }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center', lineHeight: 26 }}>{currentQuiz.question}</Text>
              </View>

              {/* Choices */}
              {currentQuiz.choices.map((choice, idx) => {
                const isSelected = quizSelectedIndex === idx;
                const isCorrect = idx === currentQuiz.correctIndex;
                const showResult = quizResult !== null;
                let bgColor = '#1a1a2e';
                let borderColor = '#333';
                if (showResult && isCorrect) { bgColor = '#1a3a1a'; borderColor = '#2ecc71'; }
                else if (showResult && isSelected && !isCorrect) { bgColor = '#3a1a1a'; borderColor = '#e74c3c'; }
                else if (isSelected) { bgColor = '#2a2a3e'; borderColor = '#D4AF37'; }

                return (
                  <Pressable
                    key={idx}
                    onPress={() => !quizResult && handleQuizAnswer(idx)}
                    style={{ backgroundColor: bgColor, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor, width: '100%', flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Text style={{ color: '#888', fontSize: 14, fontWeight: '800', marginRight: 10 }}>{String.fromCharCode(65 + idx)}</Text>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 }}>{choice}</Text>
                    {showResult && isCorrect && <Text style={{ fontSize: 18 }}>{'✅'}</Text>}
                    {showResult && isSelected && !isCorrect && <Text style={{ fontSize: 18 }}>{'❌'}</Text>}
                  </Pressable>
                );
              })}

              {/* Result feedback */}
              {quizResult === 'correct' && (
                <Text style={{ color: '#2ecc71', fontSize: 16, fontWeight: '900', marginTop: 8 }}>{'回避成功！ダメージ0'}</Text>
              )}
              {quizResult === 'wrong' && (
                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '900', marginTop: 8 }}>
                  {'被弾！ -' + calculateActualDamage(BOSS_ATTACK_CONFIG[w1BossIndex]?.attackDamage || 0, samuraiStats[BOSS_ATTACK_CONFIG[w1BossIndex]?.weaknessStat] || 0) + 'HP'}
                </Text>
              )}
              {quizResult === 'timeout' && (
                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '900', marginTop: 8 }}>{'⏰ タイムアウト！'}</Text>
              )}
              {quizResult && currentQuiz.explanation && (
                <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 8, textAlign: 'center' }}>{currentQuiz.explanation}</Text>
              )}
            </View>
          )}

          {/* === v2: Defeat Modal === */}
          {showDefeatModal && (
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
          )}

        </View>
      )}
      {renderPaywall()}"""

if battle_close in content and 'Player HP Bar' not in content:
    content = content.replace(battle_close, ui_overlay)
    changes += 1
    print('✅ Battle UI overlays added (HP bar, Quiz card, Defeat modal)')
elif 'Player HP Bar' in content:
    print('⏭  Battle UI already exists')
else:
    print('⚠  Battle close marker not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\n✅ Phase 3 done! {changes} changes.')
print('npx expo start --clear')
