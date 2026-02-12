#!/usr/bin/env python3
"""
MK2 Ending v2: Cinematic ending with tetsuya silhouette
Flow:
  clear → ending1 (「……見事だ。」 short, heavy)
  → ending2 (WORLD 1 COMPLETE, gold, 3s auto)
  → ending3 (darkness → footsteps → silhouette fade in → eye glow → text)
  → ending4 (WORLD 2 近日実装 → 修行の間へ)
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

# 1. Add requires for new assets
p("const MOUMURI_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_moumuri.mp4');",
  "const MOUMURI_DEFEAT_VIDEO = require('./assets/yokai/loseyokai_moumuri.mp4');\n"
  "const TETSUYA_SILHOUETTE = require('./assets/yokai/tetsuya_silhouette.png');\n"
  "const SFX_FOOTSTEP = require('./sounds/sfx_footstep.mp3');\n"
  "const SFX_EYE_GLOW = require('./sounds/sfx_eye_glow.mp3');",
  '1. requires')

# 2. Add ending4 to storyPhase type
p("'ending1'|'ending2'|'ending3'>('dark')",
  "'ending1'|'ending2'|'ending3'|'ending4'>('dark')",
  '2. storyPhase type')

# 3. Add animation refs
p("  const [endingText, setEndingText] = useState('');",
  "  const [endingText, setEndingText] = useState('');\n"
  "  const endingSilhouetteOp = useRef(new Animated.Value(0)).current;\n"
  "  const endingW1Op = useRef(new Animated.Value(0)).current;\n"
  "  const endingW2Op = useRef(new Animated.Value(0)).current;",
  '3. anim refs')

# 4. Replace clear button to trigger new ending1
p("""              <TouchableOpacity onPress={() => { if (storyStage === 5) { setEndingText(''); setStoryPhase('ending1'); setTimeout(() => { storyTypewriter('見事だ。お前はもう三日坊主ではない。\\n\\nだが…修行の道はまだ続く。\\nこの先に、さらなる試練が待っている。'); }, 500); } else { completeStoryEvent(); } }} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{storyStage === 5 ? '次へ' : '修行の間へ'}</Text>
              </TouchableOpacity>""",

  """              <TouchableOpacity onPress={() => { if (storyStage === 5) { setStoryPhase('ending1'); setTimeout(() => storyTypewriter('……見事だ。'), 800); } else { completeStoryEvent(); } }} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{storyStage === 5 ? '次へ' : '修行の間へ'}</Text>
              </TouchableOpacity>""",
  '4. clear button')

# 5. Replace ALL old ending UIs with new cinematic ones
OLD_ENDINGS = (
  "          {storyPhase === 'ending1' && (\n"
  "            <ImageBackground source={STORY_SCENE2_IMG} style={{ flex: 1 }} resizeMode=\"cover\">\n"
  "              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "                <Image source={CHARACTER_IMAGES[samuraiLevel] || CHARACTER_IMAGES[1]} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: '#DAA520' }} resizeMode=\"contain\" />\n"
  "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>{'侍キング'}</Text>\n"
  "                <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 24, width: '100%', marginBottom: 30 }}>\n"
  "                  <Text style={{ color: '#fff', fontSize: 17, lineHeight: 28, textAlign: 'center' }}>{storyTypeText}</Text>\n"
  "                </View>\n"
  "                {storyTypingDone && (\n"
  "                  <TouchableOpacity onPress={() => { setStoryPhase('ending2'); setTimeout(() => { storyTypewriter('くそ…お前はもう\\n三日坊主じゃない…\\n\\nだが覚えておけ。\\n次の奴は俺より遥かに強い。\\n\\n…せいぜい生き残れよ。'); }, 500); }} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
  "                    <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'次へ'}</Text>\n"
  "                  </TouchableOpacity>\n"
  "                )}\n"
  "              </View>\n"
  "            </ImageBackground>\n"
  "          )}\n"
  "\n"
  "          {storyPhase === 'ending2' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "              <Image source={YOKAI_IMAGES.mikkabozu} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20, opacity: 0.6 }} resizeMode=\"contain\" />\n"
  "              <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 16 }}>{'三日坊主II'}</Text>\n"
  "              <View style={{ backgroundColor: 'rgba(231,76,60,0.08)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 16, padding: 24, width: '100%', marginBottom: 30 }}>\n"
  "                <Text style={{ color: '#ccc', fontSize: 17, lineHeight: 28, textAlign: 'center' }}>{storyTypeText}</Text>\n"
  "              </View>\n"
  "              {storyTypingDone && (\n"
  "                <TouchableOpacity onPress={() => { setStoryPhase('ending3'); }} style={{ backgroundColor: 'rgba(231,76,60,0.15)', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
  "                  <Text style={{ color: '#e74c3c', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'次へ'}</Text>\n"
  "                </TouchableOpacity>\n"
  "              )}\n"
  "            </View>\n"
  "          )}\n"
  "\n"
  "          {storyPhase === 'ending3' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>\n"
  "              <Text style={{ color: '#DAA520', fontSize: 14, letterSpacing: 3, marginBottom: 8 }}>{'WORLD 1 COMPLETE'}</Text>\n"
  "              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 30 }}>{'…新たな敵が待っている'}</Text>\n"
  "              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>\n"
  "                <View style={{ alignItems: 'center', marginRight: 30 }}>\n"
  "                  <Image source={NODE_BOSS} style={{ width: 50, height: 50, opacity: 0.3 }} resizeMode=\"contain\" />\n"
  "                  <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{'三日坊主II'}</Text>\n"
  "                  <Text style={{ color: '#2ecc71', fontSize: 10 }}>{'CLEAR'}</Text>\n"
  "                </View>\n"
  "                <Text style={{ color: '#555', fontSize: 24 }}>{'→'}</Text>\n"
  "                <View style={{ alignItems: 'center', marginLeft: 30 }}>\n"
  "                  <Image source={NODE_LOCKED} style={{ width: 50, height: 50 }} resizeMode=\"contain\" />\n"
  "                  <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '900', marginTop: 4 }}>{'???'}</Text>\n"
  "                  <Text style={{ color: '#e74c3c', fontSize: 10 }}>{'COMING SOON'}</Text>\n"
  "                </View>\n"
  "              </View>\n"
  "              <TouchableOpacity onPress={completeStoryEvent} style={{ backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>\n"
  "                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'修行の間へ'}</Text>\n"
  "              </TouchableOpacity>\n"
  "            </View>\n"
  "          )}"
)

NEW_ENDINGS = (
  # === ENDING 1: 「……見事だ。」 short, heavy ===
  "          {storyPhase === 'ending1' && (\n"
  "            <Pressable onPress={() => { if (storyTypingDone) {\n"
  "              endingW1Op.setValue(0);\n"
  "              setStoryPhase('ending2');\n"
  "              Animated.timing(endingW1Op, { toValue: 1, duration: 1500, useNativeDriver: true }).start();\n"
  "              Audio.Sound.createAsync(WIN_SOUND).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())).catch(e => {});\n"
  "              setTimeout(() => {\n"
  "                setStoryPhase('ending3');\n"
  "                endingSilhouetteOp.setValue(0);\n"
  "                // Footstep sequence\n"
  "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.7).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 1500);\n"
  "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.8).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 2800);\n"
  "                setTimeout(() => { Audio.Sound.createAsync(SFX_FOOTSTEP).then(({sound}) => sound.setVolumeAsync(0.9).then(() => sound.playAsync())).catch(e => {}); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {} }, 4100);\n"
  "                // Silhouette fade in\n"
  "                setTimeout(() => {\n"
  "                  Animated.timing(endingSilhouetteOp, { toValue: 1, duration: 2000, useNativeDriver: true }).start();\n"
  "                  Audio.Sound.createAsync(SFX_EYE_GLOW).then(({sound}) => sound.setVolumeAsync(0.6).then(() => sound.playAsync())).catch(e => {});\n"
  "                }, 5500);\n"
  "                // Text appears\n"
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
  "          )}"
)

p(OLD_ENDINGS, NEW_ENDINGS, '5. replace endings')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
