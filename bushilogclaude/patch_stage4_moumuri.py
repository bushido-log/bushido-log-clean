#!/usr/bin/env python3
"""
BUSHIDO LOG - Stage 4 (moumuri) 
One good deed + 10 gratitudes to defeat
Requires: Stage 2 + Stage 3 patches applied
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
    "const DEEBU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_deebu.mp4');",
    "const DEEBU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_deebu.mp4');\n"
    "const MOUMURI_SCENE1_IMG = require('./assets/story/moumuri_scene1.png');\n"
    "const MOUMURI_SCENE2_IMG = require('./assets/story/moumuri_scene2.png');\n"
    "const MOUMURI_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_moumuri.mp4');",
    '1. require')

# 2. keys
src = patch(src,
    "const DEEBU_ACTIVE_KEY = 'bushido_deebu_active';",
    "const DEEBU_ACTIVE_KEY = 'bushido_deebu_active';\n"
    "const MOUMURI_EVENT_KEY = 'bushido_moumuri_event_done';\n"
    "const MOUMURI_ACTIVE_KEY = 'bushido_moumuri_active';",
    '2. keys')

# 3. state
src = patch(src,
    "  const [deebuFlash, setDeebuFlash] = useState(false);",
    "  const [deebuFlash, setDeebuFlash] = useState(false);\n"
    "  const [moumuriEventDone, setMoumuriEventDone] = useState(false);\n"
    "  const [moumuriActive, setMoumuriActive] = useState(false);\n"
    "  const [moumuriBO, setMoumuriBO] = useState(false);\n"
    "  const [moumuriPhase, setMoumuriPhase] = useState<'menu'|'zen'|'kansha'|'done'>('menu');\n"
    "  const [moumuriZenText, setMoumuriZenText] = useState('');\n"
    "  const [moumuriZenDone, setMoumuriZenDone] = useState(false);\n"
    "  const [moumuriKanshaList, setMoumuriKanshaList] = useState<string[]>([]);\n"
    "  const [moumuriKanshaInput, setMoumuriKanshaInput] = useState('');\n"
    "  const moumuriShakeAnim = useRef(new Animated.Value(0)).current;\n"
    "  const [moumuriFlash, setMoumuriFlash] = useState(false);",
    '3. state')

# 4. scenes
src = patch(src,
    "  const DEEBU_HIT_TARGET = 20;",
    "  const MOUMURI_SCENES = [\n"
    "    { img: 1, text: '\\u3053\\u306e\\u4eba\\u751f\\u3082\\u3046\\u7121\\u7406\\u3060\\u3063\\u3066\\u3002\\n\\u4e00\\u7dd2\\u306b\\u30c0\\u30e9\\u30c0\\u30e9\\u3057\\u3088\\u3046\\u305c\\u3002' },\n"
    "    { img: 1, text: '\\u611f\\u8b1d\\uff1f\\u512a\\u3057\\u3055\\uff1f\\n\\u305d\\u3093\\u306a\\u3082\\u306e\\u306b\\n\\u610f\\u5473\\u306a\\u3093\\u3066\\u306a\\u3044\\u3063\\u3066\\u3002' },\n"
    "    { img: 1, text: '\\u4ffa\\u304c\\u3044\\u308b\\u9650\\u308a\\u3001\\n\\u304a\\u524d\\u306f\\u8ab0\\u306b\\u3082\\n\\u611f\\u8b1d\\u3067\\u304d\\u306a\\u3044\\u3002' },\n"
    "    { img: 1, text: '\\u3067\\u304d\\u308b\\u3082\\u3093\\u306a\\u3089\\u3001\\n\\u4eba\\u306b\\u512a\\u3057\\u304f\\u3057\\u3066\\u307f\\u308d\\u3088\\u3002\\n\\u611f\\u8b1d\\u3057\\u3066\\u307f\\u308d\\u3088\\u3002\\n\\u3069\\u3046\\u305b\\u7121\\u7406\\u3060\\u308d\\uff1f' },\n"
    "    { img: 2, text: '\\u306a\\u3093\\u3060\\u3088\\u2026\\n\\u611f\\u8b1d\\u3068\\u304b\\u3067\\u304d\\u308b\\u306e\\u304b\\u3088\\u2026' },\n"
    "    { img: 2, text: '\\u304f\\u305d\\u2026\\u6b21\\u306f\\n\\u3082\\u3063\\u3068\\u5f37\\u3044\\u5974\\u304c\\n\\u5f85\\u3063\\u3066\\u308b\\u304b\\u3089\\u306a\\u2026' },\n"
    "  ];\n\n"
    "  const MOUMURI_KANSHA_TARGET = 10;\n\n"
    "  const DEEBU_HIT_TARGET = 20;",
    '4. scenes')

# 5. event functions
src = patch(src,
    "  // === END DEEBU EVENT ===",
    "  // === END DEEBU EVENT ===\n\n"
    "  // === MOUMURI EVENT / STAGE 4 ===\n"
    "  const startMoumuriEvent = () => {\n"
    "    setStoryStage(4);\n"
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
    "      storyTypewriter(MOUMURI_SCENES[0].text);\n"
    "      speakMikkabozu('\\u3082\\u3046\\u7121\\u7406\\u3060');\n"
    "    }, 5000);\n"
    "  };\n\n"
    "  const openMoumuriBattle = () => {\n"
    "    playTapSound();\n"
    "    setMoumuriBO(true);\n"
    "    setMoumuriPhase(moumuriZenDone && moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? 'done' : 'menu');\n"
    "  };\n\n"
    "  const triggerMoumuriDefeat = async () => {\n"
    "    setStoryStage(4);\n"
    "    setMoumuriActive(false); setMoumuriBO(false);\n"
    "    try { await AsyncStorage.setItem(MOUMURI_ACTIVE_KEY, 'false'); } catch(e) {}\n"
    "    setStoryActive(true);\n"
    "    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();\n"
    "    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    speakSamurai('\\u898b\\u4e8b\\u3060'); samuraiSpeak('\\u898b\\u4e8b\\u3060');\n"
    "    await addXpWithLevelCheck(50);\n"
    "    setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('\\u611f\\u8b1d\\u3067\\u304d\\u308b\\u306e\\u304b\\u3088'); }, 1500);\n"
    "  };\n\n"
    "  const moumuriSubmitZen = () => {\n"
    "    if (!moumuriZenText.trim()) return;\n"
    "    playTapSound();\n"
    "    setMoumuriZenDone(true);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    if (moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET) { setMoumuriPhase('done'); }\n"
    "    else { setMoumuriPhase('menu'); showSaveSuccess('\\u4e00\\u65e5\\u4e00\\u5584\\u9054\\u6210\\uff01\\u3042\\u3068\\u306f\\u611f\\u8b1d\\u3060\\uff01'); }\n"
    "  };\n\n"
    "  const moumuriAddKansha = () => {\n"
    "    if (!moumuriKanshaInput.trim()) return;\n"
    "    const next = [...moumuriKanshaList, moumuriKanshaInput.trim()];\n"
    "    setMoumuriKanshaList(next);\n"
    "    setMoumuriKanshaInput('');\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}\n"
    "    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}\n"
    "    setMoumuriFlash(true); setTimeout(() => setMoumuriFlash(false), 150);\n"
    "    Animated.sequence([\n"
    "      Animated.timing(moumuriShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),\n"
    "      Animated.timing(moumuriShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),\n"
    "      Animated.timing(moumuriShakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),\n"
    "      Animated.timing(moumuriShakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),\n"
    "      Animated.timing(moumuriShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),\n"
    "    ]).start();\n"
    "    if (next.length >= MOUMURI_KANSHA_TARGET) {\n"
    "      if (moumuriZenDone) { setTimeout(() => setMoumuriPhase('done'), 800); }\n"
    "      else { setTimeout(() => { setMoumuriPhase('menu'); showSaveSuccess('\\u611f\\u8b1d10\\u500b\\u9054\\u6210\\uff01\\u3042\\u3068\\u306f\\u4e00\\u65e5\\u4e00\\u5584\\uff01'); }, 800); }\n"
    "    }\n"
    "  };\n"
    "  // === END MOUMURI EVENT ===",
    '5. functions')

# 6a. advanceScene
src = patch(src,
    "    const scenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '6a. advanceScene')

# 6b. advanceScene brief
src = patch(src,
    "    if (storyStage === 3 && next === 4) { setStoryPhase('missionBrief'); return; }",
    "    if (storyStage === 3 && next === 4) { setStoryPhase('missionBrief'); return; }\n"
    "    if (storyStage === 4 && next === 4) { setStoryPhase('missionBrief'); return; }",
    '6b. advanceScene brief')

# 7. advanceVictoryScene
src = patch(src,
    "    const scenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '7. advanceVictoryScene')

# 8. completeStoryEvent
src = patch(src,
    "    if (storyStage === 3) {\n"
    "      try { await AsyncStorage.setItem(DEEBU_EVENT_KEY, 'true'); } catch(e) {}\n"
    "      setDeebuEventDone(true);\n"
    "    } else if (storyStage === 2) {",
    "    if (storyStage === 4) {\n"
    "      try { await AsyncStorage.setItem(MOUMURI_EVENT_KEY, 'true'); } catch(e) {}\n"
    "      setMoumuriEventDone(true);\n"
    "    } else if (storyStage === 3) {\n"
    "      try { await AsyncStorage.setItem(DEEBU_EVENT_KEY, 'true'); } catch(e) {}\n"
    "      setDeebuEventDone(true);\n"
    "    } else if (storyStage === 2) {",
    '8. completeStoryEvent')

# 9. init
src = patch(src,
    "      AsyncStorage.getItem(DEEBU_ACTIVE_KEY).then(v => { if (v === 'true') setDeebuActive(true); }).catch(e => {});",
    "      AsyncStorage.getItem(DEEBU_ACTIVE_KEY).then(v => { if (v === 'true') setDeebuActive(true); }).catch(e => {});\n"
    "      AsyncStorage.getItem(MOUMURI_EVENT_KEY).then(v => { if (v === 'true') { setMoumuriEventDone(true); } }).catch(e => {});\n"
    "      AsyncStorage.getItem(MOUMURI_ACTIVE_KEY).then(v => { if (v === 'true') setMoumuriActive(true); }).catch(e => {});",
    '9. init')

# 10. stage map cleared
src = patch(src,
    "{ id: 4, name: '\u30e2\u30a6\u30e0\u30ea', icon: NODE_BRAIN, cleared: false, x: 0.35, y: 0.34 },",
    "{ id: 4, name: '\u30e2\u30a6\u30e0\u30ea', icon: NODE_BRAIN, cleared: moumuriEventDone, x: 0.35, y: 0.34 },",
    '10. map cleared')

# 11. stage map onPress
src = patch(src,
    "else if (isNext && stage.id === 3) { startDeebuEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    "else if (isNext && stage.id === 3) { startDeebuEvent(); } else if (stage.cleared && stage.id === 4) { startMoumuriEvent(); } else if (isNext && stage.id === 4) { startMoumuriEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    '11. map onPress')

# 12. story images
src = patch(src,
    "    const currentScenes = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const currentScenes = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '12a. story scenes')

src = patch(src,
    "    const sceneImg = storyStage === 3\n"
    "      ? (currentScene.img === 2 ? DEEBU_SCENE2_IMG : DEEBU_SCENE1_IMG)\n"
    "      : storyStage === 2",
    "    const sceneImg = storyStage === 4\n"
    "      ? (currentScene.img === 2 ? MOUMURI_SCENE2_IMG : MOUMURI_SCENE1_IMG)\n"
    "      : storyStage === 3\n"
    "      ? (currentScene.img === 2 ? DEEBU_SCENE2_IMG : DEEBU_SCENE1_IMG)\n"
    "      : storyStage === 2",
    '12b. story images')

# 13. missionBrief
src = patch(src,
    "          {storyPhase === 'missionBrief' && storyStage === 3 && (",
    "          {storyPhase === 'missionBrief' && storyStage === 4 && (\n"
    "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>\n"
    "              <Image source={YOKAI_IMAGES.moumuri} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }} resizeMode=\"contain\" />\n"
    "              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\\u30e2\\u30a6\\u30e0\\u30ea'}</Text>\n"
    "              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\\u8a0e\\u4f10\\u30df\\u30c3\\u30b7\\u30e7\\u30f3'}</Text>\n"
    "              <View style={{ backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 20, width: '100%', marginBottom: 12 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\\u2694\\uFE0F \\u4e00\\u65e5\\u4e00\\u5584\\u3092\\u8a18\\u9332\\u305b\\u3088'}</Text>\n"
    "              </View>\n"
    "              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 }}>\n"
    "                <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\\u{1f64f} \\u611f\\u8b1d\\u309210\\u500b\\u66f8\\u3051'}</Text>\n"
    "              </View>\n"
    "              <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 24 }}>{'\\u30e2\\u30a6\\u30e0\\u30ea\\u3092\\u30bf\\u30c3\\u30d7\\u3057\\u3066\\u6311\\u6226\\u958b\\u59cb'}</Text>\n"
    "              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setMoumuriActive(true); setMoumuriZenText(''); setMoumuriZenDone(false); setMoumuriKanshaList([]); setMoumuriKanshaInput(''); try { await AsyncStorage.setItem(MOUMURI_ACTIVE_KEY, 'true'); } catch(e) {} }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\\u4e86\\u89e3'}</Text>\n"
    "              </TouchableOpacity>\n"
    "            </View>\n"
    "          )}\n\n"
    "          {storyPhase === 'missionBrief' && storyStage === 3 && (",
    '13. missionBrief')

# 14. defeat video
src = patch(src,
    "<Video source={storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    "<Video source={storyStage === 4 ? MOUMURI_DEFEAT_VIDEO : storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    '14. defeat video')

# 15. defeat callback
src = patch(src,
    "const sc = storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "const sc = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '15. defeat callback')

# 16. victory image
src = patch(src,
    "<ImageBackground source={storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    "<ImageBackground source={storyStage === 4 ? MOUMURI_SCENE2_IMG : storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    '16. victory image')

# 17a. clear stage
src = patch(src,
    "{storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    "{storyStage === 4 ? 'STAGE 4 CLEAR' : storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    '17a. clear stage')

# 17b. clear name
src = patch(src,
    "{storyStage === 3 ? '\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10' : storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    "{storyStage === 4 ? '\u30e2\u30a6\u30e0\u30ea\u3092\u8a0e\u4f10' : storyStage === 3 ? '\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10' : storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    '17b. clear name')

# 18. Floating Moumuri + Battle Modal
FLOATING_DEEBU = "      {/* Floating Deebu */}\n      {deebuActive && !storyActive && ("

FLOATING_MOUMURI_AND_DEEBU = (
    "      {/* Floating Moumuri */}\n"
    "      {moumuriActive && !storyActive && (\n"
    "        <Pressable onPress={openMoumuriBattle} style={{ position: 'absolute', bottom: 130, right: 12, zIndex: 999, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#9b59b6' }}>\n"
    "          <Image source={YOKAI_IMAGES.moumuri} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode=\"contain\" />\n"
    "          <Text style={{ color: '#c39bd3', fontSize: 10, fontWeight: '900', marginTop: 3 }}>{'\\u30e2\\u30a6\\u30e0\\u30ea'}</Text>\n"
    "          <View style={{ backgroundColor: '#9b59b6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>\n"
    "            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{'\\u6311\\u6226\\uff01'}</Text>\n"
    "          </View>\n"
    "        </Pressable>\n"
    "      )}\n\n"
    "      {/* Moumuri Battle Modal */}\n"
    "      {moumuriBO && (\n"
    "        <Modal visible={true} animationType=\"slide\" transparent={false}>\n"
    "          <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>\n"
    "            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: '#222' }}>\n"
    "              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>\n"
    "                <TouchableOpacity onPress={() => setMoumuriBO(false)}><Text style={{ color: '#888', fontSize: 14 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                <Text style={{ color: '#9b59b6', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{'\\u30e2\\u30a6\\u30e0\\u30ea\\u6226'}</Text>\n"
    "                <View style={{ width: 50 }} />\n"
    "              </View>\n"
    "            </View>\n\n"
    "            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps=\"handled\">\n"
    "              {/* Boss */}\n"
    "              <View style={{ alignItems: 'center', marginBottom: 20 }}>\n"
    "                <View style={{ alignItems: 'center', marginBottom: 8 }}>\n"
    "                  {moumuriFlash && <View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(155,89,182,0.5)', zIndex: 2 }} />}\n"
    "                  <Animated.Image source={YOKAI_IMAGES.moumuri} style={{ width: 100, height: 100, borderRadius: 50, opacity: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? 0.4 : 1, transform: [{ translateX: moumuriShakeAnim }] }} resizeMode=\"contain\" />\n"
    "                </View>\n"
    "                <Text style={{ color: '#9b59b6', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{'\\u30e2\\u30a6\\u30e0\\u30ea'}</Text>\n"
    "                <View style={{ width: '60%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 6 }}>\n"
    "                  <View style={{ width: (Math.max(0, MOUMURI_KANSHA_TARGET - moumuriKanshaList.length) / MOUMURI_KANSHA_TARGET * 100) + '%', height: 8, backgroundColor: '#9b59b6', borderRadius: 4 }} />\n"
    "                </View>\n"
    "                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{'HP ' + Math.max(0, MOUMURI_KANSHA_TARGET - moumuriKanshaList.length) + '/' + MOUMURI_KANSHA_TARGET}</Text>\n"
    "              </View>\n\n"
    "              {/* Menu */}\n"
    "              {moumuriPhase === 'menu' && (\n"
    "                <View>\n"
    "                  <Pressable onPress={() => { if (!moumuriZenDone) setMoumuriPhase('zen'); }} style={{ backgroundColor: moumuriZenDone ? 'rgba(46,204,113,0.1)' : 'rgba(218,165,32,0.1)', borderWidth: 2, borderColor: moumuriZenDone ? '#2ecc71' : '#DAA520', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                    <Text style={{ fontSize: 32, marginRight: 14 }}>{moumuriZenDone ? '\\u2714\\uFE0F' : '\\u2694\\uFE0F'}</Text>\n"
    "                    <View style={{ flex: 1 }}>\n"
    "                      <Text style={{ color: moumuriZenDone ? '#2ecc71' : '#DAA520', fontSize: 17, fontWeight: '900' }}>{moumuriZenDone ? '\\u4e00\\u65e5\\u4e00\\u5584\\u9054\\u6210\\uff01' : '\\u4e00\\u65e5\\u4e00\\u5584'}</Text>\n"
    "                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{moumuriZenDone ? moumuriZenText : '\\u4eca\\u65e5\\u306e\\u5584\\u3044\\u884c\\u3044\\u3092\\u66f8\\u3051'}</Text>\n"
    "                    </View>\n"
    "                    {!moumuriZenDone && <Text style={{ color: '#DAA520', fontSize: 20 }}>{'\\u203a'}</Text>}\n"
    "                  </Pressable>\n\n"
    "                  <Pressable onPress={() => { if (moumuriKanshaList.length < MOUMURI_KANSHA_TARGET) setMoumuriPhase('kansha'); }} style={{ backgroundColor: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? 'rgba(46,204,113,0.1)' : 'rgba(79,195,247,0.1)', borderWidth: 2, borderColor: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '#2ecc71' : '#4FC3F7', borderRadius: 16, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                    <Text style={{ fontSize: 32, marginRight: 14 }}>{moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '\\u2714\\uFE0F' : '\\u{1f64f}'}</Text>\n"
    "                    <View style={{ flex: 1 }}>\n"
    "                      <Text style={{ color: moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '#2ecc71' : '#4FC3F7', fontSize: 17, fontWeight: '900' }}>{moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET ? '\\u611f\\u8b1d10\\u500b\\u9054\\u6210\\uff01' : '\\u611f\\u8b1d\\u3092\\u66f8\\u3051'}</Text>\n"
    "                      <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>{moumuriKanshaList.length + '/' + MOUMURI_KANSHA_TARGET + ' \\u611f\\u8b1d\\u304c\\u30e2\\u30a6\\u30e0\\u30ea\\u306b\\u30c0\\u30e1\\u30fc\\u30b8'}</Text>\n"
    "                    </View>\n"
    "                    {moumuriKanshaList.length < MOUMURI_KANSHA_TARGET && <Text style={{ color: '#4FC3F7', fontSize: 20 }}>{'\\u203a'}</Text>}\n"
    "                  </Pressable>\n\n"
    "                  {moumuriZenDone && moumuriKanshaList.length >= MOUMURI_KANSHA_TARGET && (\n"
    "                    <TouchableOpacity onPress={() => triggerMoumuriDefeat()} style={{ backgroundColor: '#9b59b6', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 }}>\n"
    "                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\\u3068\\u3069\\u3081\\u3092\\u523a\\u305b\\uff01'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  )}\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Zen input */}\n"
    "              {moumuriPhase === 'zen' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 2 }}>{'\\u2694\\uFE0F \\u4e00\\u65e5\\u4e00\\u5584'}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center', lineHeight: 22 }}>{'\\u4eca\\u65e5\\u4eba\\u306b\\u3057\\u305f\\u512a\\u3057\\u3044\\u3053\\u3068\\u3001\\n\\u826f\\u3044\\u884c\\u3044\\u3092\\u66f8\\u3051\\u3002'}</Text>\n"
    "                  <TextInput\n"
    "                    style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }}\n"
    "                    placeholder={'\\u4f8b\\uff1a\\u540c\\u50da\\u306b\\u30b3\\u30fc\\u30d2\\u30fc\\u3092\\u5165\\u308c\\u305f'}\n"
    "                    placeholderTextColor=\"#555\"\n"
    "                    multiline\n"
    "                    value={moumuriZenText}\n"
    "                    onChangeText={setMoumuriZenText}\n"
    "                  />\n"
    "                  <TouchableOpacity onPress={moumuriSubmitZen} style={{ backgroundColor: moumuriZenText.trim() ? '#DAA520' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: moumuriZenText.trim() ? 1 : 0.5 }}>\n"
    "                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\\u5584\\u884c\\u3092\\u8a18\\u9332'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                  <TouchableOpacity onPress={() => setMoumuriPhase('menu')} style={{ padding: 12, marginTop: 8 }}>\n"
    "                    <Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Kansha input */}\n"
    "              {moumuriPhase === 'kansha' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8, letterSpacing: 2 }}>{'\\u{1f64f} \\u611f\\u8b1d\\u3092\\u66f8\\u3051'}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{moumuriKanshaList.length + ' / ' + MOUMURI_KANSHA_TARGET}</Text>\n"
    "                  {moumuriKanshaList.map((k, i) => (\n"
    "                    <View key={i} style={{ backgroundColor: 'rgba(79,195,247,0.08)', borderRadius: 10, padding: 12, width: '100%', marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#4FC3F7', fontSize: 14, marginRight: 8 }}>{(i + 1) + '.'}</Text>\n"
    "                      <Text style={{ color: '#ccc', fontSize: 14, flex: 1 }}>{k}</Text>\n"
    "                    </View>\n"
    "                  ))}\n"
    "                  {moumuriKanshaList.length < MOUMURI_KANSHA_TARGET && (\n"
    "                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 16 }}>\n"
    "                      <TextInput\n"
    "                        style={{ flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#333', marginRight: 8 }}\n"
    "                        placeholder={'\\u611f\\u8b1d\\u3057\\u3066\\u3044\\u308b\\u3053\\u3068\\u3092\\u66f8\\u3051'}\n"
    "                        placeholderTextColor=\"#555\"\n"
    "                        value={moumuriKanshaInput}\n"
    "                        onChangeText={setMoumuriKanshaInput}\n"
    "                        onSubmitEditing={moumuriAddKansha}\n"
    "                        returnKeyType=\"done\"\n"
    "                      />\n"
    "                      <TouchableOpacity onPress={moumuriAddKansha} style={{ backgroundColor: moumuriKanshaInput.trim() ? '#4FC3F7' : '#333', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', opacity: moumuriKanshaInput.trim() ? 1 : 0.5 }}>\n"
    "                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'+'}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    </View>\n"
    "                  )}\n"
    "                  <TouchableOpacity onPress={() => setMoumuriPhase('menu')} style={{ padding: 12, marginTop: 4 }}>\n"
    "                    <Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Done */}\n"
    "              {moumuriPhase === 'done' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 20 }}>{'\\u30df\\u30c3\\u30b7\\u30e7\\u30f3\\u5168\\u9054\\u6210\\uff01'}</Text>\n"
    "                  <TouchableOpacity onPress={() => triggerMoumuriDefeat()} style={{ backgroundColor: '#9b59b6', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 50 }}>\n"
    "                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\\u3068\\u3069\\u3081\\u3092\\u523a\\u305b\\uff01'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n"
    "            </ScrollView>\n"
    "          </View>\n"
    "        </Modal>\n"
    "      )}\n\n"
    "      {/* Floating Deebu */}\n"
    "      {deebuActive && !storyActive && ("
)

src = patch(src, FLOATING_DEEBU, FLOATING_MOUMURI_AND_DEEBU, '18. floating + battle modal')

# 19. text position for stage >= 3
src = src.replace(
    "top: storyStage === 3 ? SCREEN_H * 0.28 : SCREEN_H * 0.50, left: 55, right: 55",
    "top: storyStage >= 3 ? SCREEN_H * 0.46 : SCREEN_H * 0.50, left: storyStage >= 3 ? 70 : 55, right: storyStage >= 3 ? 70 : 55"
)
# Also handle if bubble patch was already applied
src = src.replace(
    "top: storyStage === 3 ? SCREEN_H * 0.46 : SCREEN_H * 0.50, left: storyStage === 3 ? 70 : 55, right: storyStage === 3 ? 70 : 55",
    "top: storyStage >= 3 ? SCREEN_H * 0.46 : SCREEN_H * 0.50, left: storyStage >= 3 ? 70 : 55, right: storyStage >= 3 ? 70 : 55"
)
src = src.replace(
    "top: storyStage === 3 ? SCREEN_H * 0.40 : SCREEN_H * 0.50, left: storyStage === 3 ? 70 : 55, right: storyStage === 3 ? 70 : 55",
    "top: storyStage >= 3 ? SCREEN_H * 0.46 : SCREEN_H * 0.50, left: storyStage >= 3 ? 70 : 55, right: storyStage >= 3 ? 70 : 55"
)
print('[OK]   19. text position')

# Fix font size for stage >= 3
src = src.replace("fontSize: storyStage === 3 ? 15 : 17", "fontSize: storyStage >= 3 ? 15 : 17")
src = src.replace("lineHeight: storyStage === 3 ? 24 : 28", "lineHeight: storyStage >= 3 ? 24 : 28")
# If bubble patch was not applied, add font conditional
if "fontSize: storyStage >= 3 ? 15 : 17" not in src:
    src = src.replace(
        "fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28",
        "fontSize: storyStage >= 3 ? 15 : 17, fontWeight: 'bold', textAlign: 'center', lineHeight: storyStage >= 3 ? 24 : 28",
        1
    )
print('[OK]   20. font size')

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
