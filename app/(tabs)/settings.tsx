import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { GlassModule } from '../../components/GlassModule';
import { useDashboardData } from '../../hooks/useDashboardData';

export default function SettingsScreen() {
  const router = useRouter();
  const { pickAvatarImage, userProfile, signOut, stats, loading } = useDashboardData();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const isDefaultProfile = userProfile.name === 'Welcome Back!';

  const handleAuthInteraction = () => {
    if (isDefaultProfile) {
      router.push('/auth/signIn' as any);
    } else {
      Alert.alert(
        'Sign Out',
        `Sign out of ${userProfile.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              // Replace clears the stack — user cannot swipe back to the dashboard
              router.replace('/auth/signIn' as any);
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      
      {/* Header Pipeline */}
      <GlassModule style={styles.profileGlassContainer} contentStyle={{ paddingVertical: 15 }}>
        {isDefaultProfile ? (
          <TouchableOpacity style={styles.profileHeader} onPress={handleAuthInteraction} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={50} color="#ffffff" />
            </View>
            <View style={[styles.profileTextInfo, { justifyContent: 'center' }]}>
              <Text style={styles.unsignedText}>Not Signed In</Text>
              <View style={[styles.signInBtn, { alignSelf: 'flex-start' }]}>
                <Text style={styles.signInBtnText}>Sign In</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={pickAvatarImage} 
              activeOpacity={0.7}
            >
              {userProfile.avatarUri ? (
                <Image source={{ uri: userProfile.avatarUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <Ionicons name="person" size={50} color="#ffffff" />
              )}
            </TouchableOpacity>
            
            <View style={[styles.profileTextInfo, { justifyContent: 'center' }]}>
              <TouchableOpacity onPress={handleAuthInteraction} activeOpacity={0.7}>
                <Text style={styles.welcomeText} numberOfLines={1}>Welcome back,</Text>
                <Text style={styles.profileName} numberOfLines={1}>{userProfile.name}</Text>
                <Text style={styles.profileSubtitle} numberOfLines={1}>{userProfile.email}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </GlassModule>

      {/* Navigation Stack Configuration */}
      <GlassModule style={styles.listModule}>
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/accountManagement' as any)} activeOpacity={0.7}>
          <View style={[styles.navIconBox, { backgroundColor: '#FF2D55' }]}>
            <Ionicons name="person" size={20} color="#ffffff" />
          </View>
          <Text style={styles.navRowText}>Account Management</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
        
        <View style={styles.navDivider} />
        
        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/wallpaperSettings' as any)} activeOpacity={0.7}>
          <View style={[styles.navIconBox, { backgroundColor: '#5856D6' }]}>
            <Ionicons name="images" size={20} color="#ffffff" />
          </View>
          <Text style={styles.navRowText}>Wallpaper</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </GlassModule>

      {/* Home Metrics Block (Maintained strictly for layout continuity) */}
      <GlassModule style={styles.module}>
        <Text style={styles.sectionTitle}>Home Analytics</Text>
        <View style={styles.statBoxContainer}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={28} color="#34C759" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{stats.tasksDone}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          
          <View style={styles.statBox}>
            <Ionicons name="flame" size={28} color="#FF9500" style={{ marginBottom: 6 }} />
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Days Streak</Text>
          </View>
        </View>
      </GlassModule>

      <GlassModule style={styles.module}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Joined System Base</Text>
          <Text style={styles.infoValue}>
            {userProfile.joinedDate ? format(new Date(userProfile.joinedDate), 'MMM d, yyyy') : 'Unknown'}
          </Text>
        </View>
      </GlassModule>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 120, // Moved down vertically
  },
  profileGlassContainer: {
    marginBottom: 25,
    // Horizontal padding stripped entirely to sync perfectly with 100% width of stack rows naturally
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileTextInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.6)',
  },
  unsignedText: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  signInBtn: {
    marginTop: 8,
    backgroundColor: '#007AFF', // Standard Blue
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  signInBtnText: {
    color: '#ffffff',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
  },
  listModule: {
    paddingHorizontal: 0,
    paddingVertical: 5,
    marginBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  navRowText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 19,
    fontFamily: 'Quicksand_600SemiBold',
  },
  navDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 60, // Align exactly with text
  },
  module: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  statBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: 'Quicksand_600SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Quicksand_500Medium',
    fontSize: 14,
  },
  infoValue: {
    color: '#ffffff',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
  }
});
