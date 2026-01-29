with open("App.tsx", "r") as f:
    lines = f.readlines()

# 2170行目（"    </>"）の前に挿入
# 2169行目が "</Modal>"、2170行目が "    </>"
insert_index = 2169  # 0-indexed

insert_lines = [
    "      {renderSaveToast()}\n",
    "      {renderPaywall()}\n",
]

new_lines = lines[:insert_index] + insert_lines + lines[insert_index:]

with open("App.tsx", "w") as f:
    f.writelines(new_lines)

print("Done!")