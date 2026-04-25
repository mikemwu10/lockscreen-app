import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GlassModule } from '../../components/GlassModule';
import { auth, db } from '../../src/config/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getTasks } from '../../utils/storage';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'All string fields specifically mapping explicitly are strictly required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Your verification passwords structurally failed matching gracefully.');
      return;
    }
    
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // Bootstrap root user document with full schema
      const defaultQuotes = [
        { id: 'default_1', text: 'Make today a masterpiece! 🎨' },
        { id: 'default_2', text: 'Small steps every day. 🚀' },
        { id: 'default_3', text: 'Add your motto to motivate yourself!' },
      ];
      const initialQuote = defaultQuotes[0];

      await setDoc(doc(db, 'users', uid), {
        name: email.split('@')[0],
        email: email,
        joinedDate: Date.now(),
        completionStreak: 0,
        lastCompletionDate: null,
        activeQuoteState: {
          quoteText: initialQuote.text,
          dateSet: new Date().toISOString().split('T')[0],
          isManual: false,
        },
        appSettings: {
          is24Hour: false,
          avatarUri: '',
          bgImage: '',
        },
      });

      // Seed default quotes as real Firestore documents in the sub-collection
      for (const q of defaultQuotes) {
        await setDoc(doc(db, 'users', uid, 'quotes', q.id), { text: q.text });
      }

      // Smart migration: push any existing local tasks to cloud
      const localTasks = await getTasks();
      for (const t of localTasks) {
        await setDoc(doc(db, 'users', uid, 'tasks', t.id), {
          title: t.text,
          text: t.text,
          isCompleted: t.isCompleted,
          createdAt: t.id,
          completedAt: t.completedAt || null,
        });
      }

      // Send verification email immediately
      await sendEmailVerification(cred.user);

      Alert.alert(
        'Account Created! 🎉',
        'A verification link has been sent to your inbox. Please verify your email, then sign in.',
        [{ text: 'Go to Sign In', onPress: () => router.replace('/auth/signIn' as any) }]
      );
    } catch (error: any) {
      if (error.code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email In Use', 'This email is already registered. Try signing in!');
      } else if (error.code === 'auth/configuration-not-found') {
        Alert.alert('Backend Disabled', 'Enable Email/Password in Firebase Console → Authentication → Sign-in method.');
      } else {
        Alert.alert('Sign Up Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
        </View>

        <GlassModule style={styles.module}>
          <Text style={styles.subtitle}>Register to sync your personal Dashboard naturally into the Firebase local cloud automatically.</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoComplete="email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 5 }]}
              placeholder="Password..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
               <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 5 }]}
              placeholder="Confirm Password..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={{ width: 50 }} />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </GlassModule>
      </ScrollView>
    </KeyboardAvoidingView>
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
  module: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Quicksand_500Medium',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 14,
    paddingRight: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#34C759', // Positive green structural completion
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  }
});
