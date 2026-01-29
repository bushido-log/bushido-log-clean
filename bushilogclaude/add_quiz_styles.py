with open("App.tsx", "r") as f:
    content = f.read()

# クイズスタイルを追加
old1 = """  proOnlyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});"""

new1 = """  proOnlyText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  // クイズスタイル
  quizOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  quizCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  quizProgress: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 16,
  },
  quizQuestion: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  quizInput: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    marginBottom: 12,
  },
  quizHint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  quizSubmitButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  quizSubmitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quizCorrect: {
    color: '#2DD4BF',
  },
  quizWrong: {
    color: '#ef4444',
  },
  quizNextButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  quizNextText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizCloseText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")