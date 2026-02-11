#!/usr/bin/env python3
"""行番号指定で古いUIと関数を差し替え"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # 1. Remove submitStoryMission function (line 5042-5065ish)
    # Find exact boundaries
    fn_start = None
    fn_end = None
    for i, line in enumerate(lines):
        if 'const submitStoryMission' in line:
            fn_start = i
            break
    if fn_start is not None:
        depth = 0
        for i in range(fn_start, len(lines)):
            depth += lines[i].count('{') - lines[i].count('}')
            if depth == 0 and i > fn_start:
                fn_end = i
                break
        if fn_end:
            del lines[fn_start:fn_end+1]
            print(f"[OK] Removed submitStoryMission (lines {fn_start+1}-{fn_end+1})")

    # 2. Replace mission UI block
    ui_start = None
    for i, line in enumerate(lines):
        if "storyPhase === 'mission'" in line and '{' in line:
            ui_start = i
            break
    
    if ui_start is not None:
        # Find the end of this block (matching the closing of the condition)
        depth = 0
        ui_end = None
        for i in range(ui_start, len(lines)):
            depth += lines[i].count('{') - lines[i].count('}')
            if depth == 0 and i > ui_start:
                ui_end = i
                break

        if ui_end:
            new_ui = """          {storyPhase === 'mission' && (
            <ImageBackground source={STORY_SCENE1_IMG} style={{ flex: 1 }} resizeMode="cover">
              <View style={{ position: 'absolute', top: SCREEN_H * 0.30, left: 40, right: 40, height: SCREEN_H * 0.40, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#333', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, letterSpacing: 2 }}>
                  {'\u2694\uFE0F \u30DF\u30C3\u30B7\u30E7\u30F3'}
                </Text>
                <Text style={{ color: '#444', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 24 }}>
                  {'\u8155\u7ACB\u3066\u3075\u305B 10\u56DE'}
                </Text>
                <Text style={{ color: '#DAA520', fontSize: 64, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
                  {missionCount}
                </Text>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
                  {'/ ' + MISSION_TARGET}
                </Text>
                {missionCount < MISSION_TARGET && (
                  <TouchableOpacity onPress={countMissionTap} style={{ backgroundColor: 'rgba(218,165,32,0.9)', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#DAA520', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900' }}>{'\u62BC\u305B'}</Text>
                  </TouchableOpacity>
                )}
                {missionCount >= MISSION_TARGET && (
                  <Text style={{ color: '#DAA520', fontSize: 22, fontWeight: '900', letterSpacing: 3 }}>{'\u2694\uFE0F \u8A0E\u4F10\u5B8C\u4E86'}</Text>
                )}
              </View>
              {samuraiVoice.length > 0 && (
                <View style={{ position: 'absolute', top: SCREEN_H * 0.12, left: 30, right: 30 }}>
                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(218,165,32,0.5)', textShadowRadius: 8 }}>
                    {samuraiVoice}
                  </Text>
                </View>
              )}
            </ImageBackground>
          )}
"""
            del lines[ui_start:ui_end+1]
            lines.insert(ui_start, new_ui)
            print(f"[OK] Replaced mission UI (lines {ui_start+1}-{ui_end+1})")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.writelines(lines)
    
    # Verify
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    remaining = content.count('storyGoalInput') + content.count('submitStoryMission')
    print(f"[CHECK] Remaining old refs: {remaining}")

if __name__ == "__main__":
    main()
