with open("App.tsx", "r") as f:
    content = f.read()

# 1. タイマー用のstateを追加
old1 = """  const [focusMinutesLeft, setFocusMinutesLeft] = useState(60);"""

new1 = """  const [focusMinutesLeft, setFocusMinutesLeft] = useState(25);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(0);
  const [focusMode, setFocusMode] = useState<'work' | 'break'>('work');
  const [focusTimerRunning, setFocusTimerRunning] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);"""

content = content.replace(old1, new1)

# 2. タイマー用のuseEffectを追加
old2 = """  // 集中タブ
  const isUrlBlocked = (url: string) => {"""

new2 = """  // 集中タイマー
  useEffect(() => {
    if (!focusTimerRunning) return;
    
    const timer = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev === 0) {
          if (focusMinutesLeft === 0) {
            // タイマー終了
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (focusMode === 'work') {
              setFocusSessions(s => s + 1);
              setFocusMode('break');
              setFocusMinutesLeft(5); // 5分休憩
              Alert.alert('集中完了！', '5分間の休憩に入る。', [{ text: '了解' }]);
            } else {
              setFocusMode('work');
              setFocusMinutesLeft(25); // 25分集中
              Alert.alert('休憩終了', '再び集中せよ。', [{ text: '了解' }]);
            }
            return 0;
          }
          setFocusMinutesLeft(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [focusTimerRunning, focusMinutesLeft, focusMode]);

  // 集中タブ
  const isUrlBlocked = (url: string) => {"""

content = content.replace(old2, new2)

# 3. タイマー開始時の処理を修正
old3 = """  const handleFocusQuestionSubmit = () => {
    if (focusQuestionAnswer.trim().toLowerCase() === currentFocusQ.a.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowFocusQuestion(false);
      setShowFocusEntry(false);
      setFocusStartTime(new Date());
    } else {"""

new3 = """  const handleFocusQuestionSubmit = () => {
    if (focusQuestionAnswer.trim().toLowerCase() === currentFocusQ.a.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowFocusQuestion(false);
      setShowFocusEntry(false);
      setFocusStartTime(new Date());
      setFocusTimerRunning(true);
      setFocusMinutesLeft(25);
      setFocusSecondsLeft(0);
      setFocusMode('work');
    } else {"""

content = content.replace(old3, new3)

# 4. ブラウザ画面のタイマー表示を追加
old4 = """      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.focusPurposeBar}>
            <Text style={styles.focusPurposeLabel}>目的: {focusPurpose}</Text>
          </View>
          <WebView"""

new4 = """      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.focusTopBar}>
            <Text style={styles.focusPurposeLabel} numberOfLines={1}>目的: {focusPurpose}</Text>
            <View style={[styles.focusTimerBox, focusMode === 'break' && styles.focusTimerBreak]}>
              <Text style={styles.focusTimerText}>
                {focusMode === 'work' ? '🔥' : '☕'} {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
              </Text>
            </View>
            <Pressable onPress={() => setFocusTimerRunning(!focusTimerRunning)}>
              <Text style={styles.focusTimerControl}>{focusTimerRunning ? '⏸' : '▶️'}</Text>
            </Pressable>
          </View>
          <View style={styles.focusSessionsBar}>
            <Text style={styles.focusSessionsText}>完了セッション: {focusSessions} 🍅</Text>
            <Pressable onPress={() => {
              setShowFocusEntry(true);
              setFocusTimerRunning(false);
              setFocusMinutesLeft(25);
              setFocusSecondsLeft(0);
              setShowStartScreen(true);
            }}>
              <Text style={styles.focusEndText}>終了する</Text>
            </Pressable>
          </View>
          <WebView"""

content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")