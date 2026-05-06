import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GlassModule } from '../../components/GlassModule';
import { auth } from '../../src/config/firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both your email and password to securely sign in.');
      return;
    }
    
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Strict Verification Intercept Map
      if (!cred.user.emailVerified) {
        Alert.alert('Email Not Verified', 'Please aggressively check your inbox and seamlessly correctly verify your email address to fully unlock dashboard access.', [
           { text: 'Resend Verification Mail', onPress: () => {
             sendEmailVerification(cred.user);
             Alert.alert('Success', 'Verification explicitly dispatched structurally successfully!');
           }},
           { text: 'Close', style: 'cancel' }
        ]);
        return; // Halt route logic
      }

      // Validated
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        Alert.alert('Sign In Failed', 'User credentials severely missing or structurally functionally invalid.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/configuration-not-found') {
        Alert.alert('Backend Disabled', 'Google Firebase rejected the request. Please go to your Firebase Console -> Authentication -> Sign-in method, and ensure "Email/Password" is explicitly enabled!');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
        </View>

        <GlassModule style={styles.module}>
          <Text style={styles.subtitle}>Welcome back! Sign in securely to access your dashboard settings exactly across devices.</Text>
          
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

          <TouchableOpacity style={styles.button} onPress={handleSignIn} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkContainer} onPress={() => router.push('/passwordReset' as any)} activeOpacity={0.7}>
            <Text style={styles.linkText}>Forgot your password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.linkContainer, { marginTop: 10 }]} onPress={() => router.push('/auth/signUp' as any)} activeOpacity={0.7}>
            <Text style={styles.linkText}>Haven't got an account? Sign Up.</Text>
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
    backgroundColor: '#007AFF',
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
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  linkText: {
    color: '#007AFF',
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 15,
  }
});
