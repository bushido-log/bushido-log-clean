#!/usr/bin/env python3
"""
BUSHIDO LOG - Stage 3 (deebu) v2
Full battle screen, in-game photo+reason
Requires: Stage 2 patch applied
"""
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
    '1. require')

# 2. keys
src = patch(src,
    "const ATODEYARU_ACTIVE_KEY = 'bushido_atodeyaru_active';",
    "const ATODEYARU_ACTIVE_KEY = 'bushido_atodeyaru_active';\nconst DEEBU_EVENT_KEY = 'bushido_deebu_event_done';\nconst DEEBU_ACTIVE_KEY = 'bushido_deebu_active';",
    '2. keys')

# 3. state
src = patch(src,
    "  const [storyStage, setStoryStage] = useState<number>(1);",
    "  const [storyStage, setStoryStage] = useState<number>(1);\n"
    "  const [deebuEventDone, setDeebuEventDone] = useState(false);\n"
    "  const [deebuActive, setDeebuActive] = useState(false);\n"
    "  const [deebuBattleOpen, setDeebuBattleOpen] = useState(false);\n"
    "  const [deebuPhase, setDeebuPhase] = useState<'menu'|'train_select'|'training'|'photo'|'reason'|'done'>('menu');\n"
    "  const [deebuHits, setDeebuHits] = useState(0);\n"
    "  const [deebuTrainingType, setDeebuTrainingType] = useState<string|null>(null);\n"
    "  const [deebuTrainingDone, setDeebuTrainingDone] = useState(false);\n"
    "  const [deebuPhotoDone, setDeebuPhotoDone] = useState(false);\n"
    "  const [deebuPhotoUri, setDeebuPhotoUri] = useState<string|null>(null);\n"
    "  const [deebuReason, setDeebuReason] = useState('');\n"
    "  const deebuShakeAnim = useRef(new Animated.Value(0)).current;\n"
    "  const [deebuFlash, setDeebuFlash] = useState(false);",
    '3. state')

# 4. scenes
DEEBU_DATA = (
    "  const DEEBU_SCENES = [\n"
    "    { img: 1, text: '\\u3075\\u3041\\u301c...\\u52d5\\u304f\\u306e\\u3060\\u308b\\u3044\\u3002\\\\n\\u98df\\u3063\\u3066\\u5bdd\\u3066\\u308c\\u3070\\u3044\\u3044\\u3058\\u3083\\u3093\\u3002' },\n"
    "    { img: 1, text: '\\u7b4b\\u30c8\\u30ec\\uff1f\\u306f\\u3041\\uff1f\\\\n\\u305d\\u3093\\u306a\\u3053\\u3068\\u3088\\u308a\\\\n\\u30c9\\u30fc\\u30ca\\u30c4\\u98df\\u3079\\u3088\\u3046\\u305c\\u3002' },\n"
    "    { img: 1, text: '\\u4ffa\\u304c\\u3044\\u308b\\u9650\\u308a\\u3001\\\\n\\u304a\\u524d\\u306f\\u6c38\\u9060\\u306b\\\\n\\u30c0\\u30e9\\u30c0\\u30e9\\u3060\\u3002' },\n"
    "    { img: 1, text: '\\u3067\\u304d\\u308b\\u3082\\u3093\\u306a\\u3089\\\\n\\u4f53\\u52d5\\u304b\\u3057\\u3066\\u307f\\u308d\\u3088\\u3002\\\\n\\u3069\\u3046\\u305b\\u7121\\u7406\\u3060\\u308d\\uff1f' },\n"
    "    { img: 2, text: '\\u306f\\u3041\\u2026\\u306f\\u3041\\u2026\\\\n\\u304a\\u524d\\u2026\\u52d5\\u3051\\u308b\\u306e\\u304b\\u3088\\u2026' },\n"
    "    { img: 2, text: '\\u304f\\u305d\\u2026\\u6b21\\u306f\\\\n\\u3082\\u3063\\u3068\\u5f37\\u3044\\u5974\\u304c\\\\n\\u5f85\\u3063\\u3066\\u308b\\u304b\\u3089\\u306a\\u2026' },\n"
    "  ];\n\n"
    "  const DEEBU_HIT_TARGET = 20;\n\n"
    "  const DEEBU_EXERCISES = [\n"
    "    { id: 'pushup', label: '\\u8155\\u7acb\\u3066\\u3075\\u305b', icon: '\\u2694\\uFE0F' },\n"
    "    { id: 'squat', label: '\\u30b9\\u30af\\u30ef\\u30c3\\u30c8', icon: '\\u2B50' },\n"
    "    { id: 'situp', label: '\\u8179\\u7b4b', icon: '\\u2604\\uFE0F' },\n"
    "  ];\n\n"
    "  const ATODEYARU_QUIPS = ["
)

