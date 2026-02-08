#!/usr/bin/env python3
# -*- coding: utf-8 -*-
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """            <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
              {LEVEL_TITLES[levelInfo.level + 1]}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };
  const renderAlarmTab"""

battle_section = """            <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
              {LEVEL_TITLES[levelInfo.level + 1]}
            </Text>
          </View>
        )}

        {/* Battle Arena Section */}
        {(isPro || levelInfo.level >= 3) && (
          <View style={{ marginTop: 32, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
              <Text style={{ color: '#8B0000', fontSize: 16, fontWeight: '900', marginHorizontal: 12 }}>\u2620\ufe0f \u5bfe\u6226\u5834 \u2620\ufe0f</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {getAvailableEnemies().map((enemy) => (
                <Pressable
                  key={enemy.id}
                  onPress={() => startBattle(enemy)}
                  style={({ pressed }) => [{
                    width: '48%',
                    backgroundColor: pressed ? '#2a0a0a' : '#0a0a1a',
                    borderRadius: 14,
                    padding: 10,
                    marginBottom: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: enemy.isBoss ? '#8B0000' : '#222',
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <View style={{
                    width: 70, height: 70, borderRadius: 12, overflow: 'hidden',
                    borderWidth: 2, borderColor: enemy.isBoss ? '#8B0000' : '#333',
                    backgroundColor: '#0a0a0a',
                  }}>
                    <Image source={enemy.image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </View>
                  {enemy.isBoss && (
                    <Text style={{ color: '#8B0000', fontSize: 9, fontWeight: '900', marginTop: 4 }}>\U0001f479 BOSS</Text>
                  )}
                  <Text style={{ color: '#aaa', fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>{enemy.name}</Text>
                  <Text style={{ color: '#555', fontSize: 9, fontStyle: 'italic', marginTop: 2, textAlign: 'center' }} numberOfLines={1}>
                    \u300c{enemy.quote}\u300d
                  </Text>
                </Pressable>
              ))}
            </View>

            {battleWinStreak > 0 && (
              <Text style={{ color: '#D4AF37', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                \U0001f525 {battleWinStreak}\u9023\u52dd\u4e2d
              </Text>
            )}
          </View>
        )}

        {!isPro && levelInfo.level < 3 && (
          <View style={{ marginTop: 32, width: '100%', alignItems: 'center', opacity: 0.4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
              <Text style={{ color: '#555', fontSize: 14, marginHorizontal: 12 }}>\u2620\ufe0f \u5bfe\u6226\u5834 \u2620\ufe0f</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            </View>
            <Text style={{ color: '#555', fontSize: 13 }}>\U0001f512 Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e</Text>
          </View>
        )}

      </ScrollView>
    );
  };
  const renderAlarmTab"""

if old in content:
    content = content.replace(old, battle_section)
    with open('App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK! Battle arena added to character tab')
else:
    print('Not found')
