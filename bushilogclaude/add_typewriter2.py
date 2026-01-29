with open("App.tsx", "r") as f:
    content = f.read()

# メッセージ表示部分をタイプライター対応に変更
old1 = """<Text style={styles.bubbleText}>{m.text}</Text>"""

new1 = """<Text style={styles.bubbleText}>{m.id === typingMessageId ? typingText : m.text}</Text>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")