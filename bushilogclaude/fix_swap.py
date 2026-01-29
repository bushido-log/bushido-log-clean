with open("App.tsx", "r") as f:
    lines = f.readlines()

# 問題の行を確認
# 907: "    showSaveSuccess('目標を刻んだ。今日も斬れ！');\n"
# 908: "  };\n"
# 909: "    });\n"

# 正しい順序は:
# 907: "    });\n"
# 908: "    showSaveSuccess('目標を刻んだ。今日も斬れ！');\n"
# 909: "  };\n"

# 行番号(1-indexed): 908, 909, 910 を修正
# インデックス(0-indexed): 907, 908, 909

line_907 = lines[907]  # showSaveSuccess
line_908 = lines[908]  # };
line_909 = lines[909]  # });

# 正しい順序に入れ替え
lines[907] = line_909  # });
lines[908] = line_907  # showSaveSuccess  
lines[909] = line_908  # };

with open("App.tsx", "w") as f:
    f.writelines(lines)

print("Done!")