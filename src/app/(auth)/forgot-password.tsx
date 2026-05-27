import { useClerk } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function ForgotPasswordScreen() {
  const clerk = useClerk();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!clerk.loaded) return;
    setLoading(true);
    try {
      await clerk.client.signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      Alert.alert('Sent', 'Check your email for a reset code.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <Text className="mb-2 mt-8 text-2xl font-bold text-text">Forgot password</Text>
      <Text className="mb-6 text-textLight">Enter your email to receive a reset link.</Text>
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
      <PrimaryButton label="Send" onPress={onSend} loading={loading} />
    </SafeAreaView>
  );
}
