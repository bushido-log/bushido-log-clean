with open("App.tsx", "r") as f:
    content = f.read()

# 1. タブに'gratitude'を追加
old1 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser'>('consult');"""
new1 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude'>('consult');"""
content = content.replace(old1, new1)

# 2. 感謝用のstateを追加
old2 = """  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');"""
new2 = """  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  
  // 感謝機能
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [showGratitudeComplete, setShowGratitudeComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);"""
content = content.replace(old2, new2)

# 3. ホーム画面を更新
old3 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Text style={styles.startTitle}>BUSHIDO LOG</Text>
      <Text style={styles.startQuote}>{randomQuote}</Text>
      <Text style={styles.startSubtitle}>今日はどこから斬る？</Text>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('consult');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>🗡️ 相談へ（サムライキングを呼び出す）</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('goal');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>🎯 目標へ</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('review');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>📖 振り返りへ</Text>
      </Pressable>
    </View>"""

new3 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Text style={styles.startTitle}>BUSHIDO LOG</Text>
      <Text style={styles.startSubtitle}>今日は何をする？</Text>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('consult');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>相談する</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('gratitude');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>感謝を書く</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('goal');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>日記を書く</Text>
      </Pressable>
      
      <Pressable
        style={[styles.startButton, styles.startButtonDisabled]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={[styles.startButtonText, styles.startButtonTextDisabled]}>集中する（準備中）</Text>
      </Pressable>
      
      <Pressable
        style={[styles.startButton, styles.startButtonDisabled]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={[styles.startButtonText, styles.startButtonTextDisabled]}>明日に備える（準備中）</Text>
      </Pressable>
    </View>"""

content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")