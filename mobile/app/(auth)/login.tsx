import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
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
            console.error('Login Error:', error);
            let message = 'Login failed';

            if (error.response) {
                // Server responded with error (4xx/5xx)
                message = error.response.data?.message || 'Invalid credentials';
            } else if (error.request) {
                // Request sent but no response (Network Error)
                message = 'Network error. Cannot reach server.\n\nMake sure your phone and computer are on the same Wi-Fi and the API IP is correct.';
            }

            Alert.alert('Login Failed', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
                        <Text className="text-4xl font-bold text-white mb-2">Welcome Back</Text>
                        <Text className="text-gray-400 text-lg mb-8">
                            Sign in to continue mastering prompts.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                        <Input
                            label="Email"
                            placeholder="john@example.com"
                            placeholderTextColor="#6B7280"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            containerClassName="mb-4"
                            className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Input
                            label="Password"
                            placeholder="••••••••"
                            placeholderTextColor="#6B7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            containerClassName="mb-6"
                            className="bg-gray-800 border-gray-700 text-white"
                        />

                        <TouchableOpacity className="mb-8 self-end">
                            <Text className="text-primary-500 font-medium">Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            size="lg"
                            className="mb-6 shadow-lg shadow-primary-500/30 rounded-2xl"
                        />

                        <View className="flex-row justify-center pb-8">
                            <Text className="text-gray-400">Don't have an account? </Text>
                            <Link href="/register" asChild>
                                <TouchableOpacity>
                                    <Text className="text-primary-500 font-bold">Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
