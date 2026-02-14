#!/usr/bin/env python3
"""
BUSHIDO LOG v3 - 全部入り最終パッチ
Run from: bushilogclaude/ (Step3 commit状態)
"""

# ============================================================
# PART 1: assets.ts
# ============================================================
with open('src/data/assets.ts', 'r', encoding='utf-8') as f:
    assets = f.read()

assets += """
// Character voices
export const VOICE_MK_APPEAR = require('../../sounds/voice_mk_appear.mp3');
export const VOICE_MK_DEFEAT = require('../../sounds/voice_mk_defeat.mp3');
export const VOICE_ATO_APPEAR = require('../../sounds/voice_ato_appear.mp3');
export const VOICE_ATO_DEFEAT = require('../../sounds/voice_ato_defeat.mp3');
export const VOICE_DEEBU_APPEAR = require('../../sounds/voice_deebu_appear.mp3');
export const VOICE_DEEBU_DEFEAT = require('../../sounds/voice_deebu_defeat.mp3');
export const VOICE_MOUMURI_APPEAR = require('../../sounds/voice_moumuri_appear.mp3');
export const VOICE_MOUMURI_DEFEAT = require('../../sounds/voice_moumuri_defeat.mp3');
export const VOICE_MK2_APPEAR = require('../../sounds/voice_mk2_appear.mp3');
export const VOICE_MK2_DEFEAT = require('../../sounds/voice_mk2_defeat.mp3');
export const VOICE_TETSUYA_APPEAR = require('../../sounds/voice_tetsuya_appear.mp3');
export const BGM_MONSTER_APPEAR = require('../../sounds/bgm_monster_appear.mp3');
export const SFX_TETSUYA_APPEAR = require('../../sounds/sfx_tetsuya_appear.mp3');
export const SCREAM_VOICES = [
  require('../../sounds/shonen9-himei3.mp3'),
  require('../../sounds/shonen9-himei5.mp3'),
  require('../../sounds/shonen10-uwaa.mp3'),
  require('../../sounds/shonen8-are.mp3'),
  require('../../sounds/shonen8-tyottokituiya.mp3'),
  require('../../sounds/shonen3-yarareta.mp3'),
  require('../../sounds/shonen10-maketanoka.mp3'),
  require('../../sounds/shonen6-usosonna.mp3'),
  require('../../sounds/shonen8-itatamouugokenaiya.mp3'),
  require('../../sounds/shonen5_konnatokorode.mp3'),
  require('../../sounds/shonen6-ittanhikuyo.mp3'),
  require('../../sounds/zyosei3-haibokuda.mp3'),
  require('../../sounds/zyosei4-munendesu.mp3'),
];
export const ENDING_CLEAR_BG = require('../../assets/ending_clear_bg.png');
export const ENDING_W1_COMPLETE_BG = require('../../assets/ending_w1_complete_bg.png');
"""
with open('src/data/assets.ts', 'w', encoding='utf-8') as f:
    f.write(assets)
print('[OK] assets.ts')

