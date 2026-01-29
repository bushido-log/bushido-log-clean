with open("App.tsx", "r") as f:
    lines = f.readlines()

# 1917行目（サムライボイス）の前に挿入
insert_lines = [
    '\n',
    '        <Text style={styles.sectionTitle}>プラン</Text>\n',
    '        <View style={styles.settingsRow}>\n',
    '          <View style={styles.settingsRowText}>\n',
    "            <Text style={styles.settingsLabel}>{isPro ? 'Pro会員' : '無料プラン'}</Text>\n",
    "            <Text style={styles.settingsHint}>{isPro ? 'サムライキング相談が無制限' : '相談 ' + samuraiKingUses + '/1回使用済み'}</Text>\n",
    '          </View>\n',
    '          {!isPro && (\n',
    '            <Pressable style={styles.proButton} onPress={() => setShowPaywall(true)}>\n',
    '              <Text style={styles.proButtonText}>Proにする</Text>\n',
    '            </Pressable>\n',
    '          )}\n',
    '        </View>\n',
    '        <Pressable style={styles.restoreButton} onPress={async () => {\n',
    '          const success = await restorePurchases();\n',
    '          if (success) setIsPro(true);\n',
    '        }}>\n',
    '          <Text style={styles.restoreButtonText}>購入を復元</Text>\n',
    '        </Pressable>\n',
]

# 1917行目（index 1916）の前に挿入
new_lines = lines[:1916] + insert_lines + lines[1916:]

with open("App.tsx", "w") as f:
    f.writelines(new_lines)

print("Done!")