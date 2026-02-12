#!/usr/bin/env python3
"""
MK2 consult mission: send text to samurai king API, show reply, then complete.
"""
FILE = 'App.tsx'

def patch(content, old, new, label):
    if old not in content:
        print(f'[SKIP] {label}')
        return content
    content = content.replace(old, new, 1)
    print(f'[OK]   {label}')
    return content

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. Add state for samurai reply + loading
src = patch(src,
    "  const [mk2Flash, setMk2Flash] = useState(false);",
    "  const [mk2Flash, setMk2Flash] = useState(false);\n"
    "  const [mk2SamuraiReply, setMk2SamuraiReply] = useState('');\n"
    "  const [mk2ConsultLoading, setMk2ConsultLoading] = useState(false);",
    '1. state')

# 2. Modify mk2SubmitText to handle consult specially
src = patch(src,
    "  const mk2SubmitText = () => {\n"
    "    if (!mk2TextVal.trim()) return;\n"
    "    playTapSound();\n"
    "    setMk2Done(prev => [...prev, mk2CM]);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    // Save to dailyLogs\n"
    "    const tagMap: { [k: string]: string } = { goal: '\\u76ee\\u6a19', alarm: '\\u65e9\\u8d77\\u304d', consult: '\\u76f8\\u8ac7', diary: '\\u65e5\\u8a18' };\n"
    "    const tag = tagMap[mk2CM] || mk2CM;\n"
    "    const deedText = '\\u3010' + tag + '\\u3011' + mk2TextVal.trim();\n"
    "    upsertTodayLog(prev => ({\n"
    "      date: getTodayStr(), mission: prev?.mission || '', routines: prev?.routines || [],\n"
    "      todos: prev?.todos || [], samuraiMission: prev?.samuraiMission,\n"
    "      missionCompleted: prev?.missionCompleted, routineDone: prev?.routineDone || [],\n"
    "      review: prev?.review, goodDeeds: [...(prev?.goodDeeds || []), deedText],\n"
    "    }));\n"
    "    setMk2TextVal(''); setMk2Phase('menu');\n"
    "  };",

    "  const mk2SubmitText = async () => {\n"
    "    if (!mk2TextVal.trim()) return;\n"
    "    playTapSound();\n"
    "    // Save to dailyLogs\n"
    "    const tagMap: { [k: string]: string } = { goal: '\\u76ee\\u6a19', alarm: '\\u65e9\\u8d77\\u304d', consult: '\\u76f8\\u8ac7', diary: '\\u65e5\\u8a18' };\n"
    "    const tag = tagMap[mk2CM] || mk2CM;\n"
    "    const deedText = '\\u3010' + tag + '\\u3011' + mk2TextVal.trim();\n"
    "    upsertTodayLog(prev => ({\n"
    "      date: getTodayStr(), mission: prev?.mission || '', routines: prev?.routines || [],\n"
    "      todos: prev?.todos || [], samuraiMission: prev?.samuraiMission,\n"
    "      missionCompleted: prev?.missionCompleted, routineDone: prev?.routineDone || [],\n"
    "      review: prev?.review, goodDeeds: [...(prev?.goodDeeds || []), deedText],\n"
    "    }));\n"
    "    // Consult: send to samurai king\n"
    "    if (mk2CM === 'consult') {\n"
    "      setMk2ConsultLoading(true); setMk2SamuraiReply('');\n"
    "      setMk2Phase('mk2_consult_reply');\n"
    "      try {\n"
    "        const reply = await callSamuraiKing(mk2TextVal.trim());\n"
    "        setMk2SamuraiReply(reply);\n"
    "      } catch(e) {\n"
    "        setMk2SamuraiReply('\\u901a\\u4fe1\\u30a8\\u30e9\\u30fc\\u3067\\u3054\\u3056\\u308b\\u3002\\u3057\\u304b\\u3057\\u60a9\\u307f\\u3092\\u66f8\\u3044\\u305f\\u3053\\u3068\\u306f\\u7acb\\u6d3e\\u3067\\u3054\\u3056\\u308b\\u3002');\n"
    "      }\n"
    "      setMk2ConsultLoading(false);\n"
    "      return;\n"
    "    }\n"
    "    // Other text missions: complete immediately\n"
    "    setMk2Done(prev => [...prev, mk2CM]);\n"
    "    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}\n"
    "    setMk2TextVal(''); setMk2Phase('menu');\n"
    "  };",
    '2. consult logic')

# 3. Add consult reply UI phase (before training select phase)
src = patch(src,
    "              {/* Training select */}\n"
    "              {mk2Phase === 'mk2_ts' && (",

    "              {/* Consult reply */}\n"
    "              {mk2Phase === 'mk2_consult_reply' && (\n"
    "                <View style={{ alignItems: 'center' }}>\n"
    "                  <Text style={{ color: '#DAA520', fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: 2 }}>{'\\u{1f3ef} \\u4f8d\\u30ad\\u30f3\\u30b0\\u306e\\u8a00\\u8449'}</Text>\n"
    "                  {mk2ConsultLoading ? (\n"
    "                    <View style={{ alignItems: 'center', paddingVertical: 40 }}>\n"
    "                      <ActivityIndicator size=\"large\" color=\"#DAA520\" />\n"
    "                      <Text style={{ color: '#888', fontSize: 13, marginTop: 12 }}>{'\\u4f8d\\u304c\\u8003\\u3048\\u4e2d...'}</Text>\n"
    "                    </View>\n"
    "                  ) : (\n"
    "                    <View style={{ width: '100%' }}>\n"
    "                      <View style={{ backgroundColor: 'rgba(218,165,32,0.1)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 16, padding: 20, marginBottom: 20 }}>\n"
    "                        <Text style={{ color: '#ddd', fontSize: 15, lineHeight: 24 }}>{mk2SamuraiReply}</Text>\n"
    "                      </View>\n"
    "                      <TouchableOpacity onPress={() => { setMk2Done(prev => [...prev, 'consult']); try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {} setMk2TextVal(''); setMk2Phase('menu'); }} style={{ backgroundColor: '#DAA520', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>\n"
    "                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>{'\\u627f\\u77e5\\uff01'}</Text>\n"
    "                      </TouchableOpacity>\n"
    "                    </View>\n"
    "                  )}\n"
    "                </View>\n"
    "              )}\n\n"
    "              {/* Training select */}\n"
    "              {mk2Phase === 'mk2_ts' && (",
    '3. consult reply UI')

if src == original:
    print('\n[ERROR] No changes')
    import sys; sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
