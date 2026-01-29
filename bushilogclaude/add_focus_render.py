with open("App.tsx", "r") as f:
    content = f.read()

# 集中タブのレンダリング関数を追加（renderGratitudeTabの前に）
old1 = """  // 感謝タブ
  const handleAddGratitude = () => {"""

new1 = """  // 集中タブ
  const isUrlBlocked = (url: string) => {
    return blockedSites.some(site => url.toLowerCase().includes(site.toLowerCase()));
  };

  const handleStartFocus = () => {
    if (!focusPurpose.trim()) {
      Alert.alert('目的が必要', '何のために開くのか、目的を入力せよ。');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowFocusEntry(false);
    setFocusStartTime(new Date());
  };

  const renderFocusTab = () => (
    <View style={{ flex: 1 }}>
      {showFocusEntry ? (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>集中</Text>
          <Text style={styles.focusQuestion}>なぜ今これを開く？</Text>
          <Text style={styles.goalSub}>目的なき行動は、時間の浪費である。</Text>
          
          <TextInput
            style={styles.focusInput}
            value={focusPurpose}
            onChangeText={setFocusPurpose}
            placeholder="目的を入力..."
            placeholderTextColor="#6b7280"
            multiline
          />
          
          <Pressable style={styles.primaryButton} onPress={handleStartFocus}>
            <Text style={styles.primaryButtonText}>集中を始める</Text>
          </Pressable>
          
          <View style={styles.blockedSitesSection}>
            <Text style={styles.blockedSitesTitle}>封印されたサイト</Text>
            {blockedSites.map((site, index) => (
              <View key={index} style={styles.blockedSiteItem}>
                <Text style={styles.blockedSiteText}>{site}</Text>
                <Pressable onPress={() => {
                  setBlockedSites(blockedSites.filter((_, i) => i !== index));
                }}>
                  <Text style={styles.removeSiteText}>解除</Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.addSiteRow}>
              <TextInput
                style={styles.addSiteInput}
                value={newBlockedSite}
                onChangeText={setNewBlockedSite}
                placeholder="サイトを追加..."
                placeholderTextColor="#6b7280"
              />
              <Pressable style={styles.addSiteButton} onPress={() => {
                if (newBlockedSite.trim()) {
                  setBlockedSites([...blockedSites, newBlockedSite.trim()]);
                  setNewBlockedSite('');
                }
              }}>
                <Text style={styles.addSiteButtonText}>封印</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.focusPurposeBar}>
            <Text style={styles.focusPurposeLabel}>目的: {focusPurpose}</Text>
          </View>
          <WebView
            source={{ uri: focusUrl }}
            style={{ flex: 1 }}
            onNavigationStateChange={(navState) => {
              if (isUrlBlocked(navState.url)) {
                Alert.alert('封印されたサイト', 'このサイトは集中モードでは開けない。目的に戻れ。');
                setFocusUrl('https://www.google.com');
              } else {
                setFocusUrl(navState.url);
              }
            }}
          />
        </View>
      )}
    </View>
  );

  // 感謝タブ
  const handleAddGratitude = () => {"""

content = content.replace(old1, new1)

# タブ表示に集中タブを追加
old2 = """{tab === 'gratitude' && renderGratitudeTab()}"""
new2 = """{tab === 'focus' && renderFocusTab()}
                      {tab === 'gratitude' && renderGratitudeTab()}"""
content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")