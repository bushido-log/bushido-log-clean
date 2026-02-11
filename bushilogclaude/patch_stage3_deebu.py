#!/usr/bin/env python3
import sys
FILE = 'App.tsx'
def patch(content, old, new, label):
    if old not in content:
        print(f'[SKIP] {label}')
        return content
    count = content.count(old)
    if count > 1:
        print(f'[WARN] {label} - {count} hits (first only)')
        idx = content.index(old)
        content = content[:idx] + new + content[idx + len(old):]
        print(f'[OK]   {label}')
        return content
    content = content.replace(old, new, 1)
    print(f'[OK]   {label}')
    return content

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. require
src = patch(src,
    "const ATODEYARU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_atodeyaru.mp4');",
    "const ATODEYARU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_atodeyaru.mp4');\nconst DEEBU_SCENE1_IMG = require('./assets/story/deebu_scene1.png');\nconst DEEBU_SCENE2_IMG = require('./assets/story/deebu_scene2.png');\nconst DEEBU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_deebu.mp4');",
    '1. DEEBU require')

# 2. keys
src = patch(src,
    "const ATODEYARU_ACTIVE_KEY = 'bushido_atodeyaru_active';",
    "const ATODEYARU_ACTIVE_KEY = 'bushido_atodeyaru_active';\nconst DEEBU_EVENT_KEY = 'bushido_deebu_event_done';\nconst DEEBU_ACTIVE_KEY = 'bushido_deebu_active';",
    '2. keys')

# 3. state
src = patch(src,
    "  const [storyStage, setStoryStage] = useState<number>(1);",
    "  const [storyStage, setStoryStage] = useState<number>(1);\n  const [deebuEventDone, setDeebuEventDone] = useState(false);\n  const [deebuActive, setDeebuActive] = useState(false);\n  const [deebuHits, setDeebuHits] = useState(0);\n  const [deebuYokubouDone, setDeebuYokubouDone] = useState(false);\n  const [deebuTrainingOpen, setDeebuTrainingOpen] = useState(false);\n  const [deebuTrainingType, setDeebuTrainingType] = useState<string|null>(null);",
    '3. state')

# 4. scenes
src = patch(src,
    "  const ATODEYARU_QUIPS = [",
    """  const DEEBU_SCENES = [
    { img: 1, text: '\u3075\u3041\u301c...\u52d5\u304f\u306e\u3060\u308b\u3044\u3002\\n\u98df\u3063\u3066\u5bdd\u3066\u308c\u3070\u3044\u3044\u3058\u3083\u3093\u3002' },
    { img: 1, text: '\u7b4b\u30c8\u30ec\uff1f\u306f\u3041\uff1f\\n\u305d\u3093\u306a\u3053\u3068\u3088\u308a\\n\u30c9\u30fc\u30ca\u30c4\u98df\u3079\u3088\u3046\u305c\u3002' },
    { img: 1, text: '\u4ffa\u304c\u3044\u308b\u9650\u308a\u3001\\n\u304a\u524d\u306f\u6c38\u9060\u306b\\n\u30c0\u30e9\u30c0\u30e9\u3060\u3002' },
    { img: 1, text: '\u3067\u304d\u308b\u3082\u3093\u306a\u3089\\n\u4f53\u52d5\u304b\u3057\u3066\u307f\u308d\u3088\u3002\\n20\u56de\u3082\u7121\u7406\u3060\u308d\uff1f' },
    { img: 2, text: '\u306f\u3041\u2026\u306f\u3041\u2026\\n\u304a\u524d\u2026\u52d5\u3051\u308b\u306e\u304b\u3088\u2026' },
    { img: 2, text: '\u304f\u305d\u2026\u6b21\u306f\\n\u3082\u3063\u3068\u5f37\u3044\u5974\u304c\\n\u5f85\u3063\u3066\u308b\u304b\u3089\u306a\u2026' },
  ];

  const DEEBU_QUIPS = [
    '\u52d5\u304f\u306e\u3060\u308b\u3044\u301c',
    '\u305d\u306e\u30c9\u30fc\u30ca\u30c4\u98df\u3079\u3061\u3083\u3044\u306a\u3088',
    '\u307e\u3060\u6b8b\u3063\u3066\u308b\u305e\uff1f',
    '\u4ffa\u3092\u5012\u305b\u308b\u3068\u601d\u3046\u306a\u3088\uff1f',
    '\u6b32\u671b\u306b\u8ca0\u3051\u308d\u3088\uff1f',
    '\u4eca\u65e5\u306f\u4f11\u3082\u3046\u305c\u301c',
  ];

  const DEEBU_HIT_TARGET = 20;

  const DEEBU_EXERCISES = [
    { id: 'pushup', label: '\u8155\u7acb\u3066\u3075\u305b', icon: '\u2694\uFE0F' },
    { id: 'squat', label: '\u30b9\u30af\u30ef\u30c3\u30c8', icon: '\u2B50' },
    { id: 'situp', label: '\u8179\u7b4b', icon: '\u2604\uFE0F' },
  ];

  const ATODEYARU_QUIPS = [""",
    '4. scenes')

