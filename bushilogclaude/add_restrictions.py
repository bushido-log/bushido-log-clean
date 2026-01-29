with open("App.tsx", "r") as f:
    content = f.read()

# 1. handleSaveTodayMission に制限追加
old1 = "const handleSaveTodayMission = async () => {"
new1 = """const handleSaveTodayMission = async () => {
    // Pro限定機能
    if (!isPro) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old1, new1)

# 2. handleSaveNightReview に制限追加
old2 = "const handleSaveNightReview = async () => {"
new2 = """const handleSaveNightReview = async () => {
    // Pro限定機能
    if (!isPro) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old2, new2)

# 3. handleSaveEditedLog に制限追加
old3 = "const handleSaveEditedLog = async () => {"
new3 = """const handleSaveEditedLog = async () => {
    // Pro限定機能
    if (!isPro) {
      setShowPaywall(true);
      return;
    }"""
content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done! 3 functions restricted.")
