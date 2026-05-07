#!/usr/bin/env python3
"""add_player_stats.py — バトル画面にプレイヤーステータス追加"""

bs_path = 'src/components/BattleScreen.tsx'
app_path = 'App.tsx'

# === BattleScreen.tsx ===
with open(bs_path, 'r') as f:
    bs = f.read()

# 1. Props追加
if 'playerHp?' not in bs:
    bs = bs.replace(
        "  playWinSound: () => void;\n};",
        "  playWinSound: () => void;\n  playerHp?: number;\n  playerMaxHp?: number;\n  playerLevel?: number;\n  playerStats?: { power: number; mind: number; skill: number; virtue: number };\n};"
    )
    print('✅ BS: Props added')

# 2. Destructure
if 'propPlayerHp' not in bs:
    bs = bs.replace(
        "    playTapSound, playAttackSound, playWinSound,",
        "    playTapSound, playAttackSound, playWinSound,\n    playerHp: propPlayerHp, playerMaxHp: propPlayerMaxHp, playerLevel, playerStats,"
    )
    print('✅ BS: Destructured')

# 3. コマンドフェーズにプレイヤーステータス追加
if '⚔️ Lv.' not in bs:
    old = """              {phase === 'command' && (
                <View>"""
    new = """              {phase === 'command' && (
                <View>
                  {/* プレイヤーステータス */}
                  <View style={{ backgroundColor: 'rgba(0,80,40,0.25)', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: '#2dd4bf', fontSize: 13, fontWeight: '900' }}>{'⚔️ Lv.' + (playerLevel || 1)}</Text>
                      <Text style={{ color: '#2ecc71', fontSize: 12, fontWeight: '700' }}>{'❤️ ' + (propPlayerHp || 0) + ' / ' + (propPlayerMaxHp || 0)}</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: '#1a1a2e', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                      <View style={{ height: '100%', width: (Math.max(0, (propPlayerHp || 0)) / Math.max(1, (propPlayerMaxHp || 1)) * 100) + '%', backgroundColor: (propPlayerHp || 0) / (propPlayerMaxHp || 1) > 0.5 ? '#2ecc71' : (propPlayerHp || 0) / (propPlayerMaxHp || 1) > 0.25 ? '#f39c12' : '#e74c3c', borderRadius: 4 }} />
                    </View>
                    {playerStats && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Text style={{ color: '#e74c3c', fontSize: 11, fontWeight: '600' }}>{'💪 ' + playerStats.power}</Text>
                        <Text style={{ color: '#3498db', fontSize: 11, fontWeight: '600' }}>{'🧠 ' + playerStats.mind}</Text>
                        <Text style={{ color: '#2ecc71', fontSize: 11, fontWeight: '600' }}>{'🎯 ' + playerStats.skill}</Text>
                        <Text style={{ color: '#f1c40f', fontSize: 11, fontWeight: '600' }}>{'🙏 ' + playerStats.virtue}</Text>
                      </View>
                    )}
                  </View>"""
    if old in bs:
        bs = bs.replace(old, new)
        print('✅ BS: Player status UI added')
    else:
        print('⚠  Command phase marker not found')

with open(bs_path, 'w') as f:
    f.write(bs)

# === App.tsx: pass props ===
with open(app_path, 'r') as f:
    app = f.read()

if 'playerHp={playerHp}' not in app:
    app = app.replace(
        "onVictory={handleBattleVictory}",
        "onVictory={handleBattleVictory}\n            playerHp={playerHp}\n            playerMaxHp={playerMaxHp}\n            playerLevel={getLevelFromXp(totalXp).level}\n            playerStats={samuraiStats}"
    )
    print('✅ App.tsx: Player props passed')

with open(app_path, 'w') as f:
    f.write(app)

print('\n✅ Done! npx expo start --clear')
