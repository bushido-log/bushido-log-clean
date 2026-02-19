#!/usr/bin/env python3
"""fix_app_mission_v2.py — 行番号ベースで appMission を置き換え"""

path = 'src/components/BattleScreen.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find appMission block: starts with {phase === 'appMission'
start = None
end = None
for i, line in enumerate(lines):
    if "phase === 'appMission'" in line and start is None:
        start = i
    if start is not None and i > start:
        # Find closing: )}  then next line is RUN CONFIRM or something else
        stripped = line.strip()
        if stripped == ')}' and i > start + 5:
            end = i + 1
            break

if start is None or end is None:
    print(f'⚠  appMission block not found (start={start}, end={end})')
    exit(1)

print(f'Found appMission block: lines {start+1}-{end}')

new_block = '''              {phase === 'appMission' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => { setConsultReply(''); setConsultLoading(false); setPhase('mission'); }} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>

                  {selMission.id === 'consult' ? (
                    <View>
                      <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>サムライに悩みを打ち明けろ</Text>
                      <TextInput
                        value={textInput} onChangeText={setTextInput}
                        placeholder="悩みや気持ちを書け…" placeholderTextColor="#555" multiline
                        style={{ backgroundColor: 'rgba(20,20,30,0.9)', color: '#fff', borderRadius: 12, padding: 16, minHeight: 80, fontSize: 15, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' }}
                        editable={!consultLoading}
                      />
                      {!consultReply && (
                        <Pressable
                          onPress={async () => {
                            if (textInput.trim().length < 3 || consultLoading || !onConsult) return;
                            setConsultLoading(true);
                            try {
                              const reply = await onConsult(textInput.trim());
                              setConsultReply(reply);
                            } catch(e) {
                              setConsultReply('通信エラーでござる…もう一度試せ');
                            }
                            setConsultLoading(false);
                          }}
                          style={({ pressed }) => [{ backgroundColor: textInput.trim().length >= 3 && !consultLoading ? (pressed ? '#1e40af' : '#2563eb') : '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                            {consultLoading ? '⏳ サムライが考え中…' : '💬 相談する'}
                          </Text>
                        </Pressable>
                      )}
                      {consultReply !== '' && (
                        <View style={{ marginTop: 12 }}>
                          <View style={{ backgroundColor: 'rgba(20,20,40,0.9)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#D4AF3744' }}>
                            <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '800', marginBottom: 4 }}>サムライキングの言葉</Text>
                            <ScrollView style={{ maxHeight: 120 }}>
                              <Text style={{ color: '#e8e8e8', fontSize: 14, lineHeight: 20 }}>{consultReply}</Text>
                            </ScrollView>
                          </View>
                          <Pressable
                            onPress={() => {
                              doAttack(selMission.id, selMission.baseDamage, { type: 'app', text: textInput.trim() });
                              setConsultReply('');
                            }}
                            style={({ pressed }) => [{ backgroundColor: pressed ? '#166534' : '#15803d', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                          >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                              {'⚔️ 攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>

                  ) : selMission.id === 'alarm' ? (
                    <View>
                      <Text style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>明日の起床時間をセットしろ</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ alignItems: 'center' }}>
                          <Pressable onPress={() => setAlarmH(prev => (prev + 1) % 24)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▲</Text>
                          </Pressable>
                          <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                            {String(alarmH).padStart(2, '0')}
                          </Text>
                          <Pressable onPress={() => setAlarmH(prev => (prev + 23) % 24)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▼</Text>
                          </Pressable>
                        </View>
                        <Text style={{ color: '#D4AF37', fontSize: 48, fontWeight: '900', marginHorizontal: 8 }}>:</Text>
                        <View style={{ alignItems: 'center' }}>
                          <Pressable onPress={() => setAlarmM(prev => (prev + 5) % 60)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▲</Text>
                          </Pressable>
                          <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                            {String(alarmM).padStart(2, '0')}
                          </Text>
                          <Pressable onPress={() => setAlarmM(prev => (prev + 55) % 60)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▼</Text>
                          </Pressable>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => {
                          if (onSetAlarm) onSetAlarm(alarmH, alarmM);
                          doAttack(selMission.id, selMission.baseDamage, { type: 'app', text: alarmH + ':' + String(alarmM).padStart(2, '0') + ' に起きる' });
                        }}
                        style={({ pressed }) => [{ backgroundColor: pressed ? '#166534' : '#15803d', borderRadius: 12, padding: 14, alignItems: 'center' }]}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                          {'⏰ アラームセット＆攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                        </Text>
                      </Pressable>
                    </View>

                  ) : (
                    <View>
                      <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{selMission.desc}</Text>
                      <TextInput
                        value={textInput} onChangeText={setTextInput}
                        placeholder="ここに書け…" placeholderTextColor="#555" multiline
                        style={{ backgroundColor: 'rgba(20,20,30,0.9)', color: '#fff', borderRadius: 12, padding: 16, minHeight: 100, fontSize: 15, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' }}
                      />
                      <Pressable
                        onPress={() => {
                          if (textInput.trim().length < 3) return;
                          doAttack(selMission.id, selMission.baseDamage, { type: 'app', text: textInput.trim() });
                        }}
                        style={({ pressed }) => [{ backgroundColor: textInput.trim().length >= 3 ? (pressed ? '#166534' : '#15803d') : '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                          {'⚔️ 攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
'''

lines[start:end] = [new_block]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ appMission replaced with real consult + alarm UI')
print('npx expo start --clear')
