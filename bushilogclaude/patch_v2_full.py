#!/usr/bin/env python3
"""
BUSHIDO LOG v2 統合パッチ
Run from: bushilogclaude/ directory (after Step 1-3 refactoring)

BEFORE RUNNING: Place these files:
  sounds/voice_mk_appear.mp3, voice_mk_defeat.mp3
  sounds/voice_ato_appear.mp3, voice_ato_defeat.mp3
  sounds/voice_deebu_appear.mp3, voice_deebu_defeat.mp3
  sounds/voice_moumuri_appear.mp3, voice_moumuri_defeat.mp3
  sounds/voice_mk2_appear.mp3, voice_mk2_defeat.mp3
  sounds/voice_tetsuya_appear.mp3
  sounds/bgm_monster_appear.mp3, sfx_tetsuya_appear.mp3
  sounds/shonen9-himei3.mp3, shonen9-himei5.mp3, shonen10-uwaa.mp3
  sounds/shonen8-are.mp3, shonen8-tyottokituiya.mp3
  sounds/shonen3-yarareta.mp3, shonen10-maketanoka.mp3
  sounds/shonen6-usosonna.mp3, shonen8-itatamouugokenaiya.mp3
  sounds/shonen5_konnatokorode.mp3, shonen6-ittanhikuyo.mp3
  sounds/zyosei3-haibokuda.mp3, zyosei4-munendesu.mp3
  assets/ending_clear_bg.png
  assets/ending_w1_complete_bg.png
"""

# ============================================================
# PART 1: assets.ts - Add new require() statements
# ============================================================
with open('src/data/assets.ts', 'r', encoding='utf-8') as f:
    assets = f.read()

new_assets = """
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

// Monster BGM & SFX
export const BGM_MONSTER_APPEAR = require('../../sounds/bgm_monster_appear.mp3');
export const SFX_TETSUYA_APPEAR = require('../../sounds/sfx_tetsuya_appear.mp3');

// Scream voices (random during battle taps)
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

// Ending backgrounds
export const ENDING_CLEAR_BG = require('../../assets/ending_clear_bg.png');
export const ENDING_W1_COMPLETE_BG = require('../../assets/ending_w1_complete_bg.png');
"""

assets += new_assets
with open('src/data/assets.ts', 'w', encoding='utf-8') as f:
    f.write(assets)
print('[OK] assets.ts: 新アセット追加')

# ============================================================
# PART 2: App.tsx - Add imports + all changes
# ============================================================
with open('App.tsx', 'r', encoding='utf-8') as f:
    src = f.read()
changes = 0

# --- Add new imports ---
old_import = """  KATANA_SOUND, SFX_POLISH, SFX_KATANA_SHINE, SFX_FOOTSTEP, SFX_EYE_GLOW,"""
new_import = """  KATANA_SOUND, SFX_POLISH, SFX_KATANA_SHINE, SFX_FOOTSTEP, SFX_EYE_GLOW,
  VOICE_MK_APPEAR, VOICE_MK_DEFEAT, VOICE_ATO_APPEAR, VOICE_ATO_DEFEAT,
  VOICE_DEEBU_APPEAR, VOICE_DEEBU_DEFEAT, VOICE_MOUMURI_APPEAR, VOICE_MOUMURI_DEFEAT,
  VOICE_MK2_APPEAR, VOICE_MK2_DEFEAT, VOICE_TETSUYA_APPEAR,
  BGM_MONSTER_APPEAR, SFX_TETSUYA_APPEAR, SCREAM_VOICES,
  ENDING_CLEAR_BG, ENDING_W1_COMPLETE_BG,"""
if old_import in src:
    src = src.replace(old_import, new_import, 1); changes += 1
    print('[OK] imports: 新アセット追加')

# --- Helper: playVoice function (add after speakMikkabozu) ---
old_speak = """  const speakMikkabozu = async (text: string) => {
    try {
      if (!settings.autoVoice) return;"""
