with open("App.tsx", "r") as f:
    content = f.read()

# スタイルを追加
old1 = """  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },"""

new1 = """  focusQText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  // 集中モード選択
  focusTypeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  focusTypeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  focusTypeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  focusTypeButtonSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  // 勉強タイマー画面
  studyTimerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  studyTimerLabel: {
    color: '#D4AF37',
    fontSize: 18,
    marginBottom: 16,
  },
  studyTimerDisplay: {
    color: '#FFF',
    fontSize: 80,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  studyTimerControls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  studyControlButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  studyControlText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // タイマー設定
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
    paddingHorizontal: 8,
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
  // ネットモードトップバー
  focusTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  focusEndText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  focusTimerBox: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusTimerText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  focusTimerControl: {
    fontSize: 24,
  },
  // NGクイズ
  ngQuizTitle: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ngQuizSub: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  ngQuizRemaining: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Styles Done!")