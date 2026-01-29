with open("App.tsx", "r") as f:
    content = f.read()

# 音声を先に開始し、タイプライターは少し遅らせる
old1 = """      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      typeWriter(replyText, msgId);"""

new1 = """      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      // 音声が少し先に始まるようタイプライターを遅延
      setTimeout(() => typeWriter(replyText, msgId), 300);"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")