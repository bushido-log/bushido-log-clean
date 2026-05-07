#!/usr/bin/env python3
"""add_dashboard_battle.py — RPGダッシュボードにバトル進捗追加"""

path = 'App.tsx'
with open(path, 'r') as f:
    c = f.read()

old = """        <SamuraiAvatar level={samuraiLevel} rankLabel={rank.label} />
        <Text style={[styles.goalTitle, { fontSize: 16, marginTop: 6 }]}>サムライ日記カレンダー</Text>"""

new = """        <SamuraiAvatar level={samuraiLevel} rankLabel={rank.label} />

        {/* バトル進捗 */}
        <View style={{ backgroundColor: '#0d1117', borderRadius: 14, padding: 16, marginTop: 12, marginBottom: 12, borderWidth: 1, borderColor: '#D4AF3733' }}>
          <Text style={{ color: '#D4AF37', fontSize: 15, fontWeight: '900', marginBottom: 10, letterSpacing: 1 }}>{'⚔️ バトル進捗'}</Text>
          
          {w1BossIndex < WORLD1_BOSSES.length ? (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{'👹 ' + WORLD1_BOSSES[w1BossIndex].name}</Text>
                <Text style={{ color: '#888', fontSize: 12 }}>{(w1BossIndex + 1) + ' / ' + WORLD1_BOSSES.length}</Text>
              </View>
              <View style={{ height: 10, backgroundColor: '#1a1a2e', borderRadius: 5, overflow: 'hidden', marginBottom: 4 }}>
                <View style={{ height: '100%', width: (Math.max(0, w1BossHp) / WORLD1_BOSSES[w1BossIndex].hp * 100) + '%', backgroundColor: '#e74c3c', borderRadius: 5 }} />
              </View>
              <Text style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>{'HP: ' + w1BossHp.toLocaleString() + ' / ' + WORLD1_BOSSES[w1BossIndex].hp.toLocaleString()}</Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#2ecc71', fontSize: 12 }}>{'❤️ 君のHP: ' + playerHp + ' / ' + playerMaxHp}</Text>
                <Text style={{ color: '#3498db', fontSize: 12 }}>{'📊 今日: ' + w1CompletedMissions.length + ' / ' + (BATTLE_MISSIONS[w1BossIndex]?.length || 0) + '回'}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#111827', borderRadius: 8, padding: 8 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '800' }}>{samuraiStats.power}</Text>
                  <Text style={{ color: '#888', fontSize: 10 }}>{'💪 力'}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#3498db', fontSize: 16, fontWeight: '800' }}>{samuraiStats.mind}</Text>
                  <Text style={{ color: '#888', fontSize: 10 }}>{'🧠 心'}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2ecc71', fontSize: 16, fontWeight: '800' }}>{samuraiStats.skill}</Text>
                  <Text style={{ color: '#888', fontSize: 10 }}>{'🎯 技'}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#f1c40f', fontSize: 16, fontWeight: '800' }}>{samuraiStats.virtue}</Text>
                  <Text style={{ color: '#888', fontSize: 10 }}>{'🙏 徳'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 12 }}>
              <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900' }}>{'🏯 全ボス撃破！'}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{'お前は真の侍だ'}</Text>
            </View>
          )}
          
          {/* 撃破済みボス */}
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
            {WORLD1_BOSSES.map((boss, idx) => (
              <View key={boss.id} style={{ flex: 1, alignItems: 'center', padding: 4, backgroundColor: idx < w1BossIndex ? '#1a2e1a' : idx === w1BossIndex ? '#2e1a1a' : '#1a1a1a', borderRadius: 8, borderWidth: 1, borderColor: idx < w1BossIndex ? '#2ecc7144' : idx === w1BossIndex ? '#e74c3c44' : '#33333344' }}>
                <Text style={{ fontSize: 10 }}>{idx < w1BossIndex ? '✅' : idx === w1BossIndex ? '⚔️' : '🔒'}</Text>
                <Text style={{ color: idx < w1BossIndex ? '#2ecc71' : idx === w1BossIndex ? '#e74c3c' : '#555', fontSize: 8, fontWeight: '700' }}>{boss.name.slice(0, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.goalTitle, { fontSize: 16, marginTop: 6 }]}>サムライ日記カレンダー</Text>"""

if old in c:
    c = c.replace(old, new)
    print('✅ バトル進捗ダッシュボード追加')
else:
    print('⚠  挿入位置が見つかりません')

with open(path, 'w') as f:
    f.write(c)

print('npx expo start --clear')
