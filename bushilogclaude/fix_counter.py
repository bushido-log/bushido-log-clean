with open("App.tsx", "r") as f:
    content = f.read()

# 相談成功後に使用回数をカウントアップ
old1 = """      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {"""

new1 = """      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
      // 使用回数カウントアップ（Pro以外）
      if (!isPro) {
        const today = new Date().toISOString().split('T')[0];
        const newUses = samuraiKingUses + 1;
        setSamuraiKingUses(newUses);
        await AsyncStorage.setItem(SAMURAI_KING_USES_KEY, JSON.stringify({ date: today, count: newUses }));
      }
    } catch (error) {"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")