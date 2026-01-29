with open("App.tsx", "r") as f:
    content = f.read()

# 集中機能のスタイルを追加
old1 = """  settingsIconText: {
    fontSize: 24,
  },"""

new1 = """  settingsIconText: {
    fontSize: 24,
  },
  // 集中機能スタイル
  focusQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 8,
  },
  focusInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  focusPurposeBar: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  focusPurposeLabel: {
    color: '#D4AF37',
    fontSize: 14,
  },
  blockedSitesSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  blockedSitesTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  blockedSiteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  blockedSiteText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  removeSiteText: {
    color: '#ef4444',
    fontSize: 12,
  },
  addSiteRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  addSiteInput: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  addSiteButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addSiteButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")