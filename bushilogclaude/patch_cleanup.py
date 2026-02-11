#!/usr/bin/env python3
"""Remove old submitStoryMission + old text input UI"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove old submitStoryMission function
    old_fn = """  const submitStoryMission = async () => {
    if (storyGoalInput.trim().length < 5) return;
    const elapsed = (Date.now() - missionStartTime) / 1000;
    if (elapsed < 3) {
      speakSamurai('\u2026\u672c\u6c17\u3067\u66f8\u3051\u3002');
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = 'BUSHIDO_DAILY_LOGS_V1';
      const raw = await AsyncStorage.getItem(key);
      const logs = raw ? JSON.parse(raw) : {};
      if (!logs[today]) logs[today] = {};
      logs[today].goal = storyGoalInput.trim();
      await AsyncStorage.setItem(key, JSON.stringify(logs));
    } catch(e) {}
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    await addXpWithLevelCheck(50);
    setStoryPhase('victory');
    setSceneIndex(4);
    setSamuraiVoice('');
    speakSamurai('\u2026\u2026\u898b\u4e8b\u3060\u3002');
    storyTypewriter(STORY_SCENES[4].text);
  };"""

    if old_fn in content:
        content = content.replace(old_fn, "", 1)
        print("[OK] Removed old submitStoryMission")

    # 2. Remove old text input UI in overlay
    old_ui = """              <View style={{ position: 'absolute', top: SCREEN_H * 0.43, left: 60, right: 60, height: SCREEN_H * 0.22, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                  {'\u2694\uFE0F \u30DF\u30C3\u30B7\u30E7\u30F3'}
                </Text>
                <Text style={{ color: '#444', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 }}>
                  {'\u4ECA\u65E5\u306E\u76EE\u6A19\u3092\u66F8\u3051'}
                </Text>
                <TextInput
                  style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: 14, fontSize: 16, width: '100%', color: '#222', textAlign: 'center', borderWidth: 1, borderColor: '#ccc' }}
                  placeholder={'\u4F8B\uFF1A\u6BCE\u65E5\u8155\u7ACB\u3066\u3075\u305B10\u56DE\u3059\u308B'}
                  placeholderTextColor="#999"
                  value={storyGoalInput}
                  onChangeText={(text) => { setStoryGoalInput(text); if (text.length === 1) samuraiSpeak('\\u3044\\u3044\\u305e\\u3001\\u66f8\\u3051\\u3002'); else if (text.length === 5) samuraiSpeak('\\u305d\\u306e\\u8abf\\u5b50\\u3060\\u3002'); else if (text.length === 10) samuraiSpeak('\\u3042\\u3068\\u5c11\\u3057\\u3060\\u3002'); }}
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={submitStoryMission}
                />
                {storyGoalInput.trim().length >= 5 && (
                  <TouchableOpacity onPress={submitStoryMission} style={{ marginTop: 16, backgroundColor: 'rgba(218,165,32,0.9)', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 2 }}>{'\u2694\uFE0F \u6311\u3080'}</Text>
                  </TouchableOpacity>
                )}
              </View>"""

    new_ui = """              <View style={{ position: 'absolute', top: SCREEN_H * 0.30, left: 40, right: 40, height: SCREEN_H * 0.40, justifyContent: 'center', alignItems: 'center' }}>
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
              </View>"""

    if old_ui in content:
        content = content.replace(old_ui, new_ui, 1)
        print("[OK] Replaced old UI with counter")
    else:
        print("[WARN] Old UI not found exactly - checking for remaining storyGoalInput")

    # 3. Final cleanup: any remaining storyGoalInput references
    remaining = content.count('storyGoalInput')
    if remaining > 0:
        print(f"[WARN] {remaining} storyGoalInput refs still remain")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("[DONE]")

if __name__ == "__main__":
    main()
