with open("App.tsx", "r") as f:
    content = f.read()

# タイプライターの遅延を削除
old1 = """      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      // 音声が少し先に始まるようタイプライターを遅延
      setTimeout(() => typeWriter(replyText, msgId), 300);"""

new1 = """      setMessages(prev => [...prev, kingMsg]);
      speakSamurai(replyText);
      typeWriter(replyText, msgId);"""

content = content.replace(old1, new1)

# タイプライター速度をもっと遅くする（120ミリ秒/文字）
old2 = "const speed = 80; // ミリ秒/文字"
new2 = "const speed = 120; // ミリ秒/文字"
content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")