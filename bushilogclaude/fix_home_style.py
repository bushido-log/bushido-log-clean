with open("App.tsx", "r") as f:
    content = f.read()

# ホームボタンスタイルを更新
old1 = """  // ホームボタン
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

new1 = """  // ホームボタン
  homeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  homeButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")