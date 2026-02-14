"""BGMをミッション選択完了まで流す"""
s = open('App.tsx').read()

# 1. monsterBgmRef追加
old_ref = "  const [storyPhase, setStoryPhase] = useState"
new_ref = "  const monsterBgmRef = useRef<any>(null);\n  const [storyPhase, setStoryPhase] = useState"
if old_ref in s and 'monsterBgmRef' not in s:
    s = s.replace(old_ref, new_ref, 1)
    print('[OK] monsterBgmRef追加')

# 2. BGM再生をref保存に変更（両パターン対応）
voices = ['VOICE_MK_APPEAR', 'VOICE_ATO_APPEAR', 'VOICE_DEEBU_APPEAR', 'VOICE_MOUMURI_APPEAR', 'VOICE_MK2_APPEAR']
for v in voices:
    # Pattern A: with stopAfterMs
    oldA = f'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice({v}), 1500);'
    # Pattern B: no args
    oldB = f'playVoice(BGM_MONSTER_APPEAR); playVoice({v});'
    newV = f"Audio.Sound.createAsync(BGM_MONSTER_APPEAR).then(({{sound}}) => {{ monsterBgmRef.current = sound; sound.setVolumeAsync(0.5).then(() => sound.playAsync()); }}).catch(e => {{}}); setTimeout(() => playVoice({v}), 1500);"
    if oldA in s:
        s = s.replace(oldA, newV, 1)
        print(f'[OK] BGM ref: {v} (patternA)')
    elif oldB in s:
        s = s.replace(oldB, newV, 1)
        print(f'[OK] BGM ref: {v} (patternB)')

# 3. BGM停止ヘルパー
stop_bgm = "if (monsterBgmRef.current) { try { monsterBgmRef.current.stopAsync(); monsterBgmRef.current.unloadAsync(); } catch(e) {} monsterBgmRef.current = null; } "

# missionSelect
old_ms = "setStoryPhase('missionSelect'); setSelectedMission(null); samuraiSpeak('どう挑む？');"
if old_ms in s and stop_bgm not in s:
    s = s.replace(old_ms, stop_bgm + old_ms, 1)
    print('[OK] missionSelect時BGM停止')

# missionBrief (4箇所)
old_mb = "setStoryPhase('missionBrief'); return; }"
new_mb = stop_bgm + "setStoryPhase('missionBrief'); return; }"
if old_mb in s and 'monsterBgmRef.current' not in s.split("setStoryPhase('missionBrief')")[1][:50] if "setStoryPhase('missionBrief')" in s else True:
    c = s.count(old_mb)
    s = s.replace(old_mb, new_mb)
    print(f'[OK] missionBrief時BGM停止: {c}箇所')

open('App.tsx', 'w').write(s)
print('\n✅ 完了')