new_speak = """  const playVoice = async (voiceAsset: any, volume: number = 1.0) => {
    try {
      const { sound } = await Audio.Sound.createAsync(voiceAsset);
      await sound.setVolumeAsync(Math.min(volume, MASTER_VOLUME));
      await sound.playAsync();
    } catch(e) { console.log('voice play error', e); }
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
if old_speak in src:
    src = src.replace(old_speak, new_speak, 1); changes += 1
    print('[OK] playVoice + playRandomScream ヘルパー追加')

# --- Replace speakMikkabozu calls with pre-recorded voices ---
voice_map = [
    ("speakMikkabozu('どうせ三日で終わりでしょ')", "playVoice(VOICE_MK_APPEAR)"),
    ("speakMikkabozu('明日やればいいじゃん')", "playVoice(VOICE_ATO_APPEAR)"),
    ("speakMikkabozu('\\u52d5\\u304f\\u306e\\u3060\\u308b\\u3044')", "playVoice(VOICE_DEEBU_APPEAR)"),
    ("speakMikkabozu('\\u3082\\u3046\\u7121\\u7406\\u3060')", "playVoice(VOICE_MOUMURI_APPEAR)"),
    ("speakMikkabozu('\\u307e\\u305f\\u4f1a\\u3063\\u305f\\u306a')", "playVoice(VOICE_MK2_APPEAR)"),
    ("speakMikkabozu('\\u52d5\\u3051\\u308b\\u306e\\u304b\\u3088')", "playVoice(VOICE_DEEBU_DEFEAT)"),
    ("speakMikkabozu('\\u611f\\u8b1d\\u3067\\u304d\\u308b\\u306e\\u304b\\u3088')", "playVoice(VOICE_MOUMURI_DEFEAT)"),
    ("speakMikkabozu('3\\u65e5\\u7d9a\\u3051\\u3084\\u304c\\u3063\\u305f')", "playVoice(VOICE_MK2_DEFEAT)"),
]
for old_v, new_v in voice_map:
    if old_v in src:
        src = src.replace(old_v, new_v, 1); changes += 1
        print(f'[OK] voice: {new_v}')

# 負けたくやしいよ appears twice (mk and ato defeat)
# Need to replace by context (function name)
# First occurrence = onMissionComplete (Stage 1 mikkabozu)
old_mk_d = "setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('負けたくやしいよ'); }, 1500);\n  };\n\n  const countMissionTap"
new_mk_d = "setTimeout(() => { setStoryPhase('defeat'); playVoice(VOICE_MK_DEFEAT); }, 1500);\n  };\n\n  const countMissionTap"
if old_mk_d in src:
    src = src.replace(old_mk_d, new_mk_d, 1); changes += 1
    print('[OK] voice: VOICE_MK_DEFEAT (onMissionComplete)')

# Second occurrence = triggerAtodeyaruDefeat
old_ato_d = "setTimeout(() => { setStoryPhase('defeat'); speakMikkabozu('負けたくやしいよ'); }, 1500);\n  };\n\n  const checkAtodeyaru"
new_ato_d = "setTimeout(() => { setStoryPhase('defeat'); playVoice(VOICE_ATO_DEFEAT); }, 1500);\n  };\n\n  const checkAtodeyaru"
if old_ato_d in src:
    src = src.replace(old_ato_d, new_ato_d, 1); changes += 1
    print('[OK] voice: VOICE_ATO_DEFEAT (triggerAtodeyaruDefeat)')

# --- Add monster appear BGM to story event starts ---
# startStoryEvent: add BGM before voice
old_story_start = "playVoice(VOICE_MK_APPEAR)"
new_story_start = "playVoice(BGM_MONSTER_APPEAR); playVoice(VOICE_MK_APPEAR)"
if old_story_start in src:
    src = src.replace(old_story_start, new_story_start, 1); changes += 1
    print('[OK] BGM: 三日坊主登場')

old_ato_start = "playVoice(VOICE_ATO_APPEAR)"
new_ato_start = "playVoice(BGM_MONSTER_APPEAR); playVoice(VOICE_ATO_APPEAR)"
if old_ato_start in src:
    src = src.replace(old_ato_start, new_ato_start, 1); changes += 1
    print('[OK] BGM: アトデヤル登場')

old_deebu_start = "playVoice(VOICE_DEEBU_APPEAR)"
new_deebu_start = "playVoice(BGM_MONSTER_APPEAR); playVoice(VOICE_DEEBU_APPEAR)"
if old_deebu_start in src:
    src = src.replace(old_deebu_start, new_deebu_start, 1); changes += 1
    print('[OK] BGM: デーブ登場')

old_moumuri_start = "playVoice(VOICE_MOUMURI_APPEAR)"
new_moumuri_start = "playVoice(BGM_MONSTER_APPEAR); playVoice(VOICE_MOUMURI_APPEAR)"
if old_moumuri_start in src:
    src = src.replace(old_moumuri_start, new_moumuri_start, 1); changes += 1
    print('[OK] BGM: モウムリ登場')

old_mk2_start = "playVoice(VOICE_MK2_APPEAR)"
new_mk2_start = "playVoice(BGM_MONSTER_APPEAR); playVoice(VOICE_MK2_APPEAR)"
if old_mk2_start in src:
    src = src.replace(old_mk2_start, new_mk2_start, 1); changes += 1
    print('[OK] BGM: 三日坊主II登場')

# --- Add scream voices to training taps ---
# deebuTrainingTap: add random scream on every 3rd hit
old_deebu_tap = """  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}"""
new_deebu_tap = """  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    if (next % 4 === 0) playRandomScream();"""
if old_deebu_tap in src:
    src = src.replace(old_deebu_tap, new_deebu_tap, 1); changes += 1
    print('[OK] scream: デーブ筋トレタップ')

# countMissionTap: add random scream
old_mission_tap = """  const countMissionTap = async () => {
    const next = missionCount + 1; setMissionCount(next);"""
new_mission_tap = """  const countMissionTap = async () => {
    const next = missionCount + 1; setMissionCount(next);
    if (next % 3 === 0) playRandomScream();"""
if old_mission_tap in src:
    src = src.replace(old_mission_tap, new_mission_tap, 1); changes += 1
    print('[OK] scream: ミッションタップ')

# mk2 training tap
old_mk2_tap = "    const next = mk2Hits + 1; setMk2Hits(next);\n    try { Haptics.impactAsync"
new_mk2_tap = "    const next = mk2Hits + 1; setMk2Hits(next);\n    if (next % 4 === 0) playRandomScream();\n    try { Haptics.impactAsync"
if old_mk2_tap in src:
    src = src.replace(old_mk2_tap, new_mk2_tap, 1); changes += 1
    print('[OK] scream: MK2筋トレタップ')

# --- ENDING 1: セリフ ---
old = "storyTypewriter('お前はもう\\n三日坊主ではない。'), 800)"
new = "storyTypewriter('三日。\\nたった三日。\\n\\n「どうせ続かない」\\n「お前には無理だ」\\n「また明日でいい」\\n\\n全部、斬った。\\n\\nお前は──侍だ。'), 800)"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending1: セリフ')

# ENDING 1: フォント
old = "color: '#DAA520', fontSize: 28, fontWeight: '900', letterSpacing: 6, textAlign: 'center'"
new = "color: '#DAA520', fontSize: 20, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 34"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending1: フォント')

# --- ENDING 2: 称号 + 背景画 ---
old = "{'三日坊主を倒した。'}"
new = "{'── 三日坊主殺し ──'}"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending2: 称号')

# ending2 background
old_e2 = """{storyPhase === 'ending2' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>"""
new_e2 = """{storyPhase === 'ending2' && (
            <ImageBackground source={ENDING_W1_COMPLETE_BG} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }} resizeMode="cover">
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />"""
if old_e2 in src:
    src = src.replace(old_e2, new_e2, 1); changes += 1
    print('[OK] ending2: 背景画追加')

# ending2 closing tag
old_e2_close = """            </View>
          )}

          {storyPhase === 'ending3'"""
new_e2_close = """            </ImageBackground>
          )}

          {storyPhase === 'ending3'"""
if old_e2_close in src:
    src = src.replace(old_e2_close, new_e2_close, 1); changes += 1
    print('[OK] ending2: 閉じタグ修正')

# --- ENDING 3: テツヤセリフ ---
old = "storyTypewriter('三日坊主が負けたか。\\n\\n俺はテツヤ。\\n夜を支配する者だ。\\n\\n……面白い。')"
new = "storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。')"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending3: テツヤセリフ')

# ending3 フォント
old = "color: '#9b59b6', fontSize: 20, fontWeight: '900', letterSpacing: 3, textAlign: 'center', lineHeight: 32"
new = "color: '#9b59b6', fontSize: 18, fontWeight: '900', letterSpacing: 2, textAlign: 'center', lineHeight: 30"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending3: フォント')

# Add tetsuya voice to ending3 (when silhouette appears)
old_tet = "Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n                  Audio.Sound.createAsync(SFX_EYE_GLOW)"
new_tet = "Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n                  playVoice(SFX_TETSUYA_APPEAR, 0.8);\n                  Audio.Sound.createAsync(SFX_EYE_GLOW)"
if old_tet in src:
    src = src.replace(old_tet, new_tet, 1); changes += 1
    print('[OK] ending3: テツヤ登場音')

# Add tetsuya voice when text appears
old_tet2 = "storyTypewriter('……ほう。\\n三日坊主を倒したか。"
new_tet2 = "playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\\n三日坊主を倒したか。"
if old_tet2 in src:
    src = src.replace(old_tet2, new_tet2, 1); changes += 1
    print('[OK] ending3: テツヤボイス')

# --- ENDING 4: テキスト ---
old = "{'―― 近日実装 ――'}"
new = "{'── 夜の支配者 ──'}"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending4: テキスト')

# ending4: 逃げるなよ
old = "{'── 夜の支配者 ──'}</Text>\n              </Animated.View>"
new = "{'── 夜の支配者 ──'}</Text>\n                <Text style={{ color: '#888', fontSize: 15, letterSpacing: 2, marginTop: 16, fontStyle: 'italic' }}>{'「逃げるなよ。」'}</Text>\n              </Animated.View>"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] ending4: 逃げるなよ')

# --- CLEAR PHASE: 背景画 ---
old_clear = """{storyPhase === 'clear' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>"""
new_clear = """{storyPhase === 'clear' && (
            <ImageBackground source={storyStage === 5 ? ENDING_CLEAR_BG : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} resizeMode="cover">
              {storyStage === 5 && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />}"""
if old_clear in src:
    src = src.replace(old_clear, new_clear, 1); changes += 1
    print('[OK] clear: 背景画追加')

# clear closing tag
old_clear_close = """            </View>
          )}

        </Animated.View>
      </View>
    );
  }"""
new_clear_close = """            </ImageBackground>
          )}

        </Animated.View>
      </View>
    );
  }"""
if old_clear_close in src:
    src = src.replace(old_clear_close, new_clear_close, 1); changes += 1
    print('[OK] clear: 閉じタグ修正')

# --- 「見事だ」削除 ---
old = "    speakSamurai('\\u898b\\u4e8b\\u3060'); samuraiSpeak('\\u898b\\u4e8b\\u3060');\n"
c = src.count(old)
if c > 0:
    src = src.replace(old, ''); changes += c
    print(f'[OK] 見事だ削除: {c}箇所')

old2 = " samuraiSpeak('……見事だ。');"
if old2 in src:
    src = src.replace(old2, '', 1); changes += 1
    print('[OK] ビデオ見事だ削除')

# --- 連打ガード ---
for fname, guard_name in [
    ("const triggerDeebuDefeat = async () => {\n    setStoryStage(3);", "deebuDefeatingRef"),
    ("const triggerMk2Defeat = async () => {\n    setStoryStage(5);", "mk2DefeatingRef"),
    ("const triggerMoumuriDefeat = async () => {", "moumuriDefeatingRef"),
    ("const onMissionComplete = async () => {", "missionCompletingRef"),
]:
    if fname in src:
        guard = f"  const {guard_name} = useRef(false);\n  {fname}\n    if ({guard_name}.current) return;\n    {guard_name}.current = true;"
        src = src.replace(f"  {fname}", guard, 1); changes += 1
        print(f'[OK] 連打ガード: {guard_name}')

# --- 足音タイミング ---
old = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500));"
new = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 2500));"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] 足音1: 2500ms')

old = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 3000));"
new = "Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 5500));"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] 足音2: 5500ms')

old = "SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});\n                }, 4000));"
new = "SFX_EYE_GLOW).then(({sound}) => { endingSounds.current.push(sound); sound.setVolumeAsync(0.6).then(() => sound.playAsync()); }).catch(e => {});\n                }, 7500));"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] シルエット: 7500ms')

# Tetsuya text timing
old = "playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。'); }, 5500));"
new = "playVoice(VOICE_TETSUYA_APPEAR); storyTypewriter('……ほう。\\n三日坊主を倒したか。\\n\\nだが、夜はまだ長い。\\n俺はテツヤ。\\n\\nお前が寝ない限り、\\n俺は消えない。\\n\\n……楽しみにしてろ。'); }, 9500));"
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] テツヤテキスト: 9500ms')

old_trans = """              }, 4000);
            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>"""
new_trans = """              }, 6000);
            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>"""
if old_trans in src:
    src = src.replace(old_trans, new_trans, 1); changes += 1
    print('[OK] エンディング遷移: 6000ms')

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
if old in src:
    src = src.replace(old, new, 1); changes += 1
    print('[OK] アトデヤル: タップヒント')

# --- MK2アラームUI ---
old = """              )}

              {/* List input phase */}"""
alarm_ui = """              )}

              {/* Alarm phase - connects to Samurai Alarm */}
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
if old in src:
    src = src.replace(old, alarm_ui, 1); changes += 1
    print('[OK] MK2アラームUI')

