import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';

const API_URL = 'https://irie-server.onrender.com/patwa-tutor';

type Message = { role: 'user' | 'assistant'; content: string };

export default function PatwaTutorScreen({ onBack }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Wah gwaan! 🇯🇲 I'm Ras Tutor! Ask me anything about Patois or Jamaican culture!" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        {onBack && <TouchableOpacity onPress={onBack} style={{ position: 'absolute', left: 16, top: 16 }}><Text style={{ color: '#F9A825', fontSize: 16 }}>← 戻る</Text></TouchableOpacity>}
        <Text style={styles.headerTitle}>🇯🇲 Ras Tutor</Text>
        <Text style={styles.headerSub}>AI Patois & Jamaica Guide</Text>
      </View>
      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={{ padding: 16 }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, m.role === 'user' ? styles.userText : styles.aiText]}>{m.content}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#F9A825" style={{ marginTop: 10 }} />}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Patois or Jamaica..."
          placeholderTextColor="#888"
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1A0A' },
  header: { backgroundColor: '#1B5E20', padding: 20, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: '#F9A825', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#A5D6A7', fontSize: 13, marginTop: 4 },
  chat: { flex: 1 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 10 },
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
