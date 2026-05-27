import { useClerk, useSSO } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function SignInScreen() {
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!clerk.loaded) return;
    setLoading(true);
    try {
      const result = await clerk.client.signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete' && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Sign in failed');
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
        <View className="mb-8 mt-4 flex-row justify-between">
          <Text className="text-2xl font-bold text-text">Log in</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="font-semibold text-primary">Sign up</Text>
            </Pressable>
          </Link>
        </View>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          </View>
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable className="mb-4 ml-2 pb-3">
              <Text className="text-sm font-medium text-primary">Forgot?</Text>
            </Pressable>
          </Link>
        </View>
        <PrimaryButton label="Log in" onPress={onSignIn} loading={loading} />
        <View className="my-6 items-center">
          <Text className="text-textLight">or</Text>
        </View>
        <PrimaryButton label="Continue with Google" variant="outline" onPress={onGoogle} />
      </ScrollView>
    </SafeAreaView>
  );
}
