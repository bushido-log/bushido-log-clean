with open("App.tsx", "r") as f:
    content = f.read()

# 明日に備えるボタンを有効化
old1 = """        <Text style={styles.startButtonText}>明日に備える（準備中）</Text>
      </Pressable>"""

new1 = """        <Text style={styles.startButtonText}>明日に備える</Text>
      </Pressable>"""

content = content.replace(old1, new1)

# ボタンのスタイルを有効化
old2 = """style={[styles.startButton, { backgroundColor: '#374151', opacity: 0.5 }]}
        disabled={true}
      >
        <Text style={styles.startButtonText}>明日に備える"""

new2 = """style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('alarm');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>明日に備える"""

content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")