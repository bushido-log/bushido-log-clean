// theme.ts - BUSHIDO LOG Design System
// 「闘志を燃やすダークサムライ」

export const colors = {
  // ========== 背景 ==========
  bgPrimary: '#030712',      // 最も深い黒（メイン背景）
  bgSecondary: '#0a0f1a',    // カード背景（微かに青み）
  bgTertiary: '#111827',     // 入力欄・サブ要素
  bgGlass: 'rgba(15, 23, 42, 0.7)', // ガラス風カード
  
  // ========== 炎（メインアクセント） ==========
  flame: '#f97316',          // オレンジ（メイン）
  flameLight: '#fb923c',     // 明るいオレンジ
  flameDark: '#ea580c',      // 深いオレンジ
  ember: '#dc2626',          // 赤（炎の芯）
  
  // ========== ゴールド（達成・報酬） ==========
  gold: '#fbbf24',           // ゴールド
  goldLight: '#fcd34d',      // 明るいゴールド
  
  // ========== グリーン（成功・完了） ==========
  success: '#22c55e',        // 成功グリーン
  successDark: '#16a34a',    // 深いグリーン
  
  // ========== テキスト ==========
  textPrimary: '#f9fafb',    // 白に近い（見出し）
  textSecondary: '#e5e7eb',  // 本文
  textMuted: '#9ca3af',      // 補足・キャプション
  textDark: '#030712',       // 暗い背景用（ボタン内など）
  
  // ========== ボーダー ==========
  border: '#1f2937',         // 通常ボーダー
  borderLight: '#374151',    // 強調ボーダー
  borderGlow: 'rgba(249, 115, 22, 0.3)', // 炎のグロー
  
  // ========== 状態 ==========
  danger: '#ef4444',         // 削除・警告
  dangerDark: '#7f1d1d',     // 深い赤
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const fontSize = {
  xs: 10,
  sm: 11,
  md: 12,
  base: 13,
  lg: 14,
  xl: 16,
  xxl: 20,
  title: 24,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

// ========== 影・グロー効果 ==========
export const shadows = {
  // React Nativeでは shadow* プロパティを使用
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: colors.flame,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowGold: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

// ========== 共通スタイルパターン ==========
export const cardStyle = {
  backgroundColor: colors.bgGlass,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.lg,
  ...shadows.card,
};

export const inputStyle = {
  backgroundColor: colors.bgTertiary,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: fontSize.base,
  color: colors.textSecondary,
};

export const primaryButtonStyle = {
  backgroundColor: colors.flame,
  borderRadius: radius.md,
  paddingVertical: spacing.md,
  alignItems: 'center' as const,
  ...shadows.glow,
};

export const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.borderLight,
  paddingVertical: spacing.sm,
  alignItems: 'center' as const,
};

export default {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  shadows,
  cardStyle,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
};
