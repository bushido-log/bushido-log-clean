with open("App.tsx", "r") as f:
    content = f.read()

# Paywallスタイルを追加（toastTextの後に）
old1 = """  toastText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});"""

new1 = """  toastText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Paywallスタイル
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  paywallCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  paywallPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 24,
  },
  paywallButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  paywallButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paywallRestoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  paywallRestoreText: {
    color: '#888',
    fontSize: 14,
  },
  paywallCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 6 done - Paywall styles added!")