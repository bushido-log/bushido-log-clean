import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import JapanMap from '../components/JapanMap';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  ProgressMap,
} from '../lib/samuraiWalkStorage';
import { PREFECTURES, JOURNEY_ORDER } from '../data/japanMapData';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Props ────────────────────────────────────────────────────────────
interface SamuraiWalkScreenProps {
  todaySteps: number;
  onClose: () => void;
  playTapSound?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function stepsToLevel(steps: number): number {
  if (steps >= 10000) return 2;
  if (steps >= 5000) return 1;
  return 0;
}

function pickNextTarget(progressById: ProgressMap): string | null {
  for (const id of JOURNEY_ORDER) {
    if ((progressById[id] ?? 0) < 2) return id;
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────
const SamuraiWalkScreen: React.FC<SamuraiWalkScreenProps> = ({
  todaySteps,
  onClose,
  playTapSound,
}) => {
  const [progressById, setProgressById] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const targetId = pickNextTarget(progressById);
  const targetPref = targetId ? PREFECTURES.find(p => p.id === targetId) : null;
  const completedCount = Object.values(progressById).filter(v => v >= 2).length;
  const stepLevel = stepsToLevel(todaySteps);

  // ── Load ─────────────────────────────────────────────
  useEffect(() => {
    loadProgress().then(saved => {
      setProgressById(saved);
      setLoading(false);
    });
  }, []);

  // ── Show toast ───────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setResultMsg(msg);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      delay: 1200,
      useNativeDriver: true,
    }).start(() => setResultMsg(null));
  }, [fadeAnim]);

  // ── Sync steps → progress ──────────────────────────
  const handleSync = useCallback(async () => {
    playTapSound?.();
    if (!targetId) return;

    const currentLevel = progressById[targetId] ?? 0;
    const newLevel = Math.max(currentLevel, stepLevel);

    if (newLevel <= currentLevel) {
      if (stepLevel === 0) {
        showToast('\u307E\u305A\u306F5,000\u6B69\u6B69\u3053\u3046\uFF01'); // まずは5,000歩歩こう！
      } else {
        showToast('\u3082\u3046\u53CD\u6620\u6E08\u307F\u3060\uFF01'); // もう反映済みだ！
      }
      return;
    }

    const updated = { ...progressById, [targetId]: newLevel };
    setProgressById(updated);
    await saveProgress(updated);

    const prefName = targetPref?.nameJp ?? '';
    if (newLevel === 2) {
      showToast(`${prefName}\u3092\u5236\u8987\uFF01`); // ○○を制覇！
    } else {
      showToast(`${prefName}\u306B\u8DB3\u8DE1\u3092\u6B8B\u3057\u305F`); // ○○に足跡を残した
    }
  }, [targetId, progressById, stepLevel, targetPref, playTapSound, showToast]);

  // ── Reset ──────────────────────────────────────────
  const handleReset = useCallback(() => {
    playTapSound?.();
    Alert.alert(
      '\u30EA\u30BB\u30C3\u30C8',
      '\u5168\u3066\u306E\u9032\u6357\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F',
      [
        { text: '\u3084\u3081\u308B', style: 'cancel' },
        {
          text: '\u30EA\u30BB\u30C3\u30C8',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            setProgressById({});
            setSelectedPrefecture(null);
            showToast('\u30EA\u30BB\u30C3\u30C8\u5B8C\u4E86');
          },
        },
      ],
    );
  }, [playTapSound, showToast]);

  // ── Prefecture tap ─────────────────────────────────
  const handlePressPrefecture = useCallback((id: string) => {
    playTapSound?.();
    setSelectedPrefecture(prev => prev === id ? null : id);
  }, [playTapSound]);

  const selectedPref = selectedPrefecture
    ? PREFECTURES.find(p => p.id === selectedPrefecture)
    : null;
  const selectedLevel = selectedPrefecture ? (progressById[selectedPrefecture] ?? 0) : 0;

  // ── Render ─────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>{'\u2190 \u623B\u308B'}</Text>
        </Pressable>
        <Text style={styles.title}>{'\u6B66\u58EB\u306E\u9053'}</Text>
        <Pressable onPress={handleReset} hitSlop={12}>
          <Text style={styles.resetText}>{'...'}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress ring / counter */}
        <View style={styles.progressRow}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>{completedCount}</Text>
            <Text style={styles.progressLabel}>{'/ 47'}</Text>
          </View>
          <View style={styles.progressInfo}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(completedCount / 47) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedCount === 47
                ? '\u5168\u56FD\u5236\u8987\uFF01\u5929\u4E0B\u7D71\u4E00\uFF01' // 全国制覇！天下統一！
                : `\u3042\u3068${47 - completedCount}\u770C`}
            </Text>
          </View>
        </View>

        {/* Japan Map */}
        <View style={styles.mapCard}>
          <JapanMap
            progressById={progressById}
            targetPrefectureId={targetId}
            onPressPrefecture={handlePressPrefecture}
          />
        </View>

        {/* Selected prefecture popup */}
        {selectedPref && (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedName}>{selectedPref.nameJp}</Text>
            <View style={[
              styles.selectedBadge,
              { backgroundColor: selectedLevel === 2 ? '#D4AF37' : selectedLevel === 1 ? '#555' : '#333' }
            ]}>
              <Text style={styles.selectedBadgeText}>
                {selectedLevel === 2 ? '\u5236\u8987' : selectedLevel === 1 ? '\u4FEE\u884C\u4E2D' : '\u672A\u8E0F\u7834'}
              </Text>
            </View>
          </View>
        )}

        {/* Next target */}
        {targetPref && (
          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>{'\u6B21\u306E\u76EE\u7684\u5730'}</Text>
            <Text style={styles.targetName}>{targetPref.nameJp}</Text>
          </View>
        )}

        {/* Steps display */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsNumber}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.stepsUnit}>{'\u6B69'}</Text>
          <View style={styles.stepsLevel}>
            {[0, 1, 2].map(lv => (
              <View
                key={lv}
                style={[
                  styles.stepsDot,
                  { backgroundColor: stepLevel > lv ? '#D4AF37' : '#333' },
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepsHint}>
            {stepLevel === 0 ? '5,000\u6B69\u3067\u8DB3\u8DE1' : stepLevel === 1 ? '10,000\u6B69\u3067\u5236\u8987' : '\u5236\u8987\u53EF\u80FD\uFF01'}
          </Text>
        </View>

        {/* Action button */}
        {targetPref && (
          <Pressable
            onPress={handleSync}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && styles.actionBtnPressed,
            ]}
          >
            <Text style={styles.actionBtnText}>
              {'\u4FEE\u884C\u3092\u53CD\u6620\u3059\u308B'}
            </Text>
          </Pressable>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: '#2A2A2E', label: '\u672A\u8E0F\u7834' },
            { color: '#B8860B', label: '\u4FEE\u884C\u4E2D' },
            { color: '#C41E3A', label: '\u5236\u8987' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Toast */}
      {resultMsg && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>{resultMsg}</Text>
        </Animated.View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    color: '#888',
    fontSize: 15,
  },
  title: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  resetText: {
    color: '#555',
    fontSize: 20,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNumber: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '900',
  },
  progressLabel: {
    color: '#555',
    fontSize: 10,
    marginTop: -2,
  },
  progressInfo: {
    flex: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
  },

  // Map
  mapCard: {
    backgroundColor: '#0d0d18',
    borderRadius: 20,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },

  // Selected prefecture
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  selectedName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Target
  targetSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  targetLabel: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 2,
  },
  targetName: {
    color: '#D4AF37',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },

  // Steps
  stepsCard: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 20,
    marginVertical: 12,
  },
  stepsNumber: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  stepsUnit: {
    color: '#888',
    fontSize: 13,
    marginTop: -2,
  },
  stepsLevel: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  stepsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepsHint: {
    color: '#555',
    fontSize: 11,
    marginTop: 8,
  },

  // Action button
  actionBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  legendLabel: {
    color: '#666',
    fontSize: 11,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  toastText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default SamuraiWalkScreen;
