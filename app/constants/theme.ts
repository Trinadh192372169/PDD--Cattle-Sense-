/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const AgriColors = {
  primary: '#176B45',         // Primary forest green
  primaryDark: '#123524',     // Dark green headings
  heading: '#123524',         // Dark green headings alias
  secondary: '#24865A',       // Secondary green
  secondaryLight: '#34A06F',  // Accent green
  surface: '#E8F5EE',         // Light tint surface
  background: '#F4FAF5',      // Clean light background
  cardBg: '#FFFFFF',          // Pure white card background
  border: '#E0EBE4',          // Soft border
  borderSubtle: '#EDF4EE',    // Ultra-light border
  textDark: '#123524',        // Deep forest text
  textMedium: '#2C3E35',      // Body text
  textMuted: '#5B6E64',       // Subtitles / captions
  textLight: '#8C9E95',       // Placeholders
  accentGold: '#D97706',      // Alert / warm accent
  accentRed: '#DC2626',       // Error / danger
  accentBlue: '#2563EB',      // Info
  pillBg: '#E8F5EE',          // Light badge fill
  pillText: '#176B45',        // Light badge text
};

export const Colors = {
  light: {
    text: AgriColors.textDark,
    background: AgriColors.background,
    tint: AgriColors.primary,
    icon: AgriColors.textMuted,
    tabIconDefault: '#7D9287',
    tabIconSelected: AgriColors.primary,
    card: AgriColors.cardBg,
    border: AgriColors.border,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0D1E16',
    tint: '#34A06F',
    icon: '#9BA1A6',
    tabIconDefault: '#5F7368',
    tabIconSelected: '#34A06F',
    card: '#142920',
    border: '#1F382D',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
