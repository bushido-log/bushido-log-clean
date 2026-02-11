#!/usr/bin/env python3
APP_PATH = "App.tsx"
def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    fn = """  const countMissionTap = async () => {
    const next = missionCount + 1;
    setMissionCount(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    if (next === 1) speakSamurai('\u3044\u3044\u5165\u308a\u3060');
    else if (next === 3) speakSamurai('\u305d\u306e\u8abf\u5b50\u3060');
    else if (next === 5) speakSamurai('\u534a\u5206\u3060\u3002\u3053\u3053\u304b\u3089\u304c\u4fee\u884c');
    else if (next === 8) speakSamurai('\u3042\u3068\u5c11\u3057\u3060\u3002\u9003\u3052\u308b\u306a');
    else if (next >= MISSION_TARGET) {
      speakSamurai('\u898b\u4e8b\u3060');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      await addXpWithLevelCheck(50);
      setTimeout(() => {
        setStoryPhase('victory');
        setSceneIndex(4);
        setSamuraiVoice('');
        storyTypewriter(STORY_SCENES[4].text);
      }, 1500);
    }
  };

"""

    target = "  const advanceVictoryScene"
    content = content.replace(target, fn + target, 1)

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] countMissionTap added")

if __name__ == "__main__":
    main()
