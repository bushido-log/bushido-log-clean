#!/usr/bin/env python3
"""三日坊主の声（高ピッチ）をシーン開始時に追加"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add speakMikkabozu function after speakSamurai
    old = "  // =========================\n  // Haptics/SFX wrappers"
    new = """  const speakMikkabozu = async (text: string) => {
    const url = `${SAMURAI_TTS_URL}?text=${encodeURIComponent(text)}`;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.setRateAsync(1.5, true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      console.log('[TTS mikkabozu] error', e);
    }
  };

  // =========================
  // Haptics/SFX wrappers"""

    if old in content:
        content = content.replace(old, new, 1)
        print("[OK] speakMikkabozu function added")

    # 2. Add voice at scene transition (when scenes phase starts)
    old2 = "      setStoryPhase('scenes');\n      storyTypewriter(STORY_SCENES[0].text);"
    new2 = "      setStoryPhase('scenes');\n      speakMikkabozu('\u3069\u3046\u305b\u4e09\u65e5\u3067\u7d42\u308f\u308a\u3067\u3057\u3087');\n      storyTypewriter(STORY_SCENES[0].text);"

    if old2 in content:
        content = content.replace(old2, new2, 1)
        print("[OK] Mikkabozu voice at scene start")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("[DONE]")

if __name__ == "__main__":
    main()
