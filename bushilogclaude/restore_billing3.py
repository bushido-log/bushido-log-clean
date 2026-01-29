with open("App.tsx", "r") as f:
    content = f.read()

# 1. handleSaveTodayMissionに課金チェック追加
old1 = "const handleSaveTodayMission = async () => {"
new1 = """const handleSaveTodayMission = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old1, new1)

# 2. handleSaveNightReviewに課金チェック追加
old2 = "const handleSaveNightReview = async () => {"
new2 = """const handleSaveNightReview = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old2, new2)

# 3. handleSaveEditedLogに課金チェック追加
old3 = "const handleSaveEditedLog = async () => {"
new3 = """const handleSaveEditedLog = async () => {
    // Pro限定機能（3日間は無料トライアル）
    if (!isPro && trialExpired) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 3 done - billing checks added!")