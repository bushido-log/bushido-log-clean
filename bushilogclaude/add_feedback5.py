with open("App.tsx", "r") as f:
    lines = f.readlines()

# handleSaveEditedLogの終わり（1187行目の "  };" の前）に追加
# setEditNextAction(''); の後、"};" の前
insert_index = 1186  # 0-indexed (line 1187)

insert_line = "    showSaveSuccess('編集完了。記録を更新した！');\n"

new_lines = lines[:insert_index] + [insert_line] + lines[insert_index:]

with open("App.tsx", "w") as f:
    f.writelines(new_lines)

print("Done!")