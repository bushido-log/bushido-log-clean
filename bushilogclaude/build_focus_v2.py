with open("App.tsx", "r") as f:
    content = f.read()

# 1. 集中機能のstate を整理・追加
old1 = """  // 集中機能
  const [focusPurpose, setFocusPurpose] = useState('');
  const [focusUrl, setFocusUrl] = useState('https://www.google.com');
  const [showFocusEntry, setShowFocusEntry] = useState(true);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusMinutesLeft, setFocusMinutesLeft] = useState(60);
  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');"""

new1 = """  // 集中機能
  const [focusUrl, setFocusUrl] = useState('https://www.google.com');
  const [showFocusEntry, setShowFocusEntry] = useState(true);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusDuration, setFocusDuration] = useState(25);
  const [focusMinutesLeft, setFocusMinutesLeft] = useState(25);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(0);
  const [focusTimerRunning, setFocusTimerRunning] = useState(false);
  const [focusType, setFocusType] = useState<'select' | 'net' | 'study'>('select');
  
  // 封印サイト・NGワード
  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com', 'youtube.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [ngWords, setNgWords] = useState<string[]>(['エロ', 'アダルト', 'porn', 'sex', 'ギャンブル', 'カジノ', 'パチンコ']);
  const [newNgWord, setNewNgWord] = useState('');
  const [ngLevel, setNgLevel] = useState<3 | 5 | 10>(5); // 問題数レベル
  
  // NGワード検出時のクイズ
  const [showNgQuiz, setShowNgQuiz] = useState(false);
  const [ngQuizRemaining, setNgQuizRemaining] = useState(0);
  const [pendingUrl, setPendingUrl] = useState('');
  const [currentNgQ, setCurrentNgQ] = useState({ q: '', a: '' });
  const [ngAnswer, setNgAnswer] = useState('');
  
  // 集中用の問題
  const focusQuestions = [
    { q: 'What is 7 + 8?', a: '15' },
    { q: 'What is 12 - 5?', a: '7' },
    { q: 'What is 6 × 4?', a: '24' },
    { q: 'What is the opposite of "hot"?', a: 'cold' },
    { q: 'What is the opposite of "big"?', a: 'small' },
    { q: 'What is the past tense of "go"?', a: 'went' },
    { q: 'What is the past tense of "eat"?', a: 'ate' },
    { q: 'How many days in a week?', a: '7' },
    { q: 'How many months in a year?', a: '12' },
    { q: 'What color is the sky?', a: 'blue' },
    { q: 'What is the capital of Japan?', a: 'tokyo' },
    { q: 'What comes after Monday?', a: 'tuesday' },
    { q: 'What is 9 × 9?', a: '81' },
    { q: 'What is 100 ÷ 4?', a: '25' },
    { q: 'Spell the number 8', a: 'eight' },
  ];"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Part 1 Done!")