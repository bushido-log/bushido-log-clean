with open("App.tsx", "r") as f:
    lines = f.readlines()

# 2306-2312行目（tabRow部分）を削除
# 2306: <View style={styles.tabRow}>
# 2307-2311: renderTabButton呼び出し
# 2312: </View>

# インデックスは0始まりなので2305-2311を削除
del lines[2305:2312]

with open("App.tsx", "w") as f:
    f.writelines(lines)

print("Done!")