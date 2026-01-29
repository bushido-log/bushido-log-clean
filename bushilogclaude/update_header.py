with open("App.tsx", "r") as f:
    content = f.read()

# 1. Imageインポートを追加（まだない場合）
if "Image," not in content:
    old_import = "import { View, Text,"
    new_import = "import { View, Text, Image,"
    content = content.replace(old_import, new_import)

# 2. ヘッダーの「BUSHIDO LOG」テキストをアイコンに変更
old1 = """                <Text style={styles.appTitle}>BUSHIDO LOG</Text>"""
new1 = """                <Image source={require('./assets/icon.png')} style={styles.headerIcon} />"""
content = content.replace(old1, new1)

# 3. トップ画面を更新（道場 + アイコン）
old2 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Text style={styles.startTitle}>BUSHIDO LOG</Text>
      <Text style={styles.startSubtitle}>今日は何をする？</Text>"""

new2 = """  const renderStartScreen = () => (
    <View style={styles.startScreen}>
      <Text style={styles.dojoTitle}>道場</Text>
      <Image source={require('./assets/icon.png')} style={styles.dojoIcon} />
      <Text style={styles.startSubtitle}>今日は何をする？</Text>"""

content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")