src = patch(src,
    "  const ATODEYARU_QUIPS = [",
    DEEBU_DATA,
    '4. scenes')

# 5. event functions
DEEBU_FUNCS = (
    "  // === DEEBU EVENT / STAGE 3 ===\n"
    "  const startDeebuEvent = () => {\n"
    "    setStoryStage(3);\n"
    "    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);\n"
    "    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}\n"
    "    setTimeout(() => {\n"
    "      setStoryPhase('eyes');\n"
    "      Audio.Sound.createAsync(require('./sounds/sfx_eyes.mp3')).then(({sound}) => sound.setVolumeAsync(0.5).then(() => sound.playAsync())).catch(e => {});\n"
    "      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();\n"
    "    }, 2000);\n"
    "    setTimeout(() => {\n"
    "      storyEyesOpacity.setValue(0); setStoryPhase('scenes');\n"
    "      storyTypewriter(DEEBU_SCENES[0].text);\n"
    "      speakMikkabozu('\\u52d5\\u304f\\u306e\\u3060\\u308b\\u3044');\n"
    "    }, 5000);\n"
    "  };\n\n"
    "  const openDeebuBattle = () => {\n"
    "    playTapSound();\n"
    "    setDeebuBattleOpen(true);\n"
    "    setDeebuPhase(deebuTrainingDone && deebuPhotoDone ? 'done' : 'menu');\n"
    "  };\n\n"
    "  const triggerDeebuDefeat = async () => {\n"
    "    setStoryStage(3);\n"
    "    setDeebuActive(false); setDeebuBattleOpen(false);\n"
    "    try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'false'); } catch(e) {}\n"
    "    setStoryActive(true);\n"
    "    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();\n"
    "    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    speakSamurai('\\u898b\\u4e8b\\u3060'); samuraiSpeak('\\u898b\\u4e8b\\u3060');\n"
    "    await addXpWithLevelCheck(50);\n"
    "    setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('\\u52d5\\u3051\\u308b\\u306e\\u304b\\u3088'); }, 1500);\n"
    "  };\n\n"
    "  const deebuTrainingTap = () => {\n"
    "    const next = deebuHits + 1;\n"
    "    setDeebuHits(next);\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}\n"
    "    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}\n"
    "    setDeebuFlash(true); setTimeout(() => setDeebuFlash(false), 150);\n"
    "    Animated.sequence([\n"
    "      Animated.timing(deebuShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),\n"
    "      Animated.timing(deebuShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),\n"
    "      Animated.timing(deebuShakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),\n"
    "      Animated.timing(deebuShakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),\n"
    "      Animated.timing(deebuShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),\n"
    "    ]).start();\n"
    "    if (next >= DEEBU_HIT_TARGET) {\n"
    "      setDeebuTrainingDone(true);\n"
    "      setTimeout(() => { if (deebuPhotoDone) { setDeebuPhase('done'); } else { setDeebuPhase('menu'); } }, 800);\n"
    "    }\n"
    "  };\n\n"
    "  const deebuPickPhoto = async () => {\n"
    "    try {\n"
    "      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });\n"
    "      if (!result.canceled && result.assets?.[0]) { setDeebuPhotoUri(result.assets[0].uri); setDeebuPhase('reason'); }\n"
    "    } catch(e) { console.log('deebu photo error', e); }\n"
    "  };\n\n"
    "  const deebuTakePhoto = async () => {\n"
    "    try {\n"
    "      const perm = await ImagePicker.requestCameraPermissionsAsync();\n"
    "      if (!perm.granted) return;\n"
    "      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });\n"
    "      if (!result.canceled && result.assets?.[0]) { setDeebuPhotoUri(result.assets[0].uri); setDeebuPhase('reason'); }\n"
    "    } catch(e) { console.log('deebu camera error', e); }\n"
    "  };\n\n"
    "  const deebuSubmitReason = () => {\n"
    "    if (!deebuReason.trim()) return;\n"
    "    playTapSound();\n"
    "    setDeebuPhotoDone(true);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    if (deebuTrainingDone) { setDeebuPhase('done'); } else { setDeebuPhase('menu'); showSaveSuccess('\\u6b32\\u671b\\u65ad\\u3061\\u5207\\u308a\\uff01\\u3042\\u3068\\u306f\\u7b4b\\u30c8\\u30ec\\u3060\\uff01'); }\n"
    "  };\n"
    "  // === END DEEBU EVENT ===\n\n"
    "  // === END ATODEYARU EVENT ==="
)

