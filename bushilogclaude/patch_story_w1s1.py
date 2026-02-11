#!/usr/bin/env python3
"""
BUSHIDO LOG - 三日坊主チュートリアル (World 1 Stage 1)
Clean patch on fresh App.tsx

Insertion points (verified):
  - Imports: line ~27 (View, → add TouchableOpacity,)
  - Assets: after YOKAI_IMAGES closing } (find by brace counting)
  - Keys: after line 258 (BLOCKLIST_KEY)
  - States: after tutorialPhase (line 4902)
  - Functions: immediately after states (same block)
  - Mount call: after checkKegare() at line 892
  - Overlay: before 'if (showStartScreen && !isOnboarding)' at line 6142
  - Gate: setTab('innerWorld') line
"""

import os, sys

APP_PATH = "App.tsx"

def read_file():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        return f.read()

def write_file(content):
    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    content = read_file()

    # Backup
    with open(APP_PATH + ".bak_story", "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Backup saved")

    # Verify clean state
    if 'mikkabozuEventDone' in content:
        print("[ERROR] Already patched. Restore first: git restore App.tsx")
        sys.exit(1)

    success = 0
    lines = content.split('\n')

    # =============================================
    # 1. IMPORTS: Add TouchableOpacity, Dimensions
    # =============================================
    for i, line in enumerate(lines):
        if line.strip() == 'View,' and i+1 < len(lines) and "} from 'react-native'" in lines[i+1]:
            lines.insert(i+1, '  TouchableOpacity,')
            lines.insert(i+2, '  Dimensions,')
            print(f"[OK] Imports added at line {i+2}")
            success += 1
            break
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =============================================
    # 2. ASSETS: After YOKAI_IMAGES closing
    # =============================================
    in_obj = False
    depth = 0
    asset_inserted = False
    for i, line in enumerate(lines):
        if 'YOKAI_IMAGES' in line and '{' in line and 'key' in line:
            in_obj = True
            depth = line.count('{') - line.count('}')
            continue
        if in_obj:
            depth += line.count('{') - line.count('}')
            if depth <= 0:
                insert_lines = [
                    "const MIKKABOZU_EYES = require('./assets/yokai/mikkabozu_eyes.png');",
                    "const STORY_SCENE1_IMG = require('./assets/story/mikkabozu_scene1.png');",
                    "const STORY_SCENE2_IMG = require('./assets/story/mikkabozu_scene2.png');",
                ]
                for j, il in enumerate(insert_lines):
                    lines.insert(i + 1 + j, il)
                print(f"[OK] Asset requires at line {i+2}")
                success += 1
                asset_inserted = True
                break
    if not asset_inserted:
        print("[ERROR] Could not find YOKAI_IMAGES end")
        sys.exit(1)
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =============================================
    # 3. KEYS: After BLOCKLIST_KEY or last _KEY
    # =============================================
    key_line = -1
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith('const ') and '_KEY' in s and "= '" in s and i < 300:
            key_line = i
    if key_line > 0:
        new_keys = [
            "const FIRST_OPEN_DATE_KEY = 'bushido_first_open_date';",
            "const MIKKABOZU_DAY_KEY = 'bushido_mikkabozu_day_count';",
            "const MIKKABOZU_EVENT_KEY = 'bushido_mikkabozu_event_done';",
        ]
        for j, k in enumerate(new_keys):
            lines.insert(key_line + 1 + j, k)
        print(f"[OK] Keys at line {key_line+2}")
        success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =============================================
    # 4. STATES + FUNCTIONS: After tutorialPhase
    # =============================================
    tut_line = -1
    for i, line in enumerate(lines):
        if 'const [tutorialPhase, setTutorialPhase]' in line:
            tut_line = i
            break
    if tut_line < 0:
        print("[ERROR] tutorialPhase not found")
        sys.exit(1)

    big_block = r"""
  // ============================================================
  // === MIKKABOZU EVENT / STORY SYSTEM (World 1 Stage 1) ===
  // ============================================================
  const SCREEN_H = Dimensions.get('window').height;
  const [mikkabozuEventDone, setMikkabozuEventDone] = useState(false);
  const [innerWorldUnlocked, setInnerWorldUnlocked] = useState(false);
  const [dayCount, setDayCount] = useState(0);
  const [storyActive, setStoryActive] = useState(false);
  const [storyPhase, setStoryPhase] = useState<'dark'|'eyes'|'scenes'|'mission'|'victory'|'clear'>('dark');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [storyTypeText, setStoryTypeText] = useState('');
  const [storyTypingDone, setStoryTypingDone] = useState(false);
  const [missionInput, setMissionInput] = useState('');
  const [storyOverlayOpacity] = useState(new Animated.Value(0));
  const [storyEyesOpacity] = useState(new Animated.Value(0));
  const [samuraiVoice, setSamuraiVoice] = useState('');

  const STORY_SCENES = [
    { img: 1, text: '\u3088\u3046\u3053\u305d\u3002\n\u3053\u3053\u306f\u201c\u7d9a\u304b\u306a\u304b\u3063\u305f\u5974\u3089\u201d\u304c\n\u5c71\u307b\u3069\u6765\u308b\u5834\u6240\u3002' },
    { img: 1, text: '\u3053\u3053\u3067\u306f\u306a\u3001\n\u884c\u52d5\u3057\u305f\u3089\u3001\u6575\u304c\u6d88\u3048\u308b\u3002\n\u305d\u308c\u3060\u3051\u3002' },
    { img: 1, text: '\u4ffa\u306f\u201c\u4e09\u65e5\u574a\u4e3b\u201d\u3002\n\u304a\u524d\u304c\u7d9a\u304b\u306a\u3044\u9650\u308a\u3001\n\u4f55\u56de\u3067\u3082\u51fa\u3066\u304f\u308b\u3002' },
    { img: 1, text: '\u8a66\u3057\u306b\u3084\u3063\u3066\u307f\u3002\n\u9003\u3052\u5834\u306f\u306a\u3044\u3051\u3069\u3001\n\u3084\u308b\u3053\u3068\u306f\u7c21\u5358\u3084\u3002' },
    { img: 2, text: '\u2026\u2026\u3042\u3002\n\u4eca\u306e\u306f\u3001\u52b9\u3044\u305f\u308f\u3002' },
    { img: 2, text: '\u52d8\u9055\u3044\u3059\u3093\u306a\u3088\u3002\n\u307e\u305f\u30b5\u30dc\u3063\u305f\u3089\u3001\n\u3059\u3050\u4f1a\u3048\u308b\u304b\u3089\u3002' },
  ];

  const storyTypewriter = (text: string, onDone?: () => void) => {
    let i = 0;
    setStoryTypeText('');
    setStoryTypingDone(false);
    const interval = setInterval(() => {
      i++;
      setStoryTypeText(text.substring(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setStoryTypingDone(true);
        if (onDone) onDone();
      }
    }, 80);
  };

  const samuraiSpeak = (text: string) => {
    let i = 0;
    setSamuraiVoice('');
    const interval = setInterval(() => {
      i++;
      setSamuraiVoice(text.substring(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 100);
  };

  const checkMikkabozuEvent = async () => {
    try {
      const done = await AsyncStorage.getItem(MIKKABOZU_EVENT_KEY);
      if (done === 'true') {
        setMikkabozuEventDone(true);
        setInnerWorldUnlocked(true);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const firstOpen = await AsyncStorage.getItem(FIRST_OPEN_DATE_KEY);
      if (!firstOpen) {
        await AsyncStorage.setItem(FIRST_OPEN_DATE_KEY, today);
        await AsyncStorage.setItem(MIKKABOZU_DAY_KEY, '1');
        await AsyncStorage.setItem('last_open_date', today);
        setDayCount(1);
        return;
      }
      const storedCount = await AsyncStorage.getItem(MIKKABOZU_DAY_KEY);
      let count = parseInt(storedCount || '1', 10);
      const lastDay = await AsyncStorage.getItem('last_open_date');
      if (lastDay !== today) {
        count += 1;
        await AsyncStorage.setItem(MIKKABOZU_DAY_KEY, String(count));
        await AsyncStorage.setItem('last_open_date', today);
      }
      setDayCount(count);
      if (count >= 3) {
        setTimeout(() => startStoryEvent(), 1000);
      }
    } catch (e) {
      console.log('Mikkabozu check error:', e);
    }
  };

  const startStoryEvent = () => {
    setStoryActive(true);
    setStoryPhase('dark');
    setSceneIndex(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    // Dark phase: flicker then eyes
    setTimeout(() => {
      setStoryPhase('eyes');
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    }, 2000);
    // Transition to scenes
    setTimeout(() => {
      storyEyesOpacity.setValue(0);
      setStoryPhase('scenes');
      storyTypewriter(STORY_SCENES[0].text);
    }, 5000);
  };

  const advanceScene = () => {
    if (!storyTypingDone) {
      // Skip to full text
      setStoryTypeText(STORY_SCENES[sceneIndex].text);
      setStoryTypingDone(true);
      return;
    }
    const next = sceneIndex + 1;
    if (next === 4) {
      // Scene 4 = mission
      setStoryPhase('mission');
      setMissionInput('');
      samuraiSpeak('\u3084\u3063\u3066\u307f\u308d\u3002\u4ffa\u306f\u3053\u3053\u306b\u3044\u308b\u3002');
      return;
    }
    if (next >= STORY_SCENES.length) {
      // All scenes done -> clear
      setStoryPhase('clear');
      return;
    }
    setSceneIndex(next);
    setSamuraiVoice('');
    storyTypewriter(STORY_SCENES[next].text);
  };

  const submitMission = async () => {
    if (missionInput.trim().length < 2) return;
    // Save as today's goal
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = 'BUSHIDO_DAILY_LOGS_V1';
      const raw = await AsyncStorage.getItem(key);
      const logs = raw ? JSON.parse(raw) : {};
      if (!logs[today]) logs[today] = {};
      logs[today].goal = missionInput.trim();
      await AsyncStorage.setItem(key, JSON.stringify(logs));
    } catch(e) {}
    // Haptic + transition to victory scenes
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    await addXpWithLevelCheck(50);
    setStoryPhase('victory');
    setSceneIndex(4);
    setSamuraiVoice('');
    samuraiSpeak('\u2026\u2026\u898b\u4e8b\u3060\u3002');
    storyTypewriter(STORY_SCENES[4].text);
  };

  const advanceVictoryScene = () => {
    if (!storyTypingDone) {
      setStoryTypeText(STORY_SCENES[sceneIndex].text);
      setStoryTypingDone(true);
      return;
    }
    if (sceneIndex === 4) {
      setSceneIndex(5);
      setSamuraiVoice('');
      storyTypewriter(STORY_SCENES[5].text);
      return;
    }
    // Final -> clear screen
    setStoryPhase('clear');
  };

  const completeStoryEvent = async () => {
    try {
      await AsyncStorage.setItem(MIKKABOZU_EVENT_KEY, 'true');
    } catch(e) {}
    setMikkabozuEventDone(true);
    setInnerWorldUnlocked(true);
    setStoryActive(false);
    setStoryPhase('dark');
    storyOverlayOpacity.setValue(0);
    storyEyesOpacity.setValue(0);
    setSceneIndex(0);
    setStoryTypeText('');
    setSamuraiVoice('');
  };
  // === END MIKKABOZU EVENT ===
"""

    lines.insert(tut_line + 1, big_block)
    print(f"[OK] States + Functions after tutorialPhase (line {tut_line+1})")
    success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =============================================
    # 5. MOUNT CALL: After checkKegare()
    # =============================================
    mounted = False
    for i, line in enumerate(lines):
        if ('await checkKegare();' in line or 'checkKegare();' in line) and i < 1500:
            indent = len(line) - len(line.lstrip())
            spaces = ' ' * indent
            lines.insert(i + 1, f"{spaces}checkMikkabozuEvent();")
            print(f"[OK] Mount call at line {i+2}")
            success += 1
            mounted = True
            break
    if not mounted:
        print("[WARN] Could not find checkKegare() call for mount")
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =============================================
    # 6. OVERLAY: Before early return
    # =============================================
    early_line = -1
    for i, line in enumerate(lines):
        if 'showStartScreen' in line and 'isOnboarding' in line and line.strip().startswith('if'):
            early_line = i
            break
    if early_line < 0:
        print("[ERROR] Early return not found")
        sys.exit(1)

    # Find the comment line before it (if any)
    insert_at = early_line
    if early_line > 0 and lines[early_line - 1].strip().startswith('//'):
        insert_at = early_line - 1

    overlay_code = """  // === Mikkabozu Story Overlay ===
  if (storyActive) {
    const currentScene = STORY_SCENES[sceneIndex] || STORY_SCENES[0];
    const sceneImg = currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG;
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Animated.View style={{ flex: 1, opacity: storyOverlayOpacity }}>

          {/* Dark intro phase */}
          {storyPhase === 'dark' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#555', fontSize: 14 }}>{'\u2026'}</Text>
            </View>
          )}

          {/* Eyes phase */}
          {storyPhase === 'eyes' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Animated.View style={{ opacity: storyEyesOpacity }}>
                <Image source={MIKKABOZU_EYES} style={{ width: 200, height: 200, resizeMode: 'contain' }} />
              </Animated.View>
            </View>
          )}

          {/* Scene phase (1-4) */}
          {storyPhase === 'scenes' && (
            <TouchableOpacity activeOpacity={1} onPress={advanceScene} style={{ flex: 1 }}>
              <ImageBackground source={sceneImg} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', top: SCREEN_H * 0.22, left: 50, right: 50, height: SCREEN_H * 0.32, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold', textAlign: 'center', lineHeight: 30, letterSpacing: 1 }}>
                    {storyTypeText}
                  </Text>
                </View>
                {storyTypingDone && (
                  <View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'\u30BF\u30C3\u30D7\u3057\u3066\u6B21\u3078'}</Text>
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          )}

          {/* Mission phase */}
          {storyPhase === 'mission' && (
            <ImageBackground source={STORY_SCENE1_IMG} style={{ flex: 1 }} resizeMode="cover">
              <View style={{ position: 'absolute', top: SCREEN_H * 0.22, left: 50, right: 50, height: SCREEN_H * 0.32, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                  {'\u2694\uFE0F \u30DF\u30C3\u30B7\u30E7\u30F3'}
                </Text>
                <Text style={{ color: '#444', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 }}>
                  {'\u4ECA\u65E5\u306E\u76EE\u6A19\u3092\u66F8\u3051'}
                </Text>
                <TextInput
                  style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: 14, fontSize: 16, width: '100%', color: '#222', textAlign: 'center', borderWidth: 1, borderColor: '#ccc' }}
                  placeholder={'\u4F8B\uFF1A\u8155\u7ACB\u3066\u3075\u305B10\u56DE'}
                  placeholderTextColor="#999"
                  value={missionInput}
                  onChangeText={setMissionInput}
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={submitMission}
                />
                {missionInput.trim().length >= 2 && (
                  <TouchableOpacity onPress={submitMission} style={{ marginTop: 16, backgroundColor: 'rgba(218,165,32,0.9)', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 2 }}>{'\u2694\uFE0F \u6311\u3080'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              {samuraiVoice.length > 0 && (
                <View style={{ position: 'absolute', bottom: 80, left: 30, right: 30 }}>
                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(218,165,32,0.5)', textShadowRadius: 8 }}>
                    {samuraiVoice}
                  </Text>
                </View>
              )}
            </ImageBackground>
          )}

          {/* Victory phase (scenes 5-6) */}
          {storyPhase === 'victory' && (
            <TouchableOpacity activeOpacity={1} onPress={advanceVictoryScene} style={{ flex: 1 }}>
              <ImageBackground source={STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', top: SCREEN_H * 0.22, left: 50, right: 50, height: SCREEN_H * 0.32, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold', textAlign: 'center', lineHeight: 30, letterSpacing: 1 }}>
                    {storyTypeText}
                  </Text>
                </View>
                {samuraiVoice.length > 0 && (
                  <View style={{ position: 'absolute', bottom: 120, left: 30, right: 30 }}>
                    <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(218,165,32,0.5)', textShadowRadius: 8 }}>
                      {samuraiVoice}
                    </Text>
                  </View>
                )}
                {storyTypingDone && (
                  <View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'\u30BF\u30C3\u30D7\u3057\u3066\u6B21\u3078'}</Text>
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          )}

          {/* Clear screen */}
          {storyPhase === 'clear' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 3, marginBottom: 8 }}>WORLD 1</Text>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 12 }}>STAGE 1 CLEAR</Text>
              <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', marginBottom: 40 }}>{'\u4E09\u65E5\u574a\u4E3B\u3092\u8A0E\u4F10'}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>+50 XP</Text>
              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4FEE\u884C\u306E\u9593\u3078'}</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </View>
    );
  }

"""

    lines.insert(insert_at, overlay_code)
    print(f"[OK] Overlay at line {insert_at}")
    success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =============================================
    # 7. GATE: Inner world logo tap
    # =============================================
    for i, line in enumerate(lines):
        if "setTab('innerWorld')" in line and 'gated' not in line and 'mikkabozuEventDone' not in line:
            indent = len(line) - len(line.lstrip())
            spaces = ' ' * indent
            lines[i] = f"{spaces}if (mikkabozuEventDone || innerWorldUnlocked) {{ setTab('innerWorld'); setShowStartScreen(false); }} // gated by mikkabozu"
            print(f"[OK] Inner world gated at line {i+1}")
            success += 1
            break
    content = '\n'.join(lines)

    write_file(content)
    print(f"\n{'='*50}")
    print(f"[DONE] {success} patches applied.")
    print(f"Run: npx expo start -c")
    print(f"\nTo test: need 3 days of opens, or manually set AsyncStorage")

if __name__ == "__main__":
    main()
