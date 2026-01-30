with open("App.tsx", "r") as f:
    content = f.read()

# Animatedをreact-nativeのインポートに追加
old1 = """import {
  ActivityIndicator,
  Alert,
  Keyboard,"""

new1 = """import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")