# 5. event functions
src = patch(src,
    "  // === END ATODEYARU EVENT ===",
    """  // === DEEBU EVENT / STAGE 3 ===
  const startDeebuEvent = () => {
    setStoryStage(3);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    setTimeout(() => {
      setStoryPhase('eyes');
      Audio.Sound.createAsync(require('./sounds/sfx_eyes.mp3')).then(({sound}) => sound.setVolumeAsync(0.5).then(() => sound.playAsync())).catch(e => {});
      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    }, 2000);
    setTimeout(() => {
      storyEyesOpacity.setValue(0); setStoryPhase('scenes');
      storyTypewriter(DEEBU_SCENES[0].text);
      speakMikkabozu('\u52d5\u304f\u306e\u3060\u308b\u3044');
    }, 5000);
  };

  const triggerDeebuDefeat = async () => {
    setStoryStage(3);
    setDeebuActive(false);
    setDeebuTrainingOpen(false);
    setDeebuTrainingType(null);
    try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'false'); } catch(e) {}
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    speakSamurai('\u898b\u4e8b\u3060'); samuraiSpeak('\u898b\u4e8b\u3060');
    await addXpWithLevelCheck(50);
    setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('\u52d5\u3051\u308b\u306e\u304b\u3088'); }, 1500);
  };

  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    if (next >= DEEBU_HIT_TARGET) {
      setDeebuTrainingOpen(false);
      setDeebuTrainingType(null);
      if (deebuYokubouDone) {
        setTimeout(() => triggerDeebuDefeat(), 800);
      } else {
        showSaveSuccess('\u7b4b\u30c8\u30ec\u5b8c\u4e86\uff01\u6b20\u671b\u3092\u53ef\u8996\u5316\u305b\u3088\uff01');
      }
    }
  };
  // === END DEEBU EVENT ===

  // === END ATODEYARU EVENT ===""",
    '5. event functions')

