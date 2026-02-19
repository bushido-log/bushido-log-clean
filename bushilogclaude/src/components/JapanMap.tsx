import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { PREFECTURES, JAPAN_VIEWBOX, PrefectureData } from '../data/japanMapData';
import { ProgressMap } from '../lib/samuraiWalkStorage';

// Colors matching the bushido theme
const LEVEL_COLORS: Record<number, string> = {
  0: '#2A2A2E',   // 未踏破 — dark charcoal
  1: '#B8860B',   // 修行中 — dark goldenrod (amber)
  2: '#C41E3A',   // 制覇   — crimson (samurai red)
};

const STROKE_COLOR = '#4A4A50';
const HIGHLIGHT_STROKE = '#FFD700';

interface JapanMapProps {
  progressById: ProgressMap;
  targetPrefectureId?: string | null;
  onPressPrefecture?: (id: string) => void;
}

const JapanMap: React.FC<JapanMapProps> = ({
  progressById,
  targetPrefectureId,
  onPressPrefecture,
}) => {
  const getFillColor = useCallback(
    (id: string) => {
      const level = progressById[id] ?? 0;
      return LEVEL_COLORS[level] ?? LEVEL_COLORS[0];
    },
    [progressById],
  );

  return (
    <View style={styles.container}>
      <Svg
        viewBox={JAPAN_VIEWBOX}
        style={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        <G>
          {PREFECTURES.map((pref: PrefectureData) => {
            const isTarget = pref.id === targetPrefectureId;
            return (
              <Path
                key={pref.id}
                d={pref.path}
                fill={getFillColor(pref.id)}
                stroke={isTarget ? HIGHLIGHT_STROKE : STROKE_COLOR}
                strokeWidth={isTarget ? 1.5 : 0.4}
                onPress={() => onPressPrefecture?.(pref.id)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 438 / 516, // matches JAPAN_VIEWBOX
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(JapanMap);
