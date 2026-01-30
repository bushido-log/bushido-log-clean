with open("App.tsx", "r") as f:
    content = f.read()

old1 = """        <Text style={styles.startButtonText}>日記を書く</Text>
      </Pressable>"""

new1 = """        <Text style={styles.startButtonText}>今日の目標</Text>
      </Pressable>
      
      <Pressable
        style={styles.startButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setTab('review');
          setShowStartScreen(false);
        }}
      >
        <Text style={styles.startButtonText}>振り返り</Text>
      </Pressable>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")