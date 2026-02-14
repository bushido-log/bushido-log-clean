s = open('App.tsx').read()
# 3000でも10000でも対応
for old_ms in ['3000', '10000']:
    s = s.replace(
        f'playVoice(BGM_MONSTER_APPEAR, 0.8, {old_ms}); playVoice(VOICE_MK_APPEAR);',
        'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice(VOICE_MK_APPEAR), 1500);')
    s = s.replace(
        f'playVoice(BGM_MONSTER_APPEAR, 0.8, {old_ms}); playVoice(VOICE_ATO_APPEAR);',
        'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice(VOICE_ATO_APPEAR), 1500);')
    s = s.replace(
        f'playVoice(BGM_MONSTER_APPEAR, 0.8, {old_ms}); playVoice(VOICE_DEEBU_APPEAR);',
        'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice(VOICE_DEEBU_APPEAR), 1500);')
    s = s.replace(
        f'playVoice(BGM_MONSTER_APPEAR, 0.8, {old_ms}); playVoice(VOICE_MOUMURI_APPEAR);',
        'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice(VOICE_MOUMURI_APPEAR), 1500);')
    s = s.replace(
        f'playVoice(BGM_MONSTER_APPEAR, 0.8, {old_ms}); playVoice(VOICE_MK2_APPEAR);',
        'playVoice(BGM_MONSTER_APPEAR, 0.5, 8000); setTimeout(() => playVoice(VOICE_MK2_APPEAR), 1500);')
open('App.tsx','w').write(s)
print('Done')
