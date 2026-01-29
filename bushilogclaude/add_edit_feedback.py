with open("App.tsx", "r") as f:
    content = f.read()

# 編集ボタン押下時にフィードバック追加
old1 = """              onPress={() => {
                if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                setIsEditingOnboarding(true);
                setObIdentity(onboardingData.identity ?? '');
                setObQuit(onboardingData.quit ?? '');
                setObRule(onboardingData.rule ?? '');
              }}"""

new1 = """              onPress={() => {
                if (settings.enableHaptics) Haptics.selectionAsync().catch(() => {});
                showSaveSuccess('サムライ宣言を編集するでござる');
                setIsEditingOnboarding(true);
                setObIdentity(onboardingData.identity ?? '');
                setObQuit(onboardingData.quit ?? '');
                setObRule(onboardingData.rule ?? '');
              }}"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")