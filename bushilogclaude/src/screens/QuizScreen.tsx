import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Image, ScrollView,
  Animated, Modal
} from 'react-native';

const API_URL = 'https://irie-server.onrender.com/quiz-generate';

const CATEGORIES = [
  { id: 'patois', label_en: 'Patois', label_ja: 'パトワ語', icon: '🗣️', img: require('../../assets/icons/icon_quiz_patois.png') },
  { id: 'reggae', label_en: 'Reggae', label_ja: 'レゲエ', icon: '🎵', img: require('../../assets/icons/icon_quiz_reggae.png') },
  { id: 'jamaica', label_en: 'Jamaica', label_ja: 'ジャマイカ', icon: '🗺️', img: require('../../assets/icons/icon_quiz_jamaica.png') },
  { id: 'artists', label_en: 'Artists', label_ja: 'アーティスト', icon: '🎤', img: require('../../assets/icons/icon_quiz_artists.png') },
];

const LEVELS = [
  { lv: 1, name: 'Fresh Offah Plane', icon: '🛬', xp: 0 },
  { lv: 2, name: 'Touris', icon: '🌴', xp: 200 },
  { lv: 3, name: 'Bredren', icon: '🤝', xp: 500 },
  { lv: 4, name: 'Yardie', icon: '🏘️', xp: 1000 },
  { lv: 5, name: 'Selector', icon: '🎵', xp: 1800 },
  { lv: 6, name: 'Rude Bwoy', icon: '🦁', xp: 2800 },
  { lv: 7, name: 'Badman', icon: '🔥', xp: 4200 },
  { lv: 8, name: 'Don', icon: '👑', xp: 6000 },
  { lv: 9, name: 'Rastaman', icon: '🌿', xp: 8500 },
  { lv: 10, name: 'Duppy Conqueror', icon: '⚡', xp: 12000 },
];

const TRIVIA = [
  "Jamaica is the birthplace of reggae, dancehall, and ska music.",
  "Patois is spoken by over 3 million Jamaicans worldwide.",
  "Bob Marley sold over 75 million records worldwide.",
  "Jamaica was the first Caribbean country to compete in the Winter Olympics.",
  "The Blue Mountains in Jamaica produce some of the world's most expensive coffee.",
  "Usain Bolt, the fastest man alive, is Jamaican.",
  "Jamaica gained independence from Britain on August 6, 1962.",
  "The word 'Irie' means everything is alright and good.",
];

const getLevel = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i];
  }
  return LEVELS[0];
};

const getNextLevel = (xp: number) => {
  const current = getLevel(xp);
  return LEVELS.find(l => l.lv === current.lv + 1) || null;
};

const getXpProgress = (xp: number) => {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  const range = next.xp - current.xp;
  const progress = xp - current.xp;
  return Math.min(progress / range, 1);
};

type Quiz = { question: string; options: string[]; correct: string; explanation: string; };
type Props = { onBack: () => void };

