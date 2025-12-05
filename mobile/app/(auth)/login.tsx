import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

export default function LoginScreen() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const { user, token } = response.data.data;
            login(user, token);
            router.replace('/(tabs)');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6 justify-center">
            <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
                <Text className="text-4xl font-bold text-primary-600 mb-2">Welcome Back</Text>
                <Text className="text-gray-500 text-lg mb-8">
                    Sign in to continue mastering prompts.
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                <Input
                    label="Email"
                    placeholder="john@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Input
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity className="mb-6 self-end">
                    <Text className="text-primary-600 font-medium">Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                    title="Sign In"
                    onPress={handleLogin}
                    isLoading={isLoading}
                    size="lg"
                    className="mb-6 shadow-lg shadow-primary-500/30"
                />

                <View className="flex-row justify-center">
                    <Text className="text-gray-500">Don't have an account? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-primary-600 font-bold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
