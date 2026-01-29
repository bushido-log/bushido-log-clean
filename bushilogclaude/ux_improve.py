with open("App.tsx", "r") as f:
    content = f.read()

# 1. スタート画面のState追加（tab stateの後に追加）
old1 = "const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser'>('consult');"
new1 = """const [tab, setTab] = useState<'consult' | 'goal' | 'review' | 'settings' | 'browser'>('consult');
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');"""
content = content.replace(old1, new1)

# 2. 保存成功時のフィードバック関数を追加（App関数の最初の方に）
old2 = "const todayStr = useMemo(() => getTodayStr(), []);"
new2 = """const todayStr = useMemo(() => getTodayStr(), []);

  // 保存成功時のフィードバック
  const showSaveSuccess = (message: string = '一太刀入魂。保存した。') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaveToastMessage(message);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };"""
content = content.replace(old2, new2)

# 3. handleSaveTodayMission に成功フィードバック追加
old3 = """await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(updatedLogs));
    setDailyLogs(updatedLogs);
  };

  const handleSaveNightReview"""
new3 = """await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(updatedLogs));
    setDailyLogs(updatedLogs);
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };

  const handleSaveNightReview"""
content = content.replace(old3, new3)

# 4. handleSaveNightReview に成功フィードバック追加
old4 = """await AsyncStorage.setItem(XP_KEY, String(newXP));
    setTotalXP(newXP);
  };

  const handleSaveOnboarding"""
new4 = """await AsyncStorage.setItem(XP_KEY, String(newXP));
    setTotalXP(newXP);
    showSaveSuccess('振り返り完了。明日も斬れ！ +' + xpGain + 'XP');
  };

  const handleSaveOnboarding"""
content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 1 done!")