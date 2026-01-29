with open("App.tsx", "r") as f:
    content = f.read()

# タブバーを削除
old1 = """              <>
                <View style={styles.tabRow}>
                  {renderTabButton('consult', '相談')}
                  {renderTabButton('goal', '目標')}
                  {renderTabButton('review', '振り返り')}
                  {renderTabButton('browser', 'ブラウザ')}
                  {renderTabButton('settings', '設定')}
                </View>
                <View style={{ flex: 1 }}>"""

new1 = """              <>
                <View style={{ flex: 1 }}>"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")