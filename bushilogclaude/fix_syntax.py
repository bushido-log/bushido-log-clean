with open("App.tsx", "r") as f:
    content = f.read()

# 間違った位置のshowSaveSuccessを削除して正しい位置に移動
old1 = """      samuraiMission: prev?.samuraiMission,
    showSaveSuccess('振り返り完了。明日も斬れ！');
      missionCompleted: prev?.missionCompleted ?? false,
      routineDone: prev?.routineDone ?? [],
    }));
  };"""

new1 = """      samuraiMission: prev?.samuraiMission,
      missionCompleted: prev?.missionCompleted ?? false,
      routineDone: prev?.routineDone ?? [],
    }));
    showSaveSuccess('振り返り完了。明日も斬れ！');
  };"""

content = content.replace(old1, new1)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")