with open("App.tsx", "r") as f:
    content = f.read()

# ヘッダーにホームボタンを追加
old1 = """            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.appTitle}>BUSHIDO LOG</Text>"""

new1 = """            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStartScreen(true);
                  }}
                  style={styles.homeButton}
                >
                  <Text style={styles.homeButtonText}>🏠</Text>
                </Pressable>
                <Text style={styles.appTitle}>BUSHIDO LOG</Text>"""

content = content.replace(old1, new1)

# タイムバッジの後の閉じタグを修正
old2 = """                {isTimeLimited && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>残り：{remainingMinutes !== null ? `${remainingMinutes}分` : '∞'}</Text>
                  </View>
                )}
              </View>"""

new2 = """                {isTimeLimited && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>残り：{remainingMinutes !== null ? `${remainingMinutes}分` : '∞'}</Text>
                  </View>
                )}
                <View style={{ width: 40 }} />
              </View>"""

content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")