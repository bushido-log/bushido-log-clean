import React, { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { useLang } from '../context/LanguageContext';
import {
  View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Keyboard,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';


const RASTA_TRIVIA_JA = ["パトワ語は英語、アフリカ語、スペイン語、ポルトガル語が混ざった言語ラスタ。", "'Irie'はジャマイカで最もよく使われる言葉で「最高」「平和」を意味するラスタ。", "'Wah gwaan'は英語の'What's going on?'から生まれたパトワ語ラスタ。", "'Bredren'は男性の友人、'Sistren'は女性の友人を意味するラスタ。", "パトワ語では'H'を発音しないことが多いラスタ。例：'im'は'him'ラスタ。", "'Babylon'はパトワ語で腐敗した社会システムや警察を指すラスタ。", "'Riddim'は'Rhythm'のパトワ語で、音楽のビートを指すラスタ。", "'Duppy'はジャマイカの幽霊・幽霊を意味する言葉ラスタ。", "'Nuff'は'Enough'から来ており「たくさん」を意味するラスタ。", "'Likkle'は'Little'のパトワ語で「小さい」「少し」を意味するラスタ。", "'Bomboclaat'はジャマイカで最も強い感嘆詞の一つラスタ。", "'Jah'はラスタファリ教でのゴッドの呼び名ラスタ。", "'Bashment'はダンスホールパーティーを意味するラスタ。", "'Sketch'は危険・怪しいを意味するジャマイカのスラングラスタ。", "'Yard'は家・故郷を意味し、'Yardie'は地元の人間を指すラスタ。", "'One Love'はボブ・マーリーが広めた平和と統一のメッセージラスタ。", "'Zeen'は'I understand'や'I see'を意味するパトワ語ラスタ。", "'Dutty'は'Dirty'のパトワ語で「汚い」を意味するラスタ。", "'Pickney'は子供を意味するパトワ語ラスタ。", "'Nyam'は「食べる」を意味するパトワ語ラスタ。"];
const RASTA_TRIVIA_EN = ["Patois is a blend of English, African, Spanish, and Portuguese languages.", "'Irie' is the most used Jamaican word, meaning 'all good' and 'peaceful'.", "'Wah gwaan' evolved from the English phrase 'What's going on?'", "'Bredren' means male friend, 'Sistren' means female friend in Patois.", "In Patois, 'H' is often dropped. Example: 'im' instead of 'him'.", "'Babylon' in Patois refers to corrupt society systems or the police.", "'Riddim' is the Patois word for 'Rhythm' - the beat of a music track.", "'Duppy' is the Jamaican word for ghost or spirit.", "'Nuff' comes from 'Enough' and means 'a lot' or 'many' in Patois.", "'Likkle' is the Patois word for 'Little' - small or a bit.", "'Bomboclaat' is one of the strongest exclamations in Jamaican Patois.", "'Jah' is the Rastafari name for God.", "'Bashment' means a dancehall party or big celebration.", "'Sketch' means dangerous or suspicious in Jamaican slang.", "'Yard' means home or homeland - a 'Yardie' is a local person.", "'One Love' is the peace and unity message popularized by Bob Marley.", "'Zeen' means 'I understand' or 'I see' in Patois.", "'Dutty' is the Patois word for 'Dirty'.", "'Pickney' is the Patois word for child.", "'Nyam' means 'to eat' in Patois."];


const FLASH_CARDS = [
  { patois: 'Wah gwaan?', meaning_ja: '元気？', meaning_en: "What's up?" },
  { patois: 'Irie', meaning_ja: '最高・平和', meaning_en: 'Everything is good' },
  { patois: 'Riddim', meaning_ja: 'リズム・ビート', meaning_en: 'Rhythm' },
  { patois: 'Bredren', meaning_ja: '仲間・友達', meaning_en: 'Friend / Brother' },
  { patois: 'Babylon', meaning_ja: '腐敗した社会', meaning_en: 'Corrupt system' },
  { patois: 'Duppy', meaning_ja: '幽霊', meaning_en: 'Ghost' },
  { patois: 'Nyam', meaning_ja: '食べる', meaning_en: 'To eat' },
  { patois: 'Likkle more', meaning_ja: 'またね', meaning_en: 'See you later' },
  { patois: 'Big up', meaning_ja: '称える・リスペクト', meaning_en: 'Respect / Shoutout' },
  { patois: 'Jah', meaning_ja: '神様', meaning_en: 'God (Rastafari)' },
  { patois: 'Bashment', meaning_ja: 'ダンスホールパーティー', meaning_en: 'Party / Dancehall event' },
  { patois: 'Nuff respect', meaning_ja: '深い敬意', meaning_en: 'Much respect' },
  { patois: 'Yow', meaning_ja: 'おい・ちょっと', meaning_en: 'Hey!' },
  { patois: 'Zeen', meaning_ja: 'わかった', meaning_en: 'I understand' },
  { patois: 'One love', meaning_ja: '愛と平和', meaning_en: 'Peace and love' },
];

function FlashCard({ lang }: { lang: string }) {
  const [index, setIndex] = React.useState(() => Math.floor(Math.random() * FLASH_CARDS.length));
  const [flipped, setFlipped] = React.useState(false);
  const card = FLASH_CARDS[index];

  return (
    <View style={{ alignItems: 'center', marginTop: 16, paddingHorizontal: 24 }}>
      <ActivityIndicator color="#F9A825" style={{ marginBottom: 16 }} />
      <TouchableOpacity
        style={{ backgroundColor: '#1B5E20', borderWidth: 1, borderColor: '#F9A825', borderRadius: 12, padding: 20, width: '100%', alignItems: 'center', minHeight: 100, justifyContent: 'center' }}
        onPress={() => setFlipped(!flipped)}
      >
        {!flipped ? (
          <>
            <Text style={{ color: '#F9A825', fontSize: 22, fontWeight: '900', textAlign: 'center' }}>{card.patois}</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 8 }}>{lang === 'ja' ? 'タップして意味を見る👆' : 'Tap to reveal 👆'}</Text>
          </>
        ) : (
          <>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{lang === 'ja' ? card.meaning_ja : card.meaning_en}</Text>
            <Text style={{ color: '#F9A825', fontSize: 13, marginTop: 6 }}>{card.patois}</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 10, padding: 8 }}
        onPress={() => { setFlipped(false); setIndex(Math.floor(Math.random() * FLASH_CARDS.length)); }}
      >
        <Text style={{ color: '#F9A825', fontSize: 13 }}>次のカード →</Text>
      </TouchableOpacity>
    </View>
  );
}

