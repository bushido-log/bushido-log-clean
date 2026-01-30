with open("App.tsx", "r") as f:
    content = f.read()

old1 = """      <Pressable
        style={[styles.startButton, styles.startButtonDisabled]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={[styles.startButtonText, styles.startButtonTextDisabled]}>明日に備える（準備中）</Text>
      </Pressable>"""

new1 = """      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>明日に備える</Text>
      </Pressable>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")