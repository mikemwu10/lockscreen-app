import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { GlassModule } from '../components/GlassModule';
import { useDashboardData } from '../hooks/useDashboardData';
import { auth, db } from '../src/config/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

export default function AccountManagementScreen() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useDashboardData();

  const handleNicknameChange = () => {
    Alert.prompt(
      'Change Nickname',
      'Enter a new display name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: (t) => t && updateUserProfile(t, undefined) },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all associated data (tasks, quotes, settings). This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
              Alert.alert('Error', 'No signed-in user found.');
              return;
            }

            try {
              // 1. Delete Firestore root document (sub-collections require Cloud Functions
              //    to cascade — this removes the profile; tasks/quotes will be orphaned
              //    but inaccessible without the auth UID)
              await deleteDoc(doc(db, 'users', currentUser.uid));

              // 2. Delete the Firebase Auth account itself
              await deleteUser(currentUser);

              // 3. Navigate back to root — onAuthStateChanged will reset state
              router.replace('/(tabs)/settings' as any);
            } catch (error: any) {
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Re-authentication Required',
                  'For security, please sign out and sign back in before deleting your account.'
                );
              } else {
                Alert.alert('Error', error.message);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <GlassModule style={styles.listModule}>
        <TouchableOpacity style={styles.navRow} onPress={handleNicknameChange} activeOpacity={0.7}>
          <Text style={styles.navRowText}>Nickname</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.navValueText} numberOfLines={1}>{userProfile.name}</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" style={{ marginLeft: 6 }} />
          </View>
        </TouchableOpacity>
        <View style={styles.navDivider} />

        <TouchableOpacity style={styles.navRow} onPress={() => router.push('/passwordReset' as any)} activeOpacity={0.7}>
          <Text style={styles.navRowText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      </GlassModule>

      <GlassModule style={styles.listModule}>
        <TouchableOpacity style={styles.navRow} onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Text style={[styles.navRowText, { color: '#ff4d4d' }]}>Delete Account</Text>
          <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
        </TouchableOpacity>
      </GlassModule>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
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
  navRowText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  navValueText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    maxWidth: 150,
  },
  navDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 20,
  },
});
