with open("App.tsx", "r") as f:
    content = f.read()

# 1. クイズデータとstateを追加
old1 = """  // 感謝機能
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [showGratitudeComplete, setShowGratitudeComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);"""

new1 = """  // 感謝機能
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [showGratitudeComplete, setShowGratitudeComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // 自己啓発クイズデータ
  const quizData = [
    { q: '「継続は___なり」', a: '力', hint: '続けることで得られるもの' },
    { q: '「思考は___化する」', a: '現実', hint: '考えたことがなるもの' },
    { q: '「行動なき___に価値なし」', a: '知識', hint: '学んだだけでは意味がないもの' },
    { q: '「今日できることを___に延ばすな」', a: '明日', hint: '今日の次の日' },
    { q: '「失敗は___の母」', a: '成功', hint: '失敗から生まれるもの' },
    { q: '「千里の道も___から」', a: '一歩', hint: '最初の小さな行動' },
    { q: '「時は___なり」', a: '金', hint: 'お金と同じくらい大切' },
    { q: '「七転び___起き」', a: '八', hint: '7+1' },
    { q: '「早起きは三文の___」', a: '徳', hint: '良いこと' },
    { q: '「塵も積もれば___となる」', a: '山', hint: '高いもの' },
  ];"""

content = content.replace(old1, new1)

# 2. クイズ処理関数を追加
old2 = """  // 感謝タブ
  const handleAddGratitude = () => {"""

new2 = """  // クイズ処理
  const handleQuizSubmit = () => {
    const current = quizData[quizIndex];
    if (quizAnswer.trim() === current.a) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQuizResult('correct');
      setQuizScore(quizScore + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setQuizResult('wrong');
    }
  };

  const handleNextQuiz = () => {
    setQuizAnswer('');
    setQuizResult(null);
    if (quizIndex < quizData.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setShowQuiz(false);
      setQuizIndex(0);
      showSaveSuccess('クイズ完了！' + quizScore + '/' + quizData.length + '問正解');
    }
  };

  // 感謝タブ
  const handleAddGratitude = () => {"""

content = content.replace(old2, new2)

# 3. クイズモーダルを追加
old3 = """      {renderSaveToast()}
      {renderPaywall()}"""

new3 = """      {renderSaveToast()}
      {renderPaywall()}
      
      {/* クイズモーダル */}
      <Modal visible={showQuiz} animationType="slide" transparent>
        <View style={styles.quizOverlay}>
          <View style={styles.quizCard}>
            <Text style={styles.quizProgress}>{quizIndex + 1} / {quizData.length}</Text>
            <Text style={styles.quizQuestion}>{quizData[quizIndex].q}</Text>
            
            {quizResult === null ? (
              <>
                <TextInput
                  style={styles.quizInput}
                  value={quizAnswer}
                  onChangeText={setQuizAnswer}
                  placeholder="答えを入力"
                  placeholderTextColor="#666"
                  autoFocus
                />
                <Text style={styles.quizHint}>ヒント: {quizData[quizIndex].hint}</Text>
                <Pressable style={styles.quizSubmitButton} onPress={handleQuizSubmit}>
                  <Text style={styles.quizSubmitText}>回答</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.quizResultText, quizResult === 'correct' ? styles.quizCorrect : styles.quizWrong]}>
                  {quizResult === 'correct' ? '正解！' : '不正解... 答え: ' + quizData[quizIndex].a}
                </Text>
                <Pressable style={styles.quizNextButton} onPress={handleNextQuiz}>
                  <Text style={styles.quizNextText}>{quizIndex < quizData.length - 1 ? '次の問題' : '終了'}</Text>
                </Pressable>
              </>
            )}
            
            <Pressable onPress={() => { setShowQuiz(false); setQuizIndex(0); setQuizResult(null); }}>
              <Text style={styles.quizCloseText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>"""

content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")