# --- ImageBackground import check ---
if 'ImageBackground' not in src.split('from \'react-native\'')[0].split('import {')[-1]:
    old_rn = "  Image,\n"
    new_rn = "  Image,\n  ImageBackground,\n"
    if old_rn in src and 'ImageBackground' not in src[:500]:
        src = src.replace(old_rn, new_rn, 1); changes += 1
        print('[OK] ImageBackground import追加')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(src)

# ============================================================
# PART 3: gameData.ts
# ============================================================
with open('src/data/gameData.ts', 'r', encoding='utf-8') as f:
    gd = f.read()

old_alarm = "sub: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\u304b\u5ba3\u8a00\u3057\u308d', phase: 'mk2_text'"
new_alarm = "sub: '\u30a2\u30e9\u30fc\u30e0\u3092\u30bb\u30c3\u30c8\u3057\u308d', phase: 'mk2_alarm'"
if old_alarm in gd:
    gd = gd.replace(old_alarm, new_alarm, 1); changes += 1
    print('[OK] gameData: alarm phase')

old_cfg = "    alarm: { title: '\u23f0 \u65e9\u8d77\u304d\u5ba3\u8a00', prompt: '\u660e\u65e5\u4f55\u6642\u306b\u8d77\u304d\u308b\uff1f', ph: '\u4f8b\uff1a6:00\u306b\u8d77\u304d\u308b', btn: '\u5ba3\u8a00\u3059\u308b' },\n"
if old_cfg in gd:
    gd = gd.replace(old_cfg, '', 1); changes += 1
    print('[OK] gameData: TEXT_CFGからalarm削除')

with open('src/data/gameData.ts', 'w', encoding='utf-8') as f:
    f.write(gd)

print(f'\n✅ v2統合パッチ完了！ {changes}箇所変更')
