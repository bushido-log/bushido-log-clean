with open("App.tsx", "r") as f:
    content = f.read()

old1 = "const SAMURAI_KING_USES_KEY = 'SAMURAI_KING_USES_V1';"
new1 = """const SAMURAI_KING_USES_KEY = 'SAMURAI_KING_USES_V1';
const FIRST_LAUNCH_KEY = 'BUSHIDO_FIRST_LAUNCH_V1';
const FREE_TRIAL_DAYS = 3;"""

content = content.replace(old1, new1)
old2 = "const [isPro, setIsPro] = useState(false);"
new2 = """const [isPro, setIsPro] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);"""
content = content.replace(old2, new2)

old4 = """// Pro限定機能
    if (!isPro) {
      setShowPaywall(true);
      return;
    }"""
new4 = """// Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old4, new4)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")
