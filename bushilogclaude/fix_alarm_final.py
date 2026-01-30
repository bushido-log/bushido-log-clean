with open("App.tsx", "r") as f:
    content = f.read()

old1 = """  const alarmMessages = {
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

new1 = """  const alarmMessages = {
    1: [
      '素晴らしい朝だ。今日という日は二度と来ない。',
      '今日はお前の人生で最高の日になる。',
      '新しい朝だ。昨日の自分を超えるチャンスだ。',
      '今日はお前にしかできない何かがある。',
    ],
    2: [
      '今日という贈り物を受け取れ。',
      '今日を最高の一日にしよう。',
      '布団から出れば、素晴らしい世界が待っている。',
      'お前には無限の可能性がある。',
    ],
    3: [
      'さあ、そろそろ起きる時間だ。',
      '今日という日が待っているぞ。',
      'あと少しの勇気だ。立ち上がれ。',
      'お前ならできる。さあ、起きよう。',
    ],
    4: [
      'おい。そろそろ起きろ。',
      'いつまで寝ている？',
      '甘えるな。起きろ。',
      'もう時間だ。',
    ],
    5: [
      'おい！いい加減にしろ！', 
      '何をしている！起きろ！',
      '情けない！立て！',
      'いつまで甘えている！',
    ],
    6: [
      'たわけが！', 
      '行動を起こせ！起きろ！', 
      '寝てる場合じゃないぞ！', 
      'いい加減起きろ！',
      '最高の日にするのはお前だよ！',
      '誰かが生きたかった今日だぞ！',
      'お前ならできる！起きろ！',
    ],
  };
  
  const alarmStartTimeRef = useRef<number>(0);
  
  const scheduleNextShout = () => {
    const elapsedSec = (Date.now() - alarmStartTimeRef.current) / 1000;
    let level = 1;
    let interval = 12000;
    
    if (elapsedSec > 150) {
      level = 6; interval = 3000;
    } else if (elapsedSec > 120) {
      level = 5; interval = 4000;
    } else if (elapsedSec > 90) {
      level = 4; interval = 6000;
    } else if (elapsedSec > 60) {
      level = 3; interval = 10000;
    } else if (elapsedSec > 30) {
      level = 2; interval = 12000;
    }
    
    const displayLevel = level <= 3 ? 1 : Math.min(level - 2, 4);
    setAlarmLevel(displayLevel);
    
    const msgs = alarmMessages[level as 1|2|3|4|5|6];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    
    let fullMsg = msg;
    if (level <= 3) {
      fullMsg += ' ' + alarmMission + 'を撮影して最高の一日を始めよう。';
    } else if (level === 4) {
      fullMsg += ' ' + alarmMission + 'を撮れ。';
    } else if (level === 5) {
      fullMsg += ' 今すぐ' + alarmMission + '撮影しろ！';
    } else {
      fullMsg += ' ' + alarmMission + '撮れ！！今すぐ！！';
    }
    
    speakSamurai(fullMsg);
    if (level >= 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, interval);
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    alarmStartTimeRef.current = Date.now();
    
    speakSamurai('おはよう！今日という日は、お前の人生で最も素晴らしい日になる。さあ、' + alarmMission + 'を撮影して、最高の一日を始めよう！');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, 12000);
  };
  
  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearTimeout(alarmIntervalRef.current);
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