const API_URL = 'https://irie-server.onrender.com/patwa-tutor';
const TTS_URL = 'https://irie-server.onrender.com/tts';

// パトワ語を抽出する（各種クォートや括弧で囲まれた英語ワード）
const extractPatois = (text: string): string[] => {
  const patterns = [
    /'([A-Za-z][A-Za-z\s'?!,]+?)'/g,
    /「([A-Za-z][A-Za-z\s'?!,]+?)」/g,
    /"([A-Za-z][A-Za-z\s'?!,]+?)"/g,
  ];
  const results: string[] = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const word = match[1].trim();
      if (word.length > 1 && word.length < 30) results.push(word);
    }
  }
  return [...new Set(results)].slice(0, 5);
};

type Message = { role: 'user' | 'assistant'; content: string; patoisWords?: string[] };

type Props = { onBack?: () => void };
export default function PatwaTutorScreen({ onBack }: Props) {
  const { lang } = useLang();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === 'ja' ? "Wah gwaan! 🇯🇲 パトワ語やジャマイカ文化について、なんでも答えるから質問してくれラスタ！" : "Wah gwaan! 🇯🇲 I'm Ras Tutor! Ask me anything about Patois or Jamaican culture!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [playingText, setPlayingText] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const playTTS = async (text: string) => {
    try {
      setPlayingText(text);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const res = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/mpeg;base64,${base64}` },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) setPlayingText(null);
        });
      };
    } catch (e) {
      console.error('TTS error:', e);
      setPlayingText(null);
    }
  };
  const [trivia, setTrivia] = React.useState(() => {
    const arr = lang === 'ja' ? RASTA_TRIVIA_JA : RASTA_TRIVIA_EN;
    return arr[Math.floor(Math.random() * arr.length)];
  });
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    if (!input.trim()) return;
    Keyboard.dismiss();
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    const arr = lang === 'ja' ? RASTA_TRIVIA_JA : RASTA_TRIVIA_EN;
    setTrivia(arr[Math.floor(Math.random() * arr.length)]);
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, lang }),
      
});
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply, patoisWords: data.patoisWords || [] }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'No signal, bredren. Try again!' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        {onBack && <TouchableOpacity onPress={onBack} style={{ alignSelf: 'flex-start', padding: 12 }}><Text style={{ color: '#F9A825', fontSize: 16 }}>{lang === 'ja' ? '← 戻る' : '← Back'}</Text></TouchableOpacity>}
        <Image source={require('../../assets/icons/icon_ras_tutor.png')} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }} />
        <Text style={styles.headerTitle}>Ras Tutor</Text>
        <Text style={styles.headerSub}>{lang === 'ja' ? 'AIパトワ語 & ジャマイカガイド' : 'AI Patois & Jamaica Guide'}</Text>
      </View>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" style={styles.chat} contentContainerStyle={{ padding: 16 }}>
        {messages.map((m, i) => {
          const patoisWords = m.role === 'assistant' ? (m.patoisWords || extractPatois(m.content)) : [];
          return (
            <View key={i}>
              <View style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.aiText]}>{m.content}</Text>
              </View>
              {patoisWords.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8, paddingLeft: 4 }}>
                  {patoisWords.map((word, j) => (
                    <TouchableOpacity
                      key={j}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1A3A1A', borderWidth: 1, borderColor: '#2D5A1B', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 }}
                      onPress={() => playTTS(word)}
                    >
                      <Text style={{ color: '#F9A825', fontSize: 13, fontWeight: '700' }}>{word}</Text>
                      <Text style={{ fontSize: 14 }}>{playingText === word ? '⏸' : '🔊'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {patoisWords.length > 0 && (
                <Text style={{ color: '#555', fontSize: 10, textAlign: 'left', marginTop: 2, paddingLeft: 4 }}>
                  {lang === 'ja' ? '🔊 発音は参考程度です。今後改善予定！' : '🔊 Pronunciation is approximate. Improving soon!'}
                </Text>
              )}
            </View>
          );
        })}
        {loading && (
          <FlashCard lang={lang} />
        )}
        <Text style={{ color: '#555', fontSize: 11, textAlign: 'center', marginTop: 16, paddingHorizontal: 24, lineHeight: 16 }}>
          {lang === 'ja' ? '本AIの回答は参考目的です。重要な情報はご自身でご確認ください。' : "AI-generated content for reference only. Please verify important information."}
        </Text>
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={lang === 'ja' ? 'パトワ語やジャマイカについて聞く...' : 'Ask about Patois or Jamaica...'}
          placeholderTextColor="#888"
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>{lang === 'ja' ? '送信' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1A0A' },
  header: { backgroundColor: '#1B5E20', padding: 20, paddingTop: 8, alignItems: 'center' },
  headerTitle: { color: '#F9A825', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#A5D6A7', fontSize: 13, marginTop: 4 },
  chat: { flex: 1 },
  bubble: { maxWidth: '92%', borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: '#F9A825', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#1B5E20', alignSelf: 'flex-start' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#000' },
  aiText: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#333' },
  input: { flex: 1, backgroundColor: '#222', color: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendBtn: { marginLeft: 10, backgroundColor: '#F9A825', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendText: { color: '#000', fontWeight: 'bold' },
});
