with open("App.tsx", "r") as f:
    content = f.read()

# タイマー設定と履歴のスタイルを追加
old1 = """  focusEndText: {
    color: '#ef4444',
    fontSize: 12,
  },"""

new1 = """  focusEndText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  timerSettingSection: {
    marginBottom: 16,
  },
  timerSettingLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 4,
  },
  timerButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timerButtonText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  timerButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  focusHistorySection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  focusHistoryTitle: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 8,
  },
  focusHistoryItem: {
    color: '#9ca3af',
    fontSize: 13,
    paddingVertical: 6,
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")