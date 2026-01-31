import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as Speech from 'expo-speech';
import { getSamuraiMessage } from '../services/samuraiService';

export default function ChatScreen() {
  const [message, setMessage] = useState('');

  const handlePress = async () => {
    try {
      const res = await getSamuraiMessage();
      setMessage(res.text);

      Speech.stop(); // 念のため
      Speech.speak(res.text, {
        language: 'ja-JP',
        pitch: 0.9,
        rate: 0.9,
      });
    } catch (e) {
      console.error('TTS error', e);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Samurai King Chat
      </Text>

      <Button
        title="欲望が出たらサムライキングを呼ぶ"
        onPress={handlePress}
      />

      <Text style={{ marginTop: 20, fontSize: 16 }}>
        {message}
      </Text>
    </View>
  );
}