#!/usr/bin/env python3
"""
討伐演出: loseyokai_mikkabozu.mp4 + ロボ声「負けたー悔しいよー」
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    count = 0

    # 1. Add 'defeat' to storyPhase type
    old_type = "'dark'|'eyes'|'scenes'|'mission'|'victory'|'clear'"
    new_type = "'dark'|'eyes'|'scenes'|'mission'|'defeat'|'victory'|'clear'"
    if old_type in content:
        content = content.replace(old_type, new_type, 1)
        count += 1
        print("[OK] Added 'defeat' phase")

    # 2. Change countMissionTap: go to 'defeat' instead of 'victory'
    old_timeout = """      setTimeout(() => {
        setStoryPhase('victory');
        setSceneIndex(4);
        setSamuraiVoice('');
        storyTypewriter(STORY_SCENES[4].text);
      }, 1500);"""

    # Check if already changed to defeat
    if old_timeout in content:
        new_timeout = """      setTimeout(() => {
        setStoryPhase('defeat');
        speakMikkabozu('\u8ca0\u3051\u305f\u30fc\u304f\u3084\u3057\u3044\u3088\u30fc');
      }, 1500);"""
        content = content.replace(old_timeout, new_timeout, 1)
        count += 1
        print("[OK] Mission -> defeat phase + voice")

    # 3. Add defeat video UI before victory phase
    old_victory = "          {storyPhase === 'victory' && ("
    new_block = """          {storyPhase === 'defeat' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Video
                source={require('./assets/yokai/loseyokai_mikkabozu.mp4')}
                style={{ width: 300, height: 300 }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={(status: any) => {
                  if (status.isLoaded && status.didJustFinish) {
                    setStoryPhase('victory');
                    setSceneIndex(4);
                    setSamuraiVoice('');
                    storyTypewriter(STORY_SCENES[4].text);
                  }
                }}
              />
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', marginTop: 20, letterSpacing: 4 }}>{'\u8A0E\u4F10\uFF01'}</Text>
            </View>
          )}

          {storyPhase === 'victory' && ("""

    if old_victory in content:
        content = content.replace(old_victory, new_block, 1)
        count += 1
        print("[OK] Defeat video UI added")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n[DONE] {count} changes")

if __name__ == "__main__":
    main()
