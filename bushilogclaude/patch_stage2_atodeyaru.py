#!/usr/bin/env python3
"""
BUSHIDO LOG - Stage 2 (アトデヤル) パッチ
===========================================
適用方法:
  cd /Users/a/Desktop/bushido-log-clean/bushilogclaude
  python3 patch_stage2_atodeyaru.py

事前に画像を配置:
  cp /path/to/名称未設定のデザイン-18.png assets/story/atodeyaru_scene1.png
  cp /path/to/名称未設定のデザイン-19.png assets/story/atodeyaru_scene2.png
"""

import sys

FILE = 'App.tsx'

def patch(content, old, new, label):
    if old not in content:
        print(f'[SKIP] {label} - 対象文字列が見つかりません')
        return content
    count = content.count(old)
    if count > 1:
        print(f'[WARN] {label} - 対象が{count}箇所あります（最初の1箇所のみ置換）')
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

# ==============================================================
# 1. 画像require追加
# ==============================================================
src = patch(src,
    "const STORY_SCENE2_IMG = require('./assets/story/mikkabozu_scene2.png');",
    """const STORY_SCENE2_IMG = require('./assets/story/mikkabozu_scene2.png');
const ATODEYARU_SCENE1_IMG = require('./assets/story/atodeyaru_scene1.png');
const ATODEYARU_SCENE2_IMG = require('./assets/story/atodeyaru_scene2.png');
const ATODEYARU_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_atodeyaru.mp4');""",
    '1. ATODEYARU画像require')

# ==============================================================
# 2. AsyncStorage key追加
# ==============================================================
src = patch(src,
    "const MIKKABOZU_EVENT_KEY = 'bushido_mikkabozu_event_done';",
    """const MIKKABOZU_EVENT_KEY = 'bushido_mikkabozu_event_done';
const ATODEYARU_EVENT_KEY = 'bushido_atodeyaru_event_done';
const ATODEYARU_ACTIVE_KEY = 'bushido_atodeyaru_active';""",
    '2. AsyncStorageキー追加')

# ==============================================================
# 3. storyPhase型にmissionBrief追加
# ==============================================================
src = patch(src,
    "useState<'dark'|'eyes'|'scenes'|'missionSelect'|'mission'|'quiz'|'defeat'|'victory'|'clear'>('dark')",
    "useState<'dark'|'eyes'|'scenes'|'missionSelect'|'missionBrief'|'mission'|'quiz'|'defeat'|'victory'|'clear'>('dark')",
    '3. storyPhase型更新')

# ==============================================================
# 4. state変数追加
# ==============================================================
src = patch(src,
    "const [innerWorldUnlocked, setInnerWorldUnlocked] = useState(false);",
    """const [innerWorldUnlocked, setInnerWorldUnlocked] = useState(false);
  const [atodeyaruEventDone, setAtodeyaruEventDone] = useState(false);
  const [atodeyaruActive, setAtodeyaruActive] = useState(false);
  const [storyStage, setStoryStage] = useState<number>(1);""",
    '4. atodeyaru state追加')

