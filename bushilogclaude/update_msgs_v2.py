#!/usr/bin/env python3
"""update_msgs_v2.py - final yokai messages"""

path = 'App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

msgs = {
    "consult": "どうせ一人で悩んでるんだろ？\\nサムライに相談して俺を黙らせてみろ",
    "goal": "明日やればいいじゃん。な？\\n今日変わりたいなら目標書いてみなよ",
    "review": "考えてばかりで行動しないんでしょ？\\n悔しかったら今日やったこと書いてみなよ",
    "gratitude": "他人ばかり気にしてるお前は感謝を忘れてる\\n感謝か良いことを書いてみれば。どうせ無理だろうけど",
    "focus": "もうちょっとだけ…ほら、携帯みようよ\\n集中したいならネット遮断してタイマー回しなよ",
    "alarm": "あと5分…あと5分だけ…寝ようよ？\\nサムライアラーム使ったら二度寝出来なくなるからやめてね",
    "character": "どうせすぐ飽きるんだろ？\\n悔しかったらキャラを育てて妖怪を倒してみなよ",
    "innerWorld": "お前には無理だよ。無理だからやめとけば\\nもし無理じゃないならここで修行してみれば",
    "battle": "妖怪がミッションを出して攻撃してくるぜ\\nミッションをこなして俺をぶっ倒せ",
    "samuraiWalk": "全国制覇？お前が？笑わせんな\\n歩いて証明しろ。5,000歩で足跡、10,000歩で制覇だ",
}

for key, msg in msgs.items():
    marker = f"{key}: {{ yokaiId:"
    idx = content.find(marker)
    if idx == -1:
        # try with extra spaces
        marker = f"{key}: {{yokaiId:"
        idx = content.find(marker)
    if idx == -1:
        print(f"⚠  {key} not found")
        continue
    msg_start = content.find("msg: '", idx)
    msg_end = content.find("' },", msg_start)
    if msg_start == -1 or msg_end == -1:
        print(f"⚠  {key} msg not parsed")
        continue
    new_msg = f"msg: '{msg}' }},"
    content = content[:msg_start] + new_msg + content[msg_end + 4:]
    print(f"✅ {key}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ Done!')
