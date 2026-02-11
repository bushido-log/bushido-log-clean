#!/usr/bin/env python3
"""テスト用: イベント即発動"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    old = """  const checkMikkabozuEvent = async () => {
    try {
      const done = await AsyncStorage.getItem(MIKKABOZU_EVENT_KEY);
      if (done === 'true') {
        setMikkabozuEventDone(true);
        setInnerWorldUnlocked(true);
        return;
      }"""

    new = """  const checkMikkabozuEvent = async () => {
    try {
      // TEMP_TEST: skip day check, force trigger
      setTimeout(() => startStoryEvent(), 500);
      return;
      const done = await AsyncStorage.getItem(MIKKABOZU_EVENT_KEY);
      if (done === 'true') {
        setMikkabozuEventDone(true);
        setInnerWorldUnlocked(true);
        return;
      }"""

    if 'TEMP_TEST' in content:
        print("[SKIP] Already in test mode")
        return
    if old not in content:
        print("[ERROR] checkMikkabozuEvent not found")
        return

    content = content.replace(old, new, 1)
    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Test mode ON - event triggers on dojo entry")

if __name__ == "__main__":
    main()
