with open("App.tsx", "r") as f:
    content = f.read()

# 設定アイコンスタイルを追加
old1 = """  dojoTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 8,
  },"""

new1 = """  dojoTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsIconButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 24,
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")