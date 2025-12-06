import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuthStore } from '../../src/store/authStore';
import api from '../../src/services/api';

export default function RegisterScreen() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                preferredLanguage
            });

            // Auto login after register
            const { user, token } = response.data.data;
            login(user, token);
            router.replace('/(tabs)');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'am', label: 'Amharic' },
        { code: 'om', label: 'Oromo' },
        { code: 'ti', label: 'Tigrinya' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50, justifyContent: 'center', minHeight: '100%' }}>
                    {/* ... (existing content) ... */}
                    <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
                        <Text className="text-4xl font-bold text-white mb-2">Create Account</Text>
                        <Text className="text-gray-400 text-lg mb-8">
                            Join PromptMaster Pro today.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            placeholderTextColor="#6B7280"
                            value={name}
                            onChangeText={setName}
                            containerClassName="mb-4"
                            className="bg-gray-800 border-gray-700 text-white"
                        />
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

                        {/* Language Selector */}
                        <Text className="text-gray-400 font-medium mb-2 ml-1">Preferred Language</Text>
                        <View className="flex-row flex-wrap mb-8">
                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    onPress={() => setPreferredLanguage(lang.code)}
                                    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${preferredLanguage === lang.code
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'bg-gray-800 border-gray-700'
                                        }`}
                                >
                                    <Text className={`${preferredLanguage === lang.code ? 'text-white' : 'text-gray-400'} font-medium`}>
                                        {lang.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            isLoading={isLoading}
                            size="lg"
                            className="mb-6 shadow-lg shadow-primary-500/30 rounded-2xl"
                        />

                        <View className="flex-row justify-center">
                            <Text className="text-gray-400">Already have an account? </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text className="text-primary-500 font-bold">Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
