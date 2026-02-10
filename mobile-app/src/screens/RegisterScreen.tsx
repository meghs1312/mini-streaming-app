import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import API from '../services/api';
import { loginWithGoogle, loginWithGitHub } from '../services/oauth';
import { saveToken, saveUser } from '../services/storage';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await API.post('/auth/register', {
        email,
        password,
      });

      const { token, user } = response.data;
      await saveToken(token);
      await saveUser(user);

      Alert.alert('Success', 'Account created');
      navigation.replace('Home');

    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || 'Registration failed');
    }
  };

  const handleGoogleSignup = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      Alert.alert('Success', 'Account created with Google');
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error || 'Google signup failed');
    }
  };

  const handleGitHubSignup = async () => {
    const result = await loginWithGitHub();
    if (result.success) {
      Alert.alert('Success', 'Account created with GitHub');
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error || 'GitHub signup failed');
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.logo}>NETFLIX</Text>

      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.oauthButton} onPress={handleGoogleSignup}>
          <Text style={styles.oauthButtonText}>🔍 Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.oauthButton} onPress={handleGitHubSignup}>
          <Text style={styles.oauthButtonText}>🐙 Continue with GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.signupContainer}
        >
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    paddingHorizontal: 25,
    paddingTop: 120,
  },

  logo: {
    color: '#E50914',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },

  title: {
    color: 'white',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },

  form: {
    width: '100%',
  },

  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 14,
    borderRadius: 6,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#E50914',
    padding: 15,
    borderRadius: 6,
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  signupContainer: {
    marginTop: 25,
    alignItems: 'center',
  },

  signupText: {
    color: '#aaa',
  },

  signupLink: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#aaa',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  oauthButton: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  oauthButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
