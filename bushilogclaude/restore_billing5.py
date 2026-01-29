with open("App.tsx", "r") as f:
    content = f.read()

# 1. Paywallモーダルを追加（renderSettingsTabの前に）
old1 = "const renderSettingsTab = () => ("
new1 = """// Paywallモーダル
  const renderPaywall = () => (
    <Modal visible={showPaywall} animationType="slide" transparent>
      <View style={styles.paywallOverlay}>
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>この先はPro</Text>
          <Text style={styles.paywallSubtitle}>決断を続けたい人のために。</Text>
          <Text style={styles.paywallPrice}>{monthlyPrice}</Text>
          <Pressable
            style={styles.paywallButton}
            onPress={async () => {
              const success = await purchasePro();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallButtonText}>Proにする</Text>
          </Pressable>
          <Pressable
            style={styles.paywallRestoreButton}
            onPress={async () => {
              const success = await restorePurchases();
              if (success) {
                setIsPro(true);
                setShowPaywall(false);
              }
            }}
          >
            <Text style={styles.paywallRestoreText}>購入を復元</Text>
          </Pressable>
          <Pressable onPress={() => setShowPaywall(false)}>
            <Text style={styles.paywallCloseText}>今はやめる</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsTab = () => ("""
content = content.replace(old1, new1)

# 2. メインreturnにPaywallモーダルを追加
old2 = "{renderSaveToast()}"
new2 = """{renderSaveToast()}
        {renderPaywall()}"""
content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 5 done - Paywall modal added!")