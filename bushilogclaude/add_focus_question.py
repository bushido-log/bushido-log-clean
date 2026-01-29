with open("App.tsx", "r") as f:
    content = f.read()

# 1. 英語問題のデータとstateを追加
old1 = """  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');"""

new1 = """  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [focusQuestionAnswer, setFocusQuestionAnswer] = useState('');
  const [showFocusQuestion, setShowFocusQuestion] = useState(false);
  const [currentFocusQ, setCurrentFocusQ] = useState({ q: '', a: '' });

  // 英語の問題（摩擦を生む）
  const focusQuestions = [
    { q: 'What is the opposite of "success"?', a: 'failure' },
    { q: 'What is the past tense of "go"?', a: 'went' },
    { q: 'What is the capital of Japan?', a: 'tokyo' },
    { q: 'How do you say "時間" in English?', a: 'time' },
    { q: 'What is 7 x 8?', a: '56' },
    { q: 'What is the opposite of "hot"?', a: 'cold' },
    { q: 'How many days in a week?', a: '7' },
    { q: 'What color is the sky?', a: 'blue' },
    { q: 'What is the plural of "child"?', a: 'children' },
    { q: 'What comes after Wednesday?', a: 'thursday' },
  ];"""

content = content.replace(old1, new1)

# 2. handleStartFocusを修正して問題を表示
old2 = """  const handleStartFocus = () => {
    if (!focusPurpose.trim()) {
      Alert.alert('目的が必要', '何のために開くのか、目的を入力せよ。');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowFocusEntry(false);
    setFocusStartTime(new Date());
  };"""

new2 = """  const handleStartFocus = () => {
    if (!focusPurpose.trim()) {
      Alert.alert('目的が必要', '何のために開くのか、目的を入力せよ。');
      return;
    }
    // ランダムな問題を選択
    const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
    setCurrentFocusQ(randomQ);
    setFocusQuestionAnswer('');
    setShowFocusQuestion(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFocusQuestionSubmit = () => {
    if (focusQuestionAnswer.trim().toLowerCase() === currentFocusQ.a.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowFocusQuestion(false);
      setShowFocusEntry(false);
      setFocusStartTime(new Date());
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('不正解', '答えが違う。集中する覚悟はあるか？');
      // 新しい問題に変更
      const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
      setCurrentFocusQ(randomQ);
      setFocusQuestionAnswer('');
    }
  };"""

content = content.replace(old2, new2)

# 3. 問題画面をrenderFocusTabに追加
old3 = """  const renderFocusTab = () => (
    <View style={{ flex: 1 }}>
      {showFocusEntry ? ("""

new3 = """  const renderFocusTab = () => (
    <View style={{ flex: 1 }}>
      {showFocusQuestion ? (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>試練</Text>
          <Text style={styles.focusQuestion}>本当に開く必要があるか？</Text>
          <Text style={styles.goalSub}>この問いに答えよ。</Text>
          
          <View style={styles.focusQBox}>
            <Text style={styles.focusQText}>{currentFocusQ.q}</Text>
          </View>
          
          <TextInput
            style={styles.focusInput}
            value={focusQuestionAnswer}
            onChangeText={setFocusQuestionAnswer}
            placeholder="Answer in English..."
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
          />
          
          <Pressable style={styles.primaryButton} onPress={handleFocusQuestionSubmit}>
            <Text style={styles.primaryButtonText}>回答する</Text>
          </Pressable>
          
          <Pressable 
            style={{ marginTop: 16 }}
            onPress={() => {
              setShowFocusQuestion(false);
            }}
          >
            <Text style={{ color: '#666', textAlign: 'center' }}>やめる</Text>
          </Pressable>
        </View>
      ) : showFocusEntry ? ("""

content = content.replace(old3, new3)

# 4. showFocusEntryの閉じかっこを修正
old4 = """        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.focusPurposeBar}>"""

new4 = """        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.focusPurposeBar}>"""

content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")