with open("App.tsx", "r") as f:
    content = f.read()

# 1. 集中機能用のstateを追加
old1 = """  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);"""

new1 = """  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  
  // 集中機能
  const [focusPurpose, setFocusPurpose] = useState('');
  const [focusUrl, setFocusUrl] = useState('https://www.google.com');
  const [showFocusEntry, setShowFocusEntry] = useState(true);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusMinutesLeft, setFocusMinutesLeft] = useState(60);
  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');"""

content = content.replace(old1, new1)

# 2. ホーム画面の「集中する」ボタンを有効化
old2 = """      <Pressable
        style={[styles.startButton, styles.startButtonDisabled]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={[styles.startButtonText, styles.startButtonTextDisabled]}>集中する（準備中）</Text>
      </Pressable>"""

new2 = """      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('focus');
          setShowStartScreen(false);
          setShowFocusEntry(true);
          setFocusPurpose('');
        }}
      >
        <Text style={styles.startButtonText}>集中する</Text>
      </Pressable>"""

content = content.replace(old2, new2)

# 3. タブの型に'focus'を追加
old3 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude'>('consult');"""
new3 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser' | 'gratitude' | 'focus'>('consult');"""
content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")