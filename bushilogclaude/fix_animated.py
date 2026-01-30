with open("App.tsx", "r") as f:
    content = f.read()

# Animatedをreact-nativeのインポートに追加
old1 = """import {
  Alert,
  View,"""

new1 = """import {
  Alert,
  Animated,
  View,"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")