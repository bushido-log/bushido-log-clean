with open("App.tsx", "r") as f:
    content = f.read()

# 1. アラーム用のstateを追加
old1 = """  const [focusType, setFocusType] = useState<'select' | 'net' | 'study'>('select');"""

new1 = """  const [focusType, setFocusType] = useState<'select' | 'net' | 'study'>('select');
  
  // アラーム機能
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmMission, setAlarmMission] = useState<'冷蔵庫' | '洗面台' | '玄関'>('洗面台');"""

content = content.replace(old1, new1)

# 2. renderAlarmTabを追加（renderFocusTabの前）
old2 = """  const renderFocusTab = () => ("""

new2 = """  const renderAlarmTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌅 SAMURAI KING ALARM</Text>
        <Text style={styles.goalSub}>カメラで撮影しないと止まらない。逃げ場なし。</Text>
        
        <Text style={[styles.goalSub, { marginTop: 20, fontWeight: 'bold' }]}>⏰ 起床時間</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => setAlarmHour(h => (h + 1) % 24)} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▲</Text>
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmHour).padStart(2, '0')}</Text>
            <Pressable onPress={() => setAlarmHour(h => (h - 1 + 24) % 24)} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▼</Text>
            </Pressable>
          </View>
          <Text style={{ color: '#fff', fontSize: 48, marginHorizontal: 8 }}>:</Text>
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => setAlarmMinute(m => (m + 15) % 60)} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▲</Text>
            </Pressable>
            <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmMinute).padStart(2, '0')}</Text>
            <Pressable onPress={() => setAlarmMinute(m => (m - 15 + 60) % 60)} style={{ padding: 10 }}>
              <Text style={{ color: '#2DD4BF', fontSize: 24 }}>▼</Text>
            </Pressable>
          </View>
        </View>
        
        <Text style={[styles.goalSub, { marginTop: 20, fontWeight: 'bold' }]}>📸 撮影ミッション</Text>
        <Text style={styles.goalSub}>この場所を撮影しないとアラームが止まらない</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
          {(['冷蔵庫', '洗面台', '玄関'] as const).map(m => (
            <Pressable
              key={m}
              onPress={() => setAlarmMission(m)}
              style={{
                backgroundColor: alarmMission === m ? '#2DD4BF' : '#374151',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginHorizontal: 4,
              }}
            >
              <Text style={{ color: alarmMission === m ? '#000' : '#fff', fontWeight: 'bold' }}>{m}</Text>
            </Pressable>
          ))}
        </View>
        
        <Pressable
          style={[styles.primaryButton, { marginTop: 24, backgroundColor: alarmSet ? '#ef4444' : '#2DD4BF' }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setAlarmSet(!alarmSet);
            if (!alarmSet) {
              Alert.alert('アラーム設定完了', 
                alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\\n撮影場所：' + alarmMission + '\\n\\n※実際のアラーム機能は次のアップデートで追加予定');
            }
          }}
        >
          <Text style={styles.primaryButtonText}>{alarmSet ? 'アラーム解除' : 'アラームを設定'}</Text>
        </Pressable>
        
        {alarmSet && (
          <Text style={{ color: '#2DD4BF', textAlign: 'center', marginTop: 12 }}>
            ⏰ {alarmHour}:{String(alarmMinute).padStart(2, '0')} にセット済み
          </Text>
        )}
      </View>
    </ScrollView>
  );

  const renderFocusTab = () => ("""

content = content.replace(old2, new2)

# 3. tab === 'alarm' の描画を追加
old3 = """                      {tab === 'focus' && renderFocusTab()}"""

new3 = """                      {tab === 'focus' && renderFocusTab()}
                      {tab === 'alarm' && renderAlarmTab()}"""

content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")