with open("App.tsx", "r") as f:
    content = f.read()

# ホームボタンスタイルを追加
old1 = """  quizCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});"""

new1 = """  quizCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // ホームボタン
  homeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 24,
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")