import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { DashboardProvider, useDashboardData } from '@/hooks/useDashboardData';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function RootNavigation() {
  const { bgImage } = useDashboardData();

  return (
    <ImageBackground 
      source={bgImage ? { uri: bgImage } : undefined} 
      style={styles.background}
      resizeMode="cover"
    >
      {/* Semi-transparent overlay to ensure content is readable over bright images */}
      <View style={styles.overlay} />
      
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'default', // Standard smooth push animations
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="completed" options={{ headerShown: false }} />
        <Stack.Screen name="manageQuotes" options={{ headerShown: false }} />
        <Stack.Screen name="wallpapers" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ImageBackground>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={TransparentTheme}>
      <DashboardProvider>
        <RootNavigation />
      </DashboardProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  }
});
