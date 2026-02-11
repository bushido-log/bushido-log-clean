#!/usr/bin/env python3
"""
missionInput重複修正 → storyMissionInputにリネーム
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    replacements = [
        ("const [missionInput, setMissionInput] = useState('');", "const [storyMissionInput, setStoryMissionInput] = useState('');"),
        ("setMissionInput('')", "setStoryMissionInput('')"),
        ("if (missionInput.trim().length < 2) return;", "if (storyMissionInput.trim().length < 2) return;"),
        ("logs[today].goal = missionInput.trim();", "logs[today].goal = storyMissionInput.trim();"),
        ("value={missionInput}", "value={storyMissionInput}"),
        ("onChangeText={setMissionInput}", "onChangeText={setStoryMissionInput}"),
        ("missionInput.trim().length >= 2", "storyMissionInput.trim().length >= 2"),
    ]

    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            count += 1

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] Renamed {count} occurrences of missionInput → storyMissionInput")

if __name__ == "__main__":
    main()
