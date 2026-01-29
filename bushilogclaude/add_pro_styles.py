with open("App.tsx", "r") as f:
    content = f.read()

# Proボタンのスタイルを追加（paywallCloseTextの後に）
old1 = """  paywallCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});"""

new1 = """  paywallCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // Proボタンスタイル
  proButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  proButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#888',
    fontSize: 13,
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")