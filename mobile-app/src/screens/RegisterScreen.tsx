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

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await API.post('/auth/register', {
        email,
        password,
      });

      Alert.alert('Success', 'Account created');
      navigation.navigate('Login');

    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.msg || 'Registration failed');
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

        {/* Go back to login */}
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
});
