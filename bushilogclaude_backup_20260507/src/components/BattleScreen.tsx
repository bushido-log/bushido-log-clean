// src/components/BattleScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, Image, ScrollView, Animated,
  Dimensions, ImageBackground, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio, Video, ResizeMode } from 'expo-av';
import { WorldBoss, BattleMission, OugiLevel, RUN_FAIL_RATE, RUN_RECOVERY_RATE } from '../data/battleWorldData';
import { YOKAI_LOSE_VIDEOS } from '../data/assets';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type MissionResult = {
  type: string;
  text?: string;
  items?: string[];
  seconds?: number;
  reps?: number;
};

type BattleScreenProps = {
  boss: WorldBoss;
  bossHp: number;
  missions: BattleMission[];
  todaySteps: number;
  streak: number;
  ougi: OugiLevel | null;
  ougiUsed: boolean;
  isFirstEncounter: boolean;
  completedMissions: string[];
  bossImage: any;
  bossDefeatImage: any;
  battleBg: any;
  defeatedCount: number;
  totalBosses: number;
  onMissionComplete: (missionId: string, damage: number, data: MissionResult) => void;
  onOugi: () => void;
  onRun: () => void;
  onClose: () => void;
  onConsult?: (text: string) => Promise<string>;
  onVictory?: () => void;
  onSetAlarm?: (hour: number, minute: number) => void;
  playTapSound: () => void;
  playAttackSound: () => void;
  playWinSound: () => void;
  playerHp?: number;
  playerMaxHp?: number;
  playerLevel?: number;
  playerStats?: { power: number; mind: number; skill: number; virtue: number };
};

type Phase = 'intro' | 'command' | 'mission' | 'textMission' | 'focusMission' | 'gratitudeMission' | 'exercise' | 'stepsMission' | 'appMission' | 'attacking' | 'enemyTurn' | 'runConfirm' | 'info' | 'defeat' | 'victory';