# ============================================================
# PART 2: App.tsx
# ============================================================
with open('App.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
c = 0

# --- Imports ---
old = "  KATANA_SOUND, SFX_POLISH, SFX_KATANA_SHINE, SFX_FOOTSTEP, SFX_EYE_GLOW,"
new = """  KATANA_SOUND, SFX_POLISH, SFX_KATANA_SHINE, SFX_FOOTSTEP, SFX_EYE_GLOW,
  VOICE_MK_APPEAR, VOICE_MK_DEFEAT, VOICE_ATO_APPEAR, VOICE_ATO_DEFEAT,
  VOICE_DEEBU_APPEAR, VOICE_DEEBU_DEFEAT, VOICE_MOUMURI_APPEAR, VOICE_MOUMURI_DEFEAT,
  VOICE_MK2_APPEAR, VOICE_MK2_DEFEAT, VOICE_TETSUYA_APPEAR,
  BGM_MONSTER_APPEAR, SFX_TETSUYA_APPEAR, SCREAM_VOICES,
  ENDING_CLEAR_BG, ENDING_W1_COMPLETE_BG,"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] imports')

# --- ImageBackground import ---
old = "  Image,\n"
if 'ImageBackground' not in src[:2000]:
    src = src.replace(old, "  Image,\n  ImageBackground,\n", 1); c += 1; print('[OK] ImageBackground import')

# --- monsterBgmRef ---
old = "  const [storyPhase, setStoryPhase] = useState"
new = "  const monsterBgmRef = useRef<any>(null);\n  const [storyPhase, setStoryPhase] = useState"
if 'monsterBgmRef' not in src:
    src = src.replace(old, new, 1); c += 1; print('[OK] monsterBgmRef')

# --- playVoice + playRandomScream ---
old = """  const speakMikkabozu = async (text: string) => {
    try {
      if (!settings.autoVoice) return;"""
new = """  const playVoice = async (voiceAsset: any, volume: number = 1.0) => {
    try {
      const { sound } = await Audio.Sound.createAsync(voiceAsset);
      await sound.setVolumeAsync(Math.min(volume, MASTER_VOLUME));
      await sound.playAsync();
    } catch(e) {}
  };

  const playRandomScream = async () => {
    try {
      const asset = SCREAM_VOICES[Math.floor(Math.random() * SCREAM_VOICES.length)];
      await playVoice(asset, 0.7);
    } catch(e) {}
  };

  const speakMikkabozu = async (text: string) => {
    try {
      if (!settings.autoVoice) return;"""
if 'const playVoice' not in src:
    src = src.replace(old, new, 1); c += 1; print('[OK] playVoice helpers')

# --- Replace speakMikkabozu with voices + BGM (ref based, stops at mission) ---
voice_map = {
    "speakMikkabozu('どうせ三日で終わりでしょ')": "Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_MK_APPEAR), 1500)",
    "speakMikkabozu('明日やればいいじゃん')": "Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_ATO_APPEAR), 1500)",
    "speakMikkabozu('\\u52d5\\u304f\\u306e\\u3060\\u308b\\u3044')": "Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_DEEBU_APPEAR), 1500)",
    "speakMikkabozu('\\u3082\\u3046\\u7121\\u7406\\u3060')": "Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_MOUMURI_APPEAR), 1500)",
    "speakMikkabozu('\\u307e\\u305f\\u4f1a\\u3063\\u305f\\u306a')": "Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({sound}) => { monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); setTimeout(() => playVoice(VOICE_MK2_APPEAR), 1500)",
    "speakMikkabozu('\\u52d5\\u3051\\u308b\\u306e\\u304b\\u3088')": "playVoice(VOICE_DEEBU_DEFEAT)",
    "speakMikkabozu('\\u611f\\u8b1d\\u3067\\u304d\\u308b\\u306e\\u304b\\u3088')": "playVoice(VOICE_MOUMURI_DEFEAT)",
    "speakMikkabozu('3\\u65e5\\u7d9a\\u3051\\u3084\\u304c\\u3063\\u305f')": "playVoice(VOICE_MK2_DEFEAT)",
}
for old_v, new_v in voice_map.items():
    if old_v in src: src = src.replace(old_v, new_v, 1); c += 1; print(f'[OK] voice: {old_v[:30]}...')

# 負けたくやしいよ x2 (context-based)
old = "setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('負けたくやしいよ'); }, 1500);\n  };\n\n  const countMissionTap"
new = "setTimeout(() => { setStoryPhase('defeat'); playVoice(VOICE_MK_DEFEAT); }, 1500);\n  };\n\n  const countMissionTap"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] MK_DEFEAT')

old = "setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('負けたくやしいよ'); }, 1500);\n  };\n\n  const checkAtodeyaru"
new = "setTimeout(() => { setStoryPhase('defeat'); playVoice(VOICE_ATO_DEFEAT); }, 1500);\n  };\n\n  const checkAtodeyaru"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ATO_DEFEAT')

# --- BGM stop at missionSelect/Brief ---
stop_bgm = "if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } "

old_ms = "setStoryPhase('missionSelect'); setSelectedMission(null); samuraiSpeak('どう挑む？');"
if old_ms in src:
    src = src.replace(old_ms, stop_bgm + old_ms, 1); c += 1; print('[OK] BGM stop: missionSelect')

old_mb = "setStoryPhase('missionBrief'); return; }"
new_mb = stop_bgm + old_mb
mc = src.count(old_mb)
src = src.replace(old_mb, new_mb); c += mc; print(f'[OK] BGM stop: missionBrief x{mc}')

# --- sfx_eyes削除 ---
old_eyes = "Audio.Sound.createAsync(require('./sounds/sfx_eyes.mp3')).then(({sound}) => sound.setVolumeAsync(0.5).then(() => sound.playAsync())).catch(e => {});"
ec = src.count(old_eyes)
src = src.replace(old_eyes, ''); c += ec; print(f'[OK] sfx_eyes削除 x{ec}')

# --- Scream on taps ---
old = """  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}"""
new = """  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    if (next % 4 === 0) playRandomScream();"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] scream: deebu')

old = """  const countMissionTap = async () => {
    const next = missionCount + 1; setMissionCount(next);"""
new = """  const countMissionTap = async () => {
    const next = missionCount + 1; setMissionCount(next);
    if (next % 3 === 0) playRandomScream();"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] scream: mission')

old = "    const next = mk2Hits + 1; setMk2Hits(next);\n    try { Haptics.impactAsync"
new = "    const next = mk2Hits + 1; setMk2Hits(next);\n    if (next % 4 === 0) playRandomScream();\n    try { Haptics.impactAsync"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] scream: mk2')

# --- 見事だ全削除 ---
old_m = "    speakSamurai('\\u898b\\u4e8b\\u3060'); samuraiSpeak('\\u898b\\u4e8b\\u3060');\n"
mc = src.count(old_m)
if mc: src = src.replace(old_m, ''); c += mc; print(f'[OK] 見事だ(escaped) x{mc}')

old_m2 = "    speakSamurai('見事だ'); samuraiSpeak('見事だ');\n"
mc2 = src.count(old_m2)
if mc2: src = src.replace(old_m2, ''); c += mc2; print(f'[OK] 見事だ(literal) x{mc2}')

old_m3 = " samuraiSpeak('……見事だ。');"
if old_m3 in src: src = src.replace(old_m3, '', 1); c += 1; print('[OK] ビデオ見事だ')

# --- 連打ガード (正しい位置) ---
# Deebu
old = "  const triggerDeebuDefeat = async () => {\n    setStoryStage(3);\n    setDeebuActive"
new = "  const deebuDefeatingRef = useRef(false);\n  const triggerDeebuDefeat = async () => {\n    if (deebuDefeatingRef.current) return;\n    deebuDefeatingRef.current = true;\n    setStoryStage(3);\n    setDeebuActive"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] guard: deebu')

# MK2
old = "  const triggerMk2Defeat = async () => {\n    setStoryStage(5);"
new = "  const mk2DefeatingRef = useRef(false);\n  const triggerMk2Defeat = async () => {\n    if (mk2DefeatingRef.current) return;\n    mk2DefeatingRef.current = true;\n    setStoryStage(5);"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] guard: mk2')

# Moumuri
old = "  const triggerMoumuriDefeat = async () => {"
new = "  const moumuriDefeatingRef = useRef(false);\n  const triggerMoumuriDefeat = async () => {\n    if (moumuriDefeatingRef.current) return;\n    moumuriDefeatingRef.current = true;"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] guard: moumuri')

# Mission
old = "  const onMissionComplete = async () => {"
new = "  const missionCompletingRef = useRef(false);\n  const onMissionComplete = async () => {\n    if (missionCompletingRef.current) return;\n    missionCompletingRef.current = true;"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] guard: mission')

# --- State reset in all defeat functions ---
for label, old_reset, new_reset in [
    ("Atodeyaru",
     "    setAtodeyaruActive(false);\n    try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryActive(true);",
     "    setAtodeyaruActive(false);\n    try { await AsyncStorage.setItem(ATODEYARU_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');\n    setStoryActive(true);"),
    ("Deebu",
     "    setDeebuActive(false); setDeebuBattleOpen(false);\n    try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryActive(true);",
     "    setDeebuActive(false); setDeebuBattleOpen(false);\n    try { await AsyncStorage.setItem(DEEBU_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');\n    setStoryActive(true);"),
    ("Moumuri",
     "    setMoumuriActive(false); setMoumuriBO(false);\n    try { await AsyncStorage.setItem(MOUMURI_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryActive(true);",
     "    setMoumuriActive(false); setMoumuriBO(false);\n    try { await AsyncStorage.setItem(MOUMURI_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');\n    setStoryActive(true);"),
]:
    if old_reset in src: src = src.replace(old_reset, new_reset, 1); c += 1; print(f'[OK] state reset: {label}')

# MK2 (different pattern - setStoryStage is on same line)
old = "    setStoryStage(5); setMk2Active(false); setMk2BO(false);\n    try { await AsyncStorage.setItem(MK2_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryActive(true);"
if old in src:
    new = "    setStoryStage(5); setMk2Active(false); setMk2BO(false);\n    try { await AsyncStorage.setItem(MK2_ACTIVE_KEY, 'false'); } catch(e) {}\n    setStoryPhase('dark'); setSceneIndex(0); setStoryTypeText(''); setSamuraiVoice('');\n    setStoryActive(true);"
    src = src.replace(old, new, 1); c += 1; print('[OK] state reset: MK2')

# --- Ending 1: セリフ + フォント ---
old = "storyTypewriter('お前はもう\\n三日坊主ではない。'), 800)"
new = "storyTypewriter('三日。\\nたった三日。\\n\\n「どうせ続かない」\\n「お前には無理だ」\\n「また明日でいい」\\n\\n全部、斬った。\\n\\nお前は──侍だ。'), 800)"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending1: セリフ')

old = "color: '#DAA520', fontSize: 28, fontWeight: '900', letterSpacing: 6, textAlign: 'center'"
new = "color: '#DAA520', fontSize: 20, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 34"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending1: フォント')

# --- Ending 2: 称号 + 背景 ---
old = "{'三日坊主を倒した。'}"
new = "{'── 三日坊主殺し ──'}"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending2: 称号')

old = """{storyPhase === 'ending2' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>"""
new = """{storyPhase === 'ending2' && (
            <ImageBackground source={ENDING_W1_COMPLETE_BG} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }} resizeMode="cover">
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending2: 背景')

old = """            </View>
          )}

          {storyPhase === 'ending3'"""
new = """            </ImageBackground>
          )}

          {storyPhase === 'ending3'"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending2: 閉じタグ')

# --- Ending 3: テツヤ ---
old = "storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。')"
new = "storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。')"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending3: テツヤセリフ')

old = "color: '#9b59b6', fontSize: 20, fontWeight: '900', letterSpacing: 3, textAlign: 'center', lineHeight: 32"
new = "color: '#9b59b6', fontSize: 18, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 30"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending3: フォント')

# Tetsuya voices (replace EYE_GLOW with TETSUYA voice only)
old = """                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});"""
new = """                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
                  playVoice(SFX_TETSUYA_APPEAR, 0.8);"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending3: テツヤ登場音')

# Tetsuya voice on text
old = "storyTypewriter('……ほう。\\n三日坊主を倒したか。"
new = "playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\\n三日坊主を倒したか。"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending3: テツヤボイス')

# --- Ending timing ---
# Footsteps slower
old = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500));"
new = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 2500));"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] 足音1: 2500ms')

old = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 3000));"
new = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 5500));"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] 足音2: 5500ms')

# Footstep volume
src = src.replace(
    "sound.setVolumeAsync(0.8).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)",
    "sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)", 1)
src = src.replace(
    "sound.setVolumeAsync(1.0).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)",
    "sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)", 1)
print('[OK] 足音音量')

# Silhouette timing
old = "SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});\n                }, 4000));"
if old not in src:
    # Already replaced EYE_GLOW, find new pattern
    old = "playVoice(SFX_TETSUYA_APPEAR, 0.8);\n                }, 4000));"
    new = "playVoice(SFX_TETSUYA_APPEAR, 0.8);\n                }, 7500));"
    if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] シルエット: 7500ms')

# Tetsuya text timing
old = "playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。'); }, 5500));"
new = "playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。'); }, 9500));"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] テツヤテキスト: 9500ms')

# ending1->ending2->ending3 transition
old = """              }, 4000);
            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>"""
new = """              }, 6000);
            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] 遷移: 6000ms')

# WIN_SOUND 3秒停止
old = "Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())).catch(e => {});"
new = "Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => { sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync()); setTimeout(() => { try { sound.stopAsync(); sound.unloadAsync(); } catch(e) {} }, 3000); }).catch(e => {});"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] WIN_SOUND: 3秒停止')

# --- Ending 4 ---
old = "{'―― 近日実装 ――'}"
new = "{'── 夜の支配者 ──'}"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending4: テキスト')

old = "{'── 夜の支配者 ──'}</Text>\n              </Animated.View>"
new = "{'── 夜の支配者 ──'}</Text>\n                <Text style={{ color: '#888', fontSize: 15, letterSpacing: 2, marginTop: 16, fontStyle: 'italic' }}>{'「逃げるなよ。」'}</Text>\n              </Animated.View>"
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] ending4: 逃げるなよ')

# --- Clear phase: 背景 ---
old = """{storyPhase === 'clear' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>"""
new = """{storyPhase === 'clear' && (
            <ImageBackground source={storyStage === 5 ? ENDING_CLEAR_BG : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} resizeMode="cover">
              {storyStage === 5 && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />}"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] clear: 背景')

old = """            </View>
          )}

        </Animated.View>
      </View>
    );
  }"""
new = """            </ImageBackground>
          )}

        </Animated.View>
      </View>
    );
  }"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] clear: 閉じタグ')

# --- アトデヤル タップヒント ---
old = """            <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 2 }}>{'アトデヤル'}</Text>
          </Pressable>
        </View>"""
new = """            <Text style={{ color: '#e74c3c', fontSize: 9, fontWeight: '900', textAlign: 'center', marginTop: 2 }}>{'アトデヤル'}</Text>
            <View style={{ backgroundColor: '#e67e22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 3 }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{'タップ！'}</Text>
            </View>
          </Pressable>
        </View>"""
if old in src: src = src.replace(old, new, 1); c += 1; print('[OK] アトデヤル: タップ')

# --- MK2アラームUI ---
old = """              )}

              {/* List input phase */}"""
alarm_ui = """              )}

              {mk2Phase === 'mk2_alarm' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2DD4BF', fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{'⏰ サムライアラーム'}</Text>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{'明日の起床時間をセットしろ。\\n撮影しないと止まらない。'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h + 1) % 24); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▲'}</Text></Pressable>
                      <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmHour).padStart(2, '0')}</Text>
                      <Pressable onPress={() => { playTapSound(); setAlarmHour(h => (h - 1 + 24) % 24); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▼'}</Text></Pressable>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 48, marginHorizontal: 8 }}>{':'}</Text>
                    <View style={{ alignItems: 'center' }}>
                      <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m + 15) % 60); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▲'}</Text></Pressable>
                      <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>{String(alarmMinute).padStart(2, '0')}</Text>
                      <Pressable onPress={() => { playTapSound(); setAlarmMinute(m => (m - 15 + 60) % 60); }} style={{ padding: 10 }}><Text style={{ color: '#2DD4BF', fontSize: 24 }}>{'▼'}</Text></Pressable>
                    </View>
                  </View>
                  <Text style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>{'📸 撮影ミッション'}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    {(['冷蔵庫', '洗面台', '玄関'] as const).map(m => (
                      <Pressable key={m} onPress={() => { playTapSound(); setAlarmMission(m); }} style={{ backgroundColor: alarmMission === m ? '#2DD4BF' : '#374151', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginHorizontal: 4 }}>
                        <Text style={{ color: alarmMission === m ? '#000' : '#fff', fontWeight: 'bold', fontSize: 14 }}>{m}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <TouchableOpacity onPress={async () => {
                    playConfirmSound();
                    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
                    const now = new Date(); let triggerDate = new Date();
                    triggerDate.setHours(alarmHour, alarmMinute, 0, 0);
                    if (triggerDate <= now) triggerDate.setDate(triggerDate.getDate() + 1);
                    if (alarmNotificationId) { await Notifications.cancelScheduledNotificationAsync(alarmNotificationId); }
                    const notifId = await Notifications.scheduleNotificationAsync({
                      content: { title: '⚔️ サムライキング参上', body: '起きろ！' + alarmMission + 'を撮影して目を覚ませ！', sound: true, data: { type: 'wakeup_alarm' } },
                      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
                    });
                    setAlarmNotificationId(notifId); setAlarmSet(true);
                    setMk2Done(prev => [...prev, 'alarm']); setMk2Phase('menu');
                    Alert.alert('⏰ アラームセット完了', alarmHour + ':' + String(alarmMinute).padStart(2, '0') + ' に起床せよ。\\n撮影場所：' + alarmMission);
                  }} style={{ backgroundColor: '#2DD4BF', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50 }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'アラームをセット'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMk2Phase('menu')} style={{ padding: 12, marginTop: 8 }}><Text style={{ color: '#666', fontSize: 13 }}>{'\u2190 \u623b\u308b'}</Text></TouchableOpacity>
                </View>
              )}

              {/* List input phase */}"""
if old in src: src = src.replace(old, alarm_ui, 1); c += 1; print('[OK] MK2アラームUI')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

# ============================================================
# PART 3: gameData.ts
# ============================================================
with open('src/data/gameData.ts', 'r', encoding='utf-8') as f:
    gd = f.read()

old = "sub: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\u304b\u5ba3\u8a00\u3057\u308d', phase: 'mk2_text'"
new = "sub: '\u30a2\u30e9\u30fc\u30e0\u3092\u30bb\u30c3\u30c8\u3057\u308d', phase: 'mk2_alarm'"
if old in gd: gd = gd.replace(old, new, 1); c += 1; print('[OK] gameData: alarm phase')

old = "    alarm: { title: '\u23f0 \u65e9\u8d77\u304d\u5ba3\u8a00', prompt: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\uff1f', ph: '\u4f8b\uff1a6:00\u306b\u8d77\u304d\u308b', btn: '\u5ba3\u8a00\u3059\u308b' },\n"
if old in gd: gd = gd.replace(old, '', 1); c += 1; print('[OK] gameData: TEXT_CFG alarm削除')

with open('src/data/gameData.ts', 'w', encoding='utf-8') as f:
    f.write(gd)

# ============================================================
# Verify
# ============================================================
s = open('App.tsx').read()
print(f'\n{{ {s.count(chr(123))} }} {s.count(chr(125))}')
print(f'( {s.count(chr(40))} ) {s.count(chr(41))}')
print(f'[ {s.count(chr(91))} ] {s.count(chr(93))}')
print(f'\n✅ 全{c}箇所変更完了')