# ==============================================================
# 5. アトデヤルシーン+セリフデータ追加
# ==============================================================
src = patch(src,
    "  const PHYSICAL_MISSIONS = [",
    """  const ATODEYARU_SCENES = [
    { img: 1, text: '\u3042\u30fc...\u3081\u3093\u3069\u304f\u3055\u3002\\n\u307e\u305f\u660e\u65e5\u3067\u3044\u3044\u3063\u3057\u3087\u3002' },
    { img: 1, text: '\u30eb\u30fc\u30c6\u30a3\u30f3\uff1fTODO\uff1f\\n\u77e5\u3089\u3093\u3057\u3002' },
    { img: 1, text: '\u4ffa\u304c\u3044\u308b\u9650\u308a\u3001\\n\u304a\u524d\u306f\u4f55\u3082\u7d42\u308f\u3089\u306a\u3044\u3002' },
    { img: 1, text: '\u3084\u308c\u308b\u3082\u3093\u306a\u3089\\n\u4eca\u65e5\u4e2d\u306b\u3084\u3063\u3066\u307f\uff1f' },
    { img: 2, text: '\u30de\u30b8\u304b\u3088...\\n\u4eca\u65e5\u3084\u3063\u3061\u3083\u3046\u306e\u304b\u3088...' },
    { img: 2, text: '\u304f\u305d...\u6b21\u306e\u5974\u306f\\n\u3082\u3063\u3068\u624b\u5f37\u3044\u304b\u3089\u3002' },
  ];

  const ATODEYARU_QUIPS = [
    '\u307e\u3060\u3084\u3063\u3066\u306a\u3044\u306e\uff1f',
    '\u3042\u3068\u3067\u3084\u308b\u3063\u3066\u8a00\u3063\u305f\u3088\u306d\uff1f',
    '\u660e\u65e5\u3067\u3082\u3044\u3044\u3093\u3058\u3083\u306a\u3044\uff1f',
    '\u3069\u3046\u305b\u9014\u4e2d\u3067\u3084\u3081\u308b\u3093\u3067\u3057\u3087',
    '\u30eb\u30fc\u30c6\u30a3\u30f3\u7d42\u308f\u3063\u305f\uff1f',
    'TODO\u6b8b\u3063\u3066\u308b\u3088\uff1f',
  ];

  const PHYSICAL_MISSIONS = [""",
    '5. ATODEYARUシーン+セリフデータ')

# ==============================================================
# 6. startStoryEventにstoryStage=1セット
# ==============================================================
src = patch(src,
    """  const startStoryEvent = () => {
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);""",
    """  const startStoryEvent = () => {
    setStoryStage(1);
    setStoryActive(true); setStoryPhase('dark'); setSceneIndex(0); setMissionCount(0);""",
    '6. startStoryEvent storyStage=1')

# ==============================================================
# 7. アトデヤルイベント関数群追加
# ==============================================================
src = patch(src,
    "  // === END MIKKABOZU EVENT ===",
    """  // === ATODEYARU EVENT / STAGE 2 ===
  const startAtodeyaruEvent = () => {
    setStoryStage(2);
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
      storyTypewriter(ATODEYARU_SCENES[0].text);
      speakMikkabozu('\u660e\u65e5\u3084\u308c\u3070\u3044\u3044\u3058\u3083\u3093');
    }, 5000);
  };

  const triggerAtodeyaruDefeat = async () => {
    setStoryStage(2);
    setAtodeyaruActive(false);
    try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'false'); } catch(e) {}
    setStoryActive(true);
    Animated.timing(storyOverlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    try { const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3')); await sound.setVolumeAsync(MASTER_VOLUME); await sound.playAsync(); } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    speakSamurai('\u898b\u4e8b\u3060'); samuraiSpeak('\u898b\u4e8b\u3060');
    await addXpWithLevelCheck(50);
    setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('\u8ca0\u3051\u305f\u304f\u3084\u3057\u3044\u3088'); }, 1500);
  };

  const checkAtodeyaruCondition = (logs: DailyLog[]) => {
    if (!atodeyaruActive) return;
    const today = getTodayStr();
    const todayLog = logs.find(l => l.date === today);
    if (!todayLog) return;
    const routineTotal = todayLog.routines.length;
    const routineDoneCount = (todayLog.routineDone || []).length;
    const routineHalf = Math.ceil(routineTotal / 2);
    if (routineTotal === 0 && todayLog.todos.length === 0) return;
    const routineOk = routineTotal === 0 || routineDoneCount >= routineHalf;
    const todoOk = todayLog.todos.length === 0 || todayLog.todos.every(t => t.done);
    if (routineOk && todoOk) { triggerAtodeyaruDefeat(); }
  };
  // === END ATODEYARU EVENT ===

  // === END MIKKABOZU EVENT ===""",
    '7. ATODEYARU\u30a4\u30d9\u30f3\u30c8\u95a2\u6570\u7fa4')

