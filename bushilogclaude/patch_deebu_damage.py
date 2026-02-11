#!/usr/bin/env python3
"""デーブ筋トレ時のダメージ演出追加（揺れ+赤フラッシュ）"""
import sys
FILE = 'App.tsx'

def patch(content, old, new, label):
    if old not in content:
        print(f'[SKIP] {label}')
        return content
    content = content.replace(old, new, 1)
    print(f'[OK]   {label}')
    return content

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()
original = src

# 1. シェイクアニメーションstate追加
src = patch(src,
    "  const [deebuTrainingType, setDeebuTrainingType] = useState<string|null>(null);",
    """  const [deebuTrainingType, setDeebuTrainingType] = useState<string|null>(null);
  const deebuShakeAnim = useRef(new Animated.Value(0)).current;
  const [deebuDamageFlash, setDeebuDamageFlash] = useState(false);""",
    '1. shake state')

# 2. タップ時にシェイク+フラッシュ発動
src = patch(src,
    """  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}""",
    """  const deebuTrainingTap = () => {
    const next = deebuHits + 1;
    setDeebuHits(next);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch(e) {}
    try { Audio.Sound.createAsync(require('./sounds/taiko-hit.mp3')).then(({sound}) => sound.setVolumeAsync(MASTER_VOLUME).then(() => sound.playAsync())); } catch(e) {}
    // damage effect
    setDeebuDamageFlash(true);
    setTimeout(() => setDeebuDamageFlash(false), 150);
    Animated.sequence([
      Animated.timing(deebuShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(deebuShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();""",
    '2. shake trigger')

# 3. 筋トレモーダル内のデーブ画像をAnimated.Imageに変更（シェイク+フラッシュ適用）
src = patch(src,
    """                <Image source={YOKAI_IMAGES.deebu} style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 8, opacity: 1 - (deebuHits / DEEBU_HIT_TARGET) * 0.6 }} resizeMode="contain" />
                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{'\u30c7\u30fc\u30d6'}</Text>""",
    """                <View style={{ alignItems: 'center', marginBottom: 8 }}>
                  {deebuDamageFlash && <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(231,76,60,0.4)', zIndex: 2 }} />}
                  <Animated.Image source={YOKAI_IMAGES.deebu} style={{ width: 120, height: 120, borderRadius: 60, opacity: 1 - (deebuHits / DEEBU_HIT_TARGET) * 0.6, transform: [{ translateX: deebuShakeAnim }] }} resizeMode="contain" />
                </View>
                <Text style={{ color: '#e74c3c', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{'\u30c7\u30fc\u30d6'}</Text>""",
    '3. animated image')

if src == original:
    print('\n[ERROR] No changes')
    sys.exit(1)
try:
    src.encode('utf-8')
except UnicodeEncodeError as e:
    print(f'\n[ERROR] UTF-8: {e}')
    sys.exit(1)
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(src)
print(f'\n\u2705 Done! +{len(src)-len(original)} chars')
