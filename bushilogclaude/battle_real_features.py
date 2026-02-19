#!/usr/bin/env python3
"""
battle_real_features.py
1. BattleScreen: appMission → 相談はAI返答あり、アラームは時間設定あり
2. App.tsx: onConsult/onSetAlarm propsを渡す
"""

import shutil
from datetime import datetime

# ═══════════════════════════════════════
# Part 1: BattleScreen.tsx
# ═══════════════════════════════════════
bs_path = 'src/components/BattleScreen.tsx'
shutil.copy2(bs_path, bs_path + f'.bak_{datetime.now().strftime("%H%M%S")}')

with open(bs_path, 'r', encoding='utf-8') as f:
    bs = f.read()

# 1a. Add new props
old_props = """  onRun: () => void;
  onClose: () => void;"""

new_props = """  onRun: () => void;
  onClose: () => void;
  onConsult?: (text: string) => Promise<string>;
  onSetAlarm?: (hour: number, minute: number) => void;"""

if old_props in bs:
    bs = bs.replace(old_props, new_props)
    print('✅ 1a. Props added to BattleScreenProps')

# 1b. Destructure new props
old_destruct = """    onMissionComplete, onOugi, onRun, onClose,"""
new_destruct = """    onMissionComplete, onOugi, onRun, onClose, onConsult, onSetAlarm,"""

if old_destruct in bs:
    bs = bs.replace(old_destruct, new_destruct)
    print('✅ 1b. Props destructured')

# 1c. Add state for consult reply and alarm time
old_state = "  const [textInput, setTextInput] = useState('');"
new_state = """  const [textInput, setTextInput] = useState('');
  const [consultReply, setConsultReply] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);
  const [alarmH, setAlarmH] = useState(7);
  const [alarmM, setAlarmM] = useState(0);"""

if old_state in bs:
    bs = bs.replace(old_state, new_state, 1)
    print('✅ 1c. State added')

# 1d. Replace appMission phase with real features
old_app_mission = """              {phase === 'appMission' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => setPhase('mission')} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{selMission.desc}</Text>
                  <TextInput
                    value={textInput} onChangeText={setTextInput}
                    placeholder={selMission.id === 'consult' ? '悩みや気持ちを書け…' : selMission.id === 'alarm' ? '明日の起床目標を宣言しろ…' : 'ここに書け…'}
                    placeholderTextColor="#555" multiline
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
              )}"""

new_app_mission = """              {phase === 'appMission' && selMission && (
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
                        <Pressable onPress={() => setAlarmH(prev => (prev + 23) % 24)} style={{ padding: 8 }}>
                          <Text style={{ color: '#888', fontSize: 22 }}>▲</Text>
                        </Pressable>
                        <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'], marginHorizontal: 4 }}>
                          {String(alarmH).padStart(2, '0')}
                        </Text>
                        <Text style={{ color: '#D4AF37', fontSize: 48, fontWeight: '900' }}>:</Text>
                        <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'], marginHorizontal: 4 }}>
                          {String(alarmM).padStart(2, '0')}
                        </Text>
                        <Pressable onPress={() => setAlarmM(prev => (prev + 55) % 60)} style={{ padding: 8 }}>
                          <Text style={{ color: '#888', fontSize: 22 }}>▲</Text>
                        </Pressable>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
                        <Pressable onPress={() => setAlarmH(prev => (prev + 1) % 24)} style={{ padding: 8 }}>
                          <Text style={{ color: '#888', fontSize: 22 }}>▼</Text>
                        </Pressable>
                        <View style={{ width: 80 }} />
                        <Pressable onPress={() => setAlarmM(prev => (prev + 5) % 60)} style={{ padding: 8 }}>
                          <Text style={{ color: '#888', fontSize: 22 }}>▼</Text>
                        </Pressable>
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
              )}"""

if old_app_mission in bs:
    bs = bs.replace(old_app_mission, new_app_mission)
    print('✅ 1d. appMission replaced with real consult + alarm UI')
else:
    print('⚠  appMission block not found (check fix_battle_screen.py was applied)')

with open(bs_path, 'w', encoding='utf-8') as f:
    f.write(bs)

# ═══════════════════════════════════════
# Part 2: App.tsx — pass props
# ═══════════════════════════════════════
app_path = 'App.tsx'
shutil.copy2(app_path, app_path + f'.bak_bf_{datetime.now().strftime("%H%M%S")}')

with open(app_path, 'r', encoding='utf-8') as f:
    app = f.read()

# Add onConsult and onSetAlarm props to BattleScreen
old_battle_tag = """            onClose={() => { setBattleActive(false); setTab('innerWorld'); }}"""

new_battle_tag = """            onClose={() => { setBattleActive(false); setTab('innerWorld'); }}
            onConsult={async (text: string) => {
              try { return await callSamuraiKing(text); } catch(e) { return 'エラーでござる'; }
            }}
            onSetAlarm={(h: number, m: number) => {
              setAlarmHour(h);
              setAlarmMinute(m);
              setAlarmSet(true);
              const now = new Date();
              const alarm = new Date();
              alarm.setHours(h, m, 0, 0);
              if (alarm <= now) alarm.setDate(alarm.getDate() + 1);
              const seconds = Math.floor((alarm.getTime() - now.getTime()) / 1000);
              Notifications.scheduleNotificationAsync({
                content: { title: '⏰ サムライアラーム', body: '起きろ！武士に二度寝なし！', sound: true },
                trigger: { type: 'timeInterval', seconds, repeats: false } as any,
              }).then(id => setAlarmNotificationId(id)).catch(() => {});
              showSaveSuccess('⏰ ' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ' にアラームセット！');
            }}"""

if old_battle_tag in app and 'onConsult' not in app:
    app = app.replace(old_battle_tag, new_battle_tag)
    print('✅ 2. App.tsx: onConsult + onSetAlarm props passed')
elif 'onConsult' in app:
    print('⏭  Props already passed')
else:
    print('⚠  BattleScreen onClose tag not found')

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app)

print('\n✅ Done! 相談はAI返答あり、アラームは実際にセットされます')
print('npx expo start --clear')
