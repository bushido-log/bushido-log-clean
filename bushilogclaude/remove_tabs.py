with open("App.tsx", "r") as f:
    content = f.read()

# 1. タブバーのレンダリング部分を削除
old1 = """            {isOnboarding ? (
              renderOnboarding()
            ) : (
              <>
                <View style={styles.tabContainer}>
                  {renderTabButton('consult', '相談')}
                  {renderTabButton('goal', '目標')}
                  {renderTabButton('review', '振り返り')}
                  {renderTabButton('browser', 'ブラウザ')}
                  {renderTabButton('settings', '設定')}
                </View>"""

new1 = """            {isOnboarding ? (
              renderOnboarding()
            ) : (
              <>"""

content = content.replace(old1, new1)

# 2. ヘッダーを簡素化（タイトル + 設定アイコン）
old2 = """            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStartScreen(true);
                  }}
                  style={styles.homeButton}
                >
                  <Text style={styles.homeButtonText}>道場に戻る</Text>
                </Pressable>
                <Image source={require('./assets/icon.png')} style={styles.headerIcon} />
                {isTimeLimited && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>残り：{remainingMinutes !== null ? `${remainingMinutes}分` : '∞'}</Text>
                  </View>
                )}
                <View style={{ width: 40 }} />
              </View>
              <Text style={styles.headerSub}>性エネルギーを創造エネルギーに変えるサムライ習慣アプリ</Text>
            </View>"""

new2 = """            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowStartScreen(true);
                  }}
                  style={styles.homeButton}
                >
                  <Text style={styles.homeButtonText}>道場に戻る</Text>
                </Pressable>
                <Image source={require('./assets/icon.png')} style={styles.headerIcon} />
                {isTimeLimited && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeText}>残り：{remainingMinutes !== null ? `${remainingMinutes}分` : '∞'}</Text>
                  </View>
                )}
              </View>
            </View>"""

content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")