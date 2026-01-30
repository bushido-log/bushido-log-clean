with open("App.tsx", "r") as f:
    content = f.read()

# 1. ImagePickerのインポートを追加
old1 = """import * as Haptics from 'expo-haptics';"""
new1 = """import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';"""
content = content.replace(old1, new1)

# 2. アラーム状態のstateを拡張
old2 = """  // アラーム機能
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmMission, setAlarmMission] = useState<'冷蔵庫' | '洗面台' | '玄関'>('洗面台');"""

new2 = """  // アラーム機能
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmMission, setAlarmMission] = useState<'冷蔵庫' | '洗面台' | '玄関'>('洗面台');
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [alarmLevel, setAlarmLevel] = useState(1);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const alarmMessages = {
    1: ['起きろ。', '目を開けよ。', '朝だ。'],
    2: ['まだ寝ているのか。', '今すぐ立て。', '布団から出ろ。'],
    3: ['いつまで寝ている！', '武士の恥だ！', '情けない！'],
    4: ['恥を知れ！', 'お前は武士ではない！', '今すぐ立たねば切腹だ！'],
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    const startTime = Date.now();
    
    const shout = () => {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      let level = 1;
      if (elapsed > 5) level = 4;
      else if (elapsed > 3) level = 3;
      else if (elapsed > 1) level = 2;
      setAlarmLevel(level);
      
      const msgs = alarmMessages[level as 1|2|3|4];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      Speech.speak(msg, { language: 'ja', rate: 0.9, pitch: 0.8 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };
    
    shout();
    alarmIntervalRef.current = setInterval(shout, 5000);
  };
  
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setAlarmRinging(false);
    setAlarmSet(false);
    Speech.speak('よくやった。今日も勝て。', { language: 'ja' });
  };
  
  const takeMissionPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('カメラ許可が必要', 'アラームを止めるにはカメラを許可してください');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    
    if (!result.canceled) {
      stopAlarm();
      setShowStartScreen(true);
    }
  };"""

content = content.replace(old2, new2)

# 3. renderAlarmTabを更新（アラーム発動画面を追加）
old3 = """  const renderAlarmTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌅 SAMURAI KING ALARM</Text>
        <Text style={styles.goalSub}>カメラで撮影しないと止まらない。逃げ場なし。</Text>"""

new3 = """  const renderAlarmTab = () => {
    // アラーム発動中の画面
    if (alarmRinging) {
      return (
        <View style={{ flex: 1, backgroundColor: '#1a0000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#ef4444', fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>
            {alarmLevel >= 3 ? '起きろ！！！' : '起きろ。'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 20, marginBottom: 30, textAlign: 'center' }}>
            📸 {alarmMission}を撮影せよ
          </Text>
          <Text style={{ color: '#ef4444', fontSize: 16, marginBottom: 30 }}>
            怒りレベル: {'🔥'.repeat(alarmLevel)}
          </Text>
          <Pressable
            style={{ backgroundColor: '#ef4444', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 12 }}
            onPress={takeMissionPhoto}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>📷 撮影してアラームを止める</Text>
          </Pressable>
        </View>
      );
    }
    
    return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>🌅 SAMURAI KING ALARM</Text>
        <Text style={styles.goalSub}>カメラで撮影しないと止まらない。逃げ場なし。</Text>"""

content = content.replace(old3, new3)

# 4. renderAlarmTabの閉じ括弧を修正
old4 = """        {alarmSet && (
          <Text style={{ color: '#2DD4BF', textAlign: 'center', marginTop: 12 }}>
            ⏰ {alarmHour}:{String(alarmMinute).padStart(2, '0')} にセット済み
          </Text>
        )}
      </View>
    </ScrollView>
  );"""

new4 = """        {alarmSet && (
          <Text style={{ color: '#2DD4BF', textAlign: 'center', marginTop: 12 }}>
            ⏰ {alarmHour}:{String(alarmMinute).padStart(2, '0')} にセット済み
          </Text>
        )}
        
        {/* テスト用ボタン */}
        <Pressable
          style={[styles.secondaryButton, { marginTop: 20 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            startAlarmShout();
          }}
        >
          <Text style={styles.secondaryButtonText}>🔔 テスト：アラームを鳴らす</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
  };"""

content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")