# 6. advanceScene
src = patch(src,
    "    const scenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '6a. advanceScene scenes')

src = patch(src,
    "    if (storyStage === 2 && next === 4) { setStoryPhase('missionBrief'); return; }",
    "    if (storyStage === 2 && next === 4) { setStoryPhase('missionBrief'); return; }\n    if (storyStage === 3 && next === 4) { setStoryPhase('missionBrief'); return; }",
    '6b. advanceScene stage3 brief')

# 7. advanceVictoryScene
src = patch(src,
    "    const scenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '7. advanceVictoryScene')

# 8. completeStoryEvent
src = patch(src,
    "    if (storyStage === 2) {\n      try { await AsyncStorage.setItem(ATODEYARU_EVENT_KEY, 'true'); } catch(e) {}\n      setAtodeyaruEventDone(true);\n    } else {",
    "    if (storyStage === 3) {\n      try { await AsyncStorage.setItem(DEEBU_EVENT_KEY, 'true'); } catch(e) {}\n      setDeebuEventDone(true);\n    } else if (storyStage === 2) {\n      try { await AsyncStorage.setItem(ATODEYARU_EVENT_KEY, 'true'); } catch(e) {}\n      setAtodeyaruEventDone(true);\n    } else {",
    '8. completeStoryEvent')

# 9. yokubou save
src = patch(src,
    "    setYokubouSaved(true);\n    showSaveSuccess('\u6b62\u307e\u308c\u3002\u547c\u5438\u3057\u308d\u3002');",
    "    setYokubouSaved(true);\n    if (deebuActive) { setDeebuYokubouDone(true); if (deebuHits >= DEEBU_HIT_TARGET) { setTimeout(() => triggerDeebuDefeat(), 500); } else { showSaveSuccess('\u6b20\u671b\u65ad\u3061\u5207\u308a\uff01\u3042\u3068\u306f\u7b4b\u30c8\u30ec\u3060\uff01'); } }\n    else { showSaveSuccess('\u6b62\u307e\u308c\u3002\u547c\u5438\u3057\u308d\u3002'); }",
    '9. yokubou check')

# 10. init
src = patch(src,
    "      AsyncStorage.getItem(ATODEYARU_ACTIVE_KEY).then(v => { if (v === 'true') setAtodeyaruActive(true); }).catch(e => {});",
    "      AsyncStorage.getItem(ATODEYARU_ACTIVE_KEY).then(v => { if (v === 'true') setAtodeyaruActive(true); }).catch(e => {});\n      AsyncStorage.getItem(DEEBU_EVENT_KEY).then(v => { if (v === 'true') { setDeebuEventDone(true); setInnerWorldUnlocked(true); } }).catch(e => {});\n      AsyncStorage.getItem(DEEBU_ACTIVE_KEY).then(v => { if (v === 'true') setDeebuActive(true); }).catch(e => {});",
    '10. init')

# 11. stage map cleared
src = patch(src,
    "{ id: 3, name: '\u30c7\u30fc\u30d6', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.47 },",
    "{ id: 3, name: '\u30c7\u30fc\u30d6', icon: NODE_SCROLL, cleared: deebuEventDone, x: 0.6, y: 0.47 },",
    '11. stage map cleared')

# 12. stage map onPress
src = patch(src,
    "else if (isNext && stage.id === 2) { startAtodeyaruEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    "else if (isNext && stage.id === 2) { startAtodeyaruEvent(); } else if (stage.cleared && stage.id === 3) { startDeebuEvent(); } else if (isNext && stage.id === 3) { startDeebuEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    '12. stage map onPress')

# 13. story overlay images
src = patch(src,
    "    const currentScenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;\n    const currentScene = currentScenes[sceneIndex] || currentScenes[0];\n    const sceneImg = storyStage === 2\n      ? (currentScene.img === 2 ? ATODEYARU_SCENE2_IMG : ATODEYARU_SCENE1_IMG)\n      : (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG);",
    "    const currentScenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;\n    const currentScene = currentScenes[sceneIndex] || currentScenes[0];\n    const sceneImg = storyStage === 3\n      ? (currentScene.img === 2 ? DEEBU_SCENE2_IMG : DEEBU_SCENE1_IMG)\n      : storyStage === 2\n        ? (currentScene.img === 2 ? ATODEYARU_SCENE2_IMG : ATODEYARU_SCENE1_IMG)\n        : (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG);",
    '13. story images')

# 14. missionBrief stage3
ATODEYARU_BRIEF = """          {storyPhase === 'missionBrief' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30a2\u30c8\u30c7\u30e4\u30eb'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28 }}>
                <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{'今日のルーティンを半分こなし\\nTODOを全て完了せよ'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 30 }}>{'\u6761\u4ef6\u3092\u9054\u6210\u3059\u308b\u3068\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10\u3067\u304d\u308b'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setAtodeyaruActive(true); try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>
              </TouchableOpacity>
            </View>
          )}"""

DEEBU_BRIEF = """          {storyPhase === 'missionBrief' && storyStage === 3 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30c7\u30fc\u30d6'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 16 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', textAlign: 'center', lineHeight: 28 }}>{'\u2694\uFE0F \u7b4b\u30c8\u30ec20\u56de\u3067\u30c7\u30fc\u30d6\u306b\u30c0\u30e1\u30fc\u30b8'}</Text>
                <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginTop: 6 }}>{'\u30c7\u30fc\u30d6\u3092\u30bf\u30c3\u30d7\u3057\u3066\u7b4b\u30c8\u30ec\u958b\u59cb'}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28 }}>
                <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', textAlign: 'center', lineHeight: 28 }}>{'\U0001f4f8 \u6b32\u671b\u3092\u53ef\u8996\u5316\u305b\u3088'}</Text>
                <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginTop: 6 }}>{'\u76f8\u8ac7\u30bf\u30d6\u300c\u6b32\u671b\u3092\u898b\u305b\u3066\u307f\u308d\u300d\u3067\u5b9f\u884c'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 30 }}>{'\u4e21\u65b9\u9054\u6210\u3067\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10\u3067\u304d\u308b'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setDeebuActive(true); setDeebuHits(0); setDeebuYokubouDone(false); try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {storyPhase === 'missionBrief' && storyStage === 2 && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30a2\u30c8\u30c7\u30e4\u30eb'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>
              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28 }}>
                <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{'今日のルーティンを半分こなし\\nTODOを全て完了せよ'}</Text>
              </View>
              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 30 }}>{'\u6761\u4ef6\u3092\u9054\u6210\u3059\u308b\u3068\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10\u3067\u304d\u308b'}</Text>
              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setAtodeyaruActive(true); try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>
              </TouchableOpacity>
            </View>
          )}"""

src = patch(src, ATODEYARU_BRIEF, DEEBU_BRIEF, '14. missionBrief stage3')

# 15. defeat video
src = patch(src,
    "<Video source={storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    "<Video source={storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    '15. defeat video')

# 16. defeat callback
src = patch(src,
    "const sc = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "const sc = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '16. defeat callback')

# 17. victory image
src = patch(src,
    "<ImageBackground source={storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    "<ImageBackground source={storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    '17. victory image')

# 18. clear text
src = patch(src,
    "{storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    "{storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    '18a. clear stage')

src = patch(src,
    "{storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    "{storyStage === 3 ? '\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10' : storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    '18b. clear name')

# 19. floating deebu + training modal
FLOATING_ATODEYARU = """      {/* Floating Atodeyaru */}
      {atodeyaruActive && !storyActive && ("""

FLOATING_DEEBU_AND_ATODEYARU = """      {/* Floating Deebu */}
      {deebuActive && !storyActive && (
        <View style={{ position: 'absolute', bottom: 120, right: 16, zIndex: 999, alignItems: 'center' }}>
          <Pressable onPress={() => { if (deebuHits < DEEBU_HIT_TARGET) { playTapSound(); setDeebuTrainingOpen(true); } else { const q = DEEBU_QUIPS[Math.floor(Math.random() * DEEBU_QUIPS.length)]; showSaveSuccess(q); } }}>
            <View style={{ alignItems: 'center' }}>
              <Image source={YOKAI_IMAGES.deebu} style={{ width: 70, height: 70, borderRadius: 35, opacity: deebuHits >= DEEBU_HIT_TARGET ? 0.4 : 1 }} resizeMode="contain" />
              <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 2 }}>{'\u30c7\u30fc\u30d6'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={{ width: 50, height: 5, backgroundColor: '#333', borderRadius: 3 }}>
                  <View style={{ width: Math.min(50, (deebuHits / DEEBU_HIT_TARGET) * 50), height: 5, backgroundColor: deebuHits >= DEEBU_HIT_TARGET ? '#2ecc71' : '#e74c3c', borderRadius: 3 }} />
                </View>
                <Text style={{ color: '#888', fontSize: 8, marginLeft: 3 }}>{deebuHits + '/' + DEEBU_HIT_TARGET}</Text>
              </View>
              {deebuHits >= DEEBU_HIT_TARGET && <Text style={{ color: '#2ecc71', fontSize: 8, marginTop: 1 }}>{'\u2714 \u7b4b\u30c8\u30ec\u5b8c\u4e86'}</Text>}
              {deebuYokubouDone && <Text style={{ color: '#2ecc71', fontSize: 8, marginTop: 1 }}>{'\u2714 \u6b32\u671b\u53ef\u8996\u5316'}</Text>}
            </View>
          </Pressable>
        </View>
      )}

      {/* Deebu Training Modal */}
      {deebuTrainingOpen && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            {!deebuTrainingType ? (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <Image source={YOKAI_IMAGES.deebu} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 16 }} resizeMode="contain" />
                <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30c7\u30fc\u30d6'}</Text>
                <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\u7b4b\u30c8\u30ec\u3092\u9078\u3093\u3067\u30c0\u30e1\u30fc\u30b8\u3092\u4e0e\u3048\u308d'}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
                  {DEEBU_EXERCISES.map((ex) => (
                    <TouchableOpacity key={ex.id} onPress={() => { setDeebuTrainingType(ex.id); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {} }} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}>
                      <Text style={{ fontSize: 24, marginBottom: 6 }}>{ex.icon}</Text>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{ex.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setDeebuTrainingOpen(false)} style={{ padding: 12 }}>
                  <Text style={{ color: '#666', fontSize: 13 }}>{'\u9589\u3058\u308b'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: 'center', width: '100%' }}>
                <Image source={YOKAI_IMAGES.deebu} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 8, opacity: 1 - (deebuHits / DEEBU_HIT_TARGET) * 0.6 }} resizeMode="contain" />
                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{'\u30c7\u30fc\u30d6'}</Text>
                <View style={{ width: '70%', height: 8, backgroundColor: '#333', borderRadius: 4, marginBottom: 6 }}>
                  <View style={{ width: ((DEEBU_HIT_TARGET - deebuHits) / DEEBU_HIT_TARGET * 100) + '%', height: 8, backgroundColor: '#e74c3c', borderRadius: 4 }} />
                </View>
                <Text style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>{'\u2694\uFE0F ' + (DEEBU_EXERCISES.find(e => e.id === deebuTrainingType)?.label || '') + ' \u2014 \u6b8b\u308a' + Math.max(0, DEEBU_HIT_TARGET - deebuHits) + '\u56de'}</Text>
                <Text style={{ color: '#fff', fontSize: 72, fontWeight: '900', marginBottom: 6 }}>{deebuHits}</Text>
                <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{deebuHits + ' / ' + DEEBU_HIT_TARGET}</Text>
                {deebuHits < DEEBU_HIT_TARGET ? (
                  <TouchableOpacity onPress={deebuTrainingTap} style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#DAA520', fontSize: 24, fontWeight: '900' }}>{'\u62bc\u305b'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#2ecc71', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\u7b4b\u30c8\u30ec\u5b8c\u4e86\uff01'}</Text>
                    <TouchableOpacity onPress={() => { setDeebuTrainingOpen(false); setDeebuTrainingType(null); }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>
                      <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: 'bold' }}>{'\u9589\u3058\u308b'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </Modal>
      )}

      {/* Floating Atodeyaru */}
      {atodeyaruActive && !storyActive && ("""

src = patch(src, FLOATING_ATODEYARU, FLOATING_DEEBU_AND_ATODEYARU, '19. floating deebu + modal')

# verify
if src == original:
    print('\n[ERROR] No changes')
    sys.exit(1)
try:
    src.encode('utf-8')
except UnicodeEncodeError as e:
    print(f'\n[ERROR] UTF-8: {e}')
    sys.exit(1)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)

print(f'\n\u2705 Done! {len(original)} -> {len(src)} (+{len(src)-len(original)})')
