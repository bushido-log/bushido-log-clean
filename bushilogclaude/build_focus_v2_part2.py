with open("App.tsx", "r") as f:
    content = f.read()

# 2. タイマーuseEffectとNGワードチェック関数を追加
old1 = """  // 集中タブ
  const isUrlBlocked = (url: string) => {
    return blockedSites.some(site => url.toLowerCase().includes(site.toLowerCase()));
  };

  const handleStartFocus = () => {"""

new1 = """  // 集中タイマー
  useEffect(() => {
    if (!focusTimerRunning) return;
    
    const timer = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev === 0) {
          if (focusMinutesLeft === 0) {
            clearInterval(timer);
            setFocusTimerRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const messages = [
              'よくやった。武士の集中力だ。',
              '見事。この調子で進め。',
              '集中完了。次の戦いに備えよ。',
              '時間を制した者が、己を制す。',
            ];
            Alert.alert('集中完了', messages[Math.floor(Math.random() * messages.length)], [
              { text: '道場に戻る', onPress: () => {
                setShowStartScreen(true);
                setShowFocusEntry(true);
                setFocusType('select');
              }}
            ]);
            return 0;
          }
          setFocusMinutesLeft(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [focusTimerRunning, focusMinutesLeft]);

  // 集中タブ
  const isUrlBlocked = (url: string) => {
    return blockedSites.some(site => url.toLowerCase().includes(site.toLowerCase()));
  };

  const containsNgWord = (url: string) => {
    const decoded = decodeURIComponent(url).toLowerCase();
    return ngWords.some(word => decoded.includes(word.toLowerCase()));
  };

  const startNgQuiz = (url: string) => {
    setPendingUrl(url);
    setNgQuizRemaining(ngLevel);
    const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
    setCurrentNgQ(randomQ);
    setNgAnswer('');
    setShowNgQuiz(true);
  };

  const handleNgQuizAnswer = () => {
    if (ngAnswer.trim().toLowerCase() === currentNgQ.a.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const remaining = ngQuizRemaining - 1;
      setNgQuizRemaining(remaining);
      
      if (remaining === 0) {
        setShowNgQuiz(false);
        setFocusUrl(pendingUrl);
        setPendingUrl('');
        showSaveSuccess('通過を許可する。');
      } else {
        const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
        setCurrentNgQ(randomQ);
        setNgAnswer('');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('不正解', '本当に必要な検索か考えよ。');
      const randomQ = focusQuestions[Math.floor(Math.random() * focusQuestions.length)];
      setCurrentNgQ(randomQ);
      setNgAnswer('');
    }
  };

  const handleStartFocus = () => {"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Part 2 Done!")