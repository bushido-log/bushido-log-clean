with open("App.tsx", "r") as f:
    lines = f.readlines()

# 907行目(index 906)を削除して、908行目の後(index 908)に挿入
# 現在: 906: "      };\n", 907: "    showSaveSuccess...\n", 908: "    });\n"
# 目標: 906: "      };\n", 907: "    });\n", 908: "    showSaveSuccess...\n"

# showSaveSuccessの行を保存
save_line = lines[907]  # index 907 = line 908

# 削除
del lines[907]

# 新しい位置に挿入（})の後）
# 今は 907が "    });\n"
lines.insert(908, save_line)

with open("App.tsx", "w") as f:
    f.writelines(lines)

print("Done!")