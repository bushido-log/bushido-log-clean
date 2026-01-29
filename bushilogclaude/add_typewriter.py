with open("App.tsx", "r") as f:
    content = f.read()

# 1. タイプライター用のstateを追加
old1 = """  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');"""

new1 = """  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');"""

content = content.replace(old1, new1)

# 2. タイプライター関数を追加
old2 = """  const showSaveSuccess = (message: string = '一太刀入魂。保存した。') => {"""

new2 = """  // タイプライター効果
  const typeWriter = (fullText: string, msgId: string, callback?: () => void) => {
    setTypingMessageId(msgId);
    setTypingText('');
    let index = 0;
    const speed = 50; // ミリ秒/文字
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypingText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setTypingMessageId(null);
        if (callback) callback();
      }
    }, speed);
  };

  const showSaveSuccess = (message: string = '一太刀入魂。保存した。') => {"""

content = content.replace(old2, new2)

# 3. kingMsgの表示をタイプライターに変更
old3 = """      const kingMsg: Message = {
        id: `${Date.now()}-samurai`,
        from: 'king',
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);"""

new3 = """      const msgId = `${Date.now()}-samurai`;
      const kingMsg: Message = {
        id: msgId,
        from: 'king',
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      typeWriter(replyText, msgId);"""

content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")