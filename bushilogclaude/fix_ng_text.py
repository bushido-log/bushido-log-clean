with open("App.tsx", "r") as f:
    content = f.read()

# 改行の問題を修正
old1 = """<Text style={styles.ngQuizSub}>この先に行きたいなら{'
'}問題に答えよ</Text>"""

new1 = """<Text style={styles.ngQuizSub}>この先に行きたいなら問題に答えよ</Text>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")