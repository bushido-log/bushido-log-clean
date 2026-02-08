#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BUSHIDO LOG - IMINASHI: anti-cheat yokai. XP=0 for fake inputs, no penalty."""

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. ADD IMINASHI STATE
# ============================================
imi_state = """
  // ===== IMINASHI (Anti-cheat Yokai) =====
  const [isIminashiActive, setIsIminashiActive] = useState(false);
  const [iminashiMessage, setIminashiMessage] = useState('');
  const lastUserInputRef = useRef('');
  const actionStartTimeRef = useRef(Date.now());
"""

content = content.replace(
    "  // ===== Inner World",
    imi_state + "  // ===== Inner World"
)
print('1/4 IMINASHI state OK')

# ============================================
# 2. ADD IMINASHI FUNCTIONS
# ============================================
imi_functions = """
  // ===== IMINASHI Functions =====
  const IMINASHI_MESSAGES = [
    '\u2026\u2026\u305d\u308c\u3001\u672c\u5f53\u306b\u610f\u5473\u3042\u3063\u305f\u304b\uff1f',
    '\u865a\u7121\u304c\u7acb\u3061\u306f\u3060\u304b\u3063\u305f',
    '\u5f62\u3060\u3051\u306e\u4fee\u884c\u306f\u3001\u529b\u306b\u306a\u3089\u306a\u3044',
  ];

  const checkIminashi = (text: string): boolean => {
    const trimmed = text.trim();
    const elapsed = Date.now() - actionStartTimeRef.current;

    // Check 1: Too short
    if (trimmed.length < 5) {
      triggerIminashi();
      return true;
    }

    // Check 2: Same as last input
    if (trimmed === lastUserInputRef.current && trimmed.length > 0) {
      triggerIminashi();
      return true;
    }

    // Check 3: Completed too fast (under 3 seconds)
    if (elapsed <= 3000) {
      triggerIminashi();
      return true;
    }

    lastUserInputRef.current = trimmed;
    return false;
  };

  const triggerIminashi = () => {
    const msg = IMINASHI_MESSAGES[Math.floor(Math.random() * IMINASHI_MESSAGES.length)];
    setIminashiMessage(msg);
    setIsIminashiActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const clearIminashi = () => {
    setIsIminashiActive(false);
    setIminashiMessage('');
    showSaveSuccess('\u865a\u7121\u304c\u9727\u6563\u3057\u305f');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const startActionTimer = () => {
    actionStartTimeRef.current = Date.now();
  };

"""

content = content.replace(
    "  // ===== Kegare Functions =====",
    imi_functions + "  // ===== Kegare Functions ====="
)
print('2/4 IMINASHI functions OK')

# ============================================
# 3. HOOK INTO GOAL + REVIEW SAVES
# ============================================

# 3a. Goal save - add iminashi check before save
old_goal_save = """    showSaveSuccess('\u76ee\u6a19\u3092\u523b\u3093\u3060\u3002\u4eca\u65e5\u3082\u65ac\u308c\uff01');
    triggerYokaiDefeat('goal', 15);"""

new_goal_save = """    // IMINASHI check
    const goalText = missionInput.trim() + ' ' + (todos || []).map((t: any) => t.text).join(' ');
    if (checkIminashi(goalText)) return;

    showSaveSuccess('\u76ee\u6a19\u3092\u523b\u3093\u3060\u3002\u4eca\u65e5\u3082\u65ac\u308c\uff01');
    triggerYokaiDefeat('goal', 15);"""

if old_goal_save in content:
    content = content.replace(old_goal_save, new_goal_save)
    print('  3a. Goal IMINASHI hook OK')
else:
    print('  3a. SKIP - goal save not found')

# 3b. Review save - add iminashi check
old_review_save = """    showSaveSuccess('\u632f\u308a\u8fd4\u308a\u5b8c\u4e86\u3002\u660e\u65e5\u3082\u65ac\u308c\uff01');
    triggerYokaiDefeat('review', 20);"""

new_review_save = """    // IMINASHI check
    const reviewText = proudInput.trim() + ' ' + lessonInput.trim() + ' ' + nextActionInput.trim();
    if (checkIminashi(reviewText)) return;

    showSaveSuccess('\u632f\u308a\u8fd4\u308a\u5b8c\u4e86\u3002\u660e\u65e5\u3082\u65ac\u308c\uff01');
    triggerYokaiDefeat('review', 20);"""

if old_review_save in content:
    content = content.replace(old_review_save, new_review_save)
    print('  3b. Review IMINASHI hook OK')
else:
    print('  3b. SKIP - review save not found')

print('3/4 IMINASHI hooks OK')

# ============================================
# 4. ADD IMINASHI OVERLAY MODAL
# ============================================
imi_modal = """
      {/* IMINASHI Overlay */}
      {isIminashiActive && (
        <Modal visible={true} animationType="fade" transparent>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.92)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
          }}>
            <Text style={{ color: '#444', fontSize: 60, marginBottom: 20 }}>\U0001f32b\ufe0f</Text>
            <Text style={{ color: '#666', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 12 }}>
              \u2500\u2500 \u30a4\u30df\u30ca\u30b7 \u2500\u2500
            </Text>
            <Text style={{ color: '#888', fontSize: 18, fontStyle: 'italic', textAlign: 'center', marginBottom: 30, lineHeight: 28 }}>
              \u300c{iminashiMessage}\u300d
            </Text>
            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>
              XP\u306f\u5f97\u3089\u308c\u306a\u304b\u3063\u305f{'\n'}\u3082\u3046\u4e00\u5ea6\u3001\u771f\u5263\u306b\u5411\u304d\u5408\u3048
            </Text>
            <Pressable
              onPress={clearIminashi}
              style={({ pressed }) => [{
                backgroundColor: pressed ? '#222' : '#1a1a1a',
                paddingVertical: 16,
                paddingHorizontal: 40,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#333',
              }]}
            >
              <Text style={{ color: '#888', fontSize: 16, fontWeight: '600' }}>\u3084\u308a\u76f4\u3059</Text>
            </Pressable>
          </View>
        </Modal>
      )}
"""

content = content.replace(
    "      {/* Katana Polishing Modal */}",
    imi_modal + "\n      {/* Katana Polishing Modal */}"
)
print('4/4 IMINASHI modal OK')

# ============================================
# SAVE
# ============================================
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('')
print('=== IMINASHI SYSTEM COMPLETE ===')
print('  - Detects: <5 chars, same input, <3sec completion')
print('  - Shows black mist overlay + message')
print('  - XP = 0 (no penalty, no shame)')
print('  - "やり直す" to clear')
print('  - Hooks: goal save, review save')
