with open("App.tsx", "r") as f:
    content = f.read()

# 1. 「今日は何をする？」を「道場」に変更
old1 = """<Text style={styles.startSubtitle}>今日は何をする？</Text>"""
new1 = """<Text style={styles.dojoTitle}>道場</Text>"""
content = content.replace(old1, new1)

# 2. 道場入口のアニメーション用state追加
old2 = """  const [alarmHour, setAlarmHour] = useState(7);"""
new2 = """  const [showDojoGate, setShowDojoGate] = useState(true);
  const [alarmHour, setAlarmHour] = useState(7);"""
content = content.replace(old2, new2)

# 3. 道場入口画面を追加（renderStartScreenの最初に）
old3 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Pressable
        style={styles.settingsIconButton}"""

new3 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      {/* 道場入口 */}
      {showDojoGate && (
        <Pressable 
          style={styles.dojoGateOverlay}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setShowDojoGate(false);
          }}
        >
          <Text style={styles.dojoGateTitle}>武士道</Text>
          <Text style={styles.dojoGateSubtitle}>— 道場に入る —</Text>
        </Pressable>
      )}
      
      <Pressable
        style={styles.settingsIconButton}"""

content = content.replace(old3, new3)

# 4. スタイル追加
old4 = """  startScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },"""

new4 = """  dojoGateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  dojoGateTitle: {
    fontSize: 72,
    color: '#D4AF37',
    fontWeight: 'bold',
    letterSpacing: 20,
    marginBottom: 24,
  },
  dojoGateSubtitle: {
    fontSize: 18,
    color: '#D4AF37',
    opacity: 0.8,
  },
  dojoTitle: {
    fontSize: 32,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  startScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },"""

content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")