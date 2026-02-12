import React from 'react';
import { View, Text } from 'react-native';
import { MAX_LEVEL } from '../data/constants';
import { styles } from '../styles';

export function SamuraiAvatar({ level, rankLabel }: { level: number; rankLabel: string }) {
  let emoji = '🥚';
  let title = `Lv.${level} 見習い侍`;
  let desc = 'まずはブシログを開き続ける段階だな。';

  if (level >= 3 && level <= 6) {
    emoji = '⚔️';
    title = `Lv.${level} 若侍`;
    desc = '習慣が少しずつ形になってきたゾーンだ。油断せず粘っていこう。';
  } else if (level >= 7 && level < MAX_LEVEL) {
    emoji = '🐉';
    title = `Lv.${level} 修羅の侍`;
    desc = 'かなりの継続力だ。周りからも変化が見え始めているはずだぞ。';
  } else if (level >= MAX_LEVEL) {
    emoji = '👑';
    title = `Lv.${level} 伝説の侍`;
    desc = '1ヶ月以上やり切った、本物のサムライだ。ここからは守りではなく拡張だな。';
  }

  return (
    <View style={styles.avatarCard}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarEmoji}>{emoji}</Text>
      </View>
      <View style={styles.avatarInfo}>
        <Text style={styles.avatarTitle}>{title}</Text>
        <Text style={styles.avatarRank}>ランク：{rankLabel}</Text>
        <Text style={styles.avatarDesc}>{desc}</Text>
      </View>
    </View>
  );
}
