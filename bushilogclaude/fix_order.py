with open("App.tsx", "r") as f:
    lines = f.readlines()

# 現在の状態:
# 905: '      };\n'  <- return文閉じ
# 906: "    showSaveSuccess(...);\n"  <- 位置が悪い
# 907: '\n'
# 908: '  };\n'  
# 909: '    });\n'  <- これがおかしい

# 目標の状態:
# 905: '      };\n'
# 906: '    });\n'
# 907: "    showSaveSuccess(...);\n"
# 908: '  };\n'

# 修正: 906-909行を書き換え
lines[905] = '      };\n'
lines[906] = '    });\n'
lines[907] = "    showSaveSuccess('目標を刻んだ。今日も斬れ！');\n"
lines[908] = '  };\n'
# 909行目を削除
del lines[909]

with open("App.tsx", "w") as f:
    f.writelines(lines)

print("Done!")