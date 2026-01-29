with open("App.tsx", "r") as f:
    content = f.read()

old = """// 日付ごとの使用回数管理
      const today = new Date().toISOString().split('T')[0];"""

new = """// 初回起動日チェック（3日間無料トライアル）
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
      // 日付ごとの使用回数管理"""

content = content.replace(old, new)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")