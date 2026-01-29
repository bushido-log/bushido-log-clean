with open("App.tsx", "r") as f:
    content = f.read()

# 1. 感謝タブのレンダリング関数を追加（renderSettingsTabの前に）
old1 = """  const renderSettingsTab = () => ("""

new1 = """  // 感謝タブ
  const handleAddGratitude = () => {
    if (!gratitudeInput.trim()) return;
    if (gratitudeList.length >= 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newList = [...gratitudeList, gratitudeInput.trim()];
    setGratitudeList(newList);
    setGratitudeInput('');
    if (newList.length === 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowGratitudeComplete(true);
    }
  };

  const renderGratitudeTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>感謝</Text>
        <Text style={styles.goalSub}>今日は感謝を10個書けるか？</Text>
        
        <Text style={styles.gratitudeProgress}>{gratitudeList.length} / 10</Text>
        
        {gratitudeList.length < 10 ? (
          <>
            <TextInput
              style={styles.gratitudeInput}
              value={gratitudeInput}
              onChangeText={setGratitudeInput}
              placeholder="感謝を1つ書く..."
              placeholderTextColor="#6b7280"
              onSubmitEditing={handleAddGratitude}
              returnKeyType="done"
            />
            <Pressable style={styles.primaryButton} onPress={handleAddGratitude}>
              <Text style={styles.primaryButtonText}>追加</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.gratitudeCompleteBox}>
            <Text style={styles.gratitudeCompleteText}>よくやった。今日はもう勝っている。</Text>
            {isPro ? (
              <Pressable
                style={styles.quizButton}
                onPress={() => setShowQuiz(true)}
              >
                <Text style={styles.quizButtonText}>学びのクイズに挑戦</Text>
              </Pressable>
            ) : (
              <Text style={styles.proOnlyText}>Proで学びクイズ解放</Text>
            )}
          </View>
        )}
        
        {gratitudeList.length > 0 && (
          <View style={styles.gratitudeListContainer}>
            {gratitudeList.map((item, index) => (
              <View key={index} style={styles.gratitudeItem}>
                <Text style={styles.gratitudeItemNumber}>{index + 1}.</Text>
                <Text style={styles.gratitudeItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => ("""

content = content.replace(old1, new1)

# 2. タブ表示に感謝タブを追加
old2 = """{tab === 'settings' && renderSettingsTab()}"""
new2 = """{tab === 'gratitude' && renderGratitudeTab()}
                      {tab === 'settings' && renderSettingsTab()}"""
content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")