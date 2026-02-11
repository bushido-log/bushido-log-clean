#!/usr/bin/env python3
"""カウント: taiko-hit + 10回目: sfx_win"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Find countMissionTap and replace entirely
    lines = content.split('\n')
    start = None
    end = None
    for i, line in enumerate(lines):
        if 'const countMissionTap' in line:
            start = i
            break
    if start is None:
        print("[ERROR] countMissionTap not found")
        return
    depth = 0
    for i in range(start, len(lines)):
        depth += lines[i].count('{') - lines[i].count('}')
        if depth == 0 and i > start:
            end = i
            break

    new_fn = [
        "  const countMissionTap = async () => {",
        "    const next = missionCount + 1;",
        "    setMissionCount(next);",
        "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}",
        "    if (next >= MISSION_TARGET) {",
        "      try {",
        "        const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3'));",
        "        await sound.setVolumeAsync(MASTER_VOLUME);",
        "        await sound.playAsync();",
        "        sound.setOnPlaybackStatusUpdate((s: any) => { if (s.isLoaded && s.didJustFinish) sound.unloadAsync(); });",
        "      } catch(e) {}",
        "      speakSamurai('10\u3002\u898b\u4e8b\u3060');",
        "      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}",
        "      await addXpWithLevelCheck(50);",
        "      setTimeout(() => {",
        "        setStoryPhase('victory');",
        "        setSceneIndex(4);",
        "        setSamuraiVoice('');",
        "        storyTypewriter(STORY_SCENES[4].text);",
        "      }, 1500);",
        "    } else {",
        "      try {",
        "        const { sound } = await Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3'));",
        "        await sound.setVolumeAsync(MASTER_VOLUME);",
        "        await sound.playAsync();",
        "        sound.setOnPlaybackStatusUpdate((s: any) => { if (s.isLoaded && s.didJustFinish) sound.unloadAsync(); });",
        "      } catch(e) {}",
        "    }",
        "  };",
    ]

    lines[start:end+1] = new_fn
    content = '\n'.join(lines)

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] taiko-hit per tap, sfx_win at 10")

if __name__ == "__main__":
    main()
