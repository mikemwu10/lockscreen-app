import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassModule } from '../components/GlassModule';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRouter } from 'expo-router';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2670&auto=format&fit=crop', // Deep ocean
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop', // Default beach
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop', // Abstract gradient
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop', // Mountains
  'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?q=80&w=2684&auto=format&fit=crop', // Deep forest curve
  'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=2693&auto=format&fit=crop'  // Starry space
];

const { width, height } = Dimensions.get('window');

export default function GalleryScreen() {
  const router = useRouter();
  const { updateBgImage } = useDashboardData();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleApplyBackground = (uri: string) => {
    Alert.alert(
      "Apply Background?",
      "Are you sure you want to change your lock screen to this image?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Apply", 
          onPress: async () => {
            await updateBgImage(uri);
            setPreviewImage(null);
            router.back();
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Curated Collection</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Pick from our beautiful curated gallery.</Text>
        
        <View style={styles.galleryGrid}>
          {GALLERY_IMAGES.map((uri, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.galleryThumbnail} 
              activeOpacity={0.8}
              onPress={() => setPreviewImage(uri)}
            >
              <Image source={{ uri }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Full Screen Image Preview Modal */}
      <Modal visible={previewImage !== null} animationType="fade" transparent={false}>
        <View style={styles.modalContainer}>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.modalImage} resizeMode="cover" />
          )}
          
          <View style={styles.modalOverlay}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalBackButton} onPress={() => setPreviewImage(null)}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalChooseButton} onPress={() => handleApplyBackground(previewImage!)}>
                <Text style={styles.modalChooseText}>Choose</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120, // Moved down for comfortable reach
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: '#1ecbe1', // Vibrant cyan
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 20,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryThumbnail: {
    width: '48%',
    aspectRatio: 9 / 16, // phone ratio
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,203,225,0.13)', // Vibrant cyan, less transparent
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: 'rgba(30,203,225,0.10)', // Vibrant cyan, less transparent
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackButton: {
    backgroundColor: '#1ecbe1', // Vibrant cyan
    padding: 10,
    borderRadius: 20,
  },
  modalChooseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalChooseText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
  }
});
