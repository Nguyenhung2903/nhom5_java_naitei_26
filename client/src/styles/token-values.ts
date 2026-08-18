/**
 * token-values.ts — CSS custom property values cho JS consumers (charts, canvas).
 *
 * ⚠️  KEEP IN SYNC WITH tokens.css
 * Export mã màu cho các thư viện ChartJS / Recharts / Canvas.
 */
export const TOKEN_COLORS = {
  green: '#06c384', // --rogym-green
  teal: '#42e09e', // --rogym-teal
  textSecondary: '#bbcabf', // --rogym-text-secondary
  textMuted: '#8ab89c', // --rogym-text-muted
  bgCard: '#0f1c16', // --rogym-bg-card
  bgBase: '#080e0b', // --rogym-bg-base
  bgElevatedGreen: '#1a3326', // --rogym-bg-elevated-green
} as const

export type TokenColorKey = keyof typeof TOKEN_COLORS