# ==============================================================
# 8. advanceScene修正（Stage2対応）
# ==============================================================
src = patch(src,
    """  const advanceScene = () => {
    if (!storyTypingDone) { setStoryTypeText(STORY_SCENES[sceneIndex].text); setStoryTypingDone(true); return; }
    const next = sceneIndex + 1;
    if (next === 4) { setStoryPhase('missionSelect'); setSelectedMission(null); samuraiSpeak('\u3069\u3046\u6311\u3080\uff1f'); return; }
    if (next >= STORY_SCENES.length) { setStoryPhase('clear'); return; }
    setSceneIndex(next); setSamuraiVoice(''); storyTypewriter(STORY_SCENES[next].text);
  };""",
    """  const advanceScene = () => {
    const scenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;
    if (!storyTypingDone) { setStoryTypeText(scenes[sceneIndex].text); setStoryTypingDone(true); return; }
    const next = sceneIndex + 1;
    if (storyStage === 1 && next === 4) { setStoryPhase('missionSelect'); setSelectedMission(null); samuraiSpeak('\u3069\u3046\u6311\u3080\uff1f'); return; }
    if (storyStage === 2 && next === 4) { setStoryPhase('missionBrief'); return; }
    if (next >= scenes.length) { setStoryPhase('clear'); return; }
    setSceneIndex(next); setSamuraiVoice(''); storyTypewriter(scenes[next].text);
  };""",
    '8. advanceScene Stage2\u5bfe\u5fdc')

# ==============================================================
# 9. advanceVictoryScene修正
# ==============================================================
src = patch(src,
    """  const advanceVictoryScene = () => {
    if (!storyTypingDone) { setStoryTypeText(STORY_SCENES[sceneIndex].text); setStoryTypingDone(true); return; }
    if (sceneIndex === 4) { setSceneIndex(5); setSamuraiVoice(''); storyTypewriter(STORY_SCENES[5].text); return; }
    setStoryPhase('clear');
  };""",
    """  const advanceVictoryScene = () => {
    const scenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;
    if (!storyTypingDone) { setStoryTypeText(scenes[sceneIndex].text); setStoryTypingDone(true); return; }
    if (sceneIndex === 4) { setSceneIndex(5); setSamuraiVoice(''); storyTypewriter(scenes[5].text); return; }
    setStoryPhase('clear');
  };""",
    '9. advanceVictoryScene Stage2\u5bfe\u5fdc')

# ==============================================================
# 10. completeStoryEvent修正（Stage2対応）
# ==============================================================
src = patch(src,
    """  const completeStoryEvent = async () => {
    try { await AsyncStorage.setItem(MIKKABOZU_EVENT_KEY, 'true'); } catch(e) {}
    setMikkabozuEventDone(true); setInnerWorldUnlocked(true); setStoryActive(false);""",
    """  const completeStoryEvent = async () => {
    if (storyStage === 2) {
      try { await AsyncStorage.setItem(ATODEYARU_EVENT_KEY, 'true'); } catch(e) {}
      setAtodeyaruEventDone(true);
    } else {
      try { await AsyncStorage.setItem(MIKKABOZU_EVENT_KEY, 'true'); } catch(e) {}
      setMikkabozuEventDone(true);
    }
    setInnerWorldUnlocked(true); setStoryActive(false);""",
    '10. completeStoryEvent Stage2\u5bfe\u5fdc')

# ==============================================================
# 11. toggleTodoDoneに条件チェック追加
# ==============================================================
src = patch(src,
    """    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const toggleRoutineDone""",
    """    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
    checkAtodeyaruCondition(newLogs);
  };

  const toggleRoutineDone""",
    '11. toggleTodoDone\u306b\u6761\u4ef6\u30c1\u30a7\u30c3\u30af')

# ==============================================================
# 12. toggleRoutineDoneに条件チェック追加
# ==============================================================
src = patch(src,
    """    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
  };

  const handleGenerateSamuraiMission""",
    """    setDailyLogs(newLogs);
    await saveDailyLogsToStorage(newLogs);
    checkAtodeyaruCondition(newLogs);
  };

  const handleGenerateSamuraiMission""",
    '12. toggleRoutineDone\u306b\u6761\u4ef6\u30c1\u30a7\u30c3\u30af')

