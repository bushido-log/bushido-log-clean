with open("App.tsx", "r") as f:
    content = f.read()

# スタイルを追加
old1 = """  homeButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
});"""

new1 = """  homeButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  // ヘッダーアイコン
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  // 道場タイトル
  dojoTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 8,
  },
  dojoIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")