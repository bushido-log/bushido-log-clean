import React, { useState, useRef } from 'react';
import { useLang } from '../context/LanguageContext';
import {
  View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Keyboard,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';


const RASTA_TRIVIA_JA = ["パトワ語は英語、アフリカ語、スペイン語、ポルトガル語が混ざった言語ラスタ。", "'Irie'はジャマイカで最もよく使われる言葉で「最高」「平和」を意味するラスタ。", "'Wah gwaan'は英語の'What's going on?'から生まれたパトワ語ラスタ。", "'Bredren'は男性の友人、'Sistren'は女性の友人を意味するラスタ。", "パトワ語では'H'を発音しないことが多いラスタ。例：'im'は'him'ラスタ。", "'Babylon'はパトワ語で腐敗した社会システムや警察を指すラスタ。", "'Riddim'は'Rhythm'のパトワ語で、音楽のビートを指すラスタ。", "'Duppy'はジャマイカの幽霊・幽霊を意味する言葉ラスタ。", "'Nuff'は'Enough'から来ており「たくさん」を意味するラスタ。", "'Likkle'は'Little'のパトワ語で「小さい」「少し」を意味するラスタ。", "'Bomboclaat'はジャマイカで最も強い感嘆詞の一つラスタ。", "'Jah'はラスタファリ教でのゴッドの呼び名ラスタ。", "'Bashment'はダンスホールパーティーを意味するラスタ。", "'Sketch'は危険・怪しいを意味するジャマイカのスラングラスタ。", "'Yard'は家・故郷を意味し、'Yardie'は地元の人間を指すラスタ。", "'One Love'はボブ・マーリーが広めた平和と統一のメッセージラスタ。", "'Zeen'は'I understand'や'I see'を意味するパトワ語ラスタ。", "'Dutty'は'Dirty'のパトワ語で「汚い」を意味するラスタ。", "'Pickney'は子供を意味するパトワ語ラスタ。", "'Nyam'は「食べる」を意味するパトワ語ラスタ。"];
const RASTA_TRIVIA_EN = ["Patois is a blend of English, African, Spanish, and Portuguese languages.", "'Irie' is the most used Jamaican word, meaning 'all good' and 'peaceful'.", "'Wah gwaan' evolved from the English phrase 'What's going on?'", "'Bredren' means male friend, 'Sistren' means female friend in Patois.", "In Patois, 'H' is often dropped. Example: 'im' instead of 'him'.", "'Babylon' in Patois refers to corrupt society systems or the police.", "'Riddim' is the Patois word for 'Rhythm' - the beat of a music track.", "'Duppy' is the Jamaican word for ghost or spirit.", "'Nuff' comes from 'Enough' and means 'a lot' or 'many' in Patois.", "'Likkle' is the Patois word for 'Little' - small or a bit.", "'Bomboclaat' is one of the strongest exclamations in Jamaican Patois.", "'Jah' is the Rastafari name for God.", "'Bashment' means a dancehall party or big celebration.", "'Sketch' means dangerous or suspicious in Jamaican slang.", "'Yard' means home or homeland - a 'Yardie' is a local person.", "'One Love' is the peace and unity message popularized by Bob Marley.", "'Zeen' means 'I understand' or 'I see' in Patois.", "'Dutty' is the Patois word for 'Dirty'.", "'Pickney' is the Patois word for child.", "'Nyam' means 'to eat' in Patois."];

const API_URL = 'https://irie-server.onrender.com/patwa-tutor';

type Message = { role: 'user' | 'assistant'; content: string };

type Props = { onBack?: () => void };
export default function PatwaTutorScreen({ onBack }: Props) {
  const { lang } = useLang();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: lang === 'ja' ? "Wah gwaan! 🇯🇲 パトワ語やジャマイカ文化について、なんでも答えるから質問してくれラスタ！" : "Wah gwaan! 🇯🇲 I'm Ras Tutor! Ask me anything about Patois or Jamaican culture!" }
  ]);
  const [loading, setLoading] = useState(false);
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
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
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
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.aiText]}>{m.content}</Text>
          </View>
        ))}
        {loading && (
          <>
            <ActivityIndicator color="#F9A825" style={{ marginTop: 10 }} />
            <Text style={{ color: '#C8860A', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 16, paddingHorizontal: 24 }}>🇯🇲 RASTA WISDOM</Text>
            <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 4, paddingHorizontal: 24, lineHeight: 18 }}>{trivia}</Text>
          </>
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
