import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { format } from 'date-fns';
import { GlassModule } from '../../components/GlassModule';
import { useDashboardData } from '../../hooks/useDashboardData';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

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
  const streakActive = stats.streak > 0;
  const streakHot = stats.streak >= 3;

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
              router.replace('/auth/signIn' as any);
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <GlassModule style={styles.profileCard} contentStyle={{ paddingVertical: 20 }}>
        {isDefaultProfile ? (
          <TouchableOpacity style={styles.profileHeader} onPress={handleAuthInteraction} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />
            </View>
            <View style={styles.profileTextInfo}>
              <Text style={styles.unsignedTitle}>Not signed in</Text>
              <Text style={styles.unsignedSub}>Sign in to sync your data across devices</Text>
              <View style={styles.signInBtn}>
                <Text style={styles.signInBtnText}>Sign In</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.profileHeader}>
            {/* Avatar with camera tap affordance */}
            <TouchableOpacity onPress={pickAvatarImage} activeOpacity={0.8} style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                {userProfile.avatarUri ? (
                  <Image source={{ uri: userProfile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={40} color="rgba(255,255,255,0.8)" />
                )}
              </View>
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={11} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={styles.profileTextInfo}>
              <Text style={styles.greeting}>{timeGreeting()},</Text>
              <Text style={styles.profileName} numberOfLines={1}>{userProfile.name}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>{userProfile.email}</Text>
              <TouchableOpacity onPress={handleAuthInteraction} activeOpacity={0.7} style={styles.signOutBtn}>
                <Text style={styles.signOutText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </GlassModule>

      {/* Navigation rows */}
      <GlassModule style={styles.listModule} contentStyle={{ padding: 0 }}>
        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push('/accountManagement' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#FF2D55' }]}>
            <Ionicons name="person" size={18} color="#ffffff" />
          </View>
          <Text style={styles.navRowText}>Account</Text>
          <Ionicons name="chevron-forward" size={17} color="rgba(255,255,255,0.35)" />
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push('/wallpaperSettings' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#5856D6' }]}>
            <Ionicons name="images" size={18} color="#ffffff" />
          </View>
          <Text style={styles.navRowText}>Wallpaper</Text>
          <Ionicons name="chevron-forward" size={17} color="rgba(255,255,255,0.35)" />
        </TouchableOpacity>

        <View style={styles.navDivider} />

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push('/manageQuotes' as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#A78BFA' }]}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#ffffff" />
          </View>
          <Text style={styles.navRowText}>Quotes</Text>
          <Ionicons name="chevron-forward" size={17} color="rgba(255,255,255,0.35)" />
        </TouchableOpacity>
      </GlassModule>

      {/* Stats */}
      <GlassModule style={styles.module}>
        <Text style={styles.sectionLabel}>YOUR PROGRESS</Text>
        <View style={styles.statBoxContainer}>
          <View style={[styles.statBox, { borderColor: 'rgba(52,199,89,0.35)' }]}>
            <Ionicons name="checkmark-circle" size={26} color="#34C759" style={{ marginBottom: 10 }} />
            <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.tasksDone}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={[styles.statBox, streakActive && { borderColor: 'rgba(255,149,0,0.4)' }]}>
            <Ionicons
              name="flame"
              size={26}
              color={streakActive ? '#FF9500' : 'rgba(255,255,255,0.3)'}
              style={{ marginBottom: 10 }}
            />
            <Text style={[styles.statValue, streakActive && { color: '#FF9500' }]}>
              {stats.streak}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
            {streakHot && (
              <Text style={styles.streakBadge}>On a roll! 🔥</Text>
            )}
          </View>
        </View>
      </GlassModule>

      {/* App info */}
      <GlassModule style={styles.module}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {userProfile.joinedDate ? format(new Date(userProfile.joinedDate), 'MMM d, yyyy') : '—'}
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
    paddingTop: 110,
  },

  /* Profile */
  profileCard: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginRight: 18,
    position: 'relative',
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5B8DEF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  profileTextInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 2,
  },
  profileName: {
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  signOutBtn: {
    alignSelf: 'flex-start',
  },
  signOutText: {
    color: '#FF453A',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
  unsignedTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  unsignedSub: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    lineHeight: 18,
  },
  signInBtn: {
    backgroundColor: '#5B8DEF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  signInBtnText: {
    color: '#ffffff',
    fontFamily: 'Quicksand_700Bold',
    fontSize: 14,
  },

  /* Nav rows */
  listModule: {
    marginBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  navRowText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  navDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 66,
  },

  /* Stats */
  module: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  statBoxContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 42,
    fontFamily: 'Quicksand_700Bold',
    lineHeight: 46,
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Quicksand_600SemiBold',
    letterSpacing: 0.5,
  },
  streakBadge: {
    marginTop: 6,
    color: '#FF9500',
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Quicksand_500Medium',
    fontSize: 14,
  },
  infoValue: {
    color: '#ffffff',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
  },
});
