with open("App.tsx", "r") as f:
    content = f.read()

# bubbleTextの色を白に変更
old1 = """  bubbleText: {
    fontSize: 16,
    lineHeight: 26,
    
    color: '#020617',
  },"""

new1 = """  bubbleText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#e5e7eb',
  },"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")