export default function QuizScreen({ onBack }: Props) {
  const [category, setCategory] = useState('patois');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(LEVELS[0]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [trivia, setTrivia] = useState('');
  const xpBarAnim = useRef(new Animated.Value(0)).current;
  const xpPopAnim = useRef(new Animated.Value(0)).current;
  const { lang } = useLang();

  useEffect(() => {
    AsyncStorage.getItem('ras_quiz_xp').then(val => {
      if (val) {
        const savedXp = parseInt(val);
        setXp(savedXp);
        xpBarAnim.setValue(getXpProgress(savedXp));
      }
    });
    setTrivia(TRIVIA[Math.floor(Math.random() * TRIVIA.length)]);
  }, []);

  const animateXpBar = (newXp: number) => {
    Animated.timing(xpBarAnim, {
      toValue: getXpProgress(newXp),
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const showXpPop = () => {
    xpPopAnim.setValue(0);
    Animated.sequence([
      Animated.timing(xpPopAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(xpPopAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const generateQuiz = async () => {
    setLoading(true);
    setSelected(null);
    setQuiz(null);
    setTrivia(TRIVIA[Math.floor(Math.random() * TRIVIA.length)]);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, seen_ids: seenIds, lang }),
      });
      const data = await res.json();
      setQuiz(data.quiz);
      if (data.quiz?.id) setSeenIds(prev => [...prev, data.quiz.id]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (option: string) => {
    if (selected) return;
    const letter = option.charAt(0);
    setSelected(letter);
    const correct = letter === quiz?.correct;
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    let earned = 0;
    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo >= 5) earned = 300;
      else if (newCombo >= 3) earned = 200;
      else if (newCombo >= 2) earned = 150;
      else earned = 100;
    } else {
      setCombo(0);
      earned = 10;
    }

    setXpGain(earned);
    showXpPop();

    const prevLevel = getLevel(xp);
    const newXp = xp + earned;
    setXp(newXp);
    await AsyncStorage.setItem('ras_quiz_xp', String(newXp));
    animateXpBar(newXp);

    const nextLv = getLevel(newXp);
    if (nextLv.lv > prevLevel.lv) {
      setNewLevel(nextLv);
      setTimeout(() => setShowLevelUp(true), 600);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!selected) return styles.option;
    const letter = option.charAt(0);
    if (letter === quiz?.correct) return [styles.option, styles.optionCorrect];
    if (letter === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  const currentLevel = getLevel(xp);
  const nextLevel = getNextLevel(xp);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ras Quiz</Text>
        <Text style={styles.score}>{score.correct}/{score.total}</Text>
      </View>

      {/* XP Bar */}
      <View style={styles.xpSection}>
        <View style={styles.xpLabelRow}>
          <Text style={styles.xpLevelText}>{currentLevel.icon} {currentLevel.name}</Text>
          <Text style={styles.xpCount}>{xp} XP</Text>
        </View>
        <View style={styles.xpBarBg}>
          <Animated.View style={[styles.xpBarFill, { width: xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>
        {nextLevel && <Text style={styles.xpNext}>Next: {nextLevel.icon} {nextLevel.name} ({nextLevel.xp} XP)</Text>}
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.id} style={[styles.catBtn, category === cat.id && styles.catBtnActive]} onPress={() => setCategory(cat.id)}>
            <Image source={cat.img} style={{ width: 40, height: 40 }} />
            <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>
              {lang === 'ja' ? cat.label_ja : cat.label_en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quiz Area */}
      <View style={styles.quizArea}>
        {!quiz && !loading && (
          <View style={styles.startArea}>
            <Image source={require('../../assets/icons/icon_rude_bwoy.png')} style={{ width: 160, height: 160 }} />
            <Text style={styles.startTitle}>Ras Quiz</Text>
            <TouchableOpacity style={styles.startBtn} onPress={generateQuiz}>
              <Text style={styles.startBtnText}>{lang === 'ja' ? 'クイズスタート' : 'START QUIZ'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.startArea}>
            <ActivityIndicator color="#C8860A" size="large" />
            <Text style={styles.loadingText}>{lang === 'ja' ? '考え中...' : 'Ras is thinking...'}</Text>
            <View style={styles.triviaBox}>
              <Text style={styles.triviaLabel}>🇯🇲 RASTA WISDOM</Text>
              <Text style={styles.triviaText}>{trivia}</Text>
            </View>
          </View>
        )}

        {quiz && !loading && (
          <ScrollView contentContainerStyle={styles.questionArea} showsVerticalScrollIndicator={false}>
            {combo >= 2 && <Text style={styles.comboText}>🔥 {combo} COMBO! +{xpGain} XP</Text>}
            <Text style={styles.question}>{quiz.question}</Text>
            {quiz.options.map((option, i) => (
              <TouchableOpacity key={i} style={getOptionStyle(option)} onPress={() => handleAnswer(option)}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            {selected && (
              <View style={styles.explanationBox}>
                <Animated.Text style={[styles.xpPopText, { opacity: xpPopAnim, transform: [{ translateY: xpPopAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }] }]}>
                  +{xpGain} XP
                </Animated.Text>
                <Text style={styles.explanationText}>
                  {selected === quiz.correct ? '✅ Irie! ' : '❌ Bomboclaat! '}
                  {quiz.explanation}
                </Text>
                <TouchableOpacity style={styles.nextBtn} onPress={generateQuiz}>
                  <Text style={styles.nextBtnText}>{lang === 'ja' ? '次の問題 →' : 'Next Question →'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Level Up Modal */}
      <Modal visible={showLevelUp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.levelUpBox}>
            <Text style={styles.levelUpEmoji}>{newLevel.icon}</Text>
            <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
            <Text style={styles.levelUpName}>{newLevel.name}</Text>
            <Text style={styles.levelUpSub}>Lv.{newLevel.lv} achieved, bredren!</Text>
            <TouchableOpacity style={styles.levelUpBtn} onPress={() => setShowLevelUp(false)}>
              <Text style={styles.levelUpBtnText}>IRIE! 🇯🇲</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2010' },
  backBtn: { color: '#C8860A', fontSize: 14 },
  headerTitle: { color: '#E8D8A0', fontSize: 16, fontWeight: '800' },
  score: { color: '#C8860A', fontSize: 14, fontWeight: '700' },
  xpSection: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1A1408' },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLevelText: { color: '#C8860A', fontSize: 13, fontWeight: '800' },
  xpCount: { color: '#5C5040', fontSize: 12 },
  xpBarBg: { height: 6, backgroundColor: '#1A1408', borderRadius: 3, overflow: 'hidden' },
  xpBarFill: { height: 6, backgroundColor: '#C8860A', borderRadius: 3 },
  xpNext: { color: '#3A2A10', fontSize: 10, marginTop: 4 },
  categories: { flexDirection: 'row', padding: 12, gap: 8 },
  catBtn: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#2A2010', backgroundColor: '#0F0A05' },
  catBtnActive: { borderColor: '#C8860A', backgroundColor: '#2A1A00' },
  catLabel: { color: '#5C5040', fontSize: 10, marginTop: 2, fontWeight: '700' },
  catLabelActive: { color: '#C8860A' },
  quizArea: { flex: 1, padding: 16 },
  startArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  startTitle: { color: '#C8860A', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  startBtn: { backgroundColor: '#C8860A', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 4, marginTop: 8 },
  startBtnText: { color: '#0D0A05', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  loadingText: { color: '#5C5040', fontSize: 14, marginTop: 12 },
  triviaBox: { backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 8, padding: 16, marginTop: 16, maxWidth: 300 },
  triviaLabel: { color: '#C8860A', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  triviaText: { color: '#A89060', fontSize: 13, lineHeight: 20 },
  comboText: { color: '#C8860A', fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: 2 },
  questionArea: { gap: 12, paddingBottom: 32 },
  question: { color: '#E8D8A0', fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 8 },
  option: { backgroundColor: '#0F0A05', borderWidth: 1, borderColor: '#2A2010', borderRadius: 4, padding: 14 },
  optionCorrect: { borderColor: '#4A7C3F', backgroundColor: '#0A1A08' },
  optionWrong: { borderColor: '#8B3A3A', backgroundColor: '#1A0808' },
  optionDim: { opacity: 0.4 },
  optionText: { color: '#E8D8A0', fontSize: 15 },
  explanationBox: { backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 4, padding: 16, gap: 12, marginTop: 8 },
  explanationText: { color: '#A89060', fontSize: 13, lineHeight: 20 },
  xpPopText: { color: '#C8860A', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  nextBtn: { backgroundColor: '#C8860A', padding: 12, borderRadius: 4, alignItems: 'center' },
  nextBtnText: { color: '#0D0A05', fontWeight: '900', letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  levelUpBox: { backgroundColor: '#1A1408', borderWidth: 2, borderColor: '#C8860A', borderRadius: 12, padding: 32, alignItems: 'center', gap: 12, minWidth: 280 },
  levelUpEmoji: { fontSize: 64 },
  levelUpTitle: { color: '#C8860A', fontSize: 32, fontWeight: '900', letterSpacing: 4 },
  levelUpName: { color: '#E8D8A0', fontSize: 22, fontWeight: '800' },
  levelUpSub: { color: '#5C5040', fontSize: 14 },
  levelUpBtn: { backgroundColor: '#C8860A', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 4, marginTop: 8 },
  levelUpBtnText: { color: '#0D0A05', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
});
