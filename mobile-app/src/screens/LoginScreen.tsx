import React, { useState } from 'react';
import {
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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await API.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      await saveToken(token);
      await saveUser(user);

      Alert.alert('Login Success');
      navigation.replace('Home');

    } catch (err: any) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      Alert.alert('Login Success');
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error || 'Google login failed');
    }
  };

  const handleGitHubLogin = async () => {
    const result = await loginWithGitHub();
    if (result.success) {
      Alert.alert('Login Success');
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.error || 'GitHub login failed');
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.logo}>NETFLIX</Text>

      <View style={styles.form}>
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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.oauthButton} onPress={handleGoogleLogin}>
          <Text style={styles.oauthButtonText}>🔍 Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.oauthButton} onPress={handleGitHubLogin}>
          <Text style={styles.oauthButtonText}>🐙 Continue with GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.signupContainer}
        >
          <Text style={styles.signupText}>
            New to Netflix? <Text style={styles.signupLink}>Sign up now.</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    color: '#E50914',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
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

  /* 🔥 IMPORTANT FIX */
  signupContainer: {
    marginTop: 50,
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
