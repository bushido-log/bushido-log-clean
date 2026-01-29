with open("App.tsx", "r") as f:
    content = f.read()

# 1. スタート画面のレンダリング関数を追加（renderTabButtonの前に）
old1 = "const renderTabButton = (value: typeof tab, label: string) => ("
new1 = """// スタート画面
  const startScreenQuotes = [
    '今日も一刀両断。',
    '迷いを斬れ。',
    '己に克て。',
    '武士道とは、死ぬことと見つけたり。',
    '行動こそが、すべてを変える。',
  ];
  const randomQuote = startScreenQuotes[Math.floor(Math.random() * startScreenQuotes.length)];

  const renderStartScreen = () => (
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
    </View>
  );

  // トースト表示
  const renderSaveToast = () => (
    showSaveToast ? (
      <View style={styles.toastContainer}>
        <Text style={styles.toastText}>{saveToastMessage}</Text>
      </View>
    ) : null
  );

  const renderTabButton = (value: typeof tab, label: string) => ("""
content = content.replace(old1, new1)

# 2. メインreturn文でスタート画面を条件表示（isOnboardingの後に）
old2 = """if (isOnboarding) {
    return ("""
new2 = """if (showStartScreen && !isOnboarding && !isLoadingOnboarding) {
    return renderStartScreen();
  }

  if (isOnboarding) {
    return ("""
content = content.replace(old2, new2)

# 3. トーストをメイン画面に追加（最後のView閉じタグの前）
old3 = """</View>
    </KeyboardAvoidingView>
  );
}

const styles"""
new3 = """  {renderSaveToast()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles"""
content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 2 done!")