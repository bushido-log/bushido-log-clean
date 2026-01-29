with open("App.tsx", "r") as f:
    content = f.read()

# 問題ボックスのスタイルを追加
old1 = """  addSiteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },"""

new1 = """  addSiteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  focusQBox: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")