# ==============================================================
# 13. アトデヤル初期化（checkMikkabozuEventの後）
# ==============================================================
src = patch(src,
    "      checkMikkabozuEvent();",
    """      checkMikkabozuEvent();
      // Atodeyaru state restore
      AsyncStorage.getItem(ATODEYARU_EVENT_KEY).then(v => { if (v === 'true') { setAtodeyaruEventDone(true); setInnerWorldUnlocked(true); } }).catch(e => {});
      AsyncStorage.getItem(ATODEYARU_ACTIVE_KEY).then(v => { if (v === 'true') setAtodeyaruActive(true); }).catch(e => {});""",
    '13. ATODEYARU\u521d\u671f\u5316')

# ==============================================================
# 14. ステージマップ Stage2 cleared更新
# ==============================================================
src = patch(src,
    "{ id: 2, name: '\u30a2\u30c8\u30c7\u30e4\u30eb', icon: NODE_KATANA, cleared: false, x: 0.3, y: 0.60 },",
    "{ id: 2, name: '\u30a2\u30c8\u30c7\u30e4\u30eb', icon: NODE_KATANA, cleared: atodeyaruEventDone, x: 0.3, y: 0.60 },",
    '14. \u30b9\u30c6\u30fc\u30b8\u30de\u30c3\u30d7 Stage2 cleared')

