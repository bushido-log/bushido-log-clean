with open("App.tsx", "r") as f:
    content = f.read()

# 不足しているstateを追加
old1 = """  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');"""

new1 = """  const [blockedSites, setBlockedSites] = useState<string[]>(['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'facebook.com', 'youtube.com']);
  const [newBlockedSite, setNewBlockedSite] = useState('');
  const [focusType, setFocusType] = useState<'select' | 'net' | 'study'>('select');
  const [focusDuration, setFocusDuration] = useState(25);
  const [ngWords, setNgWords] = useState<string[]>(['エロ', 'アダルト', 'porn', 'sex', 'ギャンブル', 'カジノ', 'パチンコ']);
  const [newNgWord, setNewNgWord] = useState('');
  const [ngLevel, setNgLevel] = useState<3 | 5 | 10>(5);
  const [showNgQuiz, setShowNgQuiz] = useState(false);
  const [ngQuizRemaining, setNgQuizRemaining] = useState(0);
  const [pendingUrl, setPendingUrl] = useState('');
  const [currentNgQ, setCurrentNgQ] = useState({ q: '', a: '' });
  const [ngAnswer, setNgAnswer] = useState('');"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")