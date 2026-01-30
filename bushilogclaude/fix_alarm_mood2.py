with open("App.tsx", "r") as f:
    content = f.read()

old1 = """  const alarmMessages = {
    1: [
      '素晴らしい朝だ。今日という日は二度と来ない。',
      '目覚めよ。今日はお前の人生で最高の日になる。',
      'おはよう。今日という贈り物を受け取れ。',
      '新しい朝だ。昨日の自分を超えるチャンスだ。',
      '起きよ。今日はお前にしかできない何かがある。',
    ],
    2: [
      'さあ、そろそろ起きる時間だ。今日を無駄にするな。',
      'まだ寝ているのか。今日という日が待っているぞ。',
      '布団の中に夢はない。起きて掴め。',
      'あと少しの勇気だ。立ち上がれ。',
    ],
    3: [
      'おい、いい加減にしろ。', 
      '何をしている！起きろ！',
      'お前の夢はその布団の中にあるのか！',
      '情けない！立て！',
      'いつまで甘えている！',
    ],
    4: [
      'たわけが！', 
      'クズめ！', 
      '恥を知れ！', 
      'ゴミが！起きろ！',
      '腐った根性め！',
      'お前は武士ではない！ただの豚だ！',
      '死んでるのか！起きろ！',
    ],
  };
  
  const alarmStartTimeRef = useRef<number>(0);
  const alarmShoutCountRef = useRef<number>(0);
  
  const scheduleNextShout = () => {
    const elapsedSec = (Date.now() - alarmStartTimeRef.current) / 1000;
    let level = 1;
    let interval = 15000; // 15秒（ポジティブ期間は長め）
    
    if (elapsedSec > 90) {
      level = 4;
      interval = 3000; // 3秒（ブチギレ）
    } else if (elapsedSec > 60) {
      level = 3;
      interval = 5000; // 5秒
    } else if (elapsedSec > 30) {
      level = 2;
      interval = 8000; // 8秒
    }
    
    setAlarmLevel(level);
    
    const msgs = alarmMessages[level as 1|2|3|4];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    
    let fullMsg = msg;
    if (level === 1) {
      fullMsg += ' ' + alarmMission + 'を撮影して一日を始めよう。';
    } else if (level === 2) {
      fullMsg += ' ' + alarmMission + 'を撮れ。';
    } else if (level === 3) {
      fullMsg += ' 今すぐ' + alarmMission + '撮影しろ！';
    } else if (level === 4) {
      fullMsg += ' ' + alarmMission + '撮れ！！今すぐ！！';
    }
    
    speakSamurai(fullMsg);
    if (level >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    alarmShoutCountRef.current += 1;
    
    // 次の叫びをスケジュール
    alarmIntervalRef.current = setTimeout(scheduleNextShout, interval);
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    alarmStartTimeRef.current = Date.now();
    alarmShoutCountRef.current = 0;
    
    // 最初のメッセージ（超ポジティブ）
    speakSamurai('おはよう！今日という日は、お前の人生で最も素晴らしい日になる。さあ、' + alarmMission + 'を撮影して、最高の一日を始めよう！');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // 次の叫びをスケジュール
    alarmIntervalRef.current = setTimeout(scheduleNextShout, 15000);
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
  const alarmShoutCountRef = useRef<number>(0);
  
  const scheduleNextShout = () => {
    const elapsedSec = (Date.now() - alarmStartTimeRef.current) / 1000;
    let level = 1;
    let interval = 12000;
    
    if (elapsedSec > 150) {
      level = 6; interval = 3000;  // 2分半以上：ブチギレMAX
    } else if (elapsedSec > 120) {
      level = 5; interval = 4000;  // 2分以上：怒り
    } else if (elapsedSec > 90) {
      level = 4; interval = 6000;  // 1分半以上：イライラ
    } else if (elapsedSec > 60) {
      level = 3; interval = 10000; // 1分以上：優しく促す
    } else if (elapsedSec > 30) {
      level = 2; interval = 12000; // 30秒以上：ポジティブ
    }
    
    // UIには4段階で表示（1-3はポジティブ、4-6は怒り）
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
    alarmShoutCountRef.current += 1;
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, interval);
  };
  
  const startAlarmShout = () => {
    setAlarmRinging(true);
    setAlarmLevel(1);
    alarmStartTimeRef.current = Date.now();
    alarmShoutCountRef.current = 0;
    
    speakSamurai('おはよう！今日という日は、お前の人生で最も素晴らしい日になる。さあ、' + alarmMission + 'を撮影して、最高の一日を始めよう！');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    alarmIntervalRef.current = setTimeout(scheduleNextShout, 12000);
  };"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")