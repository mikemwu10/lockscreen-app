import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassModule } from '../components/GlassModule';
import { useDashboardData } from '../hooks/useDashboardData';

export default function WallpaperSettingsScreen() {
  const router = useRouter();
  const { pickImage } = useDashboardData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallpaper Hub</Text>
      </View>

      <GlassModule style={styles.module}>
        <Text style={styles.sectionTitle}>Curated Collection</Text>
        <Text style={styles.subtitle}>Pick from our beautifully handpicked gallery.</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/wallpapers' as any)}>
          <Ionicons name="grid-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>View Curated Wallpapers</Text>
        </TouchableOpacity>
      </GlassModule>

      <GlassModule style={styles.module}>
        <Text style={styles.sectionTitle}>Custom Photo</Text>
        <Text style={styles.subtitle}>Want something personal? Upload your own photo.</Text>

        <TouchableOpacity style={styles.buttonOutline} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Choose Photo from Library</Text>
        </TouchableOpacity>
      </GlassModule>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120, // Comfortable UI reach padding
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
  },
  module: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#1ecbe1', // Vibrant cyan
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF', // Standard iOS System Blue
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'rgba(30,203,225,0.13)', // Vibrant cyan, less transparent
    borderWidth: 1,
    borderColor: '#1ecbe1',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
