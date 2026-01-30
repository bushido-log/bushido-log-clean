with open("App.tsx", "r") as f:
    content = f.read()

# 1. レベル5,6の言葉をマイルドに（たわけが削除）、間隔は最後だけ短く
old1 = """    5: [
      'おい！いい加減にしろ！', 
      '何をしている！起きろ！',
      '情けない！立て！',
      'いつまで甘えている！',
    ],
    6: [
      'たわけが！', 
      '行動を起こせ！起きろ！', 
      '寝てる場合じゃないぞ！', 
      'いい加減起きろ！',
      '最高の日にするのはお前だよ！',
      '誰かが生きたかった今日だぞ！',
      'お前ならできる！起きろ！',
    ],"""

new1 = """    5: [
      'おい！そろそろ起きろ！', 
      '何をしている！起きろ！',
      '立て！今すぐ！',
      'いつまで甘えている！',
    ],
    6: [
      '起きろ！', 
      '行動！', 
      '立て！', 
      'いい加減起きろ！',
      '最高の日にしろ！',
      '誰かが生きたかった今日だぞ！',
      'お前ならできる！',
      '今日を無駄にするな！',
      'さあ立て！',
    ],"""

content = content.replace(old1, new1)

# 2. 間隔調整：途中は長め、最後だけ短く「くるってくる」
old2 = """    if (elapsedSec > 150) {
      level = 6; interval = 3000;
    } else if (elapsedSec > 120) {
      level = 5; interval = 4000;
    } else if (elapsedSec > 90) {
      level = 4; interval = 6000;
    } else if (elapsedSec > 60) {
      level = 3; interval = 10000;
    } else if (elapsedSec > 30) {
      level = 2; interval = 12000;
    }"""

new2 = """    if (elapsedSec > 180) {
      level = 6; interval = 2500;  // 3分以上：くるってくる
    } else if (elapsedSec > 150) {
      level = 6; interval = 4000;
    } else if (elapsedSec > 120) {
      level = 5; interval = 6000;
    } else if (elapsedSec > 90) {
      level = 4; interval = 8000;
    } else if (elapsedSec > 60) {
      level = 3; interval = 10000;
    } else if (elapsedSec > 30) {
      level = 2; interval = 12000;
    }"""

content = content.replace(old2, new2)

with open("App.tsx", "w") as f:
    f.write(content)

print("Done!")