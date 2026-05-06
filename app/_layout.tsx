import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
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
      {/* Modern overlay: deep, semi-opaque, with blur for depth */}
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <View style={styles.overlayColor} />
      </BlurView>
      
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayColor: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 28, 36, 0.82)', // Deep blue, modern, less transparent
  },
});
