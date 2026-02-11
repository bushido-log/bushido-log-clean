#!/usr/bin/env python3
"""
1. テキスト位置調整（吹き出し中心に）
2. ミッションズル対策（5文字以上 + 3秒以上）
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    count = 0

    # 1. Text position: move down from 0.22 to 0.30 for scenes
    old = "position: 'absolute', top: SCREEN_H * 0.22, left: 50, right: 50, height: SCREEN_H * 0.32, justifyContent: 'center', alignItems: 'center'"
    new = "position: 'absolute', top: SCREEN_H * 0.28, left: 55, right: 55, height: SCREEN_H * 0.28, justifyContent: 'center', alignItems: 'center'"
    content = content.replace(old, new)
    count += content.count(new)
    print(f"[OK] Text position adjusted ({count} locations)")

    # 2. Font size slightly smaller to fit better
    old_font = "fontSize: 18, fontWeight: 'bold', textAlign: 'center', lineHeight: 30, letterSpacing: 1"
    new_font = "fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1"
    content = content.replace(old_font, new_font)
    print("[OK] Font size adjusted")

    # 3. Anti-cheat: minimum 5 chars
    old_min = "if (storyGoalInput.trim().length < 2) return;"
    new_min = "if (storyGoalInput.trim().length < 5) return;"
    content = content.replace(old_min, new_min)
    print("[OK] Minimum chars: 5")

    # 4. Anti-cheat: button shows at 5 chars
    old_btn = "storyGoalInput.trim().length >= 2"
    new_btn = "storyGoalInput.trim().length >= 5"
    content = content.replace(old_btn, new_btn)
    print("[OK] Button threshold: 5 chars")

    # 5. Add mission start time tracking + time check
    # Add state for mission start time
    old_state = "const [samuraiVoice, setSamuraiVoice] = useState('');"
    new_state = "const [samuraiVoice, setSamuraiVoice] = useState('');\n  const [missionStartTime, setMissionStartTime] = useState(0);"
    content = content.replace(old_state, new_state, 1)
    print("[OK] Added missionStartTime state")

    # Set start time when mission phase begins
    old_mission = "setStoryGoalInput('');\n      samuraiSpeak"
    new_mission = "setStoryGoalInput('');\n      setMissionStartTime(Date.now());\n      samuraiSpeak"
    content = content.replace(old_mission, new_mission, 1)
    print("[OK] Set mission start time")

    # Add time check in submit
    old_submit = "if (storyGoalInput.trim().length < 5) return;"
    new_submit = """if (storyGoalInput.trim().length < 5) return;
    const elapsed = (Date.now() - missionStartTime) / 1000;
    if (elapsed < 3) {
      samuraiSpeak('\u2026\u672C\u6C17\u3067\u66F8\u3051\u3002');
      return;
    }"""
    content = content.replace(old_submit, new_submit, 1)
    print("[OK] Added 3-second time check")

    # 6. Better placeholder text
    old_ph = "placeholder={'\u4F8B\uFF1A\u8155\u7ACB\u3066\u3075\u305B10\u56DE'}"
    new_ph = "placeholder={'\u4F8B\uFF1A\u6BCE\u65E5\u8155\u7ACB\u3066\u3075\u305B10\u56DE\u3059\u308B'}"
    content = content.replace(old_ph, new_ph)
    print("[OK] Better placeholder")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n[DONE] All fixes applied")

if __name__ == "__main__":
    main()
