with open("App.tsx", "r") as f:
    lines = f.readlines()

# 2075行目（index 2074）の前に挿入
insert_lines = [
    '\n',
    '  // スタート画面表示（オンボーディング完了後）\n',
    '  if (showStartScreen && !isOnboarding) {\n',
    '    return renderStartScreen();\n',
    '  }\n',
]

# 2075行目は "  return (" なので、その前に挿入
new_lines = lines[:2074] + insert_lines + lines[2074:]

with open("App.tsx", "w") as f:
    f.writelines(new_lines)

print("Done!")