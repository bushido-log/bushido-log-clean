with open("App.tsx", "r") as f:
    content = f.read()

# スタイルを追加（restoreButtonTextの後に）
old1 = """  restoreButtonText: {
    color: '#888',
    fontSize: 13,
  },
});"""

new1 = """  restoreButtonText: {
    color: '#888',
    fontSize: 13,
  },
  // 無効ボタンスタイル
  startButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  startButtonTextDisabled: {
    color: '#555',
  },
  // 感謝スタイル
  gratitudeProgress: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginVertical: 16,
  },
  gratitudeInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  gratitudeCompleteBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  gratitudeCompleteText: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  gratitudeListContainer: {
    marginTop: 16,
  },
  gratitudeItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gratitudeItemNumber: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
  },
  gratitudeItemText: {
    color: '#e5e7eb',
    fontSize: 14,
    flex: 1,
  },
  quizButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  quizButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proOnlyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")