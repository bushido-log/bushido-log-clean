with open("App.tsx", "r") as f:
    lines = f.readlines()

# 907行目 "  };" の後に showSaveSuccess を挿入
# 906行目は "    });" で、907行目は "  };"
insert_index = 906  # 0-indexed, so line 907

# 挿入する行
insert_line = "    showSaveSuccess('目標を刻んだ。今日も斬れ！');\n"

# 挿入
new_lines = lines[:insert_index] + [insert_line] + lines[insert_index:]

with open("App.tsx", "w") as f:
    f.writelines(new_lines)

print("Done!")