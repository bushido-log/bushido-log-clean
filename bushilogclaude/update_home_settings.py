with open("App.tsx", "r") as f:
    content = f.read()

# 1. ホーム画面に設定アイコンを追加（右上）
old1 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Text style={styles.dojoTitle}>道場</Text>
      <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />
      <Text style={styles.startSubtitle}>今日は何をする？</Text>"""

new1 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Pressable
        style={styles.settingsIconButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTab('settings');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.settingsIconText}>⚙️</Text>
      </Pressable>
      <Text style={styles.dojoTitle}>道場</Text>
      <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />
      <Text style={styles.startSubtitle}>今日は何をする？</Text>"""

content = content.replace(old1, new1)

# 2. タブバーの残りを削除（もしあれば）
old2 = """                <View style={styles.tabContainer}>
                  {renderTabButton('consult', '相談')}
                  {renderTabButton('goal', '目標')}
                  {renderTabButton('review', '振り返り')}
                  {renderTabButton('browser', 'ブラウザ')}
                  {renderTabButton('settings', '設定')}
                </View>"""
new2 = ""
content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")