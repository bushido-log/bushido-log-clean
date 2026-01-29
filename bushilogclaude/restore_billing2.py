with open("App.tsx", "r") as f:
    content = f.read()

# 1. useEffect内で課金初期化を追加（既存のuseEffectを探す）
old1 = """  useEffect(() => {
    const loadOnboarding = async () => {"""
new1 = """  // 課金システム初期化
  useEffect(() => {
    const initBilling = async () => {
      await initializePurchases();
      const proStatus = await checkProStatus();
      setIsPro(proStatus);
      const offering = await getOffering();
      setCurrentOffering(offering);
      const price = await getMonthlyPrice();
      setMonthlyPrice(price);
      
      // 初回起動日チェック（3日間無料トライアル）
      const today = new Date().toISOString().split('T')[0];
      const firstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      if (!firstLaunch) {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, today);
      } else {
        const firstDate = new Date(firstLaunch);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= FREE_TRIAL_DAYS) {
          setTrialExpired(true);
        }
      }
      
      // 日付ごとの使用回数管理
      const usesJson = await AsyncStorage.getItem(SAMURAI_KING_USES_KEY);
      if (usesJson) {
        const parsed = JSON.parse(usesJson);
        if (parsed.date === today) {
          setSamuraiKingUses(parsed.count);
        } else {
          setSamuraiKingUses(0);
          await AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: 0 }));
        }
      }
    };
    initBilling();
  }, []);

  useEffect(() => {
    const loadOnboarding = async () => {"""
content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 2 done - billing initialization added!")