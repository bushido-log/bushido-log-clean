with open("App.tsx", "r") as f:
    content = f.read()

# 1. handleSaveTodayMission の最後に showSaveSuccess を追加
old1 = """    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };

  const handleSaveNightReview"""

# 既に追加されているか確認
if old1 not in content:
    # 追加されていない場合
    old1b = """    setDailyLogs(updatedLogs);
  };

  const handleSaveNightReview"""
    new1b = """    setDailyLogs(updatedLogs);
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };

  const handleSaveNightReview"""
    content = content.replace(old1b, new1b)

# 2. handleSaveNightReview の最後に showSaveSuccess を追加
old2 = """    showSaveSuccess('振り返り完了。明日も斬れ！ +' + xpGain + 'XP');
  };

  const handleSaveOnboarding"""

if old2 not in content:
    old2b = """    setTotalXP(newXP);
  };

  const handleSaveOnboarding"""
    new2b = """    setTotalXP(newXP);
    showSaveSuccess('振り返り完了。明日も斬れ！');
  };

  const handleSaveOnboarding"""
    content = content.replace(old2b, new2b)

# 3. handleSaveEditedLog にも追加
old3 = """    setEditingLogDate(null);
  };

  const handleDeleteLog"""
new3 = """    setEditingLogDate(null);
    showSaveSuccess('編集完了！記録を更新した。');
  };

  const handleDeleteLog"""
content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")