export const BattleScreen: React.FC<BattleScreenProps> = (props) => {
  const {
    boss, bossHp, missions, todaySteps, streak, ougi, ougiUsed,
    isFirstEncounter, completedMissions, bossImage, bossDefeatImage, battleBg,
    defeatedCount, totalBosses,
    onMissionComplete, onOugi, onRun, onClose, onConsult, onSetAlarm, onVictory,
    playTapSound, playAttackSound, playWinSound,
    playerHp: propPlayerHp, playerMaxHp: propPlayerMaxHp, playerLevel, playerStats,
  } = props;

  const introLines: string[] = boss.introLines || [];
  const [introIndex, setIntroIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(isFirstEncounter && introLines.length > 0 ? 'intro' : 'command');
  const [logs, setLogs] = useState<string[]>([`${boss.name}が現れた！`]);
  const [enemyQuote, setEnemyQuote] = useState(boss.quote);
  const [showDamageNum, setShowDamageNum] = useState<number | null>(null);
  const isDefeated = bossHp <= 0;

  // Animated refs
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const enemyShake = useRef(new Animated.Value(0)).current;
  const enemyFloat = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const enemyOpacity = useRef(new Animated.Value(1)).current;
  const damageOpacity = useRef(new Animated.Value(0)).current;
  const damageTranslateY = useRef(new Animated.Value(0)).current;

  // Mission states
  const [selMission, setSelMission] = useState<BattleMission | null>(null);
  const [textInput, setTextInput] = useState('');
  const [consultReply, setConsultReply] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);
  const [alarmH, setAlarmH] = useState(7);
  const [alarmM, setAlarmM] = useState(0);
  const [gratItems, setGratItems] = useState<string[]>([]);
  const [gratInput, setGratInput] = useState('');
  const [focusSec, setFocusSec] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [timerCount, setTimerCount] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 20));

  // Enemy floating animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(enemyFloat, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(enemyFloat, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Victory/Defeat check
  useEffect(() => {
    if (bossHp <= 0 && phase !== 'victory' && phase !== 'defeat') {
      setPhase('defeat');
      setEnemyQuote(boss.defeatQuote);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      // Flash
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
      // Shake
      Animated.sequence([
        Animated.timing(enemyShake, { toValue: 20, duration: 60, useNativeDriver: true }),
        Animated.timing(enemyShake, { toValue: -20, duration: 60, useNativeDriver: true }),
        Animated.timing(enemyShake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      // Fade out boss
      setTimeout(() => {
        Animated.timing(enemyOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }).start();
      }, 500);
      // Fallback if no video
      if (!YOKAI_LOSE_VIDEOS[boss.yokaiId]) {
        setTimeout(() => {
          setPhase('victory');
          addLog('🎉 ' + boss.name + 'を撃破した！');
          playWinSound();
          enemyOpacity.setValue(1);
        }, 3000);
      }
    }
  }, [bossHp]);

  // Focus timer
  useEffect(() => {
    if (!focusRunning) return;
    const id = setInterval(() => setFocusSec(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [focusRunning]);

  // Exercise timer
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerCount(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const shakeEnemy = () => {
    Animated.sequence([
      Animated.timing(enemyShake, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(enemyShake, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(enemyShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(enemyShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(enemyShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showFlash = () => {
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const showDamage = (dmg: number) => {
    setShowDamageNum(dmg);
    damageOpacity.setValue(1);
    damageTranslateY.setValue(0);
    Animated.parallel([
      Animated.timing(damageOpacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
      Animated.timing(damageTranslateY, { toValue: -60, duration: 1200, useNativeDriver: true }),
    ]).start(() => setShowDamageNum(null));
  };

  const doAttack = (missionId: string, damage: number, data: MissionResult) => {
    playAttackSound();
    shakeEnemy();
    showFlash();
    showDamage(damage);
    addLog(`⚔️ ${damage.toLocaleString()} ダメージ！`);
    const rq = boss.hitQuotes[Math.floor(Math.random() * boss.hitQuotes.length)];
    setEnemyQuote(rq);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    onMissionComplete(missionId, damage, data);
    setPhase('attacking');
    setTimeout(() => {
      if (bossHp - damage > 0) {
        setPhase('enemyTurn');
        const iq = boss.idleQuotes[Math.floor(Math.random() * boss.idleQuotes.length)];
        setEnemyQuote(iq);
        setTimeout(() => setPhase('command'), 1200);
      }
    }, 800);
  };

  // Mission handlers
  const startMission = (m: BattleMission) => {
    setSelMission(m);
    setTextInput(''); setGratItems([]); setGratInput('');
    setFocusSec(0); setFocusRunning(false);
    setRepCount(0); setTimerCount(0); setTimerRunning(false);
    switch (m.type) {
      case 'text': setPhase('textMission'); break;
      case 'focus': setPhase('focusMission'); break;
      case 'gratitude': setPhase('gratitudeMission'); break;
      case 'exercise': setPhase('exercise'); break;
      case 'steps': setPhase('stepsMission'); break;
      case 'app': setPhase('appMission'); break;
    }
  };

  const finishText = () => {
    if (!selMission || textInput.trim().length < 3) return;
    const dmg = Math.round(selMission.baseDamage * (0.8 + Math.random() * 0.4));
    doAttack(selMission.id, dmg, { type: selMission.id, text: textInput.trim() });
  };

  const finishGratitude = () => {
    if (!selMission || gratItems.length < 1) return;
    const scale = Math.min(gratItems.length / (selMission.target || 3), 2);
    const dmg = Math.round(selMission.baseDamage * scale);
    doAttack(selMission.id, dmg, { type: 'gratitude', items: gratItems });
  };

  const finishFocus = () => {
    if (!selMission) return;
    setFocusRunning(false);
    const target = (selMission.target || 5) * 60;
    const ratio = Math.min(focusSec / target, 1);
    const dmg = Math.round(selMission.baseDamage * ratio);
    doAttack(selMission.id, dmg, { type: 'focus', seconds: focusSec });
  };

  const finishExercise = () => {
    if (!selMission) return;
    setTimerRunning(false);
    const isTimer = selMission.unit === '秒';
    const count = isTimer ? timerCount : repCount;
    const dmg = count * (selMission.perRep || 100);
    doAttack(selMission.id, dmg, { type: 'exercise', reps: count });
  };

  const finishSteps = () => {
    if (!selMission) return;
    const target = selMission.target || 3000;
    const ratio = Math.min(todaySteps / target, 1);
    const dmg = Math.round(selMission.baseDamage * ratio);
    doAttack(selMission.id, dmg, { type: 'steps', reps: todaySteps });
  };

  const hpRatio = boss.hp > 0 ? Math.max(0, bossHp / boss.hp) : 0;
  const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
  const cmdStyle = { backgroundColor: 'rgba(20,20,30,0.9)', borderRadius: 10, padding: 10, alignItems: 'center' as const, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' };
  const backBtnStyle = { backgroundColor: 'rgba(40,40,50,0.8)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <ImageBackground source={battleBg} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}>
          {/* Flash overlay */}
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', opacity: flashOpacity, zIndex: 100 }} pointerEvents="none" />

          {/* Header */}
          <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: '900' }}>
                {'👹 ' + boss.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {Array.from({ length: totalBosses }).map((_, i) => (
                  <Text key={i} style={{ fontSize: 12, marginHorizontal: 2, opacity: i < defeatedCount ? 1 : 0.3 }}>
                    {i < defeatedCount ? '💀' : '👹'}
                  </Text>
                ))}
              </View>
            </View>
            {/* HP Bar */}
            <View style={{ marginTop: 6, height: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, overflow: 'hidden' }}>
              <Animated.View style={{
                height: '100%', borderRadius: 8, backgroundColor: hpColor,
                width: `${Math.max(0, hpRatio * 100)}%`,
                transform: [{ translateX: shakeAnim }],
              }} />
            </View>
            <Text style={{ color: '#888', fontSize: 11, marginTop: 2, textAlign: 'right' }}>
              {Math.max(0, bossHp).toLocaleString()} / {boss.hp.toLocaleString()}
            </Text>
          </View>

          {/* Boss Image */}
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Animated.View style={{ transform: [{ translateX: enemyShake }, { translateY: enemyFloat }], opacity: enemyOpacity }}>
              <Image
                source={isDefeated ? bossDefeatImage : bossImage}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
              />
            </Animated.View>
            {/* Damage number */}
            {showDamageNum !== null && (
              <Animated.Text style={{
                position: 'absolute', top: 20, color: '#ff4444', fontSize: 32, fontWeight: '900',
                opacity: damageOpacity, transform: [{ translateY: damageTranslateY }],
                textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4,
              }}>
                {showDamageNum.toLocaleString()}
              </Animated.Text>
            )}
            <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4, maxWidth: SCREEN_W * 0.8 }}>
              <Text style={{ color: '#ccc', fontSize: 13, textAlign: 'center', fontStyle: 'italic' }}>
                {'「' + enemyQuote + '」'}
              </Text>
            </View>
          </View>

          {/* Main Area */}
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>

              {/* === INTRO PHASE === */}
              {phase === 'intro' && (
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Text style={{ color: '#ff6b6b', fontSize: 20, fontWeight: '900', marginBottom: 12 }}>{boss.name}</Text>
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 16, marginHorizontal: 8, borderWidth: 1, borderColor: 'rgba(255,100,100,0.2)', minHeight: 80, justifyContent: 'center' }}>
                    <Text style={{ color: '#e0e0e0', fontSize: 16, fontWeight: '700', lineHeight: 26, textAlign: 'center' }}>
                      {'「' + (introLines[introIndex] || '...') + '」'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      playTapSound();
                      if (introIndex < introLines.length - 1) {
                        setIntroIndex(introIndex + 1);
                      } else {
                        setPhase('command');
                      }
                    }}
                    style={({ pressed }) => [{
                      marginTop: 16, paddingHorizontal: 32, paddingVertical: 10,
                      backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8,
                      borderWidth: 1, borderColor: '#444', opacity: pressed ? 0.6 : 1,
                    }]}
                  >
                    <Text style={{ color: '#aaa', fontSize: 14 }}>
                      {introIndex < introLines.length - 1 ? '▼ 続き' : '⚔️ 戦闘開始'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* === COMMAND PHASE === */}
              {phase === 'command' && (
                <View>
                  {/* プレイヤーステータス */}
                  <View style={{ backgroundColor: 'rgba(0,80,40,0.25)', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: '#2dd4bf', fontSize: 13, fontWeight: '900' }}>{'⚔️ Lv.' + (playerLevel || 1)}</Text>
                      <Text style={{ color: '#2ecc71', fontSize: 12, fontWeight: '700' }}>{'❤️ ' + (propPlayerHp || 0) + ' / ' + (propPlayerMaxHp || 0)}</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: '#1a1a2e', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                      <View style={{ height: '100%', width: (Math.max(0, (propPlayerHp || 0)) / Math.max(1, (propPlayerMaxHp || 1)) * 100) + '%', backgroundColor: (propPlayerHp || 0) / (propPlayerMaxHp || 1) > 0.5 ? '#2ecc71' : (propPlayerHp || 0) / (propPlayerMaxHp || 1) > 0.25 ? '#f39c12' : '#e74c3c', borderRadius: 4 }} />
                    </View>
                    {playerStats && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Text style={{ color: '#e74c3c', fontSize: 11, fontWeight: '600' }}>{'💪 ' + playerStats.power}</Text>
                        <Text style={{ color: '#3498db', fontSize: 11, fontWeight: '600' }}>{'🧠 ' + playerStats.mind}</Text>
                        <Text style={{ color: '#2ecc71', fontSize: 11, fontWeight: '600' }}>{'🎯 ' + playerStats.skill}</Text>
                        <Text style={{ color: '#f1c40f', fontSize: 11, fontWeight: '600' }}>{'🙏 ' + playerStats.virtue}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <Pressable
                      onPress={() => { playTapSound(); setPhase('mission'); }}
                      style={({ pressed }) => [{ flex: 1, ...cmdStyle, borderColor: '#ef444455', opacity: pressed ? 0.7 : 1, width: (SCREEN_W - 48) / 2 }]}
                    >
                      <Text style={{ fontSize: 18 }}>⚔️</Text>
                      <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '800' }}>ミッション</Text>
                      <Text style={{ color: '#666', fontSize: 10 }}>こなして攻撃</Text>
                    </Pressable>

                    <Pressable
                      onLongPress={() => {
                        if (ougi && !ougiUsed) {
                          playAttackSound();
                          setPhase('attacking');
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                          Animated.sequence([
                            Animated.timing(enemyShake, { toValue: 25, duration: 40, useNativeDriver: true }),
                            Animated.timing(enemyShake, { toValue: -25, duration: 40, useNativeDriver: true }),
                            Animated.timing(enemyShake, { toValue: 20, duration: 40, useNativeDriver: true }),
                            Animated.timing(enemyShake, { toValue: -20, duration: 40, useNativeDriver: true }),
                            Animated.timing(enemyShake, { toValue: 0, duration: 40, useNativeDriver: true }),
                          ]).start();
                          Animated.sequence([
                            Animated.timing(flashOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
                            Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                            Animated.timing(flashOpacity, { toValue: 0.7, duration: 100, useNativeDriver: true }),
                            Animated.timing(flashOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
                          ]).start();
                          const dmg = Math.floor(boss.hp * ougi.damageRate);
                          addLog(ougi.emoji + ' 奥義「' + ougi.name + '」発動！ ' + dmg.toLocaleString() + ' ダメージ！');
                          setEnemyQuote('な…なんだこの力は…！');
                          showDamage(dmg);
                          setTimeout(() => {
                            onOugi();
                            setPhase('enemyTurn');
                            setTimeout(() => {
                              setEnemyQuote(boss.hitQuotes[Math.floor(Math.random() * boss.hitQuotes.length)]);
                              setTimeout(() => setPhase('command'), 1200);
                            }, 800);
                          }, 1000);
                        }
                      }}
                      delayLongPress={800}
                      style={({ pressed }) => [cmdStyle, {
                        borderColor: ougi && !ougiUsed ? '#f59e0b' : '#22222266',
                        borderWidth: ougi && !ougiUsed ? 2 : 1,
                        opacity: ougi && !ougiUsed ? (pressed ? 0.7 : 1) : 0.5,
                        width: (SCREEN_W - 48) / 2,
                      }]}
                    >
                      <Text style={{ fontSize: 18 }}>🌪️</Text>
                      <Text style={{ color: ougi && !ougiUsed ? '#f59e0b' : '#555', fontSize: 14, fontWeight: '800' }}>⚡ 奥義</Text>
                      <Text style={{ color: '#666', fontSize: 10 }}>
                        {ougiUsed ? '本日使用済み' : ougi ? `長押し: ${ougi.name}` : `あと${Math.max(0, 10000 - todaySteps).toLocaleString()}歩`}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => { playTapSound(); setPhase('runConfirm'); }}
                      style={({ pressed }) => [cmdStyle, { borderColor: '#44444466', opacity: pressed ? 0.7 : 1, width: (SCREEN_W - 48) / 2 }]}
                    >
                      <Text style={{ fontSize: 18 }}>🏃</Text>
                      <Text style={{ color: '#888', fontSize: 14, fontWeight: '800' }}>逃げる</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { playTapSound(); setPhase('info'); }}
                      style={({ pressed }) => [cmdStyle, { borderColor: '#3b82f655', opacity: pressed ? 0.7 : 1, width: (SCREEN_W - 48) / 2 }]}
                    >
                      <Text style={{ fontSize: 18 }}>📊</Text>
                      <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '800' }}>情報</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => { playTapSound(); onClose(); }}
                    style={({ pressed }) => [{ backgroundColor: '#1a1a2e', borderRadius: 10, padding: 8, alignItems: 'center', marginTop: 6, opacity: pressed ? 0.7 : 1, borderWidth: 1, borderColor: '#33333366' }]}
                  >
                    <Text style={{ color: '#666', fontSize: 12 }}>{'🏠 機能画面に戻る'}</Text>
                  </Pressable>
                  {/* Log */}
                  <View style={{ marginTop: 10, maxHeight: 60 }}>
                    {logs.slice(0, 3).map((l, i) => (
                      <Text key={i} style={{ color: i === 0 ? '#ccc' : '#555', fontSize: 11 }}>{l}</Text>
                    ))}
                  </View>
                </View>
              )}

              {/* === MISSION SELECT === */}
              {phase === 'mission' && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '800' }}>⚔️ ミッションを選べ</Text>
                    <Pressable onPress={() => setPhase('command')} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {missions.map(m => {
                      const done = completedMissions.includes(m.id);
                      return (
                        <Pressable
                          key={m.id}
                          onPress={() => { if (!done) { playTapSound(); startMission(m); } }}
                          style={({ pressed }) => [{
                            ...cmdStyle, width: (SCREEN_W - 48) / 2,
                            opacity: done ? 0.4 : (pressed ? 0.7 : 1),
                          }]}
                        >
                          <Text style={{ fontSize: 16 }}>{m.emoji}</Text>
                          <Text style={{ color: done ? '#555' : '#ccc', fontSize: 12, fontWeight: '700' }}>
                            {done ? `${m.label} ✓` : m.label}
                          </Text>
                          <Text style={{ color: done ? '#333' : '#2DD4BF', fontSize: 10 }}>
                            {done ? '完了済み' : m.desc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* === TEXT MISSION === */}
              {phase === 'textMission' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => setPhase('mission')} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    value={textInput} onChangeText={setTextInput}
                    placeholder={selMission.desc} placeholderTextColor="#555" multiline
                    style={{ backgroundColor: 'rgba(20,20,30,0.9)', color: '#fff', borderRadius: 12, padding: 16, minHeight: 100, fontSize: 15, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' }}
                  />
                  <Pressable
                    onPress={finishText}
                    style={({ pressed }) => [{ backgroundColor: textInput.trim().length >= 3 ? (pressed ? '#166534' : '#15803d') : '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                      {'⚔️ 攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* === FOCUS MISSION === */}
              {phase === 'focusMission' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => { setFocusRunning(false); setPhase('mission'); }} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                      {Math.floor(focusSec / 60)}:{(focusSec % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
                      {'目標: ' + (selMission.target || 5) + '分'}
                    </Text>
                    <View style={{ width: '100%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 12 }}>
                      <View style={{ height: '100%', backgroundColor: '#22c55e', borderRadius: 4, width: `${Math.min(100, (focusSec / ((selMission.target || 5) * 60)) * 100)}%` }} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                      <Pressable
                        onPress={() => setFocusRunning(!focusRunning)}
                        style={({ pressed }) => [{ backgroundColor: focusRunning ? '#991b1b' : '#15803d', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, opacity: pressed ? 0.7 : 1 }]}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                          {focusRunning ? '⏸ 一時停止' : '▶️ スタート'}
                        </Text>
                      </Pressable>
                      {focusSec > 0 && (
                        <Pressable
                          onPress={finishFocus}
                          style={({ pressed }) => [{ backgroundColor: '#1e40af', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, opacity: pressed ? 0.7 : 1 }]}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>⚔️ 攻撃</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* === GRATITUDE MISSION === */}
              {phase === 'gratitudeMission' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => setPhase('mission')} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  {gratItems.map((item, i) => (
                    <Text key={i} style={{ color: '#22c55e', fontSize: 14, marginBottom: 4 }}>{'✓ ' + item}</Text>
                  ))}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TextInput
                      value={gratInput} onChangeText={setGratInput}
                      placeholder={`感謝 ${gratItems.length + 1}つ目...`} placeholderTextColor="#555"
                      style={{ flex: 1, backgroundColor: 'rgba(20,20,30,0.9)', color: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#333' }}
                    />
                    <Pressable
                      onPress={() => { if (gratInput.trim()) { setGratItems([...gratItems, gratInput.trim()]); setGratInput(''); } }}
                      style={({ pressed }) => [{ backgroundColor: '#15803d', borderRadius: 10, padding: 12, justifyContent: 'center', opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>＋</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={finishGratitude}
                    style={({ pressed }) => [{ backgroundColor: gratItems.length >= 1 ? '#15803d' : '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                      {'⚔️ 攻撃！（' + gratItems.length + '/' + (selMission.target || 3) + '個）'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* === EXERCISE MISSION === */}
              {phase === 'exercise' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#f59e0b', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => { setTimerRunning(false); setPhase('mission'); }} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    {selMission.unit === '秒' ? (
                      <>
                        <Text style={{ color: '#fff', fontSize: 56, fontWeight: '900' }}>{timerCount}秒</Text>
                        <Text style={{ color: '#888', fontSize: 14 }}>{'目標: ' + selMission.target + '秒'}</Text>
                        <Pressable
                          onPress={() => setTimerRunning(!timerRunning)}
                          style={({ pressed }) => [{ backgroundColor: timerRunning ? '#991b1b' : '#15803d', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 16, opacity: pressed ? 0.7 : 1 }]}
                        >
                          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{timerRunning ? '⏸ ストップ' : '▶️ スタート'}</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Text style={{ color: '#fff', fontSize: 56, fontWeight: '900' }}>{repCount}回</Text>
                        <Text style={{ color: '#888', fontSize: 14 }}>{'目標: ' + selMission.target + '回'}</Text>
                        <Pressable
                          onPress={() => { setRepCount(p => p + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }}
                          style={({ pressed }) => [{ backgroundColor: '#15803d', borderRadius: 20, width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginTop: 16, opacity: pressed ? 0.7 : 1 }]}
                        >
                          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>タップ</Text>
                        </Pressable>
                      </>
                    )}
                    <View style={{ width: '100%', height: 8, backgroundColor: '#222', borderRadius: 4, marginTop: 16 }}>
                      <View style={{ height: '100%', backgroundColor: '#f59e0b', borderRadius: 4, width: `${Math.min(100, ((selMission.unit === '秒' ? timerCount : repCount) / (selMission.target || 10)) * 100)}%` }} />
                    </View>
                    <Pressable
                      onPress={finishExercise}
                      style={({ pressed }) => [{ backgroundColor: '#1e40af', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16, opacity: pressed ? 0.7 : 1 }]}
                    >
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>⚔️ 攻撃！</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* === STEPS MISSION === */}
              {phase === 'stepsMission' && selMission && (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 12 }}>🚶 歩数チャレンジ</Text>
                  <Text style={{ color: '#22c55e', fontSize: 48, fontWeight: '900' }}>{todaySteps.toLocaleString()}</Text>
                  <Text style={{ color: '#888', fontSize: 14 }}>{'/ ' + (selMission.target || 3000).toLocaleString() + ' 歩'}</Text>
                  <View style={{ width: '100%', height: 12, backgroundColor: '#222', borderRadius: 6, marginTop: 12 }}>
                    <View style={{ height: '100%', backgroundColor: todaySteps >= (selMission.target || 3000) ? '#22c55e' : '#f59e0b', borderRadius: 6, width: `${Math.min(100, (todaySteps / (selMission.target || 3000)) * 100)}%` }} />
                  </View>
                  <Pressable
                    onPress={finishSteps}
                    style={({ pressed }) => [{ backgroundColor: '#15803d', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 20, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                      {'⚔️ 歩数で攻撃！（~' + Math.round(selMission.baseDamage * Math.min(todaySteps / (selMission.target || 3000), 1)).toLocaleString() + ' DMG）'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setPhase('mission')} style={{ marginTop: 12 }}>
                    <Text style={{ color: '#888', fontSize: 13 }}>戻る</Text>
                  </Pressable>
                </View>
              )}

              {/* === APP MISSION === */}
              {phase === 'appMission' && selMission && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>{selMission.emoji} {selMission.label}</Text>
                    <Pressable onPress={() => { setConsultReply(''); setConsultLoading(false); setPhase('mission'); }} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>

                  {selMission.id === 'consult' ? (
                    <View>
                      <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>サムライに悩みを打ち明けろ</Text>
                      <TextInput
                        value={textInput} onChangeText={setTextInput}
                        placeholder="悩みや気持ちを書け…" placeholderTextColor="#555" multiline
                        style={{ backgroundColor: 'rgba(20,20,30,0.9)', color: '#fff', borderRadius: 12, padding: 16, minHeight: 80, fontSize: 15, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' }}
                        editable={!consultLoading}
                      />
                      {!consultReply && (
                        <Pressable
                          onPress={async () => {
                            if (textInput.trim().length < 3 || consultLoading || !onConsult) return;
                            setConsultLoading(true);
                            try {
                              const reply = await onConsult(textInput.trim());
                              setConsultReply(reply);
                            } catch(e) {
                              setConsultReply('通信エラーでござる…もう一度試せ');
                            }
                            setConsultLoading(false);
                          }}
                          style={({ pressed }) => [{ backgroundColor: textInput.trim().length >= 3 && !consultLoading ? (pressed ? '#1e40af' : '#2563eb') : '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                            {consultLoading ? '⏳ サムライが考え中…' : '💬 相談する'}
                          </Text>
                        </Pressable>
                      )}
                      {consultReply !== '' && (
                        <View style={{ marginTop: 12 }}>
                          <View style={{ backgroundColor: 'rgba(20,20,40,0.9)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#D4AF3744' }}>
                            <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '800', marginBottom: 4 }}>サムライキングの言葉</Text>
                            <ScrollView style={{ maxHeight: 120 }}>
                              <Text style={{ color: '#e8e8e8', fontSize: 14, lineHeight: 20 }}>{consultReply}</Text>
                            </ScrollView>
                          </View>
                          <Pressable
                            onPress={() => {
                              doAttack(selMission.id, selMission.baseDamage, { type: 'app', text: textInput.trim() });
                              setConsultReply('');
                            }}
                            style={({ pressed }) => [{ backgroundColor: pressed ? '#166534' : '#15803d', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                          >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                              {'⚔️ 攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>

                  ) : selMission.id === 'alarm' ? (
                    <View>
                      <Text style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>明日の起床時間をセットしろ</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ alignItems: 'center' }}>
                          <Pressable onPress={() => setAlarmH(prev => (prev + 1) % 24)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▲</Text>
                          </Pressable>
                          <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                            {String(alarmH).padStart(2, '0')}
                          </Text>
                          <Pressable onPress={() => setAlarmH(prev => (prev + 23) % 24)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▼</Text>
                          </Pressable>
                        </View>
                        <Text style={{ color: '#D4AF37', fontSize: 48, fontWeight: '900', marginHorizontal: 8 }}>:</Text>
                        <View style={{ alignItems: 'center' }}>
                          <Pressable onPress={() => setAlarmM(prev => (prev + 5) % 60)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▲</Text>
                          </Pressable>
                          <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                            {String(alarmM).padStart(2, '0')}
                          </Text>
                          <Pressable onPress={() => setAlarmM(prev => (prev + 55) % 60)} style={{ padding: 8 }}>
                            <Text style={{ color: '#888', fontSize: 22 }}>▼</Text>
                          </Pressable>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => {
                          if (onSetAlarm) onSetAlarm(alarmH, alarmM);
                          doAttack(selMission.id, selMission.baseDamage, { type: 'app', text: alarmH + ':' + String(alarmM).padStart(2, '0') + ' に起きる' });
                        }}
                        style={({ pressed }) => [{ backgroundColor: pressed ? '#166534' : '#15803d', borderRadius: 12, padding: 14, alignItems: 'center' }]}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                          {'⏰ アラームセット＆攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                        </Text>
                      </Pressable>
                    </View>

                  ) : (
                    <View>
                      <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{selMission.desc}</Text>
                      <TextInput
                        value={textInput} onChangeText={setTextInput}
                        placeholder="ここに書け…" placeholderTextColor="#555" multiline
                        style={{ backgroundColor: 'rgba(20,20,30,0.9)', color: '#fff', borderRadius: 12, padding: 16, minHeight: 100, fontSize: 15, borderWidth: 1, borderColor: '#333', textAlignVertical: 'top' }}
                      />
                      <Pressable
                        onPress={() => {
                          if (textInput.trim().length < 3) return;
                          doAttack(selMission.id, selMission.baseDamage, { type: 'app', text: textInput.trim() });
                        }}
                        style={({ pressed }) => [{ backgroundColor: textInput.trim().length >= 3 ? (pressed ? '#166534' : '#15803d') : '#333', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 }]}
                      >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
                          {'⚔️ 攻撃！（~' + selMission.baseDamage.toLocaleString() + ' DMG）'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* === RUN CONFIRM === */}
              {phase === 'runConfirm' && (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '800', marginBottom: 12 }}>逃げますか？</Text>
                  <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
                    {`${Math.round(RUN_FAIL_RATE * 100)}%で逃げられない\n逃げると敵HP ${Math.round(RUN_RECOVERY_RATE * 100)}%回復`}
                  </Text>
                  <Pressable
                    onPress={() => { playTapSound(); onRun(); }}
                    style={({ pressed }) => [{ backgroundColor: '#7f1d1d', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>🏃 逃げる！</Text>
                  </Pressable>
                  <Pressable onPress={() => setPhase('command')} style={{ marginTop: 12 }}>
                    <Text style={{ color: '#888', fontSize: 13 }}>やっぱり戦う</Text>
                  </Pressable>
                </View>
              )}

              {/* === INFO === */}
              {phase === 'info' && (
                <View style={{ padding: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '800' }}>📊 バトル情報</Text>
                    <Pressable onPress={() => setPhase('command')} style={backBtnStyle}>
                      <Text style={{ color: '#888', fontSize: 11 }}>戻る</Text>
                    </Pressable>
                  </View>
                  <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 22 }}>
                    {`👹 ${boss.name}\nHP: ${bossHp.toLocaleString()} / ${boss.hp.toLocaleString()} (${Math.round(hpRatio * 100)}%)\n1日のミッション上限: ${boss.maxMissionsPerDay}回\n🚶 今日の歩数: ${todaySteps.toLocaleString()}\n🔥 連続日数: ${streak}日\n⚔️ 撃破済み: ${defeatedCount}/${totalBosses}`}
                  </Text>
                  {ougi && (
                    <Text style={{ color: '#f59e0b', fontSize: 13, marginTop: 8 }}>
                      {`🌪️ 奥義「${ougi.name}」使用可能！\n（長押しで発動 → ${Math.round(ougi.damageRate * 100)}%ダメージ）`}
                    </Text>
                  )}
                </View>
              )}

              {/* === ATTACKING / ENEMY TURN === */}
              {(phase === 'attacking' || phase === 'enemyTurn') && (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: phase === 'attacking' ? '#22c55e' : '#ef4444', fontSize: 20, fontWeight: '900' }}>
                    {phase === 'attacking' ? '⚔️ 攻撃中...' : `👹 ${boss.name}の番...`}
                  </Text>
                </View>
              )}

              {/* === DEFEAT PHASE === */}
              {phase === 'defeat' && (
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ color: '#e74c3c', fontSize: 14, fontWeight: '900', letterSpacing: 3, marginBottom: 8 }}>━━ 撃破 ━━</Text>
                  {YOKAI_LOSE_VIDEOS[boss.yokaiId] ? (
                    <Video source={YOKAI_LOSE_VIDEOS[boss.yokaiId]} style={{ width: 250, height: 250, borderRadius: 16 }} resizeMode={ResizeMode.CONTAIN} shouldPlay isLooping={false}
                      onPlaybackStatusUpdate={(status: any) => { if (status.didJustFinish) { setPhase('victory'); playWinSound(); enemyOpacity.setValue(1); } }} />
                  ) : (<Text style={{ color: '#555', fontSize: 40, marginVertical: 20 }}>💨</Text>)}
                  <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>
                    {'「' + boss.defeatQuote + '」'}
                  </Text>
                </View>
              )}

              {/* === VICTORY === */}
              {phase === 'victory' && (
                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>⚔️</Text>
                  <Text style={{ color: '#D4AF37', fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: 4 }}>勝利</Text>
                  <Text style={{ color: '#aaa', fontSize: 16, marginBottom: 4 }}>{boss.name}を撃破した</Text>
                  <Text style={{ color: '#ff6b6b', fontSize: 14, fontStyle: 'italic', marginBottom: 20 }}>{'「' + boss.defeatQuote + '」'}</Text>
                  <Pressable onPress={() => { playTapSound(); if (onVictory) onVictory(); else onClose(); }} style={({ pressed }) => [{ backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2, borderColor: '#D4AF37', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, opacity: pressed ? 0.7 : 1 }]}>
                    <Text style={{ color: '#D4AF37', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>続ける</Text>
                  </Pressable>
                </View>
              )}

          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};
