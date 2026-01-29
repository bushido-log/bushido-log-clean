with open("App.tsx", "r") as f:
    lines = f.readlines()

# handleSaveNightReviewの終わり（932行目の "  };" の前）に追加
# 931行目が "    });" で、932行目が "  };"
insert_index = 931  # 0-indexed

insert_line = "    showSaveSuccess('振り返り完了。明日も斬れ！');\n"

new_lines = lines[:insert_index] + [insert_line] + lines[insert_index:]

with open("App.tsx", "w") as f:
    f.writelines(new_lines)

print("Done!")