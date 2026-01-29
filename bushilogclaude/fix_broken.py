with open("App.tsx", "r") as f:
    content = f.read()

# 壊れた部分を修正
old1 = """      return {
        date: getTodayStr(),
        mission: missionInput.trim(),
        routines: routineLines,
        todos,
        review: prev?.review,
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: newRoutineDone,
      };
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };
    });
  const handleSaveNightReview"""

new1 = """      return {
        date: getTodayStr(),
        mission: missionInput.trim(),
        routines: routineLines,
        todos,
        review: prev?.review,
        samuraiMission: prev?.samuraiMission,
        missionCompleted: prev?.missionCompleted ?? false,
        routineDone: newRoutineDone,
      };
    });
    showSaveSuccess('目標を刻んだ。今日も斬れ！');
  };
  const handleSaveNightReview"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")