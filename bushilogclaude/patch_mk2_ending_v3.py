#!/usr/bin/env python3
"""
MK2 Cinematic Ending - STANDALONE
Apply after: stage5 + test + consult (NO old ending patch needed)

Flow:
  clear -> ending1 (「……見事だ。」black + gold, tap)
  -> ending2 (WORLD 1 COMPLETE, fade in, auto 4s)
  -> ending3 (darkness -> footsteps x3 -> silhouette fade -> eye glow -> purple text, tap)
  -> ending4 (WORLD 2 近日実装 -> 修行の間へ)
"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

def p(old, new, label):
    global src
    if old not in src:
        print(f'[SKIP] {label}')
        return False
    src = src.replace(old, new, 1)
    print(f'[OK]   {label}')
    return True

# 1. Add requires
p("const MOUMURI_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_moumuri.mp4');",
  "const MOUMURI_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_moumuri.mp4');\n"
  "const TETSUYA_SILHOUETTE = require('./assets/yokai/tetsuya_silhouette.png');\n"
  "const SFX_FOOTSTEP = require('./sounds/sfx_footstep.mp3');\n"
  "const SFX_EYE_GLOW = require('./sounds/sfx_eye_glow.mp3');",
  '1. requires')

# 2. Add ending phases to storyPhase type
p("useState<'dark'|'eyes'|'scenes'|'missionSelect'|'missionBrief'|'mission'|'quiz'|'defeat'|'victory'|'clear'>('dark')",
  "useState<'dark'|'eyes'|'scenes'|'missionSelect'|'missionBrief'|'mission'|'quiz'|'defeat'|'victory'|'clear'|'ending1'|'ending2'|'ending3'|'ending4'>('dark')",
  '2. storyPhase type')

# 3. Add state + anim refs
p("  const [mk2Flash, setMk2Flash] = useState(false);",
  "  const [mk2Flash, setMk2Flash] = useState(false);\n"
  "  const endingSilhouetteOp = useRef(new Animated.Value(0)).current;\n"
  "  const endingW1Op = useRef(new Animated.Value(0)).current;\n"
  "  const endingW2Op = useRef(new Animated.Value(0)).current;",
  '3. anim refs')

# 4. Modify clear button for stage 5
p("""              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'修行の間へ'}</Text>
              </TouchableOpacity>""",

  """              <TouchableOpacity onPress={() => { if (storyStage === 5) { setStoryPhase('ending1'); setTimeout(() => storyTypewriter('……見事だ。'), 800); } else { completeStoryEvent(); } }} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{storyStage === 5 ? '次へ' : '修行の間へ'}</Text>
              </TouchableOpacity>""",
  '4. clear button')

# 5. Insert ending UI before clear phase
ENDING_UI = (
  # === ENDING 1: 「……見事だ。」 ===
  "          {storyPhase === 'ending1' && (\n"
  "            <Pressable onPress={() => { if (storyTypingDone) {\n"
  "              endingW1Op.setValue(0);\n"
  "              setStoryPhase('ending2');\n"
  "              Animated.timing(endingW1Op, { toValue: 1, duration: 1500, useNativeDriver: true }).start();\n"
  "              Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())).catch(e => {});\n"
  "              setTimeout(() => {\n"
  "                setStoryPhase('ending3');\n"
  "                endingSilhouetteOp.setValue(0);\n"
  "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.7).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500);\n"
  "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.8).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 2800);\n"
  "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.9).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 4100);\n"
  "                setTimeout(() => {\n"
  "                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n"
  "                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => sound.setVolumeAsync(0.6).then(() => sound.playAsync())).catch(e => {});\n"
  "                }, 5500);\n"
  "                setTimeout(() => { storyTypewriter('三日坊主が負けたか。\\n\\n……面白い。'); }, 7500);\n"
  "              }, 4000);\n"
  "            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "              <Text style={{ color: '#DAA520', fontSize: 28, fontWeight: '900', letterSpacing: 6, textAlign: 'center' }}>{storyTypeText}</Text>\n"
  "              {storyTypingDone && (\n"
  "                <Text style={{ color: '#555', fontSize: 12, marginTop: 40 }}>{'タップで次へ'}</Text>\n"
  "              )}\n"
  "            </Pressable>\n"
  "          )}\n\n"

  # === ENDING 2: WORLD 1 COMPLETE (auto 4s) ===
  "          {storyPhase === 'ending2' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "              <Animated.View style={{ opacity: endingW1Op, alignItems: 'center' }}>\n"
  "                <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 5, marginBottom: 12 }}>{'WORLD 1'}</Text>\n"
  "                <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 6, marginBottom: 16 }}>{'COMPLETE'}</Text>\n"
  "                <View style={{ width: 60, height: 2, backgroundColor: '#DAA520', marginBottom: 16 }} />\n"
  "                <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 2 }}>{'三日坊主を倒した。'}</Text>\n"
  "              </Animated.View>\n"
  "            </View>\n"
  "          )}\n\n"

  # === ENDING 3: Darkness → footsteps → silhouette → text ===
  "          {storyPhase === 'ending3' && (\n"
  "            <Pressable onPress={() => { if (storyTypingDone) {\n"
  "              endingW2Op.setValue(0);\n"
  "              setStoryPhase('ending4');\n"
  "              Animated.timing(endingW2Op, { toValue: 1, duration: 1500, useNativeDriver: true }).start();\n"
  "            } }} style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "              <Animated.Image source={TETSUYA_SILHOUETTE} style={{ width: 200, height: 200, opacity: endingSilhouetteOp, marginBottom: 30 }} resizeMode=\"contain\" />\n"
  "              <Text style={{ color: '#9b59b6', fontSize: 20, fontWeight: '900', letterSpacing: 3, textAlign: 'center', lineHeight: 32 }}>{storyTypeText}</Text>\n"
  "              {storyTypingDone && (\n"
  "                <Text style={{ color: '#555', fontSize: 12, marginTop: 40 }}>{'タップで次へ'}</Text>\n"
  "              )}\n"
  "            </Pressable>\n"
  "          )}\n\n"

  # === ENDING 4: WORLD 2 近日実装 ===
  "          {storyPhase === 'ending4' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "              <Animated.View style={{ opacity: endingW2Op, alignItems: 'center' }}>\n"
  "                <Text style={{ color: '#9b59b6', fontSize: 14, letterSpacing: 5, marginBottom: 12 }}>{'WORLD 2'}</Text>\n"
  "                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 30 }}>{'―― 近日実装 ――'}</Text>\n"
  "              </Animated.View>\n"
  "              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 40, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
  "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'修行の間へ'}</Text>\n"
  "              </TouchableOpacity>\n"
  "            </View>\n"
  "          )}\n\n"
)

p("          {storyPhase === 'clear' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>",
  ENDING_UI +
  "          {storyPhase === 'clear' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>",
  '5. ending UI')

# 6. ??? node on map
p("{ id: 5, name: '三日坊主II', icon: NODE_BOSS, cleared: mk2EventDone, x: 0.5, y: 0.21 },",
  "{ id: 5, name: '三日坊主II', icon: NODE_BOSS, cleared: mk2EventDone, x: 0.5, y: 0.21 },\n"
  "        { id: 6, name: '???', icon: NODE_LOCKED, cleared: false, x: 0.5, y: 0.08 },",
  '6. ??? node')

# 7. ??? tap handler
p("else if (isNext && stage.id === 5) { startMk2Event(); } else if (isNext) showSaveSuccess('近日実装');",
  "else if (isNext && stage.id === 5) { startMk2Event(); } else if (stage.id === 6) { showSaveSuccess('新たな敵が待っている…'); } else if (isNext) showSaveSuccess('近日実装');",
  '7. ??? tap')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
