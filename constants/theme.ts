/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';


// More vibrant accent colors
const tintColorLight = '#1ecbe1'; // Vibrant cyan
const tintColorDark = '#ffb300'; // Warm gold

export const Colors = {
  light: {
    text: '#1a2236', // Deep blue-gray
    background: '#f7fafc', // Soft off-white
    tint: tintColorLight,
    icon: '#1ecbe1', // Accent cyan
    tabIconDefault: '#b0b8c1',
    tabIconSelected: tintColorLight,
    accent: '#ffb300', // Gold accent
    card: '#e3f6fd', // Light blue card
  },
  dark: {
    text: '#f7fafc',
    background: '#181c24', // Deep blue
    tint: tintColorDark,
    icon: '#ffb300', // Gold accent
    tabIconDefault: '#6c7a89',
    tabIconSelected: tintColorDark,
    accent: '#1ecbe1', // Cyan accent
    card: '#232b3a', // Blue-gray card
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
