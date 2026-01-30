with open("App.tsx", "r") as f:
    content = f.read()

# アラームのspeakとメッセージ部分を修正
old1 = """  const alarmMessages = {
    1: ['起きろ。', '目を開けよ。', '朝だ。'],
    2: ['まだ寝ているのか。', '今すぐ立て。', '布団から出ろ。'],
    3: ['いつまで寝ている！', '武士の恥だ！', '情けない！'],
    4: ['恥を知れ！', 'お前は武士ではない！', '今すぐ立たねば切腹だ！'],
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    const startTime = Date.now();
    
    const shout = () => {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      let level = 1;
      if (elapsed > 5) level = 4;
      else if (elapsed > 3) level = 3;
      else if (elapsed > 1) level = 2;
      setAlarmLevel(level);
      
      const msgs = alarmMessages[level as 1|2|3|4];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      Speech.speak(msg, { language: 'ja', rate: 0.9, pitch: 0.8 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };
    
    shout();
    alarmIntervalRef.current = setInterval(shout, 5000);
  };
  
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setAlarmRinging(false);
    setAlarmSet(false);
    Speech.speak('よくやった。今日も勝て。', { language: 'ja' });
  };"""

new1 = """  const alarmMessages = {
    1: ['起きろ。', '目を開けよ。', '朝だ。立て。'],
    2: ['まだ寝ているのか？', '今すぐ立て！', '布団から出ろ！'],
    3: ['いつまで寝ている！', '武士の恥だ！', '情けない奴め！'],
    4: ['恥を知れ！', 'お前は武士ではない！', '今すぐ立たねば切腹だ！', 'このたわけが！'],
  };
  
  const alarmStartTimeRef = useRef<number>(0);
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    alarmStartTimeRef.current = Date.now();
    
    // 最初のメッセージ
    speakSamurai(alarmMission + 'を撮影して起きるのだ。さあ、立て！');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    alarmIntervalRef.current = setInterval(() => {
      const elapsedMin = (Date.now() - alarmStartTimeRef.current) / 1000 / 60;
      let level = 1;
      if (elapsedMin > 3) level = 4;
      else if (elapsedMin > 2) level = 3;
      else if (elapsedMin > 1) level = 2;
      setAlarmLevel(level);
      
      const msgs = alarmMessages[level as 1|2|3|4];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      
      // レベルに応じてミッションを追加
      let fullMsg = msg;
      if (level >= 2) {
        fullMsg += alarmMission + 'を撮影しろ！';
      }
      if (level >= 3) {
        fullMsg += '早くしろ！';
      }
      
      speakSamurai(fullMsg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 8000);
  };
  
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setAlarmRinging(false);
    setAlarmSet(false);
    speakSamurai('よくやった。今日も己に勝て。武士道とは毎朝の勝利から始まる。');
  };"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")