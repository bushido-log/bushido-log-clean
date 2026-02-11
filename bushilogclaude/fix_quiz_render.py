#!/usr/bin/env python3
"""
修正:
1. quiz UIのIIFEパターンを通常の条件レンダリングに変更
2. Video/ResizeMode importチェック
"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "rb") as f:
        raw = f.read()
    content = raw.decode('utf-8', errors='replace')
    
    # Remove any replacement chars from surrogates
    content = content.replace('\ufffd', '')
    
    count = 0

    # 1. Fix IIFE quiz pattern -> normal conditional
    old_iife = """          {storyPhase === 'quiz' && (() => {
            const missionId = selectedMission || 'english';
            const questions = QUIZ_DATA[missionId] || QUIZ_DATA.english;
            const currentQ = questions[quizIndex];
            const mLabel = QUIZ_MISSIONS.find(m => m.id === missionId)?.label || '';
            return (
              <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>"""

    new_quiz = """          {storyPhase === 'quiz' && (
              <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>"""

    if old_iife in content:
        content = content.replace(old_iife, new_quiz, 1)
        print("[OK] Quiz IIFE start fixed")
        count += 1

    # Fix the variables that were inside IIFE - move to inline
    # Replace references to currentQ with inline access
    old_q_text = """{currentQ.q}"""
    new_q_text = """{(QUIZ_DATA[selectedMission || 'english'] || QUIZ_DATA.english)[quizIndex].q}"""
    if old_q_text in content:
        content = content.replace(old_q_text, new_q_text)
        print("[OK] Quiz question inline")
        count += 1

    # Replace mLabel
    old_mlabel = """{mLabel}"""
    if old_mlabel in content:
        content = content.replace(old_mlabel, "{QUIZ_MISSIONS.find(m => m.id === (selectedMission || 'english'))?.label || ''}", 1)
        print("[OK] Quiz label inline")
        count += 1

    # Replace choices map
    old_choices = """{currentQ.choices.map((choice: string, idx: number) => {
                  let bg = 'rgba(255,255,255,0.05)';
                  let border = 'rgba(255,255,255,0.2)';
                  let textColor = '#fff';
                  if (quizAnswered && idx === currentQ.answer) { bg = 'rgba(46,204,113,0.3)'; border = '#2ecc71'; textColor = '#2ecc71'; }
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
                })}"""

    new_choices = """{((QUIZ_DATA[selectedMission || 'english'] || QUIZ_DATA.english)[quizIndex].choices).map((choice: string, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => answerQuiz(idx)}
                      disabled={quizAnswered}
                      style={{
                        backgroundColor: quizAnswered && idx === (QUIZ_DATA[selectedMission || 'english'] || QUIZ_DATA.english)[quizIndex].answer ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.05)',
                        borderWidth: 1,
                        borderColor: quizAnswered && idx === (QUIZ_DATA[selectedMission || 'english'] || QUIZ_DATA.english)[quizIndex].answer ? '#2ecc71' : 'rgba(255,255,255,0.2)',
                        borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 10, width: '100%'
                      }}
                    >
                      <Text style={{ color: quizAnswered && idx === (QUIZ_DATA[selectedMission || 'english'] || QUIZ_DATA.english)[quizIndex].answer ? '#2ecc71' : '#fff', fontSize: 17, fontWeight: 'bold', textAlign: 'center' }}>{choice}</Text>
                    </TouchableOpacity>
                  ))}"""

    if old_choices in content:
        content = content.replace(old_choices, new_choices, 1)
        print("[OK] Quiz choices inline")
        count += 1

    # Fix IIFE closing
    old_iife_close = """              </View>
            );
          })()}"""
    new_close = """              </View>
          )}"""
    if old_iife_close in content:
        content = content.replace(old_iife_close, new_close, 1)
        print("[OK] Quiz IIFE close fixed")
        count += 1

    # 2. Check Video import
    if 'ResizeMode' not in content.split('\n')[0:50].__repr__():
        # Check if ResizeMode is imported
        has_resize = False
        for line in content.split('\n')[:100]:
            if 'ResizeMode' in line:
                has_resize = True
                break
        if not has_resize:
            # Add import
            old_import = "import { Video } from 'expo-av';"
            new_import = "import { Video, ResizeMode } from 'expo-av';"
            if old_import in content:
                content = content.replace(old_import, new_import, 1)
                print("[OK] ResizeMode import added")
                count += 1
            elif "import { Audio" in content and "Video" not in content.split("import { Audio")[1].split(";")[0]:
                print("[WARN] Video not imported - defeat video may fail")

    # Verify clean
    try:
        content.encode('utf-8')
    except UnicodeEncodeError as e:
        print(f"[WARN] Fixing remaining surrogates: {e}")
        clean = []
        for ch in content:
            cp = ord(ch)
            if 0xD800 <= cp <= 0xDFFF:
                continue
            clean.append(ch)
        content = ''.join(clean)

    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"\n[DONE] {count} fixes applied")

if __name__ == "__main__":
    main()
