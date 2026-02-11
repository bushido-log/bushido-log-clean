#!/usr/bin/env python3
"""
BUSHIDO LOG 統合パッチ v3
Story + Tap Counter + Defeat Animation + Audio + Stage Map
Apply on clean git App.tsx (9262 lines)
"""
import sys

APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    with open(APP_PATH + ".bak_all", "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] Backup saved")

    if 'mikkabozuEventDone' in content:
        print("[ERROR] Already patched. Run: git checkout App.tsx")
        sys.exit(1)

    success = 0
    lines = content.split('\n')

    # =========================================
    # 1. IMPORTS: Add TouchableOpacity, Dimensions
    # =========================================
    for i, line in enumerate(lines):
        if line.strip() == 'View,' and i+1 < len(lines) and "} from 'react-native'" in lines[i+1]:
            lines.insert(i+1, '  TouchableOpacity,')
            lines.insert(i+2, '  Dimensions,')
            print(f"[OK] Imports at line {i+2}")
            success += 1
            break
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 2. ASSETS: After YOKAI_IMAGES closing
    # =========================================
    in_obj = False
    depth = 0
    for i, line in enumerate(lines):
        if 'YOKAI_IMAGES' in line and '{' in line and 'key' in line:
            in_obj = True
            depth = line.count('{') - line.count('}')
            continue
        if in_obj:
            depth += line.count('{') - line.count('}')
            if depth <= 0:
                asset_lines = [
                    "const MIKKABOZU_EYES = require('./assets/yokai/mikkabozu_eyes.png');",
                    "const STORY_SCENE1_IMG = require('./assets/story/mikkabozu_scene1.png');",
                    "const STORY_SCENE2_IMG = require('./assets/story/mikkabozu_scene2.png');",
                    "const MIKKABOZU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_mikkabozu.mp4');",
                    "const WORLD1_BG = require('./assets/map/bg/world1_bg.png');",
                    "const NODE_FIST = require('./assets/map/nodes/node_fist.png');",
                    "const NODE_KATANA = require('./assets/map/nodes/node_katana.png');",
                    "const NODE_SCROLL = require('./assets/map/nodes/node_scroll.png');",
                    "const NODE_BRAIN = require('./assets/map/nodes/node_brain.png');",
                    "const NODE_BOSS = require('./assets/map/nodes/node_boss.png');",
                    "const NODE_LOCKED = require('./assets/map/nodes/node_locked.png');",
                    "const NODE_DIAMOND = require('./assets/map/nodes/node_diamond.png');",
                ]
                for j, al in enumerate(asset_lines):
                    lines.insert(i + 1 + j, al)
                print(f"[OK] Assets at line {i+2}")
                success += 1
                break
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 3. KEYS: After last _KEY constant
    # =========================================
    key_line = -1
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith('const ') and '_KEY' in s and "= '" in s and i < 300:
            key_line = i
    if key_line > 0:
        for j, k in enumerate([
            "const FIRST_OPEN_DATE_KEY = 'bushido_first_open_date';",
            "const MIKKABOZU_DAY_KEY = 'bushido_mikkabozu_day_count';",
            "const MIKKABOZU_EVENT_KEY = 'bushido_mikkabozu_event_done';",
        ]):
            lines.insert(key_line + 1 + j, k)
        print(f"[OK] Keys at line {key_line+2}")
        success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 4. INNER WORLD VIEW TYPE
    # =========================================
    content = content.replace("'menu' | 'yokaiDex'", "'menu' | 'yokaiDex' | 'stageMap'")
    print("[OK] innerWorldView type expanded")
    success += 1
    lines = content.split('\n')

    # =========================================
    # 5. STATES + FUNCTIONS after tutorialPhase
    # =========================================
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
  const SCREEN_W = Dimensions.get('window').width;
  const SCREEN_H = Dimensions.get('window').height;
  const MISSION_TARGET = 10;
  const [mikkabozuEventDone, setMikkabozuEventDone] = useState(false);
  const [innerWorldUnlocked, setInnerWorldUnlocked] = useState(false);
  const [dayCount, setDayCount] = useState(0);
  const [storyActive, setStoryActive] = useState(false);
  const [storyPhase, setStoryPhase] = useState<'dark'|'eyes'|'scenes'|'mission'|'defeat'|'victory'|'clear'>('dark');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [storyTypeText, setStoryTypeText] = useState('');
  const [storyTypingDone, setStoryTypingDone] = useState(false);
  const [missionCount, setMissionCount] = useState(0);
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

  const speakMikkabozu = async (text: string) => {
    try {
      if (!settings.autoVoice) return;
      const url = `${SAMURAI_TTS_URL}?text=${encodeURIComponent(text)}`;
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.setRateAsync(1.8, false);
      await sound.playAsync();
    } catch(e) { console.log('mikkabozu voice error', e); }
  };

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
    setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0);
      setStoryPhase('scenes');
      storyTypewriter(STORY_SCENES[0].text);
      speakMikkabozu('\u3069\u3046\u305b\u4e09\u65e5\u3067\u7d42\u308f\u308a\u3067\u3057\u3087');
    }, 5000);
  };

  const advanceScene = () => {
    if (!storyTypingDone) {
      setStoryTypeText(STORY_SCENES[sceneIndex].text);
      setStoryTypingDone(true);
      return;
    }
    const next = sceneIndex + 1;
    if (next === 4) {
      setStoryPhase('mission');
      setMissionCount(0);
      return;
    }
    if (next >= STORY_SCENES.length) {
      setStoryPhase('clear');
      return;
    }
    setSceneIndex(next);
    setSamuraiVoice('');
    storyTypewriter(STORY_SCENES[next].text);
  };

  const countMissionTap = async () => {
    const next = missionCount + 1;
    setMissionCount(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    if (next >= MISSION_TARGET) {
      // Victory!
      try {
        const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3'));
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
      } catch(e) {}
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      speakSamurai('\u898b\u4e8b\u3060');
      samuraiSpeak('\u898b\u4e8b\u3060');
      await addXpWithLevelCheck(50);
      // Delay then defeat animation
      setTimeout(() => {
        setStoryPhase('defeat');
        speakMikkabozu('\u8ca0\u3051\u305f\u30fc\u304f\u3084\u3057\u3044\u3088\u30fc');
      }, 1500);
    } else {
      // Taiko drum
      try {
        const { sound } = await Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3'));
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
      } catch(e) {}
    }
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
    setMissionCount(0);
  };
  // === END MIKKABOZU EVENT ===
"""

    lines.insert(tut_line + 1, big_block)
    print(f"[OK] States + Functions at line {tut_line+1}")
    success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 6. MOUNT CALL: After checkKegare()
    # =========================================
    for i, line in enumerate(lines):
        if ('await checkKegare();' in line or 'checkKegare();' in line) and i < 1500:
            indent = len(line) - len(line.lstrip())
            spaces = ' ' * indent
            lines.insert(i + 1, f"{spaces}checkMikkabozuEvent();")
            print(f"[OK] Mount call at line {i+2}")
            success += 1
            break
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 7. STORY OVERLAY: Before early return
    # =========================================
    early_line = -1
    for i, line in enumerate(lines):
        if 'showStartScreen' in line and 'isOnboarding' in line and line.strip().startswith('if'):
            early_line = i
            break
    if early_line < 0:
        print("[ERROR] Early return not found")
        sys.exit(1)

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

          {storyPhase === 'dark' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#555', fontSize: 14 }}>{'\\u2026'}</Text>
            </View>
          )}

          {storyPhase === 'eyes' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Animated.View style={{ opacity: storyEyesOpacity }}>
                <Image source={MIKKABOZU_EYES} style={{ width: 200, height: 200, resizeMode: 'contain' }} />
              </Animated.View>
            </View>
          )}

          {storyPhase === 'scenes' && (
            <TouchableOpacity activeOpacity={1} onPress={advanceScene} style={{ flex: 1 }}>
              <ImageBackground source={sceneImg} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', top: SCREEN_H * 0.43, left: 55, right: 55, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1 }}>
                    {storyTypeText}
                  </Text>
                </View>
                {storyTypingDone && (
                  <View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'\\u30BF\\u30C3\\u30D7\\u3057\\u3066\\u6B21\\u3078'}</Text>
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          )}

          {storyPhase === 'mission' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 2, marginBottom: 20 }}>{'\\u2694\\uFE0F \\u30DF\\u30C3\\u30B7\\u30E7\\u30F3'}</Text>
              <Text style={{ color: '#fff', fontSize: 64, fontWeight: '900', marginBottom: 10 }}>{missionCount}</Text>
              <Text style={{ color: '#888', fontSize: 16, marginBottom: 30 }}>{missionCount + ' / ' + MISSION_TARGET}</Text>
              {missionCount < MISSION_TARGET ? (
                <TouchableOpacity
                  onPress={countMissionTap}
                  style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ color: '#DAA520', fontSize: 24, fontWeight: '900' }}>{'\\u62BC\\u305B'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: '#DAA520', fontSize: 22, fontWeight: '900', letterSpacing: 3 }}>{'\\u8A0E\\u4F10\\u5B8C\\u4E86'}</Text>
              )}
              {samuraiVoice.length > 0 && (
                <View style={{ position: 'absolute', bottom: 100, left: 30, right: 30 }}>
                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(218,165,32,0.5)', textShadowRadius: 8 }}>
                    {samuraiVoice}
                  </Text>
                </View>
              )}
            </View>
          )}

          {storyPhase === 'defeat' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Video
                source={MIKKABOZU_DEFEAT_VIDEO}
                style={{ width: 300, height: 300 }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={(status: any) => {
                  if (status.didJustFinish) {
                    setSceneIndex(4);
                    setSamuraiVoice('');
                    setStoryPhase('victory');
                    samuraiSpeak('\\u2026\\u2026\\u898B\\u4E8B\\u3060\\u3002');
                    storyTypewriter(STORY_SCENES[4].text);
                  }
                }}
              />
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', marginTop: 16, letterSpacing: 3 }}>{'\\u8A0E\\u4F10\\uFF01'}</Text>
            </View>
          )}

          {storyPhase === 'victory' && (
            <TouchableOpacity activeOpacity={1} onPress={advanceVictoryScene} style={{ flex: 1 }}>
              <ImageBackground source={STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode="cover">
                <View style={{ position: 'absolute', top: SCREEN_H * 0.43, left: 55, right: 55, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1 }}>
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
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'\\u30BF\\u30C3\\u30D7\\u3057\\u3066\\u6B21\\u3078'}</Text>
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          )}

          {storyPhase === 'clear' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 3, marginBottom: 8 }}>WORLD 1</Text>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 12 }}>STAGE 1 CLEAR</Text>
              <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', marginBottom: 40 }}>{'\\u4E09\\u65E5\\u574A\\u4E3B\\u3092\\u8A0E\\u4F10'}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>+50 XP</Text>
              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\\u4FEE\\u884C\\u306E\\u9593\\u3078'}</Text>
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

    # =========================================
    # 8. STAGE MAP in renderInnerWorldTab
    # =========================================
    old_yokai_check = "    if (innerWorldView === 'yokaiDex') {"
    stage_map_code = """    if (innerWorldView === 'stageMap') {
      const W1_STAGES = [
        { id: 1, name: '\\u4E09\\u65E5\\u574A\\u4E3B', sub: '\\u8155\\u7ACB\\u3066\\u3075\\u305B 10\\u56DE', icon: NODE_FIST, cleared: mikkabozuEventDone, x: 0.5, y: 0.82 },
        { id: 2, name: '\\u30A2\\u30C8\\u30C7\\u30E4\\u30EB', sub: '\\u203B\\u6E96\\u5099\\u4E2D', icon: NODE_KATANA, cleared: false, x: 0.3, y: 0.66 },
        { id: 3, name: '\\u30C7\\u30FC\\u30D6', sub: '\\u203B\\u6E96\\u5099\\u4E2D', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.50 },
        { id: 4, name: '\\u30E2\\u30A6\\u30E0\\u30EA', sub: '\\u203B\\u6E96\\u5099\\u4E2D', icon: NODE_BRAIN, cleared: false, x: 0.35, y: 0.34 },
        { id: 5, name: '\\u4E09\\u65E5\\u574A\\u4E3B\\u2161', sub: 'BOSS', icon: NODE_BOSS, cleared: false, x: 0.5, y: 0.18 },
      ];
      return (
        <ImageBackground source={WORLD1_BG} style={{ flex: 1 }} resizeMode="cover">
          <View style={{ position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 4, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 6 }}>
              {'WORLD 1 \\u300C\\u76EE\\u899A\\u3081\\u300D'}
            </Text>
          </View>
          <Pressable
            onPress={() => { playTapSound(); setInnerWorldView('menu'); }}
            style={{ position: 'absolute', top: 50, left: 16, zIndex: 20 }}
          >
            <Text style={{ color: '#fff', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 }}>{'\\u2190 \\u623B\\u308B'}</Text>
          </Pressable>
          {W1_STAGES.map((stage) => {
            const isNext = !stage.cleared && W1_STAGES.filter(s => s.id < stage.id).every(s => s.cleared);
            const isLocked = !stage.cleared && !isNext;
            return (
              <Pressable
                key={stage.id}
                onPress={() => {
                  playTapSound();
                  if (stage.cleared) { showSaveSuccess('CLEAR\\u6E08\\u307F'); }
                  else if (isNext) { showSaveSuccess('\\u8FD1\\u65E5\\u5B9F\\u88C5'); }
                  else { showSaveSuccess('\\uD83D\\uDD12 \\u524D\\u306E\\u30B9\\u30C6\\u30FC\\u30B8\\u3092\\u30AF\\u30EA\\u30A2'); }
                }}
                style={{
                  position: 'absolute',
                  left: SCREEN_W * stage.x - 35,
                  top: SCREEN_H * stage.y - 35,
                  alignItems: 'center',
                  opacity: isLocked ? 0.4 : 1,
                }}
              >
                <View style={{
                  width: 70, height: 70, borderRadius: 35,
                  borderWidth: 3,
                  borderColor: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#555',
                  overflow: 'hidden', backgroundColor: '#000',
                }}>
                  <Image source={isLocked ? NODE_LOCKED : stage.icon} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
                <Text style={{
                  color: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#888',
                  fontSize: 11, fontWeight: '900', marginTop: 4,
                  textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 4,
                }}>
                  {stage.id + '. ' + stage.name}
                </Text>
                {stage.cleared && <Text style={{ color: '#DAA520', fontSize: 9, fontWeight: 'bold' }}>{'\\u2714 CLEAR'}</Text>}
                {stage.id === 5 && <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', marginTop: 1 }}>BOSS</Text>}
              </Pressable>
            );
          })}
        </ImageBackground>
      );
    }

    if (innerWorldView === 'yokaiDex') {"""

    if old_yokai_check in content:
        content = content.replace(old_yokai_check, stage_map_code, 1)
        print("[OK] Stage map view added")
        success += 1
    lines = content.split('\n')

    # =========================================
    # 9. STAGE MAP BUTTON in menu
    # =========================================
    old_battle_btn = """        <Pressable
          onPress={() => {
            playTapSound();
            if (!isPro && levelInfo.level < 3) {
              showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');
              return;
            }
            setBattleMode('select');
            setTab('battle');
          }}"""

    new_map_btn = """        <Pressable
          onPress={() => { playTapSound(); setInnerWorldView('stageMap'); }}
          style={({ pressed }) => [{
            backgroundColor: pressed ? '#0a1a0a' : '#0a0a1a',
            borderRadius: 16, padding: 20, marginBottom: 14,
            borderWidth: 1, borderColor: '#DAA520',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 14 }}>{""" + "'\\u2694\\uFE0F'" + """}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900' }}>{""" + "'\\u30B9\\u30C6\\u30FC\\u30B8\\u30DE\\u30C3\\u30D7'" + """}</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{'World 1""" + " \\u300C\\u76EE\\u899A\\u3081\\u300D" + """'}</Text>
            </View>
            <Text style={{ color: '#DAA520', fontSize: 18 }}>{'\\u203A'}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            playTapSound();
            if (!isPro && levelInfo.level < 3) {
              showSaveSuccess('Lv.3""" + "\\u300C\\u8DB3\\u8EFD\\u300D\\u3067\\u89E3\\u653E" + """');
              return;
            }
            setBattleMode('select');
            setTab('battle');
          }}"""

    if old_battle_btn in content:
        content = content.replace(old_battle_btn, new_map_btn, 1)
        print("[OK] Stage map button added")
        success += 1
    else:
        print("[WARN] Battle button not found for map insertion")
    lines = content.split('\n')

    # =========================================
    # 10. GATE: Inner world logo tap
    # =========================================
    for i, line in enumerate(lines):
        if "setTab('innerWorld')" in line and 'gated' not in line and 'mikkabozuEventDone' not in line:
            indent = len(line) - len(line.lstrip())
            spaces = ' ' * indent
            lines[i] = f"{spaces}if (mikkabozuEventDone || innerWorldUnlocked) {{ setTab('innerWorld'); setShowStartScreen(false); }} // gated by mikkabozu"
            print(f"[OK] Inner world gated at line {i+1}")
            success += 1
            break
    content = '\n'.join(lines)

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n{'='*50}")
    print(f"[DONE] {success} changes applied.")
    print("Run: npx expo start -c")

if __name__ == "__main__":
    main()
