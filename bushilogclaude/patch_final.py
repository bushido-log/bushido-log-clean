#!/usr/bin/env python3
"""
BUSHIDO LOG - FINAL UNIFIED PATCH
Story + Mission Select + Quiz + Tap Counter + Defeat + Stage Map
Apply on clean git App.tsx (9262 lines)

NO surrogate pairs. NO IIFE in JSX. NO patch chaining.
"""
import sys

APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    with open(APP_PATH + ".bak_final", "w", encoding="utf-8") as f:
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
                ]
                for j, al in enumerate(asset_lines):
                    lines.insert(i + 1 + j, al)
                print(f"[OK] Assets at line {i+2}")
                success += 1
                break
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 3. KEYS
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

    # Build big block line by line (avoids any string escape issues)
    bb = []
    bb.append("")
    bb.append("  // ============================================================")
    bb.append("  // === MIKKABOZU EVENT / STORY + MISSION SYSTEM ===")
    bb.append("  // ============================================================")
    bb.append("  const SCREEN_W = Dimensions.get('window').width;")
    bb.append("  const SCREEN_H = Dimensions.get('window').height;")
    bb.append("  const MISSION_TARGET = 10;")
    bb.append("  const QUIZ_TOTAL = 3;")
    bb.append("  const [mikkabozuEventDone, setMikkabozuEventDone] = useState(false);")
    bb.append("  const [innerWorldUnlocked, setInnerWorldUnlocked] = useState(false);")
    bb.append("  const [dayCount, setDayCount] = useState(0);")
    bb.append("  const [storyActive, setStoryActive] = useState(false);")
    bb.append("  const [storyPhase, setStoryPhase] = useState<'dark'|'eyes'|'scenes'|'missionSelect'|'mission'|'quiz'|'defeat'|'victory'|'clear'>('dark');")
    bb.append("  const [sceneIndex, setSceneIndex] = useState(0);")
    bb.append("  const [storyTypeText, setStoryTypeText] = useState('');")
    bb.append("  const [storyTypingDone, setStoryTypingDone] = useState(false);")
    bb.append("  const [missionCount, setMissionCount] = useState(0);")
    bb.append("  const [storyOverlayOpacity] = useState(new Animated.Value(0));")
    bb.append("  const [storyEyesOpacity] = useState(new Animated.Value(0));")
    bb.append("  const [samuraiVoice, setSamuraiVoice] = useState('');")
    bb.append("  const [selectedMission, setSelectedMission] = useState<string|null>(null);")
    bb.append("  const [quizIndex, setQuizIndex] = useState(0);")
    bb.append("  const [quizScore, setQuizScore] = useState(0);")
    bb.append("  const [quizAnswered, setQuizAnswered] = useState(false);")
    bb.append("  const [quizCorrect, setQuizCorrect] = useState(false);")
    bb.append("")
    # Scenes - use direct unicode literals (all BMP, no surrogates)
    bb.append("  const STORY_SCENES = [")
    bb.append("    { img: 1, text: '\u3088\u3046\u3053\u305d\u3002\\n\u3053\u3053\u306f\u201c\u7d9a\u304b\u306a\u304b\u3063\u305f\u5974\u3089\u201d\u304c\\n\u5c71\u307b\u3069\u6765\u308b\u5834\u6240\u3002' },")
    bb.append("    { img: 1, text: '\u3053\u3053\u3067\u306f\u306a\u3001\\n\u884c\u52d5\u3057\u305f\u3089\u3001\u6575\u304c\u6d88\u3048\u308b\u3002\\n\u305d\u308c\u3060\u3051\u3002' },")
    bb.append("    { img: 1, text: '\u4ffa\u306f\u201c\u4e09\u65e5\u574a\u4e3b\u201d\u3002\\n\u304a\u524d\u304c\u7d9a\u304b\u306a\u3044\u9650\u308a\u3001\\n\u4f55\u56de\u3067\u3082\u51fa\u3066\u304f\u308b\u3002' },")
    bb.append("    { img: 1, text: '\u8a66\u3057\u306b\u3084\u3063\u3066\u307f\u3002\\n\u9003\u3052\u5834\u306f\u306a\u3044\u3051\u3069\u3001\\n\u3084\u308b\u3053\u3068\u306f\u7c21\u5358\u3084\u3002' },")
    bb.append("    { img: 2, text: '\u2026\u2026\u3042\u3002\\n\u4eca\u306e\u306f\u3001\u52b9\u3044\u305f\u308f\u3002' },")
    bb.append("    { img: 2, text: '\u52d8\u9055\u3044\u3059\u3093\u306a\u3088\u3002\\n\u307e\u305f\u30b5\u30dc\u3063\u305f\u3089\u3001\\n\u3059\u3050\u4f1a\u3048\u308b\u304b\u3089\u3002' },")
    bb.append("  ];")
    bb.append("")
    # Missions (BMP emoji only: \u2694, \u2B50, \u2604, \u270F, \u2702, \u2753)
    bb.append("  const PHYSICAL_MISSIONS = [")
    bb.append("    { id: 'pushup', label: '\u8155\u7ACB\u3066\u3075\u305B', icon: '\u2694\uFE0F', count: MISSION_TARGET },")
    bb.append("    { id: 'squat', label: '\u30B9\u30AF\u30EF\u30C3\u30C8', icon: '\u2B50', count: MISSION_TARGET },")
    bb.append("    { id: 'situp', label: '\u8179\u7B4B', icon: '\u2604\uFE0F', count: MISSION_TARGET },")
    bb.append("  ];")
    bb.append("  const QUIZ_MISSIONS = [")
    bb.append("    { id: 'english', label: '\u82F1\u5358\u8A9E\u30AF\u30A4\u30BA', icon: 'EN' },")
    bb.append("    { id: 'kotowaza', label: '\u3053\u3068\u308F\u3056\u30AF\u30A4\u30BA', icon: '\u2702\uFE0F' },")
    bb.append("    { id: 'trivia', label: '\u96D1\u5B66\u30AF\u30A4\u30BA', icon: '\u2753' },")
    bb.append("  ];")
    bb.append("")
    # Quiz data
    bb.append("  const QUIZ_DATA: { [key: string]: { q: string; choices: string[]; answer: number }[] } = {")
    bb.append("    english: [")
    bb.append('      { q: \'"apple" \u306E\u610F\u5473\u306F\uFF1F\', choices: [\'\u308A\u3093\u3054\', \'\u307F\u304B\u3093\', \'\u3076\u3069\u3046\', \'\u3082\u3082\'], answer: 0 },')
    bb.append('      { q: \'"strong" \u306E\u610F\u5473\u306F\uFF1F\', choices: [\'\u5F31\u3044\', \'\u5F37\u3044\', \'\u65E9\u3044\', \'\u9045\u3044\'], answer: 1 },')
    bb.append('      { q: \'"continue" \u306E\u610F\u5473\u306F\uFF1F\', choices: [\'\u6B62\u3081\u308B\', \'\u59CB\u3081\u308B\', \'\u7D9A\u3051\u308B\', \'\u7D42\u308F\u308B\'], answer: 2 },')
    bb.append("    ],")
    bb.append("    kotowaza: [")
    bb.append("      { q: '\u300C\u77F3\u306E\u4E0A\u306B\u3082___\u300D', choices: ['\u4E09\u5E74', '\u4E94\u5E74', '\u5341\u5E74', '\u767E\u5E74'], answer: 0 },")
    bb.append("      { q: '\u300C\u7D99\u7D9A\u306F___\u306A\u308A\u300D', choices: ['\u91D1', '\u529B', '\u5922', '\u6280'], answer: 1 },")
    bb.append("      { q: '\u300C\u5343\u91CC\u306E\u9053\u3082___\u304B\u3089\u300D', choices: ['\u4E09\u6B69', '\u767E\u6B69', '\u4E00\u6B69', '\u5341\u6B69'], answer: 2 },")
    bb.append("    ],")
    bb.append("    trivia: [")
    bb.append("      { q: '\u4EBA\u9593\u306E\u9AA8\u306E\u6570\u306F\u7D04\u4F55\u672C\uFF1F', choices: ['106\u672C', '206\u672C', '306\u672C', '406\u672C'], answer: 1 },")
    bb.append("      { q: '\u65E5\u672C\u3067\u4E00\u756A\u9AD8\u3044\u5C71\u306F\uFF1F', choices: ['\u5BCC\u58EB\u5C71', '\u5317\u5CB3', '\u69D8\u304C\u5CB3', '\u7ACB\u5C71'], answer: 0 },")
    bb.append("      { q: '\u592A\u967D\u7CFB\u3067\u4E00\u756A\u5927\u304D\u3044\u60D1\u661F\u306F\uFF1F', choices: ['\u571F\u661F', '\u6728\u661F', '\u5929\u738B\u661F', '\u6D77\u738B\u661F'], answer: 1 },")
    bb.append("    ],")
    bb.append("  };")
    bb.append("")
    # Helper to get current quiz question
    bb.append("  const getQuizQ = () => {")
    bb.append("    const qs = QUIZ_DATA[selectedMission || 'english'] || QUIZ_DATA.english;")
    bb.append("    return qs[quizIndex] || qs[0];")
    bb.append("  };")
    bb.append("")
    # Functions
    bb.append("  const speakMikkabozu = async (text: string) => {")
    bb.append("    try {")
    bb.append("      if (!settings.autoVoice) return;")
    bb.append("      const url = `${SAMURAI_TTS_URL}?text=${encodeURIComponent(text)}`;")
    bb.append("      const { sound } = await Audio.Sound.createAsync({ uri: url });")
    bb.append("      await sound.setVolumeAsync(MASTER_VOLUME);")
    bb.append("      await sound.setRateAsync(1.8, false);")
    bb.append("      await sound.playAsync();")
    bb.append("    } catch(e) { console.log('mikkabozu voice error', e); }")
    bb.append("  };")
    bb.append("")
    bb.append("  const storyTypewriter = (text: string, onDone?: () => void) => {")
    bb.append("    let i = 0;")
    bb.append("    setStoryTypeText('');")
    bb.append("    setStoryTypingDone(false);")
    bb.append("    const interval = setInterval(() => {")
    bb.append("      i++;")
    bb.append("      setStoryTypeText(text.substring(0, i));")
    bb.append("      if (i >= text.length) {")
    bb.append("        clearInterval(interval);")
    bb.append("        setStoryTypingDone(true);")
    bb.append("        if (onDone) onDone();")
    bb.append("      }")
    bb.append("    }, 80);")
    bb.append("  };")
    bb.append("")
    bb.append("  const samuraiSpeak = (text: string) => {")
    bb.append("    let i = 0;")
    bb.append("    setSamuraiVoice('');")
    bb.append("    const interval = setInterval(() => {")
    bb.append("      i++;")
    bb.append("      setSamuraiVoice(text.substring(0, i));")
    bb.append("      if (i >= text.length) clearInterval(interval);")
    bb.append("    }, 100);")
    bb.append("  };")
    bb.append("")
    bb.append("  const checkMikkabozuEvent = async () => {")
    bb.append("    try {")
    bb.append("      const done = await AsyncStorage.getItem(MIKKABOZU_EVENT_KEY);")
    bb.append("      if (done === 'true') { setMikkabozuEventDone(true); setInnerWorldUnlocked(true); return; }")
    bb.append("      const today = new Date().toISOString().split('T')[0];")
    bb.append("      const firstOpen = await AsyncStorage.getItem(FIRST_OPEN_DATE_KEY);")
    bb.append("      if (!firstOpen) {")
    bb.append("        await AsyncStorage.setItem(FIRST_OPEN_DATE_KEY, today);")
    bb.append("        await AsyncStorage.setItem(MIKKABOZU_DAY_KEY, '1');")
    bb.append("        await AsyncStorage.setItem('last_open_date', today);")
    bb.append("        setDayCount(1); return;")
    bb.append("      }")
    bb.append("      const storedCount = await AsyncStorage.getItem(MIKKABOZU_DAY_KEY);")
    bb.append("      let count = parseInt(storedCount || '1', 10);")
    bb.append("      const lastDay = await AsyncStorage.getItem('last_open_date');")
    bb.append("      if (lastDay !== today) {")
    bb.append("        count += 1;")
    bb.append("        await AsyncStorage.setItem(MIKKABOZU_DAY_KEY, String(count));")
    bb.append("        await AsyncStorage.setItem('last_open_date', today);")
    bb.append("      }")
    bb.append("      setDayCount(count);")
    bb.append("      if (count >= 3) { setTimeout(() => startStoryEvent(), 1000); }")
    bb.append("    } catch (e) { console.log('Mikkabozu check error:', e); }")
    bb.append("  };")
    bb.append("")
    bb.append("  const startStoryEvent = () => {")
    bb.append("    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);")
    bb.append("    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();")
    bb.append("    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}")
    bb.append("    setTimeout(() => {")
    bb.append("      setStoryPhase('eyes');")
    bb.append("      Animated.timing(storyEyesOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();")
    bb.append("    }, 2000);")
    bb.append("    setTimeout(() => {")
    bb.append("      storyEyesOpacity.setValue(0); setStoryPhase('scenes');")
    bb.append("      storyTypewriter(STORY_SCENES[0].text);")
    bb.append("      speakMikkabozu('\u3069\u3046\u305b\u4e09\u65e5\u3067\u7d42\u308f\u308a\u3067\u3057\u3087');")
    bb.append("    }, 5000);")
    bb.append("  };")
    bb.append("")
    bb.append("  const advanceScene = () => {")
    bb.append("    if (!storyTypingDone) { setStoryTypeText(STORY_SCENES[sceneIndex].text); setStoryTypingDone(true); return; }")
    bb.append("    const next = sceneIndex + 1;")
    bb.append("    if (next === 4) { setStoryPhase('missionSelect'); setSelectedMission(null); samuraiSpeak('\u3069\u3046\u6311\u3080\uFF1F'); return; }")
    bb.append("    if (next >= STORY_SCENES.length) { setStoryPhase('clear'); return; }")
    bb.append("    setSceneIndex(next); setSamuraiVoice(''); storyTypewriter(STORY_SCENES[next].text);")
    bb.append("  };")
    bb.append("")
    bb.append("  const selectMission = (missionId: string) => {")
    bb.append("    setSelectedMission(missionId);")
    bb.append("    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}")
    bb.append("    if (['pushup','squat','situp'].includes(missionId)) {")
    bb.append("      setMissionCount(0); setStoryPhase('mission');")
    bb.append("      const label = PHYSICAL_MISSIONS.find(m => m.id === missionId)?.label || '';")
    bb.append("      samuraiSpeak(label + '\u3001\u3084\u308C\u3002');")
    bb.append("    } else {")
    bb.append("      setQuizIndex(0); setQuizScore(0); setQuizAnswered(false); setQuizCorrect(false);")
    bb.append("      setStoryPhase('quiz'); samuraiSpeak('\u982D\u3092\u4F7F\u3048\u3002');")
    bb.append("    }")
    bb.append("  };")
    bb.append("")
    bb.append("  const onMissionComplete = async () => {")
    bb.append("    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}")
    bb.append("    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}")
    bb.append("    speakSamurai('\u898B\u4E8B\u3060'); samuraiSpeak('\u898B\u4E8B\u3060');")
    bb.append("    await addXpWithLevelCheck(50);")
    bb.append("    setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('\u8CA0\u3051\u305F\u304F\u3084\u3057\u3044\u3088'); }, 1500);")
    bb.append("  };")
    bb.append("")
    bb.append("  const countMissionTap = async () => {")
    bb.append("    const next = missionCount + 1; setMissionCount(next);")
    bb.append("    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}")
    bb.append("    if (next >= MISSION_TARGET) { await onMissionComplete(); }")
    bb.append("    else { try { const { sound } = await Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {} }")
    bb.append("  };")
    bb.append("")
    bb.append("  const answerQuiz = (choiceIndex: number) => {")
    bb.append("    if (quizAnswered) return;")
    bb.append("    setQuizAnswered(true);")
    bb.append("    const q = getQuizQ();")
    bb.append("    const correct = q.answer === choiceIndex;")
    bb.append("    setQuizCorrect(correct);")
    bb.append("    if (correct) { setQuizScore(quizScore + 1); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {} try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {} }")
    bb.append("    else { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch(e) {} }")
    bb.append("    setTimeout(() => { if (quizIndex + 1 >= QUIZ_TOTAL) { onMissionComplete(); } else { setQuizIndex(quizIndex + 1); setQuizAnswered(false); setQuizCorrect(false); } }, 1200);")
    bb.append("  };")
    bb.append("")
    bb.append("  const advanceVictoryScene = () => {")
    bb.append("    if (!storyTypingDone) { setStoryTypeText(STORY_SCENES[sceneIndex].text); setStoryTypingDone(true); return; }")
    bb.append("    if (sceneIndex === 4) { setSceneIndex(5); setSamuraiVoice(''); storyTypewriter(STORY_SCENES[5].text); return; }")
    bb.append("    setStoryPhase('clear');")
    bb.append("  };")
    bb.append("")
    bb.append("  const completeStoryEvent = async () => {")
    bb.append("    try { await AsyncStorage.setItem(MIKKABOZU_EVENT_KEY, 'true'); } catch(e) {}")
    bb.append("    setMikkabozuEventDone(true); setInnerWorldUnlocked(true); setStoryActive(false);")
    bb.append("    setStoryPhase('dark'); storyOverlayOpacity.setValue(0); storyEyesOpacity.setValue(0);")
    bb.append("    setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice(''); setMissionCount(0);")
    bb.append("  };")
    bb.append("  // === END MIKKABOZU EVENT ===")

    big_block = '\n'.join(bb)
    lines.insert(tut_line + 1, big_block)
    print(f"[OK] States + Functions at line {tut_line+1}")
    success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 6. MOUNT CALL
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
    # 7. STORY OVERLAY (all phases)
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

    ov = []
    ov.append("  // === Story Overlay ===")
    ov.append("  if (storyActive) {")
    ov.append("    const currentScene = STORY_SCENES[sceneIndex] || STORY_SCENES[0];")
    ov.append("    const sceneImg = currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG;")
    ov.append("    const quizQ = getQuizQ();")
    ov.append("    return (")
    ov.append("      <View style={{ flex: 1, backgroundColor: '#000' }}>")
    ov.append("        <Animated.View style={{ flex: 1, opacity: storyOverlayOpacity }}>")
    ov.append("")
    # Dark
    ov.append("          {storyPhase === 'dark' && (<View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#555', fontSize: 14 }}>{'\u2026'}</Text></View>)}")
    ov.append("")
    # Eyes
    ov.append("          {storyPhase === 'eyes' && (<View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}><Animated.View style={{ opacity: storyEyesOpacity }}><Image source={MIKKABOZU_EYES} style={{ width: 200, height: 200, resizeMode: 'contain' }} /></Animated.View></View>)}")
    ov.append("")
    # Scenes
    ov.append("          {storyPhase === 'scenes' && (")
    ov.append("            <TouchableOpacity activeOpacity={1} onPress={advanceScene} style={{ flex: 1 }}>")
    ov.append('              <ImageBackground source={sceneImg} style={{ flex: 1 }} resizeMode="cover">')
    ov.append("                <View style={{ position: 'absolute', top: SCREEN_H * 0.50, left: 55, right: 55, justifyContent: 'center', alignItems: 'center' }}>")
    ov.append("                  <Text style={{ color: '#333', fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1 }}>{storyTypeText}</Text>")
    ov.append("                </View>")
    ov.append("                {storyTypingDone && (<View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'\u30BF\u30C3\u30D7\u3057\u3066\u6B21\u3078'}</Text></View>)}")
    ov.append("              </ImageBackground>")
    ov.append("            </TouchableOpacity>")
    ov.append("          )}")
    ov.append("")
    # Mission Select
    ov.append("          {storyPhase === 'missionSelect' && (")
    ov.append("            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>")
    ov.append("              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4E09\u65E5\u574A\u4E3B'}</Text>")
    ov.append("              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u30DF\u30C3\u30B7\u30E7\u30F3\u3092\u9078\u3079'}</Text>")
    ov.append("              <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 12, alignSelf: 'flex-start' }}>{'\u2694\uFE0F \u4F53\u3092\u52D5\u304B\u3059'}</Text>")
    ov.append("              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>")
    ov.append("                {PHYSICAL_MISSIONS.map((m) => (<TouchableOpacity key={m.id} onPress={() => selectMission(m.id)} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}><Text style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</Text><Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{m.label}</Text><Text style={{ color: '#DAA520', fontSize: 11, marginTop: 4 }}>{m.count + '\u56DE'}</Text></TouchableOpacity>))}")
    ov.append("              </View>")
    ov.append("              <Text style={{ color: '#4FC3F7', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 12, alignSelf: 'flex-start' }}>{'\u270F\uFE0F \u982D\u3092\u4F7F\u3046'}</Text>")
    ov.append("              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>")
    ov.append("                {QUIZ_MISSIONS.map((m) => (<TouchableOpacity key={m.id} onPress={() => selectMission(m.id)} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}><Text style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</Text><Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{m.label}</Text><Text style={{ color: '#4FC3F7', fontSize: 11, marginTop: 4 }}>{QUIZ_TOTAL + '\u554F'}</Text></TouchableOpacity>))}")
    ov.append("              </View>")
    ov.append("              {samuraiVoice.length > 0 && (<View style={{ position: 'absolute', bottom: 80, left: 30, right: 30 }}><Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 }}>{samuraiVoice}</Text></View>)}")
    ov.append("            </View>")
    ov.append("          )}")
    ov.append("")
    # Physical mission
    ov.append("          {storyPhase === 'mission' && (")
    ov.append("            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>")
    ov.append("              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4E09\u65E5\u574A\u4E3B'}</Text>")
    ov.append("              <Text style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{'\u2694\uFE0F ' + (PHYSICAL_MISSIONS.find(m => m.id === selectedMission)?.label || '') + ' ' + MISSION_TARGET + '\u56DE\u3067\u8A0E\u4F10\uFF01'}</Text>")
    ov.append("              <Text style={{ color: '#fff', fontSize: 72, fontWeight: '900', marginBottom: 6 }}>{missionCount}</Text>")
    ov.append("              <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{missionCount + ' / ' + MISSION_TARGET}</Text>")
    ov.append("              {missionCount < MISSION_TARGET ? (")
    ov.append("                <TouchableOpacity onPress={countMissionTap} style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>")
    ov.append("                  <Text style={{ color: '#DAA520', fontSize: 24, fontWeight: '900' }}>{'\u62BC\u305B'}</Text>")
    ov.append("                </TouchableOpacity>")
    ov.append("              ) : (<Text style={{ color: '#DAA520', fontSize: 22, fontWeight: '900', letterSpacing: 3 }}>{'\u8A0E\u4F10\u5B8C\u4E86'}</Text>)}")
    ov.append("              {samuraiVoice.length > 0 && (<View style={{ position: 'absolute', bottom: 100, left: 30, right: 30 }}><Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 }}>{samuraiVoice}</Text></View>)}")
    ov.append("            </View>")
    ov.append("          )}")
    ov.append("")
    # Quiz
    ov.append("          {storyPhase === 'quiz' && (")
    ov.append("            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>")
    ov.append("              <Text style={{ color: '#4FC3F7', fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>{QUIZ_MISSIONS.find(m => m.id === (selectedMission || 'english'))?.label || ''}</Text>")
    ov.append("              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'Q' + (quizIndex + 1) + ' / ' + QUIZ_TOTAL}</Text>")
    ov.append("              <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>")
    ov.append("                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{quizQ.q}</Text>")
    ov.append("              </View>")
    ov.append("              {quizQ.choices.map((choice: string, idx: number) => (")
    ov.append("                <TouchableOpacity key={idx} onPress={() => answerQuiz(idx)} disabled={quizAnswered} style={{ backgroundColor: quizAnswered && idx === quizQ.answer ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: quizAnswered && idx === quizQ.answer ? '#2ecc71' : 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 10, width: '100%' }}>")
    ov.append("                  <Text style={{ color: quizAnswered && idx === quizQ.answer ? '#2ecc71' : '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>{choice}</Text>")
    ov.append("                </TouchableOpacity>")
    ov.append("              ))}")
    ov.append("              {quizAnswered && (<Text style={{ color: quizCorrect ? '#2ecc71' : '#e74c3c', fontSize: 22, fontWeight: '900', marginTop: 10, letterSpacing: 2 }}>{quizCorrect ? '\u2B55 \u6B63\u89E3\uFF01' : '\u274C \u4E0D\u6B63\u89E3'}</Text>)}")
    ov.append("              <View style={{ position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'center' }}>")
    ov.append("                {Array.from({ length: QUIZ_TOTAL }).map((_, i) => (<View key={i} style={{ width: 12, height: 12, borderRadius: 6, marginHorizontal: 4, backgroundColor: i < quizIndex ? '#2ecc71' : i === quizIndex ? '#4FC3F7' : '#333' }} />))}")
    ov.append("              </View>")
    ov.append("            </View>")
    ov.append("          )}")
    ov.append("")
    # Defeat
    ov.append("          {storyPhase === 'defeat' && (")
    ov.append("            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>")
    ov.append("              <Video source={MIKKABOZU_DEFEAT_VIDEO} style={{ width: 300, height: 300 }} resizeMode={ResizeMode.CONTAIN} shouldPlay isLooping={false} onPlaybackStatusUpdate={(status: any) => { if (status.didJustFinish) { setSceneIndex(4); setSamuraiVoice(''); setStoryPhase('victory'); samuraiSpeak('\u2026\u2026\u898B\u4E8B\u3060\u3002'); storyTypewriter(STORY_SCENES[4].text); } }} />")
    ov.append("              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', marginTop: 16, letterSpacing: 3 }}>{'\u8A0E\u4F10\uFF01'}</Text>")
    ov.append("            </View>")
    ov.append("          )}")
    ov.append("")
    # Victory
    ov.append("          {storyPhase === 'victory' && (")
    ov.append("            <TouchableOpacity activeOpacity={1} onPress={advanceVictoryScene} style={{ flex: 1 }}>")
    ov.append('              <ImageBackground source={STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode="cover">')
    ov.append("                <View style={{ position: 'absolute', top: SCREEN_H * 0.50, left: 55, right: 55, justifyContent: 'center', alignItems: 'center' }}>")
    ov.append("                  <Text style={{ color: '#333', fontSize: 17, fontWeight: 'bold', textAlign: 'center', lineHeight: 28, letterSpacing: 1 }}>{storyTypeText}</Text>")
    ov.append("                </View>")
    ov.append("                {samuraiVoice.length > 0 && (<View style={{ position: 'absolute', bottom: 120, left: 30, right: 30 }}><Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2 }}>{samuraiVoice}</Text></View>)}")
    ov.append("                {storyTypingDone && (<View style={{ position: 'absolute', bottom: 60, width: '100%', alignItems: 'center' }}><Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{'\u30BF\u30C3\u30D7\u3057\u3066\u6B21\u3078'}</Text></View>)}")
    ov.append("              </ImageBackground>")
    ov.append("            </TouchableOpacity>")
    ov.append("          )}")
    ov.append("")
    # Clear
    ov.append("          {storyPhase === 'clear' && (")
    ov.append("            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>")
    ov.append("              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 3, marginBottom: 8 }}>WORLD 1</Text>")
    ov.append("              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 12 }}>STAGE 1 CLEAR</Text>")
    ov.append("              <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', marginBottom: 40 }}>{'\u4E09\u65E5\u574A\u4E3B\u3092\u8A0E\u4F10'}</Text>")
    ov.append("              <Text style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>+50 XP</Text>")
    ov.append("              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>")
    ov.append("                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\u4FEE\u884C\u306E\u9593\u3078'}</Text>")
    ov.append("              </TouchableOpacity>")
    ov.append("            </View>")
    ov.append("          )}")
    ov.append("")
    ov.append("        </Animated.View>")
    ov.append("      </View>")
    ov.append("    );")
    ov.append("  }")
    ov.append("")

    overlay_code = '\n'.join(ov)
    lines.insert(insert_at, overlay_code)
    print(f"[OK] Overlay at line {insert_at}")
    success += 1
    content = '\n'.join(lines)
    lines = content.split('\n')

    # =========================================
    # 8. STAGE MAP
    # =========================================
    old_yokai = "    if (innerWorldView === 'yokaiDex') {"

    sm = []
    sm.append("    if (innerWorldView === 'stageMap') {")
    sm.append("      const W1_STAGES = [")
    sm.append("        { id: 1, name: '\u4E09\u65E5\u574A\u4E3B', icon: NODE_FIST, cleared: mikkabozuEventDone, x: 0.5, y: 0.82 },")
    sm.append("        { id: 2, name: '\u30A2\u30C8\u30C7\u30E4\u30EB', icon: NODE_KATANA, cleared: false, x: 0.3, y: 0.66 },")
    sm.append("        { id: 3, name: '\u30C7\u30FC\u30D6', icon: NODE_SCROLL, cleared: false, x: 0.6, y: 0.50 },")
    sm.append("        { id: 4, name: '\u30E2\u30A6\u30E0\u30EA', icon: NODE_BRAIN, cleared: false, x: 0.35, y: 0.34 },")
    sm.append("        { id: 5, name: '\u4E09\u65E5\u574A\u4E3BII', icon: NODE_BOSS, cleared: false, x: 0.5, y: 0.18 },")
    sm.append("      ];")
    sm.append("      return (")
    sm.append('        <ImageBackground source={WORLD1_BG} style={{ flex: 1 }} resizeMode="cover">')
    sm.append("          <Pressable onPress={() => { playTapSound(); setInnerWorldView('menu'); }} style={{ position: 'absolute', top: 54, left: 16, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>")
    sm.append("            <Text style={{ color: '#fff', fontSize: 14 }}>{'\u2190 \u623B\u308B'}</Text>")
    sm.append("          </Pressable>")
    sm.append("          <View style={{ position: 'absolute', top: 54, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>")
    sm.append("            <Text style={{ color: '#DAA520', fontSize: 13, fontWeight: '900', letterSpacing: 3, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6 }}>WORLD 1</Text>")
    sm.append("            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 6, marginTop: 2 }}>{'\u300C\u76EE\u899A\u3081\u300D'}</Text>")
    sm.append("          </View>")
    sm.append("          {W1_STAGES.map((stage) => {")
    sm.append("            const isNext = !stage.cleared && W1_STAGES.filter(s => s.id < stage.id).every(s => s.cleared);")
    sm.append("            const isLocked = !stage.cleared && !isNext;")
    sm.append("            return (")
    sm.append("              <Pressable key={stage.id} onPress={() => { playTapSound(); if (stage.cleared) showSaveSuccess('CLEAR\u6E08\u307F'); else if (isNext) showSaveSuccess('\u8FD1\u65E5\u5B9F\u88C5'); else showSaveSuccess('\u524D\u306E\u30B9\u30C6\u30FC\u30B8\u3092\u30AF\u30EA\u30A2'); }} style={{ position: 'absolute', left: SCREEN_W * stage.x - 35, top: SCREEN_H * stage.y - 35, alignItems: 'center', opacity: isLocked ? 0.4 : 1 }}>")
    sm.append("                <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#555', overflow: 'hidden', backgroundColor: '#000' }}>")
    sm.append("                  <Image source={isLocked ? NODE_LOCKED : stage.icon} style={{ width: '100%', height: '100%' }} resizeMode='contain' />")
    sm.append("                </View>")
    sm.append("                <Text style={{ color: stage.cleared ? '#DAA520' : isNext ? '#fff' : '#888', fontSize: 11, fontWeight: '900', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.9)', textShadowRadius: 4 }}>{stage.id + '. ' + stage.name}</Text>")
    sm.append("                {stage.cleared && <Text style={{ color: '#DAA520', fontSize: 9, fontWeight: 'bold' }}>{'\u2714 CLEAR'}</Text>}")
    sm.append("                {stage.id === 5 && <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', marginTop: 1 }}>BOSS</Text>}")
    sm.append("              </Pressable>")
    sm.append("            );")
    sm.append("          })}")
    sm.append("        </ImageBackground>")
    sm.append("      );")
    sm.append("    }")
    sm.append("")
    sm.append("    if (innerWorldView === 'yokaiDex') {")

    stage_map_code = '\n'.join(sm)
    if old_yokai in content:
        content = content.replace(old_yokai, stage_map_code, 1)
        print("[OK] Stage map added")
        success += 1
    lines = content.split('\n')

    # =========================================
    # 9. STAGE MAP BUTTON
    # =========================================
    old_battle = "        <Pressable\n          onPress={() => {\n            playTapSound();\n            if (!isPro && levelInfo.level < 3) {\n              showSaveSuccess('Lv.3\u300c\u8db3\u8efd\u300d\u3067\u89e3\u653e');\n              return;\n            }\n            setBattleMode('select');\n            setTab('battle');\n          }}"

    map_btn = "        <Pressable\n"
    map_btn += "          onPress={() => { playTapSound(); setInnerWorldView('stageMap'); }}\n"
    map_btn += "          style={({ pressed }) => [{ backgroundColor: pressed ? '#0a1a0a' : '#0a0a1a', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#DAA520' }]}\n"
    map_btn += "        >\n"
    map_btn += "          <View style={{ flexDirection: 'row', alignItems: 'center' }}>\n"
    map_btn += "            <Text style={{ fontSize: 28, marginRight: 14 }}>{'\u2694\uFE0F'}</Text>\n"
    map_btn += "            <View style={{ flex: 1 }}>\n"
    map_btn += "              <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900' }}>{'\u30B9\u30C6\u30FC\u30B8\u30DE\u30C3\u30D7'}</Text>\n"
    map_btn += "              <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{'World 1 \u300C\u76EE\u899A\u3081\u300D'}</Text>\n"
    map_btn += "            </View>\n"
    map_btn += "            <Text style={{ color: '#DAA520', fontSize: 18 }}>{'\u203A'}</Text>\n"
    map_btn += "          </View>\n"
    map_btn += "        </Pressable>\n\n"
    map_btn += "        <Pressable\n          onPress={() => {\n            playTapSound();\n            if (!isPro && levelInfo.level < 3) {\n              showSaveSuccess('Lv.3\u300C\u8DB3\u8EFD\u300D\u3067\u89E3\u653E');\n              return;\n            }\n            setBattleMode('select');\n            setTab('battle');\n          }}"

    if old_battle in content:
        content = content.replace(old_battle, map_btn, 1)
        print("[OK] Stage map button added")
        success += 1
    lines = content.split('\n')

    # =========================================
    # 10. GATE inner world
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

    # =========================================
    # FINAL: Verify no surrogates
    # =========================================
    try:
        content.encode('utf-8')
        print("[OK] No surrogates")
    except UnicodeEncodeError as e:
        print(f"[FIXING] Surrogates found: {e}")
        clean = []
        for ch in content:
            if 0xD800 <= ord(ch) <= 0xDFFF:
                continue
            clean.append(ch)
        content = ''.join(clean)

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n{'='*50}")
    print(f"[DONE] {success} changes applied.")
    print("Run: npx expo start -c")

if __name__ == "__main__":
    main()
