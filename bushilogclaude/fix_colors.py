with open("App.tsx", "r") as f:
    content = f.read()

# スタートボタンの色をターコイズに変更
old1 = """  startButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '600',
  },"""

new1 = """  startButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")