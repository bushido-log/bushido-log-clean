#!/usr/bin/env python3
"""
MK2 ending: samurai praise -> mikkabozu hints next -> ??? on map
"""
FILE = 'App.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

def p(old, new, label):
    global src
    if old not in src:
        print(f'[SKIP] {label}')
        return
    src = src.replace(old, new, 1)
    print(f'[OK]   {label}')

# 1. storyPhase type
p("useState<'dark'|'eyes'|'scenes'|'missionSelect'|'missionBrief'|'mission'|'quiz'|'defeat'|'victory'|'clear'>('dark')",
  "useState<'dark'|'eyes'|'scenes'|'missionSelect'|'missionBrief'|'mission'|'quiz'|'defeat'|'victory'|'clear'|'ending1'|'ending2'|'ending3'>('dark')",
  '1. storyPhase type')

# 2. ending state
p("  const [mk2Flash, setMk2Flash] = useState(false);",
  "  const [mk2Flash, setMk2Flash] = useState(false);\n"
  "  const [endingText, setEndingText] = useState('');",
  '2. ending state')

# 3. clear button -> ending for stage 5
p("""              <TouchableOpacity onPress={completeStoryEvent} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{'修行の間へ'}</Text>
              </TouchableOpacity>""",

  """              <TouchableOpacity onPress={() => { if (storyStage === 5) { setEndingText(''); setStoryPhase('ending1'); setTimeout(() => { storyTypewriter('見事だ。お前はもう三日坊主ではない。\\n\\nだが…修行の道はまだ続く。\\nこの先に、さらなる試練が待っている。'); }, 500); } else { completeStoryEvent(); } }} style={{ marginTop: 30, backgroundColor: 'rgba(218,165,32,0.2)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 50 }}>
                <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', letterSpacing: 2 }}>{storyStage === 5 ? '次へ' : '修行の間へ'}</Text>
              </TouchableOpacity>""",
  '3. clear button')

# 4. ending scenes UI
ENDING_UI = (
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
  "          )}\n\n"
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
  "          )}\n\n"
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
  "                <Text style={{ color: '#555', fontSize: 24 }}>{'\u2192'}</Text>\n"
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
  "          )}\n\n"
)

p("          {storyPhase === 'clear' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>",
  ENDING_UI +
  "          {storyPhase === 'clear' && (\n"
  "            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>",
  '4. ending UI')

# 5. ??? node on map
p("{ id: 5, name: '\u4e09\u65e5\u574a\u4e3bII', icon: NODE_BOSS, cleared: mk2EventDone, x: 0.5, y: 0.21 },",
  "{ id: 5, name: '\u4e09\u65e5\u574a\u4e3bII', icon: NODE_BOSS, cleared: mk2EventDone, x: 0.5, y: 0.21 },\n"
  "        { id: 6, name: '???', icon: NODE_LOCKED, cleared: false, x: 0.5, y: 0.08 },",
  '5. ??? node')

# 6. ??? tap handler
p("else if (isNext && stage.id === 5) { startMk2Event(); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
  "else if (isNext && stage.id === 5) { startMk2Event(); } else if (stage.id === 6) { showSaveSuccess('\u65b0\u305f\u306a\u6575\u304c\u5f85\u3063\u3066\u3044\u308b\u2026'); } else if (isNext) showSaveSuccess('\u8fd1\u65e5\u5b9f\u88c5');",
  '6. ??? tap')

if src == original:
    print('\n[ERROR] No changes'); import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
