#!/usr/bin/env python3
"""yokai_hints_final.py - emoji->image + custom messages in one script"""

import shutil
from datetime import datetime

path = 'App.tsx'
shutil.copy2(path, path + f'.bak_yf_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace entire YOKAI_HINTS block
old_start = "  const YOKAI_HINTS: Record<string, {yokai: string; msg: string}> = {"
if old_start not in content:
    old_start = "  const YOKAI_HINTS: Record<string, {yokaiId: string; msg: string}> = {"

new_block = """  const YOKAI_HINTS: Record<string, {yokaiId: string; msg: string}> = {
    consult: { yokaiId: 'mikkabozu', msg: 'どうせ一人で悩んでるんだろ？\\nサムライに相談して俺を黙らせてみろ' },
    goal: { yokaiId: 'atodeyaru', msg: '明日やればいいじゃん。な？\\n今日変わりたいなら目標書いてみなよ' },
    review: { yokaiId: 'atamadekkachi', msg: '考えてばかりで行動しないんでしょ？\\n悔しかったら今日やったこと書いてみなよ' },
    gratitude: { yokaiId: 'hikakuzou', msg: '他人ばかり気にしてるお前は感謝を忘れてる\\n感謝か良いことを書いてみれば。どうせ無理だろうけど' },
    focus: { yokaiId: 'scroll', msg: 'もうちょっとだけ…ほら、携帯みようよ\\n集中したいならネット遮断してタイマー回しなよ' },
    alarm: { yokaiId: 'nidoneel', msg: 'あと5分…あと5分だけ…寝ようよ？\\nサムライアラーム使ったら二度寝出来なくなるからやめてね' },
    character: { yokaiId: 'mikkabozu', msg: 'どうせすぐ飽きるんだろ？\\n悔しかったらキャラを育てて妖怪を倒してみなよ' },
    innerWorld: { yokaiId: 'moumuri', msg: 'お前には無理だよ。無理だからやめとけば\\nもし無理じゃないならここで修行してみれば' },
    battle: { yokaiId: 'deebu', msg: '妖怪がミッションを出して攻撃してくるぜ\\nミッションをこなして俺をぶっ倒せ' },
    samuraiWalk: { yokaiId: 'mikkabozu', msg: '全国制覇？お前が？笑わせんな\\n歩いて証明しろ。5,000歩で足跡、10,000歩で制覇だ' },
  };"""

idx = content.find(old_start)
if idx == -1:
    print('⚠  YOKAI_HINTS not found')
else:
    end_idx = content.find('  };\n', idx) + len('  };\n')
    content = content[:idx] + new_block + '\n' + content[end_idx:]
    print('✅ YOKAI_HINTS replaced')

# 2. Update activeHint type
content = content.replace(
    "{yokai: string; msg: string} | null",
    "{yokaiId: string; msg: string} | null"
)
print('✅ activeHint type updated')

# 3. Replace emoji with Image in modal
old_emoji = "<Text style={{ fontSize: 48, marginBottom: 12 }}>{activeHint.yokai}</Text>"
new_image = '<Image source={YOKAI_IMAGES[activeHint.yokaiId]} style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 12 }} resizeMode="contain" />'
if old_emoji in content:
    content = content.replace(old_emoji, new_image)
    print('✅ Emoji replaced with Image')
elif 'activeHint.yokaiId' in content and 'YOKAI_IMAGES[activeHint' in content:
    print('⏭  Image already set')
else:
    print('⚠  Modal emoji line not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('\n✅ Done! npx expo start --clear')
