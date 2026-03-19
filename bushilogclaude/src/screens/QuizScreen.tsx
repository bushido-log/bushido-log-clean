import React, { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Image, ScrollView
} from 'react-native';

const API_URL = 'https://irie-server.onrender.com/quiz-generate';

const CATEGORIES = [
  { id: 'patois', label_en: 'Patois', label_ja: 'パトワ語', icon: '🗣️', img: require('../../assets/icons/icon_quiz_patois.png') },
  { id: 'reggae', label_en: 'Reggae', label_ja: 'レゲエ', icon: '🎵', img: require('../../assets/icons/icon_quiz_reggae.png') },
  { id: 'jamaica', label_en: 'Jamaica', label_ja: 'ジャマイカ', icon: '🗺️', img: require('../../assets/icons/icon_quiz_jamaica.png') },
  { id: 'artists', label_en: 'Artists', label_ja: 'アーティスト', icon: '🎤', img: require('../../assets/icons/icon_quiz_artists.png') },
];

type Quiz = {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
};

type Props = { onBack: () => void };

export default function QuizScreen({ onBack }: Props) {
  const [category, setCategory] = useState('patois');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const { lang } = useLang();
  const [seenIds, setSeenIds] = useState<string[]>([]);

  const generateQuiz = async () => {
    setLoading(true);
    setSelected(null);
    setQuiz(null);
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

  const handleAnswer = (option: string) => {
    if (selected) return;
    const letter = option.charAt(0);
    setSelected(letter);
    setScore(s => ({
      correct: s.correct + (letter === quiz?.correct ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const getOptionStyle = (option: string) => {
    if (!selected) return styles.option;
    const letter = option.charAt(0);
    if (letter === quiz?.correct) return [styles.option, styles.optionCorrect];
    if (letter === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ras Quiz</Text>
        <Text style={styles.score}>{score.correct}/{score.total}</Text>
      </View>

      <View style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
            onPress={() => setCategory(cat.id)}
          >
            {cat.img ? (
              <Image source={cat.img} style={{ width: 40, height: 40 }} />
            ) : (
              <Text style={styles.catIcon}>{cat.icon}</Text>
            )}
            <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>
              {lang === 'ja' ? cat.label_ja : cat.label_en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
            <Text style={styles.loadingText}>{lang === 'ja' ? '考え中...' : 'Ras Quiz is thinking...'}</Text>
          </View>
        )}

        {quiz && !loading && (
          <ScrollView
            contentContainerStyle={styles.questionArea}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.question}>{quiz.question}</Text>
            {quiz.options.map((option, i) => (
              <TouchableOpacity
                key={i}
                style={getOptionStyle(option)}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}

            {selected && (
              <View style={styles.explanationBox}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0A05' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2010' },
  backBtn: { color: '#C8860A', fontSize: 14 },
  headerTitle: { color: '#E8D8A0', fontSize: 16, fontWeight: '800' },
  score: { color: '#C8860A', fontSize: 14, fontWeight: '700' },
  categories: { flexDirection: 'row', padding: 12, gap: 8 },
  catBtn: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#2A2010', backgroundColor: '#0F0A05' },
  catBtnActive: { borderColor: '#C8860A', backgroundColor: '#2A1A00' },
  catIcon: { fontSize: 18 },
  catLabel: { color: '#5C5040', fontSize: 10, marginTop: 2, fontWeight: '700' },
  catLabelActive: { color: '#C8860A' },
  quizArea: { flex: 1, padding: 16 },
  startArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  startTitle: { color: '#C8860A', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  startSub: { color: '#5C5040', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  startBtn: { backgroundColor: '#C8860A', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 4, marginTop: 8 },
  startBtnText: { color: '#0D0A05', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  loadingText: { color: '#5C5040', fontSize: 14, marginTop: 12 },
  questionArea: { gap: 12, paddingBottom: 32 },
  question: { color: '#E8D8A0', fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 8 },
  option: { backgroundColor: '#0F0A05', borderWidth: 1, borderColor: '#2A2010', borderRadius: 4, padding: 14 },
  optionCorrect: { borderColor: '#4A7C3F', backgroundColor: '#0A1A08' },
  optionWrong: { borderColor: '#8B3A3A', backgroundColor: '#1A0808' },
  optionDim: { opacity: 0.4 },
  optionText: { color: '#E8D8A0', fontSize: 15 },
  explanationBox: { backgroundColor: '#1A1408', borderWidth: 1, borderColor: '#3A2A10', borderRadius: 4, padding: 16, gap: 12, marginTop: 8 },
  explanationText: { color: '#A89060', fontSize: 13, lineHeight: 20 },
  nextBtn: { backgroundColor: '#C8860A', padding: 12, borderRadius: 4, alignItems: 'center' },
  nextBtnText: { color: '#0D0A05', fontWeight: '900', letterSpacing: 2 },
});
