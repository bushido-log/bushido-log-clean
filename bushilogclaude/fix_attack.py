#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

old = """  const yokaiAttack = async () => {
    if (yokaiPhase !== 'appear' || !yokaiEncounter) return;
    setYokaiPhase('attack');
    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Shake animation
    Animated.sequence([
      Animated.timing(yokaiShakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      setYokaiPhase('defeated');
      playWinSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addXpWithLevelCheck(yokaiXp);
    }, 1200);
  };"""

new = """  const SAMURAI_KING_DEFEAT_QUOTES = [
    '\u3088\u304f\u3084\u3063\u305f\u3002\u3060\u304c\u3001\u6cb9\u65ad\u3059\u308b\u306a',
    '\u305d\u308c\u304c\u304a\u524d\u306e\u529b\u3060',
    '\u884c\u52d5\u3057\u305f\u8005\u3060\u3051\u304c\u3001\u659c\u308c\u308b',
    '\u4fee\u884c\u306f\u7d9a\u304f\u3002\u6b62\u307e\u308b\u306a',
    '\u4e00\u592a\u5200\u3001\u898b\u4e8b\u3060',
    '\u5f31\u3044\u5fc3\u3092\u659c\u3063\u305f\u306e\u306f\u3001\u304a\u524d\u81ea\u8eab\u3060',
  ];

  const yokaiAttack = async () => {
    if (yokaiPhase !== 'appear' || !yokaiEncounter) return;
    setYokaiPhase('attack');
    await playAttackSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
    Animated.sequence([
      Animated.timing(yokaiShakeAnim, { toValue: 25, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -25, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 20, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -20, duration: 40, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 18, duration: 35, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -18, duration: 35, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 12, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -12, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 6, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: -6, duration: 30, useNativeDriver: true }),
      Animated.timing(yokaiShakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 500);
    setTimeout(() => {
      setYokaiPhase('defeated');
      playWinSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
      addXpWithLevelCheck(yokaiXp);
    }, 1500);
  };"""

if old in c:
    c = c.replace(old, new)
    with open('App.tsx','w',encoding='utf-8') as f:
        f.write(c)
    print('OK! yokaiAttack enhanced')
else:
    print('Not found')
