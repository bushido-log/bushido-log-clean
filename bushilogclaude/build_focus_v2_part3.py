with open("App.tsx", "r") as f:
    content = f.read()

# renderFocusTab全体を見つけて置換
# まず開始位置を探す
start_marker = "  const renderFocusTab = () => ("
end_marker = "  // 感謝タブ"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    new_focus_tab = '''  const renderFocusTab = () => (
    <View style={{ flex: 1 }}>
      {/* モード選択画面 */}
      {focusType === 'select' && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>集中</Text>
          <Text style={styles.focusQuestion}>何に集中する？</Text>
          
          <Pressable
            style={styles.focusTypeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFocusType('net');
              setShowFocusEntry(true);
            }}
          >
            <Text style={styles.focusTypeEmoji}>🌐</Text>
            <Text style={styles.focusTypeButtonText}>ネットを使う</Text>
            <Text style={styles.focusTypeButtonSub}>封印サイト・NGワード監視付き</Text>
          </Pressable>
          
          <Pressable
            style={styles.focusTypeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setFocusType('study');
              setShowFocusEntry(true);
            }}
          >
            <Text style={styles.focusTypeEmoji}>📚</Text>
            <Text style={styles.focusTypeButtonText}>勉強する</Text>
            <Text style={styles.focusTypeButtonSub}>タイマーで集中管理</Text>
          </Pressable>
        </View>
      )}

      {/* 勉強モード設定 */}
      {focusType === 'study' && showFocusEntry && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>勉強タイマー</Text>
          <Text style={styles.focusQuestion}>集中せよ。</Text>
          
          <View style={styles.timerSettingSection}>
            <Text style={styles.timerSettingLabel}>集中時間</Text>
            <View style={styles.timerButtons}>
              {[15, 25, 45, 60].map(min => (
                <Pressable
                  key={min}
                  style={[styles.timerButton, focusDuration === min && styles.timerButtonActive]}
                  onPress={() => setFocusDuration(min)}
                >
                  <Text style={[styles.timerButtonText, focusDuration === min && styles.timerButtonTextActive]}>{min}分</Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setShowFocusEntry(false);
              setFocusTimerRunning(true);
              setFocusMinutesLeft(focusDuration);
              setFocusSecondsLeft(0);
            }}
          >
            <Text style={styles.primaryButtonText}>開始</Text>
          </Pressable>
          
          <Pressable style={{ marginTop: 16 }} onPress={() => setFocusType('select')}>
            <Text style={{ color: '#666', textAlign: 'center' }}>戻る</Text>
          </Pressable>
        </View>
      )}

      {/* 勉強モード実行中 */}
      {focusType === 'study' && !showFocusEntry && (
        <View style={styles.studyTimerScreen}>
          <Text style={styles.studyTimerLabel}>集中中</Text>
          <Text style={styles.studyTimerDisplay}>
            {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
          </Text>
          <View style={styles.studyTimerControls}>
            <Pressable
              style={styles.studyControlButton}
              onPress={() => setFocusTimerRunning(!focusTimerRunning)}
            >
              <Text style={styles.studyControlText}>{focusTimerRunning ? '一時停止' : '再開'}</Text>
            </Pressable>
            <Pressable
              style={[styles.studyControlButton, { backgroundColor: '#333' }]}
              onPress={() => {
                Alert.alert('終了する？', '集中を終了しますか？', [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '終了', style: 'destructive', onPress: () => {
                    setFocusTimerRunning(false);
                    setShowFocusEntry(true);
                    setFocusType('select');
                    setShowStartScreen(true);
                  }}
                ]);
              }}
            >
              <Text style={styles.studyControlText}>終了</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ネットモード設定 */}
      {focusType === 'net' && showFocusEntry && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>ネット</Text>
            <Text style={styles.focusQuestion}>必要な検索だけせよ。</Text>
            <Text style={styles.goalSub}>封印サイト→ブロック / NGワード→問題{ngLevel}問</Text>
            
            <View style={styles.timerSettingSection}>
              <Text style={styles.timerSettingLabel}>制限時間</Text>
              <View style={styles.timerButtons}>
                {[15, 25, 45, 60].map(min => (
                  <Pressable
                    key={min}
                    style={[styles.timerButton, focusDuration === min && styles.timerButtonActive]}
                    onPress={() => setFocusDuration(min)}
                  >
                    <Text style={[styles.timerButtonText, focusDuration === min && styles.timerButtonTextActive]}>{min}分</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.timerSettingSection}>
              <Text style={styles.timerSettingLabel}>NGワード問題数</Text>
              <View style={styles.timerButtons}>
                {[3, 5, 10].map(num => (
                  <Pressable
                    key={num}
                    style={[styles.timerButton, ngLevel === num && styles.timerButtonActive]}
                    onPress={() => setNgLevel(num as 3 | 5 | 10)}
                  >
                    <Text style={[styles.timerButtonText, ngLevel === num && styles.timerButtonTextActive]}>{num}問</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setShowFocusEntry(false);
                setFocusTimerRunning(true);
                setFocusMinutesLeft(focusDuration);
                setFocusSecondsLeft(0);
                setFocusUrl('https://www.google.com');
              }}
            >
              <Text style={styles.primaryButtonText}>ブラウザを開く</Text>
            </Pressable>
            
            <Pressable style={{ marginTop: 16 }} onPress={() => setFocusType('select')}>
              <Text style={{ color: '#666', textAlign: 'center' }}>戻る</Text>
            </Pressable>
            
            {/* 封印サイト管理 */}
            <View style={styles.blockedSitesSection}>
              <Text style={styles.blockedSitesTitle}>🚫 封印サイト（完全ブロック）</Text>
              {blockedSites.map((site, index) => (
                <View key={index} style={styles.blockedSiteItem}>
                  <Text style={styles.blockedSiteText}>{site}</Text>
                  <Pressable onPress={() => setBlockedSites(blockedSites.filter((_, i) => i !== index))}>
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

            {/* NGワード管理 */}
            <View style={styles.blockedSitesSection}>
              <Text style={styles.blockedSitesTitle}>⚠️ NGワード（問題で通過）</Text>
              {ngWords.map((word, index) => (
                <View key={index} style={styles.blockedSiteItem}>
                  <Text style={styles.blockedSiteText}>{word}</Text>
                  <Pressable onPress={() => setNgWords(ngWords.filter((_, i) => i !== index))}>
                    <Text style={styles.removeSiteText}>削除</Text>
                  </Pressable>
                </View>
              ))}
              <View style={styles.addSiteRow}>
                <TextInput
                  style={styles.addSiteInput}
                  value={newNgWord}
                  onChangeText={setNewNgWord}
                  placeholder="NGワードを追加..."
                  placeholderTextColor="#6b7280"
                />
                <Pressable style={styles.addSiteButton} onPress={() => {
                  if (newNgWord.trim()) {
                    setNgWords([...ngWords, newNgWord.trim()]);
                    setNewNgWord('');
                  }
                }}>
                  <Text style={styles.addSiteButtonText}>追加</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ネットモード実行中（ブラウザ） */}
      {focusType === 'net' && !showFocusEntry && (
        <View style={{ flex: 1 }}>
          <View style={styles.focusTopBar}>
            <Pressable onPress={() => {
              Alert.alert('終了する？', 'ネット利用を終了しますか？', [
                { text: 'キャンセル', style: 'cancel' },
                { text: '終了', style: 'destructive', onPress: () => {
                  setFocusTimerRunning(false);
                  setShowFocusEntry(true);
                  setFocusType('select');
                  setShowStartScreen(true);
                }}
              ]);
            }}>
              <Text style={styles.focusEndText}>終了</Text>
            </Pressable>
            <View style={styles.focusTimerBox}>
              <Text style={styles.focusTimerText}>
                {String(focusMinutesLeft).padStart(2, '0')}:{String(focusSecondsLeft).padStart(2, '0')}
              </Text>
            </View>
            <Pressable onPress={() => setFocusTimerRunning(!focusTimerRunning)}>
              <Text style={styles.focusTimerControl}>{focusTimerRunning ? '⏸' : '▶️'}</Text>
            </Pressable>
          </View>
          <WebView
            source={{ uri: focusUrl }}
            style={{ flex: 1 }}
            onShouldStartLoadWithRequest={(request) => {
              if (isUrlBlocked(request.url)) {
                Alert.alert('封印されたサイト', 'このサイトは開けない。');
                return false;
              }
              if (containsNgWord(request.url)) {
                startNgQuiz(request.url);
                return false;
              }
              return true;
            }}
          />
        </View>
      )}

      {/* NGワード問題モーダル */}
      <Modal visible={showNgQuiz} animationType="slide" transparent>
        <View style={styles.quizOverlay}>
          <View style={styles.quizCard}>
            <Text style={styles.ngQuizTitle}>⚠️ NGワード検出</Text>
            <Text style={styles.ngQuizSub}>この先に行きたいなら{'\n'}問題に答えよ</Text>
            <Text style={styles.ngQuizRemaining}>残り {ngQuizRemaining} 問</Text>
            
            <View style={styles.focusQBox}>
              <Text style={styles.focusQText}>{currentNgQ.q}</Text>
            </View>
            
            <TextInput
              style={styles.quizInput}
              value={ngAnswer}
              onChangeText={setNgAnswer}
              placeholder="Answer..."
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoFocus
            />
            
            <Pressable style={styles.quizSubmitButton} onPress={handleNgQuizAnswer}>
              <Text style={styles.quizSubmitText}>回答</Text>
            </Pressable>
            
            <Pressable onPress={() => { setShowNgQuiz(false); setPendingUrl(''); }}>
              <Text style={styles.quizCloseText}>やめる（検索を中止）</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );

'''
    
    content = before + new_focus_tab + after

with open("App.tsx", "w") as f:
    f.write(content)

print("Part 3 Done!")