with open("App.tsx", "r") as f:
    content = f.read()

# 間違った位置を修正
old1 = """        routineDone: newRoutineDone,
      };
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
    });
  };
  const handleSaveNightReview"""

new1 = """        routineDone: newRoutineDone,
      };
    });
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };
  const handleSaveNightReview"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")