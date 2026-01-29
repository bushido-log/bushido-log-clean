with open("App.tsx", "r") as f:
    content = f.read()

# 設定画面にPro表示を追加
old1 = """        <Text style={styles.goalSub}>サムライキングの声やバイブの強さを、自分好みにカスタムできるでござる。</Text>
        <Text style={styles.sectionTitle}>サムライボイス</Text>"""

new1 = """        <Text style={styles.goalSub}>サムライキングの声やバイブの強さを、自分好みにカスタムできるでござる。</Text>
        
        <Text style={styles.sectionTitle}>プラン</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowText}>
            <Text style={styles.settingsLabel}>{isPro ? 'Pro会員' : '無料プラン'}</Text>
            <Text style={styles.settingsHint}>{isPro ? 'サムライキング相談が無制限' : '相談 ' + samuraiKingUses + '/1回使用済み'}</Text>
          </View>
          {!isPro && (
            <Pressable style={styles.proButton} onPress={() => setShowPaywall(true)}>
              <Text style={styles.proButtonText}>Proにする</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.restoreButton} onPress={async () => {
          const success = await restorePurchases();
          if (success) setIsPro(true);
        }}>
          <Text style={styles.restoreButtonText}>購入を復元</Text>
        </Pressable>
        
        <Text style={styles.sectionTitle}>サムライボイス</Text>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")