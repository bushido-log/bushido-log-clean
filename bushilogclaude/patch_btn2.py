#!/usr/bin/env python3
with open('App.tsx','r') as f:
    content = f.read()

target = "</ScrollView>\n    );\n  };\n\n  const renderAlarmTab"

btn = """
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
          <Text style={{ fontSize: 28, marginBottom: 4 }}>{String.fromCodePoint(0x2694, 0xFE0F)}</Text>
          <Text style={{ color: '#ef4444', fontSize: 20, fontWeight: '900' }}>\u4fee\u884c\u5bfe\u6226</Text>
          <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>\u5df1\u306e\u529b\u3092\u8a66\u305b</Text>
          {battleWinStreak > 0 && (
            <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 4 }}>\ud83d\udd25 {battleWinStreak}\u9023\u52dd\u4e2d</Text>
          )}
        </Pressable>
"""

replacement = btn + "\n      </ScrollView>\n    );\n  };\n\n  const renderAlarmTab"

if target in content:
    content = content.replace(target, replacement)
    with open('App.tsx','w') as f:
        f.write(content)
    print('OK! Battle button added!')
else:
    print('ERROR: still not found')
