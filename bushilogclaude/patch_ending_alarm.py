#!/usr/bin/env python3
"""
BUSHIDO LOG: エンディング演出変更 + MK2アラーム接続
Run from: bushilogclaude/ directory (after Step 1-3)

Changes:
  1. ending1: 静→熱のミックスセリフ + フォントサイズ調整
  2. ending2: 「三日坊主殺し」称号
  3. ending3: テツヤのセリフ改善 + フォント調整
  4. ending4: 「夜の支配者」+「逃げるなよ。」
  5. MK2アラームミッション → 実際のサムライアラームに接続
  6. gameData.ts: alarm phase変更 + TEXT_CFGからalarm削除
"""

# ============================================================
# App.tsx
# ============================================================
with open('App.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
changes = 0

# 1. ending1: ミックスセリフ
old = "storyTypewriter('お前はもう\\n三日坊主ではない。'), 800)"
new = "storyTypewriter('三日。\\nたった三日。\\n\\n「どうせ続かない」\\n「お前には無理だ」\\n「また明日でいい」\\n\\n全部、斬った。\\n\\nお前は──侍だ。'), 800)"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending1: セリフ変更')
else: print('[SKIP] ending1')

# 1b. ending1: フォントサイズ
old = "color: '#DAA520', fontSize: 28, fontWeight: '900', letterSpacing: 6, textAlign: 'center'"
new = "color: '#DAA520', fontSize: 20, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 34"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending1: フォントサイズ調整')

# 2. ending2: 称号
old = "{'三日坊主を倒した。'}"
new = "{'── 三日坊主殺し ──'}"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending2: 称号変更')

# 3. ending3: テツヤのセリフ
old = "storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。')"
new = "storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。')"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending3: テツヤのセリフ変更')

# 3b. ending3: フォント
old = "color: '#9b59b6', fontSize: 20, fontWeight: '900', letterSpacing: 3, textAlign: 'center', lineHeight: 32"
new = "color: '#9b59b6', fontSize: 18, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 30"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending3: フォントサイズ調整')

# 4. ending4: テキスト
old = "{'―― 近日実装 ――'}"
new = "{'── 夜の支配者 ──'}"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending4: テキスト変更')

# 4b. ending4: 「逃げるなよ。」
old = "{'── 夜の支配者 ──'}</Text>\n              </Animated.View>"
new = "{'── 夜の支配者 ──'}</Text>\n                <Text style={{ color: '#888', fontSize: 15, letterSpacing: 2, marginTop: 16, fontStyle: 'italic' }}>{'「逃げるなよ。」'}</Text>\n              </Animated.View>"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending4: 「逃げるなよ。」追加')

# 5. MK2アラームUI
old = """              )}

              {/* List input phase */}"""
alarm_ui = """              )}

              {/* Alarm phase - connects to Samurai Alarm */}
              {mk2Phase === 'mk2_alarm' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2DD4BF', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{'⏰ サムライアラーム'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{'明日の起床時間をセットしろ。\\n撮影しないと止まらない。'}</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h + 1) % 24); }} style={{ padding: 10 }}>
                        <Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▲'}</Text>
                      </Pressable>
                      <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmHour).padStart(2, '0')}</Text>
                      <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h - 1 + 24) % 24); }} style={{ padding: 10 }}>
                        <Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▼'}</Text>
                      </Pressable>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 48, marginHorizontal: 8 }}>{':'}</Text>
                    <View style={{ alignItems: 'center' }}>
                      <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m + 15) % 60); }} style={{ padding: 10 }}>
                        <Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▲'}</Text>
                      </Pressable>
                      <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmMinute).padStart(2, '0')}</Text>
                      <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m - 15 + 60) % 60); }} style={{ padding: 10 }}>
                        <Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▼'}</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>{'📸 撮影ミッション'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    {(['冷蔵庫', '洗面台', '玄関'] as const).map(m => (
                      <Pressable key={m} onPress={() => { playTapSound(); setAlarmMission(m); }} style={{ backgroundColor: alarmMission === m ? '#2DD4BF' : '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginHorizontal: 4 }}>
                        <Text style={{ color: alarmMission === m ? '#000' : '#fff', fontWeight: 'bold', fontSize: 14 }}>{m}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <TouchableOpacity onPress={async () => {
                    playConfirmSound();
                    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
                    const now = new Date();
                    let triggerDate = new Date();
                    triggerDate.setHours(alarmHour, alarmMinute, 0, 0);
                    if (triggerDate <= now) triggerDate.setDate(triggerDate.getDate() + 1);
                    if (alarmNotificationId) { await Notifications.cancelScheduledNotificationAsync(alarmNotificationId); }
                    const notifId = await Notifications.scheduleNotificationAsync({
                      content: { title: '⚔️ サムライキング参上', body: '起きろ！' + alarmMission + 'を撮影して目を覚ませ！', sound: true, data: { type: 'wakeup_alarm' } },
                      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
                    });
                    setAlarmNotificationId(notifId);
                    setAlarmSet(true);
                    setMk2Done(prev => [...prev, 'alarm']);
                    setMk2Phase('menu');
                    Alert.alert('⏰ アラームセット完了', alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\\n撮影場所：' + alarmMission);
                  }} style={{ backgroundColor: '#2DD4BF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'アラームをセット'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 8 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* List input phase */}"""
if old in src:
    src = src.replace(old, alarm_ui, 1); changes += 1
    print('[OK] MK2アラームUI追加')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

# ============================================================
# gameData.ts
# ============================================================
with open('src/data/gameData.ts', 'r', encoding='utf-8') as f:
    gd = f.read()

old_alarm = "sub: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\u304b\u5ba3\u8a00\u3057\u308d', phase: 'mk2_text'"
new_alarm = "sub: '\u30a2\u30e9\u30fc\u30e0\u3092\u30bb\u30c3\u30c8\u3057\u308d', phase: 'mk2_alarm'"
if old_alarm in gd:
    gd = gd.replace(old_alarm, new_alarm, 1); changes += 1
    print('[OK] gameData: alarm phase変更')

old_cfg = "    alarm: { title: '\u23f0 \u65e9\u8d77\u304d\u5ba3\u8a00', prompt: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\uff1f', ph: '\u4f8b\uff1a6:00\u306b\u8d77\u304d\u308b', btn: '\u5ba3\u8a00\u3059\u308b' },\n"
if old_cfg in gd:
    gd = gd.replace(old_cfg, '', 1); changes += 1
    print('[OK] gameData: TEXT_CFGからalarm削除')

with open('src/data/gameData.ts', 'w', encoding='utf-8') as f:
    f.write(gd)

print(f'\n✅ 完了！ {changes}箇所変更')
