with open("App.tsx", "r") as f:
    content = f.read()

# 現在の壊れた状態
old1 = """        routineDone: newRoutineDone,
      };
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };
    });
  const handleSaveNightReview = async () => {"""

# 正しい状態
new1 = """        routineDone: newRoutineDone,
      };
    });
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };
  const handleSaveNightReview = async () => {"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")