# ==============================================================
# 15. ステージマップ onPress更新
# ==============================================================
src = patch(src,
    "if (stage.cleared && stage.id === 1) { startStoryEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    "if (stage.cleared && stage.id === 1) { startStoryEvent(); } else if (stage.cleared && stage.id === 2) { startAtodeyaruEvent(); } else if (isNext && stage.id === 2) { startAtodeyaruEvent(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
    '15. \u30b9\u30c6\u30fc\u30b8\u30de\u30c3\u30d7 onPress')

# ==============================================================
# 16. ストーリーオーバーレイ: シーンデータ/画像切り替え
# ==============================================================
src = patch(src,
    """    const currentScene = STORY_SCENES[sceneIndex] || STORY_SCENES[0];
    const sceneImg = currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG;""",
    """    const currentScenes = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES;
    const currentScene = currentScenes[sceneIndex] || currentScenes[0];
    const sceneImg = storyStage === 2
      ? (currentScene.img === 2 ? ATODEYARU_SCENE2_IMG : ATODEYARU_SCENE1_IMG)
      : (currentScene.img === 2 ? STORY_SCENE2_IMG : STORY_SCENE1_IMG);""",
    '16. \u30b9\u30c8\u30fc\u30ea\u30fc\u30aa\u30fc\u30d0\u30fc\u30ec\u30a4\u753b\u50cf\u5207\u66ff')

# ==============================================================
# 17. missionBriefフェーズ描画追加
# ==============================================================
src = patch(src,
    """          {storyPhase === 'mission' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4e09\u65e5\u574a\u4e3b'}</Text>""",
    """          {storyPhase === 'missionBrief' && (
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
          )}

          {storyPhase === 'mission' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4e09\u65e5\u574a\u4e3b'}</Text>""",
    '17. missionBrief\u30d5\u30a7\u30fc\u30ba\u63cf\u753b')

# ==============================================================
# 18. defeat動画をStage分岐
# ==============================================================
src = patch(src,
    "<Video source={MIKKABOZU_DEFEAT_VIDEO} style={{ width: 300, height: 300 }}",
    "<Video source={storyStage === 2 ? ATODEYARU_DEFEAT_VIDEO : MIKKABOZU_DEFEAT_VIDEO} style={{ width: 300, height: 300 }}",
    '18. defeat\u52d5\u753b\u5206\u5c90')

# ==============================================================
# 19. defeat onPlaybackStatusUpdateをStage分岐
# ==============================================================
src = patch(src,
    "onPlaybackStatusUpdate={(status: any) => { if (status.didJustFinish) { setSceneIndex(4); setSamuraiVoice(''); setStoryPhase('victory'); samuraiSpeak('\u2026\u2026\u898b\u4e8b\u3060\u3002'); storyTypewriter(STORY_SCENES[4].text); } }}",
    "onPlaybackStatusUpdate={(status: any) => { if (status.didJustFinish) { const sc = storyStage === 2 ? ATODEYARU_SCENES : STORY_SCENES; setSceneIndex(4); setSamuraiVoice(''); setStoryPhase('victory'); samuraiSpeak('\u2026\u2026\u898b\u4e8b\u3060\u3002'); storyTypewriter(sc[4].text); } }}",
    '19. defeat onPlaybackStatusUpdate\u5206\u5c90')

# ==============================================================
# 20. victory画像をStage分岐
# ==============================================================
src = patch(src,
    "<ImageBackground source={STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode=\"cover\">",
    "<ImageBackground source={storyStage === 2 ? ATODEYARU_SCENE2_IMG : STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode=\"cover\">",
    '20. victory\u753b\u50cf\u5206\u5c90')

# ==============================================================
# 21. clearテキストをStage分岐
# ==============================================================
src = patch(src,
    """<Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 12 }}>STAGE 1 CLEAR</Text>
              <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', marginBottom: 40 }}>{'\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}</Text>""",
    """<Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 12 }}>{storyStage === 2 ? 'STAGE 2 CLEAR' : 'STAGE 1 CLEAR'}</Text>
              <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', marginBottom: 40 }}>{storyStage === 2 ? '\u30a2\u30c8\u30c7\u30e4\u30eb\u3092\u8a0e\u4f10' : '\u4e09\u65e5\u574a\u4e3b\u3092\u8a0e\u4f10'}</Text>""",
    '21. clear\u30c6\u30ad\u30b9\u30c8\u5206\u5c90')

# ==============================================================
# 22. フローティングアトデヤル追加
# ==============================================================
src = patch(src,
    """      </KeyboardAvoidingView>




      {/* Yokai Defeat Modal */}""",
    """      </KeyboardAvoidingView>

      {/* Floating Atodeyaru */}
      {atodeyaruActive && !storyActive && (
        <View style={{ position: 'absolute', bottom: 120, right: 16, zIndex: 999, alignItems: 'center' }}>
          <Pressable onPress={() => { const quips = ATODEYARU_QUIPS; const q = quips[Math.floor(Math.random() * quips.length)]; showSaveSuccess(q); }}>
            <Image source={YOKAI_IMAGES.atodeyaru} style={{ width: 60, height: 60, borderRadius: 30 }} resizeMode="contain" />
            <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 2 }}>{'\u30a2\u30c8\u30c7\u30e4\u30eb'}</Text>
          </Pressable>
        </View>
      )}

      {/* Yokai Defeat Modal */}""",
    '22. \u30d5\u30ed\u30fc\u30c6\u30a3\u30f3\u30b0\u30a2\u30c8\u30c7\u30e4\u30eb')

# ==============================================================
# 検証 & 書き込み
# ==============================================================
if src == original:
    print('\n[ERROR] \u5909\u66f4\u304c\u3042\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002')
    sys.exit(1)

# UTF-8エンコードチェック（サロゲート対策）
try:
    src.encode('utf-8')
except UnicodeEncodeError as e:
    print(f'\n[ERROR] UTF-8\u30a8\u30f3\u30b3\u30fc\u30c9\u30a8\u30e9\u30fc: {e}')
    sys.exit(1)

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)

print(f'\n\u2705 \u30d1\u30c3\u30c1\u5b8c\u4e86\uff01App.tsx \u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002')
print(f'   \u5909\u66f4\u524d: {len(original)} \u6587\u5b57')
print(f'   \u5909\u66f4\u5f8c: {len(src)} \u6587\u5b57 (+{len(src) - len(original)})')
print()
print('\u203b \u7d50\u679c\u78ba\u8a8d:  npx expo start -c')
