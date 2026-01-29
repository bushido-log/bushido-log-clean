with open("App.tsx", "r") as f:
    content = f.read()

# スタイル追加（既存のstylesの最後 }); の前に追加）
old1 = """  timeOverText: {
    fontSize: 13,
    color: '#d1d5db',
  },
});"""

new1 = """  timeOverText: {
    fontSize: 13,
    color: '#d1d5db',
  },
  // スタート画面スタイル
  startScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  startTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  startQuote: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  startSubtitle: {
    fontSize: 20,
    color: '#FFF',
    marginBottom: 24,
  },
  startButton: {
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
  },
  // トーストスタイル
  toastContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 3b done!")