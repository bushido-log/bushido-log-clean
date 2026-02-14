"""テキスト表示修正: CLEAR画面・COMPLETE画面・WORLD2画面"""
s = open('App.tsx').read()

# 1. FINAL STAGE CLEAR - 中央寄せ + フォント調整
old = "color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 12"
new = "color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 4, marginBottom: 12, textAlign: 'center'"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] CLEAR: フォント+中央寄せ')

# 2. WORLD 1 COMPLETE - オーバーレイ濃く
old = "backgroundColor: 'rgba(0,0,0,0.55)'"
new = "backgroundColor: 'rgba(0,0,0,0.75)'"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] COMPLETE: オーバーレイ濃く')

# 3. WORLD 2 夜の支配者 - ダッシュ改行防止
old = "color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 30"
new = "color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 30, textAlign: 'center'"
if old in s:
    s = s.replace(old, new, 1)
    print('[OK] WORLD2: フォント調整')

open('App.tsx', 'w').write(s)
print('Done')
