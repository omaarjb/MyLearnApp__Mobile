import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';

export default function VerifyEmailScreen({ route }) {
  const { email } = route.params;
  const { signUp, setActive } = useSignUp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const onVerify = async () => {
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: result.createdSessionId });
    } catch (err) {
      setError(err.errors?.[0]?.message || "Verification failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text>Code sent to: {email}</Text>
      
      <TextInput
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />
      
      <Button title="Verify" onPress={onVerify} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', marginTop: 10 },
});