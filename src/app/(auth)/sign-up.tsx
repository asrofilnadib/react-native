import { useClerk, useSSO } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function SignUpScreen() {
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!clerk.loaded) return;
    setLoading(true);
    try {
      await clerk.client.signUp.create({
        emailAddress: email.trim(),
        password,
        username: username.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
      });
      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert(
        'Verify email',
        'Check your inbox for a verification code, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }],
      );
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const { createdSessionId, setActive: setActiveSSO, authSessionResult } =
        await startSSOFlow({ strategy: 'oauth_google' });
      if (authSessionResult?.type !== 'success') return;
      if (createdSessionId && setActiveSSO) {
        await setActiveSSO({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'OAuth failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        <View className="mb-6 mt-4 flex-row justify-between">
          <Text className="text-2xl font-bold text-text">Create Account</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="font-semibold text-primary">Log in</Text>
            </Pressable>
          </Link>
        </View>
        <Input label="Username" value={username} onChangeText={setUsername} placeholder="username" autoCapitalize="words" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+62..." keyboardType="phone-pad" />
        <PrimaryButton label="Create Account" onPress={onSignUp} loading={loading} />
        <View className="my-6 items-center">
          <Text className="text-textLight">or</Text>
        </View>
        <PrimaryButton label="Continue with Google" variant="outline" onPress={onGoogle} />
      </ScrollView>
    </SafeAreaView>
  );
}
