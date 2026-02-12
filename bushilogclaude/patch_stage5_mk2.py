#!/usr/bin/env python3
"""
BUSHIDO LOG - Stage 5 (Mikkabozu II) 
3-day final boss. Skip a day = reset.
Day 1: goal + alarm + training 30 + photo/reason
Day 2: focus 30s + consult + kansha 15 + zen 3
Day 3: diary + all routines + all todos + training 50
Requires: Stage 2-4 patches applied
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

# 1. keys
src = patch(src,
    "const MOUMURI_ACTIVE_KEY = 'bushido_moumuri_active';",
    "const MOUMURI_ACTIVE_KEY = 'bushido_moumuri_active';\n"
    "const MK2_EVENT_KEY = 'bushido_mk2_event_done';\n"
    "const MK2_ACTIVE_KEY = 'bushido_mk2_active';\n"
    "const MK2_PROGRESS_KEY = 'bushido_mk2_progress';",
    '1. keys')

# 2. state
src = patch(src,
    "  const [moumuriFlash, setMoumuriFlash] = useState(false);",
    "  const [moumuriFlash, setMoumuriFlash] = useState(false);\n"
    "  const [mk2EventDone, setMk2EventDone] = useState(false);\n"
    "  const [mk2Active, setMk2Active] = useState(false);\n"
    "  const [mk2BO, setMk2BO] = useState(false);\n"
    "  const [mk2Phase, setMk2Phase] = useState<string>('menu');\n"
    "  const [mk2Day, setMk2Day] = useState(1);\n"
    "  const [mk2Done, setMk2Done] = useState<string[]>([]);\n"
    "  const [mk2CM, setMk2CM] = useState('');\n"
    "  const [mk2WasReset, setMk2WasReset] = useState(false);\n"
    "  const [mk2TextVal, setMk2TextVal] = useState('');\n"
    "  const [mk2ListItems, setMk2ListItems] = useState<string[]>([]);\n"
    "  const [mk2ListInput, setMk2ListInput] = useState('');\n"
    "  const [mk2Hits, setMk2Hits] = useState(0);\n"
    "  const [mk2TT, setMk2TT] = useState<string|null>(null);\n"
    "  const [mk2PhotoUri, setMk2PhotoUri] = useState<string|null>(null);\n"
    "  const [mk2ReasonVal, setMk2ReasonVal] = useState('');\n"
    "  const [mk2FocusLeft, setMk2FocusLeft] = useState(30);\n"
    "  const mk2Shake = useRef(new Animated.Value(0)).current;\n"
    "  const [mk2Flash, setMk2Flash] = useState(false);",
    '2. state')

# 3. scenes + config data
src = patch(src,
    "  const MOUMURI_KANSHA_TARGET = 10;",
    "  const MK2_SCENES = [\n"
    "    { img: 1, text: '\\u3075\\u3063\\u2026\\u307e\\u305f\\u4f1a\\u3063\\u305f\\u306a\\u3002\\n\\u304a\\u524d\\u306f\\u307e\\u3060\\u4e09\\u65e5\\u574a\\u4e3b\\u3060\\u3002' },\n"
    "    { img: 1, text: '3\\u65e5\\u9593\\u3001\\u5168\\u529b\\u3067\\u4ffa\\u306b\\u6311\\u3081\\u3002\\n1\\u65e5\\u3067\\u3082\\u30b5\\u30dc\\u3063\\u305f\\u3089\\n\\u30ea\\u30bb\\u30c3\\u30c8\\u3060\\u3002' },\n"
    "    { img: 1, text: '\\u4eca\\u307e\\u3067\\u306e\\u6575\\u306f\\u524d\\u5ea7\\u306b\\u904e\\u304e\\u306a\\u3044\\u3002\\n\\u4ffa\\u3053\\u305d\\u304c\\u672c\\u7269\\u306e\\u58c1\\u3060\\u3002' },\n"
    "    { img: 1, text: '3\\u65e5\\u7d9a\\u3051\\u3066\\u307f\\u308d\\u3002\\n\\u4f53\\u3082\\u5fc3\\u3082\\u7fd2\\u6163\\u3082\\n\\u5168\\u3066\\u3067\\u52dd\\u3063\\u3066\\u307f\\u308d\\u3002\\n\\u3069\\u3046\\u305b\\u7121\\u7406\\u3060\\u308d\\uff1f' },\n"
    "    { img: 2, text: '\\u99ac\\u9e7f\\u306a\\u2026\\n3\\u65e5\\u7d9a\\u3051\\u3084\\u304c\\u3063\\u305f\\u2026' },\n"
    "    { img: 2, text: '\\u304f\\u305d\\u2026\\u304a\\u524d\\u306f\\u3082\\u3046\\n\\u4e09\\u65e5\\u574a\\u4e3b\\u3058\\u3083\\u306a\\u3044\\u2026' },\n"
    "  ];\n\n"
    "  const MK2_DAY1 = ['goal', 'alarm', 'training', 'photo'];\n"
    "  const MK2_DAY2 = ['focus', 'consult', 'kansha', 'zen'];\n"
    "  const MK2_DAY3 = ['diary', 'routines', 'todos', 'training3'];\n\n"
    "  const MK2_MISSIONS: { [k: string]: { icon: string; title: string; sub: string; phase: string } } = {\n"
    "    goal: { icon: '\\u{1f3af}', title: '\\u76ee\\u6a19\\u8a2d\\u5b9a', sub: '\\u4eca\\u65e5\\u306e\\u76ee\\u6a19\\u3092\\u66f8\\u3051', phase: 'mk2_text' },\n"
    "    alarm: { icon: '\\u23f0', title: '\\u65e9\\u8d77\\u304d\\u5ba3\\u8a00', sub: '\\u660e\\u65e5\\u4f55\\u6642\\u306b\\u8d77\\u304d\\u308b\\u304b\\u5ba3\\u8a00\\u3057\\u308d', phase: 'mk2_text' },\n"
    "    training: { icon: '\\u2694\\uFE0F', title: '\\u7b4b\\u30c8\\u30ec30\\u56de', sub: '\\u7b4b\\u30c8\\u30ec\\u306730\\u56de\\u30c0\\u30e1\\u30fc\\u30b8', phase: 'mk2_ts' },\n"
    "    photo: { icon: '\\u{1f4f8}', title: '\\u6b32\\u671b\\u3092\\u65ad\\u3066', sub: '\\u6211\\u6162\\u3059\\u308b\\u3082\\u306e\\u3092\\u64ae\\u3063\\u3066\\u7406\\u7531\\u3092\\u66f8\\u3051', phase: 'mk2_photo' },\n"
    "    focus: { icon: '\\u{1f9d8}', title: '\\u96c6\\u4e2d30\\u79d2', sub: '\\u96d1\\u5ff5\\u3092\\u6368\\u306630\\u79d2\\u96c6\\u4e2d\\u305b\\u3088', phase: 'mk2_focus' },\n"
    "    consult: { icon: '\\u{1f3ef}', title: '\\u4f8d\\u30ad\\u30f3\\u30b0\\u306b\\u76f8\\u8ac7', sub: '\\u60a9\\u307f\\u3092\\u4f8d\\u306b\\u6253\\u3061\\u660e\\u3051\\u308d', phase: 'mk2_text' },\n"
    "    kansha: { icon: '\\u{1f64f}', title: '\\u611f\\u8b1d15\\u500b', sub: '\\u611f\\u8b1d\\u304c\\u30c0\\u30e1\\u30fc\\u30b8\\u306b\\u306a\\u308b', phase: 'mk2_list' },\n"
    "    zen: { icon: '\\u2728', title: '\\u4e00\\u65e5\\u4e09\\u5584', sub: '\\u5584\\u3044\\u884c\\u3044\\u30923\\u3064\\u8a18\\u9332\\u3057\\u308d', phase: 'mk2_list' },\n"
    "    diary: { icon: '\\u{1f4d6}', title: '\\u65e5\\u8a18', sub: '\\u4eca\\u65e5\\u306e\\u632f\\u308a\\u8fd4\\u308a\\u3092\\u66f8\\u3051', phase: 'mk2_text' },\n"
    "    routines: { icon: '\\u{1f4cb}', title: '\\u30eb\\u30fc\\u30c6\\u30a3\\u30f3\\u5168\\u5b8c\\u4e86', sub: '\\u30eb\\u30fc\\u30c6\\u30a3\\u30f3\\u3092\\u5168\\u3066\\u3053\\u306a\\u305b', phase: 'mk2_check' },\n"
    "    todos: { icon: '\\u2705', title: 'TODO\\u5168\\u5b8c\\u4e86', sub: 'TODO\\u3092\\u5168\\u3066\\u5b8c\\u4e86\\u3057\\u308d', phase: 'mk2_check' },\n"
    "    training3: { icon: '\\u{1f525}', title: '\\u7b4b\\u30c8\\u30ec50\\u56de', sub: '\\u6700\\u5f8c\\u306e\\u8a66\\u7df4\\u3060', phase: 'mk2_ts' },\n"
    "  };\n\n"
    "  const MK2_TEXT_CFG: { [k: string]: { title: string; prompt: string; ph: string; btn: string } } = {\n"
    "    goal: { title: '\\u{1f3af} \\u76ee\\u6a19\\u8a2d\\u5b9a', prompt: '\\u4eca\\u65e5\\u306e\\u76ee\\u6a19\\u3092\\u66f8\\u3051', ph: '\\u4f8b\\uff1a\\u8155\\u7acb\\u3066100\\u56de\\u3067\\u304d\\u308b\\u3088\\u3046\\u306b\\u306a\\u308b', btn: '\\u76ee\\u6a19\\u3092\\u8a2d\\u5b9a' },\n"
    "    alarm: { title: '\\u23f0 \\u65e9\\u8d77\\u304d\\u5ba3\\u8a00', prompt: '\\u660e\\u65e5\\u4f55\\u6642\\u306b\\u8d77\\u304d\\u308b\\uff1f', ph: '\\u4f8b\\uff1a6:00\\u306b\\u8d77\\u304d\\u308b', btn: '\\u5ba3\\u8a00\\u3059\\u308b' },\n"
    "    consult: { title: '\\u{1f3ef} \\u4f8d\\u30ad\\u30f3\\u30b0\\u306b\\u76f8\\u8ac7', prompt: '\\u60a9\\u307f\\u3084\\u8ab2\\u984c\\u3092\\u4f8d\\u306b\\u6253\\u3061\\u660e\\u3051\\u308d', ph: '\\u4f8b\\uff1a\\u6700\\u8fd1\\u3084\\u308b\\u6c17\\u304c\\u51fa\\u306a\\u3044...', btn: '\\u76f8\\u8ac7\\u3059\\u308b' },\n"
    "    diary: { title: '\\u{1f4d6} \\u65e5\\u8a18', prompt: '\\u4eca\\u65e5\\u3092\\u632f\\u308a\\u8fd4\\u308c', ph: '\\u4eca\\u65e5\\u3042\\u3063\\u305f\\u3053\\u3068\\u3001\\u611f\\u3058\\u305f\\u3053\\u3068\\u3001\\u5b66\\u3093\\u3060\\u3053\\u3068...', btn: '\\u8a18\\u9332\\u3059\\u308b' },\n"
    "  };\n\n"
    "  const MK2_LIST_CFG: { [k: string]: { title: string; target: number; ph: string } } = {\n"
    "    kansha: { title: '\\u{1f64f} \\u611f\\u8b1d\\u3092\\u66f8\\u3051', target: 15, ph: '\\u611f\\u8b1d\\u3057\\u3066\\u3044\\u308b\\u3053\\u3068\\u3092\\u66f8\\u3051' },\n"
    "    zen: { title: '\\u2728 \\u4e00\\u65e5\\u4e09\\u5584', target: 3, ph: '\\u5584\\u3044\\u884c\\u3044\\u3092\\u66f8\\u3051' },\n"
    "  };\n\n"
    "  const MOUMURI_KANSHA_TARGET = 10;",
    '3. data')

# 4. event functions
src = patch(src,
    "  // === END MOUMURI EVENT ===",
    "  // === END MOUMURI EVENT ===\n\n"
    "  // === MK2 EVENT / STAGE 5 ===\n"
    "  const mk2LocalDate = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };\n"
    "  const mk2Yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };\n\n"
    "  const startMk2Event = () => {\n"
    "    setStoryStage(5);\n"
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
    "      storyTypewriter(MK2_SCENES[0].text);\n"
    "      speakMikkabozu('\\u307e\\u305f\\u4f1a\\u3063\\u305f\\u306a');\n"
    "    }, 5000);\n"
    "  };\n\n"
    "  const openMk2Battle = async () => {\n"
    "    playTapSound();\n"
    "    let raw = null; try { raw = await AsyncStorage.getItem(MK2_PROGRESS_KEY); } catch(e) {}\n"
    "    const prog = raw ? JSON.parse(raw) : { day1: null, day2: null, day3: null };\n"
    "    const today = mk2LocalDate(); const yday = mk2Yesterday();\n"
    "    setMk2Done([]); setMk2TextVal(''); setMk2ListItems([]); setMk2ListInput(''); setMk2Hits(0); setMk2PhotoUri(null); setMk2ReasonVal(''); setMk2FocusLeft(30); setMk2WasReset(false);\n"
    "    if (prog.day3) { setMk2Day(3); setMk2Phase('done'); }\n"
    "    else if (prog.day2) {\n"
    "      if (prog.day2 === today) { setMk2Day(2); setMk2Phase('day_clear'); }\n"
    "      else if (prog.day2 === yday) { setMk2Day(3); setMk2Phase('menu'); }\n"
    "      else { await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify({day1:null,day2:null,day3:null})); setMk2Day(1); setMk2Phase('menu'); setMk2WasReset(true); }\n"
    "    } else if (prog.day1) {\n"
    "      if (prog.day1 === today) { setMk2Day(1); setMk2Phase('day_clear'); }\n"
    "      else if (prog.day1 === yday) { setMk2Day(2); setMk2Phase('menu'); }\n"
    "      else { await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify({day1:null,day2:null,day3:null})); setMk2Day(1); setMk2Phase('menu'); setMk2WasReset(true); }\n"
    "    } else { setMk2Day(1); setMk2Phase('menu'); }\n"
    "    setMk2BO(true);\n"
    "  };\n\n"
    "  const mk2CompleteDay = async () => {\n"
    "    const today = mk2LocalDate();\n"
    "    let raw = null; try { raw = await AsyncStorage.getItem(MK2_PROGRESS_KEY); } catch(e) {}\n"
    "    const prog = raw ? JSON.parse(raw) : { day1: null, day2: null, day3: null };\n"
    "    if (mk2Day === 1) prog.day1 = today;\n"
    "    else if (mk2Day === 2) prog.day2 = today;\n"
    "    else if (mk2Day === 3) prog.day3 = today;\n"
    "    try { await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify(prog)); } catch(e) {}\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    if (mk2Day === 3) { triggerMk2Defeat(); }\n"
    "    else { setMk2Phase('day_clear'); }\n"
    "  };\n\n"
    "  const triggerMk2Defeat = async () => {\n"
    "    setStoryStage(5); setMk2Active(false); setMk2BO(false);\n"
    "    try { await AsyncStorage.setItem(MK2_ACTIVE_KEY, 'false'); } catch(e) {}\n"
    "    setStoryActive(true);\n"
    "    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();\n"
    "    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    speakSamurai('\\u898b\\u4e8b\\u3060'); samuraiSpeak('\\u898b\\u4e8b\\u3060');\n"
    "    await addXpWithLevelCheck(100);\n"
    "    setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('3\\u65e5\\u7d9a\\u3051\\u3084\\u304c\\u3063\\u305f'); }, 1500);\n"
    "  };\n\n"
    "  const mk2SubmitText = () => {\n"
    "    if (!mk2TextVal.trim()) return;\n"
    "    playTapSound();\n"
    "    setMk2Done(prev => [...prev, mk2CM]);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    setMk2TextVal(''); setMk2Phase('menu');\n"
    "  };\n\n"
    "  const mk2AddListItem = () => {\n"
    "    if (!mk2ListInput.trim()) return;\n"
    "    const next = [...mk2ListItems, mk2ListInput.trim()];\n"
    "    setMk2ListItems(next); setMk2ListInput('');\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}\n"
    "    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}\n"
    "    mk2DamageEffect();\n"
    "    const target = MK2_LIST_CFG[mk2CM]?.target || 10;\n"
    "    if (next.length >= target) {\n"
    "      setMk2Done(prev => [...prev, mk2CM]);\n"
    "      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "      setTimeout(() => { setMk2Phase('menu'); setMk2ListItems([]); }, 800);\n"
    "    }\n"
    "  };\n\n"
    "  const mk2DamageEffect = () => {\n"
    "    setMk2Flash(true); setTimeout(() => setMk2Flash(false), 150);\n"
    "    Animated.sequence([\n"
    "      Animated.timing(mk2Shake, { toValue: 15, duration: 50, useNativeDriver: true }),\n"
    "      Animated.timing(mk2Shake, { toValue: -15, duration: 50, useNativeDriver: true }),\n"
    "      Animated.timing(mk2Shake, { toValue: 10, duration: 40, useNativeDriver: true }),\n"
    "      Animated.timing(mk2Shake, { toValue: -10, duration: 40, useNativeDriver: true }),\n"
    "      Animated.timing(mk2Shake, { toValue: 0, duration: 30, useNativeDriver: true }),\n"
    "    ]).start();\n"
    "  };\n\n"
    "  const mk2TrainTap = () => {\n"
    "    const next = mk2Hits + 1; setMk2Hits(next);\n"
    "    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}\n"
    "    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}\n"
    "    mk2DamageEffect();\n"
    "    const target = mk2CM === 'training3' ? 50 : 30;\n"
    "    if (next >= target) {\n"
    "      setMk2Done(prev => [...prev, mk2CM]);\n"
    "      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "      setTimeout(() => { setMk2Phase('menu'); setMk2Hits(0); }, 800);\n"
    "    }\n"
    "  };\n\n"
    "  const mk2PickPhoto = async () => {\n"
    "    try { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 }); if (!r.canceled && r.assets?.[0]) { setMk2PhotoUri(r.assets[0].uri); setMk2Phase('mk2_reason'); } } catch(e) {}\n"
    "  };\n"
    "  const mk2TakePhoto = async () => {\n"
    "    try { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ quality: 0.7 }); if (!r.canceled && r.assets?.[0]) { setMk2PhotoUri(r.assets[0].uri); setMk2Phase('mk2_reason'); } } catch(e) {}\n"
    "  };\n"
    "  const mk2SubmitReason = () => {\n"
    "    if (!mk2ReasonVal.trim()) return; playTapSound();\n"
    "    setMk2Done(prev => [...prev, 'photo']); setMk2ReasonVal(''); setMk2Phase('menu');\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "  };\n\n"
    "  const mk2StartFocus = () => {\n"
    "    let sec = 30; setMk2FocusLeft(30);\n"
    "    const id = setInterval(() => {\n"
    "      sec--; setMk2FocusLeft(sec);\n"
    "      if (sec <= 0) {\n"
    "        clearInterval(id);\n"
    "        setMk2Done(prev => [...prev, 'focus']);\n"
    "        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "        mk2DamageEffect();\n"
    "      }\n"
    "    }, 1000);\n"
    "  };\n"
    "  // === END MK2 EVENT ===",
    '4. functions')

# 5a. advanceScene
src = patch(src,
    "    const scenes = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '5a. advanceScene')

# 5b. advanceScene brief
src = patch(src,
    "    if (storyStage === 4 && next === 4) { setStoryPhase('missionBrief'); return; }",
    "    if (storyStage === 4 && next === 4) { setStoryPhase('missionBrief'); return; }\n"
    "    if (storyStage === 5 && next === 4) { setStoryPhase('missionBrief'); return; }",
    '5b. advanceScene brief')

# 5c. advanceVictoryScene
src = patch(src,
    "    const scenes = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const scenes = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '5c. advanceVictoryScene')

# 6. completeStoryEvent
src = patch(src,
    "    if (storyStage === 4) {\n"
    "      try { await AsyncStorage.setItem(MOUMURI_EVENT_KEY, 'true'); } catch(e) {}\n"
    "      setMoumuriEventDone(true);\n"
    "    } else if (storyStage === 3) {",
    "    if (storyStage === 5) {\n"
    "      try { await AsyncStorage.setItem(MK2_EVENT_KEY, 'true'); } catch(e) {}\n"
    "      setMk2EventDone(true);\n"
    "    } else if (storyStage === 4) {\n"
    "      try { await AsyncStorage.setItem(MOUMURI_EVENT_KEY, 'true'); } catch(e) {}\n"
    "      setMoumuriEventDone(true);\n"
    "    } else if (storyStage === 3) {",
    '6. completeStoryEvent')

# 7. init
src = patch(src,
    "      AsyncStorage.getItem(MOUMURI_ACTIVE_KEY).then(v => { if (v === 'true') setMoumuriActive(true); }).catch(e => {});",
    "      AsyncStorage.getItem(MOUMURI_ACTIVE_KEY).then(v => { if (v === 'true') setMoumuriActive(true); }).catch(e => {});\n"
    "      AsyncStorage.getItem(MK2_EVENT_KEY).then(v => { if (v === 'true') setMk2EventDone(true); }).catch(e => {});\n"
    "      AsyncStorage.getItem(MK2_ACTIVE_KEY).then(v => { if (v === 'true') setMk2Active(true); }).catch(e => {});",
    '7. init')

# 8. stage map cleared
src = patch(src,
    "{ id: 5, name: '\u4e09\u65e5\u574a\u4e3bII', icon: NODE_BOSS, cleared: false, x: 0.5, y: 0.21 },",
    "{ id: 5, name: '\u4e09\u65e5\u574a\u4e3bII', icon: NODE_BOSS, cleared: mk2EventDone, x: 0.5, y: 0.21 },",
    '8. map cleared')

# 9. stage map onPress
src = patch(src,
    "else if (isNext && stage.id === 4) { startMoumuriEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    "else if (isNext && stage.id === 4) { startMoumuriEvent(); } else if (stage.cleared && stage.id === 5) { startMk2Event(); } else if (isNext && stage.id === 5) { startMk2Event(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    '9. map onPress')

# 10. story images
src = patch(src,
    "    const currentScenes = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "    const currentScenes = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '10a. story scenes')

src = patch(src,
    "    const sceneImg = storyStage === 4\n"
    "      ? (currentScene.img === 2 ? MOUMURI_SCENE2_IMG : MOUMURI_SCENE1_IMG)\n"
    "      : storyStage === 3",
    "    const sceneImg = storyStage === 5\n"
    "      ? (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG)\n"
    "      : storyStage === 4\n"
    "      ? (currentScene.img === 2 ? MOUMURI_SCENE2_IMG : MOUMURI_SCENE1_IMG)\n"
    "      : storyStage === 3",
    '10b. story images')

# 11. missionBrief
src = patch(src,
    "          {storyPhase === 'missionBrief' && storyStage === 4 && (",
    "          {storyPhase === 'missionBrief' && storyStage === 5 && (\n"
    "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>\n"
    "              <Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }} resizeMode=\"contain\" />\n"
    "              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\\u4e09\\u65e5\\u574a\\u4e3bII'}</Text>\n"
    "              <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'\\u6700\\u7d42\\u6c7a\\u6226'}</Text>\n"
    "              <View style={{ backgroundColor: 'rgba(231,76,60,0.15)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 16, padding: 20, width: '100%', marginBottom: 12 }}>\n"
    "                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{'\\u{1f525} 3\\u65e5\\u9593\\u9023\\u7d9a\\u3067\\u5168\\u30df\\u30c3\\u30b7\\u30e7\\u30f3\\u9054\\u6210'}</Text>\n"
    "              </View>\n"
    "              <View style={{ backgroundColor: 'rgba(218,165,32,0.1)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 8 }}>\n"
    "                <Text style={{ color: '#DAA520', fontSize: 13, textAlign: 'center' }}>{'DAY1: \\u76ee\\u6a19 + \\u65e9\\u8d77\\u304d + \\u7b4b\\u30c8\\u30ec30 + \\u6b32\\u671b\\u65ad\\u3061'}</Text>\n"
    "              </View>\n"
    "              <View style={{ backgroundColor: 'rgba(79,195,247,0.1)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 8 }}>\n"
    "                <Text style={{ color: '#4FC3F7', fontSize: 13, textAlign: 'center' }}>{'DAY2: \\u96c6\\u4e2d + \\u76f8\\u8ac7 + \\u611f\\u8b1d15 + \\u4e09\\u5584'}</Text>\n"
    "              </View>\n"
    "              <View style={{ backgroundColor: 'rgba(155,89,182,0.1)', borderRadius: 12, padding: 14, width: '100%', marginBottom: 16 }}>\n"
    "                <Text style={{ color: '#c39bd3', fontSize: 13, textAlign: 'center' }}>{'DAY3: \\u65e5\\u8a18 + \\u30eb\\u30fc\\u30c6\\u30a3\\u30f3\\u5168 + TODO\\u5168 + \\u7b4b\\u30c8\\u30ec50'}</Text>\n"
    "              </View>\n"
    "              <Text style={{ color: '#e74c3c', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>{'\\u203b 1\\u65e5\\u3067\\u3082\\u30b5\\u30dc\\u308b\\u3068\\u30ea\\u30bb\\u30c3\\u30c8'}</Text>\n"
    "              <TouchableOpacity onPress={async () => { setStoryActive(false); storyOverlayOpacity.setValue(0); setMk2Active(true); try { await AsyncStorage.setItem(MK2_ACTIVE_KEY, 'true'); await AsyncStorage.setItem(MK2_PROGRESS_KEY, JSON.stringify({day1:null,day2:null,day3:null})); } catch(e) {} }} style={{ backgroundColor: 'rgba(231,76,60,0.2)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
    "                <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'\\u53d7\\u3051\\u3066\\u7acb\\u3064'}</Text>\n"
    "              </TouchableOpacity>\n"
    "            </View>\n"
    "          )}\n\n"
    "          {storyPhase === 'missionBrief' && storyStage === 4 && (",
    '11. missionBrief')

# 12. defeat video
src = patch(src,
    "<Video source={storyStage === 4 ? MOUMURI_DEFEAT_VIDEO : storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    "<Video source={storyStage === 5 ? MIKKABOZU_DEFEAT_VIDEO : storyStage === 4 ? MOUMURI_DEFEAT_VIDEO : storyStage === 3 ? DEEBU_DEFEAT_VIDEO : storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO}",
    '12. defeat video')

# 13. defeat callback
src = patch(src,
    "const sc = storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    "const sc = storyStage === 5 ? MK2_SCENES : storyStage === 4 ? MOUMURI_SCENES : storyStage === 3 ? DEEBU_SCENES : storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;",
    '13. defeat callback')

# 14. victory image
src = patch(src,
    "<ImageBackground source={storyStage === 4 ? MOUMURI_SCENE2_IMG : storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    "<ImageBackground source={storyStage === 5 ? STORY_SCENE2_IMG : storyStage === 4 ? MOUMURI_SCENE2_IMG : storyStage === 3 ? DEEBU_SCENE2_IMG : storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG}",
    '14. victory image')

# 15a. clear stage
src = patch(src,
    "{storyStage === 4 ? 'STAGE 4 CLEAR' : storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    "{storyStage === 5 ? 'FINAL STAGE CLEAR' : storyStage === 4 ? 'STAGE 4 CLEAR' : storyStage === 3 ? 'STAGE 3 CLEAR' : storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}",
    '15a. clear stage')

# 15b. clear name
src = patch(src,
    "{storyStage === 4 ? '\u30e2\u30a6\u30e0\u30ea\u3092\u8a0e\u4f10' : storyStage === 3 ? '\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10' : storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    "{storyStage === 5 ? '\u4e09\u65e5\u574a\u4e3bII\u3092\u8a0e\u4f10' : storyStage === 4 ? '\u30e2\u30a6\u30e0\u30ea\u3092\u8a0e\u4f10' : storyStage === 3 ? '\u30c7\u30fc\u30d6\u3092\u8a0e\u4f10' : storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}",
    '15b. clear name')

# 16. Floating MK2 + Battle Modal
FLOATING_MOUMURI = "      {/* Floating Moumuri */}\n      {moumuriActive && !storyActive && ("

MK2_MODAL = (
    "      {/* Floating MK2 */}\n"
    "      {mk2Active && !storyActive && (\n"
    "        <Pressable onPress={openMk2Battle} style={{ position: 'absolute', bottom: 130, right: 12, zIndex: 999, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#e74c3c' }}>\n"
    "          <Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 56, height: 56, borderRadius: 28 }} resizeMode=\"contain\" />\n"
    "          <Text style={{ color: '#ff6b6b', fontSize: 9, fontWeight: '900', marginTop: 3 }}>{'\\u4e09\\u65e5\\u574a\\u4e3bII'}</Text>\n"
    "          <View style={{ backgroundColor: '#e74c3c', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>\n"
    "            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{'\\u6700\\u7d42\\u6c7a\\u6226'}</Text>\n"
    "          </View>\n"
    "        </Pressable>\n"
    "      )}\n\n"
    "      {/* MK2 Battle Modal */}\n"
    "      {mk2BO && (\n"
    "        <Modal visible={true} animationType=\"slide\" transparent={false}>\n"
    "          <View style={{ flex: 1, backgroundColor: '#0a0a1a' }}>\n"
    "            <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#0d0d20', borderBottomWidth: 1, borderBottomColor: '#222' }}>\n"
    "              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>\n"
    "                <TouchableOpacity onPress={() => setMk2BO(false)}><Text style={{ color: '#888', fontSize: 14 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', letterSpacing: 2 }}>{'\\u4e09\\u65e5\\u574a\\u4e3bII'}</Text>\n"
    "                <View style={{ width: 50 }} />\n"
    "              </View>\n"
    "            </View>\n\n"
    "            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps=\"handled\">\n"
    "              {/* Day tabs */}\n"
    "              <View style={{ flexDirection: 'row', marginBottom: 16 }}>\n"
    "                {[1,2,3].map(d => (\n"
    "                  <View key={d} style={{ flex: 1, marginHorizontal: 3, backgroundColor: mk2Day === d ? (d === 1 ? 'rgba(218,165,32,0.2)' : d === 2 ? 'rgba(79,195,247,0.2)' : 'rgba(155,89,182,0.2)') : '#111', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: mk2Day === d ? 2 : 1, borderColor: mk2Day === d ? (d === 1 ? '#DAA520' : d === 2 ? '#4FC3F7' : '#9b59b6') : '#333' }}>\n"
    "                    <Text style={{ color: mk2Day === d ? '#fff' : '#555', fontSize: 12, fontWeight: '900' }}>{'DAY ' + d}</Text>\n"
    "                    <Text style={{ color: mk2Day === d ? '#888' : '#333', fontSize: 10 }}>{d === 1 ? '\\u4f53' : d === 2 ? '\\u5fc3' : '\\u7fd2\\u6163'}</Text>\n"
    "                  </View>\n"
    "                ))}\n"
    "              </View>\n\n"
    "              {/* Boss */}\n"
    "              <View style={{ alignItems: 'center', marginBottom: 16 }}>\n"
    "                <View style={{ alignItems: 'center', marginBottom: 8 }}>\n"
    "                  {mk2Flash && <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(231,76,60,0.5)', zIndex: 2 }} />}\n"
    "                  <Animated.Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 80, height: 80, borderRadius: 40, transform: [{ translateX: mk2Shake }] }} resizeMode=\"contain\" />\n"
    "                </View>\n"
    "                <View style={{ width: '70%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 4 }}>\n"
    "                  <View style={{ width: (Math.max(0, 3 - (mk2Day - 1)) / 3 * 100) + '%', height: 8, backgroundColor: '#e74c3c', borderRadius: 4 }} />\n"
    "                </View>\n"
    "                <Text style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{'HP ' + Math.max(0, 3 - (mk2Day - 1)) + '/3'}</Text>\n"
    "              </View>\n\n"
    "              {/* Reset warning */}\n"
    "              {mk2WasReset && mk2Phase === 'menu' && (\n"
    "                <View style={{ backgroundColor: 'rgba(231,76,60,0.15)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 12, padding: 14, marginBottom: 14 }}>\n"
    "                  <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '900', textAlign: 'center' }}>{'\\u3084\\u3063\\u3071\\u308a\\u4e09\\u65e5\\u574a\\u4e3b\\u3060\\u306a\\u3002\\n\\u6700\\u521d\\u304b\\u3089\\u3084\\u308a\\u76f4\\u3057\\u3060\\u3002'}</Text>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Menu - mission cards */}\n"
    "              {mk2Phase === 'menu' && (\n"
    "                <View>\n"
    "                  {(mk2Day === 1 ? MK2_DAY1 : mk2Day === 2 ? MK2_DAY2 : MK2_DAY3).map(id => {\n"
    "                    const m = MK2_MISSIONS[id]; if (!m) return null;\n"
    "                    const done = mk2Done.includes(id);\n"
    "                    return (\n"
    "                      <Pressable key={id} onPress={() => { if (!done) { setMk2CM(id); if (m.phase === 'mk2_text') setMk2TextVal(''); if (m.phase === 'mk2_list') { setMk2ListItems([]); setMk2ListInput(''); } if (m.phase === 'mk2_ts') setMk2Hits(0); if (m.phase === 'mk2_focus') setMk2FocusLeft(30); setMk2Phase(m.phase); if (id === 'routines' || id === 'todos') { const tl = dailyLogs.find(l => l.date === getTodayStr()); if (id === 'routines' && tl && tl.routines.length > 0 && (tl.routineDone||[]).length >= tl.routines.length) { setMk2Done(prev => [...prev,'routines']); } if (id === 'todos' && tl && (tl.todos.length === 0 || tl.todos.every(t => t.done))) { setMk2Done(prev => [...prev,'todos']); } } } }} style={{ backgroundColor: done ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.03)', borderWidth: 2, borderColor: done ? '#2ecc71' : '#333', borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                        <Text style={{ fontSize: 28, marginRight: 12 }}>{done ? '\\u2714\\uFE0F' : m.icon}</Text>\n"
    "                        <View style={{ flex: 1 }}>\n"
    "                          <Text style={{ color: done ? '#2ecc71' : '#fff', fontSize: 15, fontWeight: '900' }}>{done ? m.title + '\\u9054\\u6210\\uff01' : m.title}</Text>\n"
    "                          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{m.sub}</Text>\n"
    "                        </View>\n"
    "                        {!done && <Text style={{ color: '#555', fontSize: 18 }}>{'\\u203a'}</Text>}\n"
    "                      </Pressable>\n"
    "                    );\n"
    "                  })}\n"
    "                  {(mk2Day === 1 ? MK2_DAY1 : mk2Day === 2 ? MK2_DAY2 : MK2_DAY3).every(id => mk2Done.includes(id)) && (\n"
    "                    <TouchableOpacity onPress={mk2CompleteDay} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10 }}>\n"
    "                      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{mk2Day === 3 ? '\\u3068\\u3069\\u3081\\u3092\\u523a\\u305b\\uff01' : 'DAY ' + mk2Day + ' CLEAR!'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  )}\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Text input phase */}\n"
    "              {mk2Phase === 'mk2_text' && MK2_TEXT_CFG[mk2CM] && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{MK2_TEXT_CFG[mk2CM].title}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{MK2_TEXT_CFG[mk2CM].prompt}</Text>\n"
    "                  <TextInput style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }} placeholder={MK2_TEXT_CFG[mk2CM].ph} placeholderTextColor=\"#555\" multiline value={mk2TextVal} onChangeText={setMk2TextVal} />\n"
    "                  <TouchableOpacity onPress={mk2SubmitText} style={{ backgroundColor: mk2TextVal.trim() ? '#DAA520' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: mk2TextVal.trim() ? 1 : 0.5 }}>\n"
    "                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{MK2_TEXT_CFG[mk2CM].btn}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 8 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* List input phase */}\n"
    "              {mk2Phase === 'mk2_list' && MK2_LIST_CFG[mk2CM] && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{MK2_LIST_CFG[mk2CM].title}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>{mk2ListItems.length + ' / ' + MK2_LIST_CFG[mk2CM].target}</Text>\n"
    "                  {mk2ListItems.map((k, i) => (\n"
    "                    <View key={i} style={{ backgroundColor: 'rgba(79,195,247,0.08)', borderRadius: 10, padding: 12, width: '100%', marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#4FC3F7', fontSize: 14, marginRight: 8 }}>{(i+1) + '.'}</Text>\n"
    "                      <Text style={{ color: '#ccc', fontSize: 14, flex: 1 }}>{k}</Text>\n"
    "                    </View>\n"
    "                  ))}\n"
    "                  {mk2ListItems.length < MK2_LIST_CFG[mk2CM].target && (\n"
    "                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 16 }}>\n"
    "                      <TextInput style={{ flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#333', marginRight: 8 }} placeholder={MK2_LIST_CFG[mk2CM].ph} placeholderTextColor=\"#555\" value={mk2ListInput} onChangeText={setMk2ListInput} onSubmitEditing={mk2AddListItem} returnKeyType=\"done\" />\n"
    "                      <TouchableOpacity onPress={mk2AddListItem} style={{ backgroundColor: mk2ListInput.trim() ? '#4FC3F7' : '#333', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', opacity: mk2ListInput.trim() ? 1 : 0.5 }}>\n"
    "                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'+'}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    </View>\n"
    "                  )}\n"
    "                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Training select */}\n"
    "              {mk2Phase === 'mk2_ts' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\\u7b4b\\u30c8\\u30ec\\u3092\\u9078\\u3079'}</Text>\n"
    "                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>\n"
    "                    {DEEBU_EXERCISES.map((ex) => (\n"
    "                      <TouchableOpacity key={ex.id} onPress={() => { setMk2TT(ex.id); setMk2Hits(0); setMk2Phase('mk2_training'); }} style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 2, borderColor: '#DAA520', borderRadius: 14, paddingVertical: 20, alignItems: 'center' }}>\n"
    "                        <Text style={{ fontSize: 28, marginBottom: 6 }}>{ex.icon}</Text>\n"
    "                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{ex.label}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    ))}\n"
    "                  </View>\n"
    "                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Training counter */}\n"
    "              {mk2Phase === 'mk2_training' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>{'\\u2694\\uFE0F ' + (DEEBU_EXERCISES.find(e => e.id === mk2TT)?.label || '')}</Text>\n"
    "                  <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900', marginBottom: 4 }}>{mk2Hits}</Text>\n"
    "                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 30 }}>{mk2Hits + ' / ' + (mk2CM === 'training3' ? 50 : 30)}</Text>\n"
    "                  {!mk2Done.includes(mk2CM) ? (\n"
    "                    <TouchableOpacity onPress={mk2TrainTap} style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 3, borderColor: '#DAA520', justifyContent: 'center', alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#DAA520', fontSize: 28, fontWeight: '900' }}>{'\\u62bc\\u305b\\uff01'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  ) : (\n"
    "                    <View style={{ alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\\u7b4b\\u30c8\\u30ec\\u5b8c\\u4e86\\uff01'}</Text>\n"
    "                      <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>\n"
    "                        <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: 'bold' }}>{'\\u6b21\\u3078'}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    </View>\n"
    "                  )}\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Photo */}\n"
    "              {mk2Phase === 'mk2_photo' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{'\\u{1f4f8} \\u6b32\\u671b\\u3092\\u65ad\\u3066'}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>{'\\u6211\\u6162\\u3059\\u308b\\u3082\\u306e\\u3092\\u64ae\\u308c'}</Text>\n"
    "                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>\n"
    "                    <TouchableOpacity onPress={mk2TakePhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', marginRight: 16 }}>\n"
    "                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\\u{1f4f7}'}</Text>\n"
    "                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\\u64ae\\u5f71'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                    <TouchableOpacity onPress={mk2PickPhoto} style={{ backgroundColor: 'rgba(79,195,247,0.15)', borderWidth: 2, borderColor: '#4FC3F7', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center' }}>\n"
    "                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{'\\u{1f5bc}\\uFE0F'}</Text>\n"
    "                      <Text style={{ color: '#4FC3F7', fontSize: 13, fontWeight: 'bold' }}>{'\\u9078\\u629e'}</Text>\n"
    "                    </TouchableOpacity>\n"
    "                  </View>\n"
    "                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Reason */}\n"
    "              {mk2Phase === 'mk2_reason' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#4FC3F7', fontSize: 16, fontWeight: '900', marginBottom: 12 }}>{'\\u306a\\u305c\\u6211\\u6162\\u3059\\u308b\\uff1f'}</Text>\n"
    "                  {mk2PhotoUri && <Image source={{ uri: mk2PhotoUri }} style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 16, borderWidth: 2, borderColor: '#333' }} />}\n"
    "                  <TextInput style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, fontSize: 16, color: '#fff', width: '100%', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#333', marginBottom: 16 }} placeholder={'\\u6211\\u6162\\u3059\\u308b\\u7406\\u7531\\u3092\\u66f8\\u3051'} placeholderTextColor=\"#555\" multiline value={mk2ReasonVal} onChangeText={setMk2ReasonVal} />\n"
    "                  <TouchableOpacity onPress={mk2SubmitReason} style={{ backgroundColor: mk2ReasonVal.trim() ? '#4FC3F7' : '#333', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, opacity: mk2ReasonVal.trim() ? 1 : 0.5 }}>\n"
    "                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\\u6b32\\u671b\\u3092\\u65ad\\u3061\\u5207\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Focus */}\n"
    "              {mk2Phase === 'mk2_focus' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#9b59b6', fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\\u{1f9d8} \\u96c6\\u4e2d\\u305b\\u3088'}</Text>\n"
    "                  {mk2FocusLeft > 0 && !mk2Done.includes('focus') ? (\n"
    "                    <View style={{ alignItems: 'center' }}>\n"
    "                      {mk2FocusLeft === 30 ? (\n"
    "                        <TouchableOpacity onPress={mk2StartFocus} style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(155,89,182,0.15)', borderWidth: 3, borderColor: '#9b59b6', justifyContent: 'center', alignItems: 'center' }}>\n"
    "                          <Text style={{ color: '#9b59b6', fontSize: 24, fontWeight: '900' }}>{'START'}</Text>\n"
    "                        </TouchableOpacity>\n"
    "                      ) : (\n"
    "                        <View style={{ alignItems: 'center' }}>\n"
    "                          <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900' }}>{mk2FocusLeft}</Text>\n"
    "                          <View style={{ width: 200, height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 12 }}>\n"
    "                            <View style={{ width: ((30 - mk2FocusLeft) / 30 * 100) + '%', height: 8, backgroundColor: '#9b59b6', borderRadius: 4 }} />\n"
    "                          </View>\n"
    "                          <Text style={{ color: '#888', fontSize: 13, marginTop: 12 }}>{'\\u96d1\\u5ff5\\u3092\\u6368\\u3066\\u308d'}</Text>\n"
    "                        </View>\n"
    "                      )}\n"
    "                    </View>\n"
    "                  ) : (\n"
    "                    <View style={{ alignItems: 'center' }}>\n"
    "                      <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'\\u96c6\\u4e2d\\u5b8c\\u4e86\\uff01'}</Text>\n"
    "                      <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ backgroundColor: 'rgba(155,89,182,0.2)', borderWidth: 1, borderColor: '#9b59b6', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>\n"
    "                        <Text style={{ color: '#9b59b6', fontSize: 14, fontWeight: 'bold' }}>{'\\u6b21\\u3078'}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    </View>\n"
    "                  )}\n"
    "                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 16 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Check routines/todos */}\n"
    "              {mk2Phase === 'mk2_check' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  {(() => {\n"
    "                    const tl = dailyLogs.find(l => l.date === getTodayStr());\n"
    "                    if (mk2CM === 'routines') {\n"
    "                      const total = tl?.routines?.length || 0;\n"
    "                      const doneC = (tl?.routineDone || []).length;\n"
    "                      const ok = total > 0 && doneC >= total;\n"
    "                      return (\n"
    "                        <View style={{ alignItems: 'center' }}>\n"
    "                          <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>{'\\u{1f4cb} \\u30eb\\u30fc\\u30c6\\u30a3\\u30f3\\u30c1\\u30a7\\u30c3\\u30af'}</Text>\n"
    "                          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', marginBottom: 4 }}>{doneC + '/' + total}</Text>\n"
    "                          {ok || mk2Done.includes('routines') ? (\n"
    "                            <View style={{ alignItems: 'center' }}>\n"
    "                              <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>{'\\u5168\\u5b8c\\u4e86\\uff01'}</Text>\n"
    "                              <TouchableOpacity onPress={() => { if (!mk2Done.includes('routines')) setMk2Done(prev => [...prev,'routines']); setMk2Phase('menu'); }} style={{ backgroundColor: 'rgba(46,204,113,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>\n"
    "                                <Text style={{ color: '#2ecc71', fontSize: 14, fontWeight: 'bold' }}>{'\\u78ba\\u8a8d'}</Text>\n"
    "                              </TouchableOpacity>\n"
    "                            </View>\n"
    "                          ) : (\n"
    "                            <Text style={{ color: '#e74c3c', fontSize: 14, marginTop: 12, textAlign: 'center' }}>{'\\u30eb\\u30fc\\u30c6\\u30a3\\u30f3\\u3092\\u5168\\u3066\\u3053\\u306a\\u3057\\u3066\\u304b\\u3089\\u623b\\u308c'}</Text>\n"
    "                          )}\n"
    "                        </View>\n"
    "                      );\n"
    "                    } else {\n"
    "                      const total = tl?.todos?.length || 0;\n"
    "                      const doneC = tl?.todos?.filter(t => t.done)?.length || 0;\n"
    "                      const ok = total === 0 || doneC >= total;\n"
    "                      return (\n"
    "                        <View style={{ alignItems: 'center' }}>\n"
    "                          <Text style={{ color: '#4FC3F7', fontSize: 18, fontWeight: '900', marginBottom: 12 }}>{'\\u2705 TODO\\u30c1\\u30a7\\u30c3\\u30af'}</Text>\n"
    "                          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', marginBottom: 4 }}>{doneC + '/' + total}</Text>\n"
    "                          {ok || mk2Done.includes('todos') ? (\n"
    "                            <View style={{ alignItems: 'center' }}>\n"
    "                              <Text style={{ color: '#2ecc71', fontSize: 20, fontWeight: '900', marginBottom: 16 }}>{'\\u5168\\u5b8c\\u4e86\\uff01'}</Text>\n"
    "                              <TouchableOpacity onPress={() => { if (!mk2Done.includes('todos')) setMk2Done(prev => [...prev,'todos']); setMk2Phase('menu'); }} style={{ backgroundColor: 'rgba(46,204,113,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 }}>\n"
    "                                <Text style={{ color: '#2ecc71', fontSize: 14, fontWeight: 'bold' }}>{'\\u78ba\\u8a8d'}</Text>\n"
    "                              </TouchableOpacity>\n"
    "                            </View>\n"
    "                          ) : (\n"
    "                            <Text style={{ color: '#e74c3c', fontSize: 14, marginTop: 12, textAlign: 'center' }}>{'TODO\\u3092\\u5168\\u3066\\u5b8c\\u4e86\\u3057\\u3066\\u304b\\u3089\\u623b\\u308c'}</Text>\n"
    "                          )}\n"
    "                        </View>\n"
    "                      );\n"
    "                    }\n"
    "                  })()}\n"
    "                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 16 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\\u2190 \\u623b\\u308b'}</Text></TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Day clear */}\n"
    "              {mk2Phase === 'day_clear' && (\n"
    "                <View style={{ alignItems: 'center', paddingTop: 30 }}>\n"
    "                  <Text style={{ color: '#2ecc71', fontSize: 28, fontWeight: '900', letterSpacing: 3, marginBottom: 12 }}>{'DAY ' + mk2Day + ' CLEAR!'}</Text>\n"
    "                  <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 24, marginBottom: 30 }}>{'\\u660e\\u65e5\\u307e\\u305f\\u6765\\u3044\\u3002\\n\\u30b5\\u30dc\\u3063\\u305f\\u3089\\u30ea\\u30bb\\u30c3\\u30c8\\u3060\\u305e\\u3002'}</Text>\n"
    "                  <TouchableOpacity onPress={() => setMk2BO(false)} style={{ backgroundColor: 'rgba(46,204,113,0.2)', borderWidth: 1, borderColor: '#2ecc71', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
    "                    <Text style={{ color: '#2ecc71', fontSize: 16, fontWeight: 'bold' }}>{'\\u9589\\u3058\\u308b'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* All done */}\n"
    "              {mk2Phase === 'done' && (\n"
    "                <View style={{ alignItems: 'center', paddingTop: 30 }}>\n"
    "                  <Text style={{ color: '#2ecc71', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 20 }}>{'3\\u65e5\\u9593\\u5168\\u9054\\u6210\\uff01'}</Text>\n"
    "                  <TouchableOpacity onPress={() => triggerMk2Defeat()} style={{ backgroundColor: '#e74c3c', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 50 }}>\n"
    "                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 }}>{'\\u3068\\u3069\\u3081\\u3092\\u523a\\u305b\\uff01'}</Text>\n"
    "                  </TouchableOpacity>\n"
    "                </View>\n"
    "              )}\n"
    "            </ScrollView>\n"
    "          </View>\n"
    "        </Modal>\n"
    "      )}\n\n"
    "      {/* Floating Moumuri */}\n"
    "      {moumuriActive && !storyActive && ("
)

src = patch(src, FLOATING_MOUMURI, MK2_MODAL, '16. floating + battle modal')

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
