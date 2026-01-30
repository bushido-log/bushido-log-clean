with open("App.tsx", "r") as f:
    content = f.read()

# Speechのインポートを追加
old1 = """import * as ImagePicker from 'expo-image-picker';"""
new1 = """import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")