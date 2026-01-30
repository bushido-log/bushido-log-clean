with open("App.tsx", "r") as f:
    content = f.read()

# 1. 上の「道場」タイトル（dojoTitle）を削除
old1 = """      <Text style={styles.dojoTitle}>道場</Text>
      <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />"""

new1 = """      <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />"""

content = content.replace(old1, new1)

# 2. showDojoGateの初期値をtrueに確認し、アニメーションを追加
old2 = """  const [showDojoGate, setShowDojoGate] = useState(true);"""
new2 = """  const [showDojoGate, setShowDojoGate] = useState(true);
  const gateOpacity = useRef(new Animated.Value(0)).current;
  const gateScale = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    if (showDojoGate) {
      Animated.parallel([
        Animated.timing(gateOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(gateScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, []);"""

content = content.replace(old2, new2)

# 3. Animatedをインポートに追加（まだない場合）
if "import { Animated }" not in content and "Animated," not in content:
    old3 = """import { Alert, View,"""
    new3 = """import { Alert, Animated, View,"""
    content = content.replace(old3, new3)

# 4. 起動画面のPressableをAnimated.Viewでラップ
old4 = """      {/* 道場入口 */}
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
      )}"""

new4 = """      {/* 道場入口 */}
      {showDojoGate && (
        <Pressable 
          style={styles.dojoGateOverlay}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setShowDojoGate(false);
          }}
        >
          <Animated.View style={{ opacity: gateOpacity, transform: [{ scale: gateScale }], alignItems: 'center' }}>
            <Text style={styles.dojoGateTitle}>武士道</Text>
            <Text style={styles.dojoGateSubtitle}>— 道場に入る —</Text>
          </Animated.View>
        </Pressable>
      )}"""

content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")