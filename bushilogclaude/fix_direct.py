with open("App.tsx", "r") as f:
    lines = f.readlines()

# 現在の状態を確認
# 906 (index 905): "      };\n"
# 907 (index 906): "    showSaveSuccess('目標を刻んだ。今日も斬れ！');\n"
# 908 (index 907): "\n"
# 909 (index 908): "  };\n"
# 910 (index 909): "    });\n"

# 問題: 909と910の行が不要で、906と907の位置も変

# まず問題の行を見つける
for i, line in enumerate(lines[903:915], start=903):
    print(f"{i}: {repr(line)}")