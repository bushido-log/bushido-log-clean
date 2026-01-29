with open("App.tsx", "r") as f:
    content = f.read()

old1 = """  if (isLoadingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>サムライキングを呼び出し中…</Text>
      </View>
    );
  }
  return (
    <>"""

new1 = """  if (isLoadingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>サムライキングを呼び出し中…</Text>
      </View>
    );
  }

  // スタート画面表示（オンボーディング完了後）
  if (showStartScreen && !isOnboarding) {
    return renderStartScreen();
  }

  return (
    <>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")