src = patch(src,
    "  // === END ATODEYARU EVENT ===",
    DEEBU_FUNCS,
    '5. functions')

# 6. advanceScene
src = patch(src,
    "    const scenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '6a. advanceScene')

src = patch(src,
    "    if (storyStage === 2 && next === 4) { setStoryPhase('missionBrief'); return; }",
    "    if (storyStage === 2 && next === 4) { setStoryPhase('missionBrief'); return; }\n    if (storyStage === 3 && next === 4) { setStoryPhase('missionBrief'); return; }",
    '6b. advanceScene brief')

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

# 9. init
src = patch(src,
    "      AsyncStorage.getItem(ATODEYARU_ACTIVE_KEY).then(v => { if (v === 'true') setAtodeyaruActive(true); }).catch(e => {});",
    "      AsyncStorage.getItem(ATODEYARU_ACTIVE_KEY).then(v => { if (v === 'true') setAtodeyaruActive(true); }).catch(e => {});\n      AsyncStorage.getItem(DEEBU_EVENT_KEY).then(v => { if (v === 'true') { setDeebuEventDone(true); setInnerWorldUnlocked(true); } }).catch(e => {});\n      AsyncStorage.getItem(DEEBU_ACTIVE_KEY).then(v => { if (v === 'true') setDeebuActive(true); }).catch(e => {});",
    '9. init')

# 10. stage map
src = patch(src,
    "{ id: 3, name: '\u30c7\u30fc\u30d6', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.47 },",
    "{ id: 3, name: '\u30c7\u30fc\u30d6', icon: NODE_SCROLL, cleared: deebuEventDone, x: 0.6, y: 0.47 },",
    '10. map cleared')

src = patch(src,
    "else if (isNext && stage.id === 2) { startAtodeyaruEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    "else if (isNext && stage.id === 2) { startAtodeyaruEvent(); } else if (stage.cleared && stage.id === 3) { startDeebuEvent(); } else if (isNext && stage.id === 3) { startDeebuEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    '11. map onPress')

# 12. story images
src = patch(src,
    "    const currentScenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;\n    const currentScene = currentScenes[sceneIndex] || currentScenes[0];\n    const sceneImg = storyStage === 2\n      ? (currentScene.img === 2 ? ATODEYARU_SCENE2_IMG : ATODEYARU_SCENE1_IMG)\n      : (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG);",
    "    const currentScenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;\n    const currentScene = currentScenes[sceneIndex] || currentScenes[0];\n    const sceneImg = storyStage === 3\n      ? (currentScene.img === 2 ? DEEBU_SCENE2_IMG : DEEBU_SCENE1_IMG)\n      : storyStage === 2\n        ? (currentScene.img === 2 ? ATODEYARU_SCENE2_IMG : ATODEYARU_SCENE1_IMG)\n        : (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG);",
    '12. story images')

# 13. missionBrief - replace with stage-conditional version
ATODEYARU_BRIEF = "          {storyPhase === 'missionBrief' && (\n            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>\n              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u30a2\u30c8\u30c7\u30e4\u30eb'}</Text>\n              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u8a0e\u4f10\u30df\u30c3\u30b7\u30e7\u30f3'}</Text>\n              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28 }}>\n                <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{'今日のルーティンを半分こなし\\nTODOを全て完了せよ'}</Text>\n              </View>\n              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 30 }}>{'\u6761\u4ef6\u3092\u9054\u6210\u3059\u308b\u3068\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10\u3067\u304d\u308b'}</Text>\n              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setAtodeyaruActive(true); try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4e86\u89e3'}</Text>\n              </TouchableOpacity>\n            </View>\n          )}"

DEEBU_BRIEF_PART = (
    "          {storyPhase === 'missionBrief' && storyStage === 3 && (\n"
    "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>\n"
    "              <Image source={YOKAI_IMAGES.deebu} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }} resizeMode=\"contain\" />\n"
    "              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\\u30c7\\u30fc\\u30d6'}</Text>\n"
    "              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\\u8a0e\\u4f10\\u30df\\u30c3\\u30b7\\u30e7\\u30f3'}</Text>\n"
    "              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 20, width: '100%', marginBottom: 12 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\\u2694\\uFE0F \\u7b4b\\u30c8\\u30ec20\\u56de\\u3067\\u653b\\u6483'}</Text>\n"
    "              </View>\n"
    "              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 }}>\n"
    "                <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\\u{1f4f8} \\u6b32\\u671b\\u3092\\u65ad\\u3061\\u5207\\u308c'}</Text>\n"
    "              </View>\n"
    "              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>{'\\u30c7\\u30fc\\u30d6\\u3092\\u30bf\\u30c3\\u30d7\\u3057\\u3066\\u6311\\u6226\\u958b\\u59cb'}</Text>\n"
    "              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setDeebuActive(true); setDeebuHits(0); setDeebuTrainingDone(false); setDeebuPhotoDone(false); setDeebuPhotoUri(null); setDeebuReason(''); try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\\u4e86\\u89e3'}</Text>\n"
    "              </TouchableOpacity>\n"
    "            </View>\n"
    "          )}\n\n"
)

ATODEYARU_BRIEF_CONDITIONAL = (
    "          {storyPhase === 'missionBrief' && storyStage === 2 && (\n"
    "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>\n"
    "              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\\u30a2\\u30c8\\u30c7\\u30e4\\u30eb'}</Text>\n"
    "              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\\u8a0e\\u4f10\\u30df\\u30c3\\u30b7\\u30e7\\u30f3'}</Text>\n"
    "              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{'今日のルーティンを半分こなし\\\\nTODOを全て完了せよ'}</Text>\n"
    "              </View>\n"
    "              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 30 }}>{'\\u6761\\u4ef6\\u3092\\u9054\\u6210\\u3059\\u308b\\u3068\\u30a2\\u30c8\\u30c7\\u30e4\\u30eb\\u3092\\u8a0e\\u4f10\\u3067\\u304d\\u308b'}</Text>\n"
    "              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setAtodeyaruActive(true); try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\\u4e86\\u89e3'}</Text>\n"
    "              </TouchableOpacity>\n"
    "            </View>\n"
    "          )}"
)

src = patch(src, ATODEYARU_BRIEF, DEEBU_BRIEF_PART + ATODEYARU_BRIEF_CONDITIONAL, '13. missionBrief')

# 14-17 defeat/victory/clear
src = patch(src,
    "<Video source={storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    "<Video source={storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    '14. defeat video')

src = patch(src,
    "const sc = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "const sc = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '15. defeat callback')

src = patch(src,
    "<ImageBackground source={storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    "<ImageBackground source={storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    '16. victory image')

src = patch(src,
    "{storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    "{storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    '17a. clear stage')

src = patch(src,
    "{storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    "{storyStage === 3 ? '\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10' : storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    '17b. clear name')

# 18. Floating Deebu + Full Battle Modal
FLOATING_ATODEYARU = "      {/* Floating Atodeyaru */}\n      {atodeyaruActive && !storyActive && ("

# Build the battle modal JSX as a Python string
BATTLE_MODAL = (
    "      {/* Floating Deebu */}\n"
    "      {deebuActive && !storyActive && (\n"
    "        <Pressable onPress={openDeebuBattle} style={{ position: 'absolute', bottom: 130, right: 12, zIndex: 999, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#e74c3c' }}>\n"
    "          <Image source={YOKAI_IMAGES.deebu} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode=\"contain\" />\n"
    "          <Text style={{ color: '#ff6b6b', fontSize: 10, fontWeight: '900', marginTop: 3 }}>{'\\u30c7\\u30fc\\u30d6'}</Text>\n"
    "          <View style={{ backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>\n"
    "            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{'\\u6311\\u6226\\uff01'}</Text>\n"
    "          </View>\n"
    "        </Pressable>\n"
    "      )}\n\n"
    "      {/* Deebu Battle Modal */}\n"
    "      {deebuBattleOpen && (\n"
    "        <Modal visible={true} animationType=\"slide\" transparent={false}>\n"
    "          <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>\n"
    "            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: '#222' }}>\n"
    "              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>\n"
    "                <TouchableOpacity onPress={() => setDeebuBattleOpen(false)}><Text style={{ color: '#888', fontSize: 14 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{'\\u30c7\\u30fc\\u30d6\\u6226'}</Text>\n"
    "                <View style={{ width: 50 }} />\n"
    "              </View>\n"
    "            </View>\n\n"
    "            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>\n"
    "              {/* Boss */}\n"
    "              <View style={{ alignItems: 'center', marginBottom: 20 }}>\n"
    "                <View style={{ alignItems: 'center', marginBottom: 8 }}>\n"
    "                  {deebuFlash && <View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(231,76,60,0.5)', zIndex: 2 }} />}\n"
    "                  <Animated.Image source={YOKAI_IMAGES.deebu} style={{ width: 100, height: 100, borderRadius: 50, opacity: deebuTrainingDone ? 0.4 : 1, transform: [{ translateX: deebuShakeAnim }] }} resizeMode=\"contain\" />\n"
    "                </View>\n"
    "                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{'\\u30c7\\u30fc\\u30d6'}</Text>\n"
    "                <View style={{ width: '60%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 6 }}>\n"
    "                  <View style={{ width: (Math.max(0, DEEBU_HIT_TARGET - deebuHits) / DEEBU_HIT_TARGET * 100) + '%', height: 8, backgroundColor: '#e74c3c', borderRadius: 4 }} />\n"
    "                </View>\n"
    "                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{'HP ' + Math.max(0, DEEBU_HIT_TARGET - deebuHits) + '/' + DEEBU_HIT_TARGET}</Text>\n"
    "              </View>\n\n"
    "              {/* Menu */}\n"
    "              {deebuPhase === 'menu' && (\n"
    "                <View>\n"
    "                  <Pressable onPress={() => { if (!deebuTrainingDone) setDeebuPhase('train_select'); }} style={{ backgroundColor: deebuTrainingDone ? 'rgba(46,204,113,0.1)' : 'rgba(218,165,32,0.1)', borderWidth: 2, borderColor: deebuTrainingDone ? '#2ecc71' : '#DAA520', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                    <Text style={{ fontSize: 32, marginRight: 14 }}>{deebuTrainingDone ? '\\u2714\\uFE0F' : '\\u2694\\uFE0F'}</Text>\n"
    "                    <View style={{ flex: 1 }}>\n"
    "                      <Text style={{ color: deebuTrainingDone ? '#2ecc71' : '#DAA520', fontSize: 17, fontWeight: '900' }}>{deebuTrainingDone ? '\\u7b4b\\u30c8\\u30ec\\u5b8c\\u4e86\\uff01' : '\\u7b4b\\u30c8\\u30ec\\u3067\\u653b\\u6483'}</Text>\n"
    "                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{deebuTrainingDone ? deebuHits + '\\u56de\\u9054\\u6210' : '\\u7b4b\\u30c8\\u30ec\\u3092\\u9078\\u3093\\u3067' + DEEBU_HIT_TARGET + '\\u56de\\u30c0\\u30e1\\u30fc\\u30b8\\u3092\\u4e0e\\u3048\\u308d'}</Text>\n"
    "                    </View>\n"
    "                    {!deebuTrainingDone && <Text style={{ color: '#DAA520', fontSize: 20 }}>{'\\u203a'}</Text>}\n"
    "                  </Pressable>\n\n"
    "                  <Pressable onPress={() => { if (!deebuPhotoDone) setDeebuPhase('photo'); }} style={{ backgroundColor: deebuPhotoDone ? 'rgba(46,204,113,0.1)' : 'rgba(79,195,247,0.1)', borderWidth: 2, borderColor: deebuPhotoDone ? '#2ecc71' : '#4FC3F7', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                    <Text style={{ fontSize: 32, marginRight: 14 }}>{deebuPhotoDone ? '\\u2714\\uFE0F' : '\\u{1f4f8}'}</Text>\n"
    "                    <View style={{ flex: 1 }}>\n"
    "                      <Text style={{ color: deebuPhotoDone ? '#2ecc71' : '#4FC3F7', fontSize: 17, fontWeight: '900' }}>{deebuPhotoDone ? '\\u6b32\\u671b\\u65ad\\u3061\\u5207\\u308a\\uff01' : '\\u6b32\\u671b\\u3092\\u65ad\\u3061\\u5207\\u308c'}</Text>\n"
    "                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{deebuPhotoDone ? '\\u6211\\u6162\\u3059\\u308b\\u3082\\u306e\\u3092\\u5c01\\u5370\\u3057\\u305f' : '\\u6211\\u6162\\u3059\\u308b\\u3082\\u306e\\u3092\\u64ae\\u3063\\u3066\\u7406\\u7531\\u3092\\u66f8\\u3051'}</Text>\n"
    "                    </View>\n"
    "                    {!deebuPhotoDone && <Text style={{ color: '#4FC3F7', fontSize: 20 }}>{'\\u203a'}</Text>}\n"
    "                  </Pressable>\n\n"
    "                  {deebuTrainingDone && deebuPhotoDone && (\n"
    "                    <TouchableOpacity onPress={() => triggerDeebuDefeat()} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 }}>\n"
    "                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\\u3068\\u3069\\u3081\\u3092\\u523a\\u305b\\uff01'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  )}\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Train select */}\n"
    "              {deebuPhase === 'train_select' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\\u7b4b\\u30c8\\u30ec\\u3092\\u9078\\u3079'}</Text>\n"
    "                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>\n"
    "                    {DEEBU_EXERCISES.map((ex) => (\n"
    "                      <TouchableOpacity key={ex.id} onPress={() => { setDeebuTrainingType(ex.id); setDeebuPhase('training'); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {} }} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 2, borderColor: '#DAA520', borderRadius: 14, paddingVertical: 20, alignItems: 'center' }}>\n"
    "                        <Text style={{ fontSize: 28, marginBottom: 6 }}>{ex.icon}</Text>\n"
    "                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{ex.label}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    ))}\n"
    "                  </View>\n"
    "                  <TouchableOpacity onPress={() => setDeebuPhase('menu')} style={{ padding: 12 }}>\n"
    "                    <Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Training counter */}\n"
    "              {deebuPhase === 'training' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>{'\\u2694\\uFE0F ' + (DEEBU_EXERCISES.find(e => e.id === deebuTrainingType)?.label || '')}</Text>\n"
    "                  <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900', marginBottom: 4 }}>{deebuHits}</Text>\n"
    "                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{deebuHits + ' / ' + DEEBU_HIT_TARGET}</Text>\n"
    "                  {deebuHits < DEEBU_HIT_TARGET ? (\n"
    "                    <TouchableOpacity onPress={deebuTrainingTap} style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#DAA520', fontSize: 28, fontWeight: '900' }}>{'\\u62bc\\u305b\\uff01'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  ) : (\n"
    "                    <View style={{ alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\\u7b4b\\u30c8\\u30ec\\u5b8c\\u4e86\\uff01'}</Text>\n"
    "                      <TouchableOpacity onPress={() => setDeebuPhase('menu')} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>\n"
    "                        <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: 'bold' }}>{'\\u6b21\\u3078'}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    </View>\n"
    "                  )}\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Photo */}\n"
    "              {deebuPhase === 'photo' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 2 }}>{'\\u{1f4f8} \\u6b32\\u671b\\u3092\\u65ad\\u3061\\u5207\\u308c'}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 22 }}>{'\\u4eca\\u6211\\u6162\\u3057\\u305f\\u3044\\u3082\\u306e\\u3092\\u64ae\\u308c\\u3002\\\\n\\u305d\\u308c\\u304c\\u304a\\u524d\\u306e\\u5f31\\u3055\\u3060\\u3002'}</Text>\n"
    "                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>\n"
    "                    <TouchableOpacity onPress={deebuTakePhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', marginRight: 16 }}>\n"
    "                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\\u{1f4f7}'}</Text>\n"
    "                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\\u64ae\\u5f71'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                    <TouchableOpacity onPress={deebuPickPhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center' }}>\n"
    "                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\\u{1f5bc}\\uFE0F'}</Text>\n"
    "                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\\u9078\\u629e'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  </View>\n"
    "                  <TouchableOpacity onPress={() => setDeebuPhase('menu')} style={{ padding: 12 }}>\n"
    "                    <Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Reason */}\n"
    "              {deebuPhase === 'reason' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', marginBottom: 12 }}>{'\\u306a\\u305c\\u6211\\u6162\\u3059\\u308b\\uff1f'}</Text>\n"
    "                  {deebuPhotoUri && <Image source={{ uri: deebuPhotoUri }} style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 16, borderWidth: 2, borderColor: '#333' }} />}\n"
    "                  <TextInput\n"
    "                    style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }}\n"
    "                    placeholder={'\\u6211\\u6162\\u3059\\u308b\\u7406\\u7531\\u3092\\u66f8\\u3051'}\n"
    "                    placeholderTextColor=\"#555\"\n"
    "                    multiline\n"
    "                    value={deebuReason}\n"
    "                    onChangeText={setDeebuReason}\n"
    "                  />\n"
    "                  <TouchableOpacity onPress={deebuSubmitReason} style={{ backgroundColor: deebuReason.trim() ? '#4FC3F7' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: deebuReason.trim() ? 1 : 0.5 }}>\n"
    "                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\\u6b32\\u671b\\u3092\\u65ad\\u3061\\u5207\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Done */}\n"
    "              {deebuPhase === 'done' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 20 }}>{'\\u30df\\u30c3\\u30b7\\u30e7\\u30f3\\u5168\\u9054\\u6210\\uff01'}</Text>\n"
    "                  <TouchableOpacity onPress={() => triggerDeebuDefeat()} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 50 }}>\n"
    "                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\\u3068\\u3069\\u3081\\u3092\\u523a\\u305b\\uff01'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n"
    "            </ScrollView>\n"
    "          </View>\n"
    "        </Modal>\n"
    "      )}\n\n"
    "      {/* Floating Atodeyaru */}\n"
    "      {atodeyaruActive && !storyActive && ("
)

src = patch(src, FLOATING_ATODEYARU, BATTLE_MODAL, '18. floating + battle modal')

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
