#!/usr/bin/env python3
"""
ミッション選択システム追加
- カウント系（腕立て/スクワット/腹筋）
- クイズ系（英単語/ことわざ/雑学）
- 難易度はステージで変動
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    count = 0

    # =========================================
    # 1. Expand storyPhase type
    # =========================================
    old_type = "useState<'dark'|'eyes'|'scenes'|'mission'|'defeat'|'victory'|'clear'>('dark')"
    new_type = "useState<'dark'|'eyes'|'scenes'|'missionSelect'|'mission'|'quiz'|'defeat'|'victory'|'clear'>('dark')"
    if old_type in content:
        content = content.replace(old_type, new_type, 1)
        print("[OK] storyPhase type expanded")
        count += 1

    # =========================================
    # 2. Add mission selection + quiz state + data
    # =========================================
    old_state = "  const [samuraiVoice, setSamuraiVoice] = useState('');"
    new_state = """  const [samuraiVoice, setSamuraiVoice] = useState('');
  const [selectedMission, setSelectedMission] = useState<'pushup'|'squat'|'situp'|'english'|'kotowaza'|'trivia'|null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);

  // === Mission Definitions (scales with stage) ===
  const PHYSICAL_MISSIONS = [
    { id: 'pushup', label: '\u8155\u7ACB\u3066\u3075\u305B', icon: '\uD83D\uDCAA', count: MISSION_TARGET },
    { id: 'squat', label: '\u30B9\u30AF\u30EF\u30C3\u30C8', icon: '\uD83E\uDDB5', count: MISSION_TARGET },
    { id: 'situp', label: '\u8179\u7B4B', icon: '\uD83D\uDD25', count: MISSION_TARGET },
  ];

  const QUIZ_MISSIONS = [
    { id: 'english', label: '\u82F1\u5358\u8A9E\u30AF\u30A4\u30BA', icon: '\uD83C\uDDEC\uD83C\uDDE7' },
    { id: 'kotowaza', label: '\u3053\u3068\u308F\u3056\u30AF\u30A4\u30BA', icon: '\uD83D\uDCDC' },
    { id: 'trivia', label: '\u96D1\u5B66\u30AF\u30A4\u30BA', icon: '\uD83E\uDDE0' },
  ];

  // Stage 1 quiz data (easy)
  const QUIZ_DATA: { [key: string]: { q: string; choices: string[]; answer: number }[] } = {
    english: [
      { q: '"apple" \u306E\u610F\u5473\u306F\uFF1F', choices: ['\u308A\u3093\u3054', '\u307F\u304B\u3093', '\u3076\u3069\u3046', '\u3082\u3082'], answer: 0 },
      { q: '"strong" \u306E\u610F\u5473\u306F\uFF1F', choices: ['\u5F31\u3044', '\u5F37\u3044', '\u65E9\u3044', '\u9045\u3044'], answer: 1 },
      { q: '"continue" \u306E\u610F\u5473\u306F\uFF1F', choices: ['\u6B62\u3081\u308B', '\u59CB\u3081\u308B', '\u7D9A\u3051\u308B', '\u7D42\u308F\u308B'], answer: 2 },
    ],
    kotowaza: [
      { q: '\u300C\u77F3\u306E\u4E0A\u306B\u3082___\u300D', choices: ['\u4E09\u5E74', '\u4E94\u5E74', '\u5341\u5E74', '\u767E\u5E74'], answer: 0 },
      { q: '\u300C\u7D99\u7D9A\u306F___\u306A\u308A\u300D', choices: ['\u91D1', '\u529B', '\u5922', '\u6280'], answer: 1 },
      { q: '\u300C\u5343\u91CC\u306E\u9053\u3082___\u304B\u3089\u300D', choices: ['\u4E09\u6B69', '\u767E\u6B69', '\u4E00\u6B69', '\u5341\u6B69'], answer: 2 },
    ],
    trivia: [
      { q: '\u4EBA\u9593\u306E\u9AA8\u306E\u6570\u306F\u7D04\u4F55\u672C\uFF1F', choices: ['106\u672C', '206\u672C', '306\u672C', '406\u672C'], answer: 1 },
      { q: '\u65E5\u672C\u3067\u4E00\u756A\u9AD8\u3044\u5C71\u306F\uFF1F', choices: ['\u5BCC\u58EB\u5C71', '\u5317\u5CB3', '\u69D8\u304C\u5CB3', '\u7ACB\u5C71'], answer: 0 },
      { q: '\u592A\u967D\u7CFB\u3067\u4E00\u756A\u5927\u304D\u3044\u60D1\u661F\u306F\uFF1F', choices: ['\u571F\u661F', '\u6728\u661F', '\u5929\u738B\u661F', '\u6D77\u738B\u661F'], answer: 1 },
    ],
  };

  const QUIZ_TOTAL = 3;"""

    if old_state in content:
        content = content.replace(old_state, new_state, 1)
        print("[OK] Mission + quiz state added")
        count += 1

    # =========================================
    # 3. Change advanceScene: scene4 -> missionSelect
    # =========================================
    old_advance = """    if (next === 4) {
      setStoryPhase('mission');
      setMissionCount(0);
      return;
    }"""
    new_advance = """    if (next === 4) {
      setStoryPhase('missionSelect');
      setSelectedMission(null);
      samuraiSpeak('\u3069\u3046\u6311\u3080\uFF1F');
      return;
    }"""
    if old_advance in content:
        content = content.replace(old_advance, new_advance, 1)
        print("[OK] advanceScene -> missionSelect")
        count += 1

    # =========================================
    # 4. Add selectMission + quiz functions
    # =========================================
    old_count_fn = "  const countMissionTap = async () => {"
    new_fns = """  const selectMission = (missionId: string) => {
    setSelectedMission(missionId as any);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    const isPhysical = ['pushup', 'squat', 'situp'].includes(missionId);
    if (isPhysical) {
      setMissionCount(0);
      setStoryPhase('mission');
      const label = PHYSICAL_MISSIONS.find(m => m.id === missionId)?.label || '';
      samuraiSpeak(label + '\u3001\u3084\u308C\u3002');
    } else {
      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswered(false);
      setQuizCorrect(false);
      setStoryPhase('quiz');
      samuraiSpeak('\u982D\u3092\u4F7F\u3048\u3002');
    }
  };

  const answerQuiz = (choiceIndex: number) => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    const missionId = selectedMission || 'english';
    const questions = QUIZ_DATA[missionId] || QUIZ_DATA.english;
    const correct = questions[quizIndex].answer === choiceIndex;
    setQuizCorrect(correct);
    if (correct) {
      setQuizScore(quizScore + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      try {
        Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({ sound }) => {
          sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync());
        });
      } catch(e) {}
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch(e) {}
    }
    // Auto advance after 1.2s
    setTimeout(() => {
      const nextIdx = quizIndex + 1;
      if (nextIdx >= QUIZ_TOTAL) {
        // Quiz complete -> victory
        onMissionComplete();
      } else {
        setQuizIndex(nextIdx);
        setQuizAnswered(false);
        setQuizCorrect(false);
      }
    }, 1200);
  };

  const onMissionComplete = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3'));
      await sound.setVolumeAsync(MASTER_VOLUME);
      await sound.playAsync();
    } catch(e) {}
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
    speakSamurai('\u898B\u4E8B\u3060');
    samuraiSpeak('\u898B\u4E8B\u3060');
    await addXpWithLevelCheck(50);
    setTimeout(() => {
      setStoryPhase('defeat');
      speakMikkabozu('\u8CA0\u3051\u305F\u30FC\u304F\u3084\u3057\u3044\u3088\u30FC');
    }, 1500);
  };

  const countMissionTap = async () => {"""

    if old_count_fn in content:
        content = content.replace(old_count_fn, new_fns, 1)
        print("[OK] selectMission + quiz functions added")
        count += 1

    # =========================================
    # 5. Simplify countMissionTap victory to use onMissionComplete
    # =========================================
    old_victory_in_tap = """      // Victory!
      try {
        const { sound } = await Audio.Sound.createAsync(require('./sounds/sfx_win.mp3'));
        await sound.setVolumeAsync(MASTER_VOLUME);
        await sound.playAsync();
      } catch(e) {}
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}
      speakSamurai('\u898b\u4e8b\u3060');
      samuraiSpeak('\u898b\u4e8b\u3060');
      await addXpWithLevelCheck(50);
      // Delay then defeat animation
      setTimeout(() => {
        setStoryPhase('defeat');
        speakMikkabozu('\u8ca0\u3051\u305f\u30fc\u304f\u3084\u3057\u3044\u3088\u30fc');
      }, 1500);"""

    new_victory_in_tap = """      // Victory!
      await onMissionComplete();"""

    if old_victory_in_tap in content:
        content = content.replace(old_victory_in_tap, new_victory_in_tap, 1)
        print("[OK] countMissionTap uses onMissionComplete")
        count += 1

    # =========================================
    # 6. Add missionSelect UI + quiz UI in overlay
    # =========================================

    # Insert missionSelect phase UI BEFORE the mission phase
    old_mission_ui = "          {storyPhase === 'mission' && ("
    new_select_and_quiz_ui = """          {storyPhase === 'missionSelect' && (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#e74c3c', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4E09\u65E5\u574A\u4E3B'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 30 }}>{'\u30DF\u30C3\u30B7\u30E7\u30F3\u3092\u9078\u3079'}</Text>

              <Text style={{ color: '#DAA520', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 12, alignSelf: 'flex-start' }}>{'\uD83D\uDD25 \u4F53\u3092\u52D5\u304B\u3059'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
                {PHYSICAL_MISSIONS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => selectMission(m.id)}
                    style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(218,165,32,0.15)', borderWidth: 1, borderColor: '#DAA520', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{m.label}</Text>
                    <Text style={{ color: '#DAA520', fontSize: 11, marginTop: 4 }}>{m.count + '\u56DE'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: '#4FC3F7', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 12, alignSelf: 'flex-start' }}>{'\uD83D\uDCDA \u982D\u3092\u4F7F\u3046'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
                {QUIZ_MISSIONS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => selectMission(m.id)}
                    style={{ flex: 1, marginHorizontal: 4, backgroundColor: 'rgba(79,195,247,0.1)', borderWidth: 1, borderColor: '#4FC3F7', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</Text>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{m.label}</Text>
                    <Text style={{ color: '#4FC3F7', fontSize: 11, marginTop: 4 }}>{QUIZ_TOTAL + '\u554F'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {samuraiVoice.length > 0 && (
                <View style={{ position: 'absolute', bottom: 80, left: 30, right: 30 }}>
                  <Text style={{ color: '#DAA520', fontSize: 16, fontWeight: 'bold', textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(218,165,32,0.5)', textShadowRadius: 8 }}>
                    {samuraiVoice}
                  </Text>
                </View>
              )}
            </View>
          )}

          {storyPhase === 'quiz' && (() => {
            const missionId = selectedMission || 'english';
            const questions = QUIZ_DATA[missionId] || QUIZ_DATA.english;
            const currentQ = questions[quizIndex];
            const mLabel = QUIZ_MISSIONS.find(m => m.id === missionId)?.label || '';
            return (
              <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>
                <Text style={{ color: '#4FC3F7', fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>{mLabel}</Text>
                <Text style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>{'Q' + (quizIndex + 1) + ' / ' + QUIZ_TOTAL}</Text>

                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, width: '100%', marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 30 }}>{currentQ.q}</Text>
                </View>

                {currentQ.choices.map((choice: string, idx: number) => {
                  let bg = 'rgba(255,255,255,0.05)';
                  let border = 'rgba(255,255,255,0.2)';
                  let textColor = '#fff';
                  if (quizAnswered) {
                    if (idx === currentQ.answer) { bg = 'rgba(46,204,113,0.3)'; border = '#2ecc71'; textColor = '#2ecc71'; }
                    else if (idx !== currentQ.answer && quizCorrect === false && idx === currentQ.choices.indexOf(currentQ.choices[idx])) { /* keep default for wrong unselected */ }
                  }
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => answerQuiz(idx)}
                      disabled={quizAnswered}
                      style={{ backgroundColor: bg, borderWidth: 1, borderColor: border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 10, width: '100%' }}
                    >
                      <Text style={{ color: textColor, fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>{choice}</Text>
                    </TouchableOpacity>
                  );
                })}

                {quizAnswered && (
                  <Text style={{ color: quizCorrect ? '#2ecc71' : '#e74c3c', fontSize: 22, fontWeight: '900', marginTop: 10, letterSpacing: 2 }}>
                    {quizCorrect ? '\u2B55 \u6B63\u89E3\uFF01' : '\u274C \u4E0D\u6B63\u89E3'}
                  </Text>
                )}

                <View style={{ position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'center' }}>
                  {Array.from({ length: QUIZ_TOTAL }).map((_, i) => (
                    <View key={i} style={{ width: 12, height: 12, borderRadius: 6, marginHorizontal: 4, backgroundColor: i < quizIndex ? '#2ecc71' : i === quizIndex ? '#4FC3F7' : '#333' }} />
                  ))}
                </View>
              </View>
            );
          })()}

          {storyPhase === 'mission' && ("""

    if old_mission_ui in content:
        content = content.replace(old_mission_ui, new_select_and_quiz_ui, 1)
        print("[OK] Mission select + quiz UI added")
        count += 1

    # =========================================
    # 7. Update mission UI to show selected exercise name
    # =========================================
    old_mission_header = """              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4E09\u65E5\u574A\u4E3B'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{'\u2694\uFE0F \u8155\u7ACB\u3066\u3075\u305B 10\u56DE\u3067\u8A0E\u4F10\uFF01'}</Text>"""

    new_mission_header = """              <Text style={{ color: '#e74c3c', fontSize: 22, fontWeight: '900', letterSpacing: 3, marginBottom: 6 }}>{'\u4E09\u65E5\u574A\u4E3B'}</Text>
              <Text style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>{'\u2694\uFE0F ' + (PHYSICAL_MISSIONS.find(m => m.id === selectedMission)?.label || '') + ' ' + MISSION_TARGET + '\u56DE\u3067\u8A0E\u4F10\uFF01'}</Text>"""

    if old_mission_header in content:
        content = content.replace(old_mission_header, new_mission_header, 1)
        print("[OK] Mission header shows selected exercise")
        count += 1
    else:
        print("[WARN] Mission header not found (may need patch_fix_ui first)")

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n{'='*50}")
    print(f"[DONE] {count} changes applied")
    print("Run: npx expo start -c")

if __name__ == "__main__":
    main()
