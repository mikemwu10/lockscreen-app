import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
  View, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { GlassModule } from '../components/GlassModule';
import { auth } from '../src/config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordResetScreen() {
  const router = useRouter();

  // Detect auth state at mount time
  const loggedInEmail = auth.currentUser?.email ?? null;
  const isLoggedIn = loggedInEmail !== null;

  // For the "forgot password" (logged-out) flow, the user types their email
  const [manualEmail, setManualEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const emailToUse = isLoggedIn ? loggedInEmail : manualEmail;
  const isValidEmail = EMAIL_REGEX.test(emailToUse ?? '');
  const canSend = isLoggedIn ? true : isValidEmail; // Logged-in email is always valid

  const handleReset = async () => {
    if (!emailToUse) {
      Alert.alert('No Email', 'Please enter your registered email address.');
      return;
    }
    if (!isValidEmail) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailToUse);
      Alert.alert(
        'Email Sent ✉️',
        `A password reset link has been sent to ${emailToUse}.`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Not Found', 'No account is associated with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/configuration-not-found') {
        Alert.alert('Backend Disabled', 'Enable Email/Password in Firebase Console → Authentication → Sign-in method.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
        </View>

        <GlassModule style={styles.module}>
          <Text style={styles.subtitle}>
            {isLoggedIn
              ? 'A password reset link will be sent to your registered email address.'
              : 'Enter your registered email and we\'ll send you a secure reset link.'}
          </Text>

          {/* Email field — locked when logged in, editable when not */}
          <View style={[styles.inputContainer, !isLoggedIn && styles.inputContainerEditable]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="rgba(255,255,255,0.5)"
              style={styles.inputIcon}
            />
            {isLoggedIn ? (
              // Case B: locked, prefilled
              <Text style={styles.lockedEmail} numberOfLines={1}>
                {loggedInEmail}
              </Text>
            ) : (
              // Case A: editable, user types email
              <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={manualEmail}
                onChangeText={setManualEmail}
                returnKeyType="done"
                onSubmitEditing={handleReset}
              />
            )}
            {isLoggedIn && (
              <Ionicons
                name="lock-closed"
                size={16}
                color="rgba(255,255,255,0.3)"
                style={{ paddingRight: 15 }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!canSend || loading) && styles.buttonDisabled,
            ]}
            onPress={handleReset}
            activeOpacity={0.8}
            disabled={!canSend || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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
    color: '#1ecbe1', // Vibrant cyan
    fontFamily: 'Quicksand_500Medium',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,203,225,0.13)', // Vibrant cyan, less transparent
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1ecbe1',
    marginBottom: 20,
    paddingVertical: 14,
    opacity: 0.9, // More visible
  },
  inputContainerEditable: {
    opacity: 1, // Full opacity for the editable state
    borderColor: '#1ecbe1',
    backgroundColor: 'rgba(30,203,225,0.18)',
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10,
  },
  // Locked (logged-in) email display
  lockedEmail: {
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  // Editable (logged-out) text input
  input: {
    flex: 1,
    color: '#ffffff',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    paddingRight: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
