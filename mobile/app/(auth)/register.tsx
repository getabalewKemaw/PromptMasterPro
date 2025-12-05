import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
    const [language, setLanguage] = useState('en');
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
                preferredLanguage: language,
            });

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
        { code: 'en', label: 'English 🇺🇸' },
        { code: 'am', label: 'Amharic 🇪🇹' },
        { code: 'om', label: 'Oromo 🌳' },
        { code: 'ti', label: 'Tigrinya ⛰️' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
                <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
                    <Text className="text-4xl font-bold text-primary-600 mb-2">Create Account</Text>
                    <Text className="text-gray-500 text-lg mb-8">
                        Join the community of prompt masters.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />
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

                    <Text className="text-gray-700 font-medium mb-2 ml-1">Preferred Language</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => setLanguage(lang.code)}
                                className={`px-4 py-2 rounded-full border ${language === lang.code
                                        ? 'bg-primary-50 border-primary-500'
                                        : 'bg-white border-gray-200'
                                    }`}
                            >
                                <Text
                                    className={
                                        language === lang.code
                                            ? 'text-primary-700 font-bold'
                                            : 'text-gray-600'
                                    }
                                >
                                    {lang.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Button
                        title="Sign Up"
                        onPress={handleRegister}
                        isLoading={isLoading}
                        size="lg"
                        className="mb-6 shadow-lg shadow-primary-500/30"
                    />

                    <View className="flex-row justify-center mb-8">
                        <Text className="text-gray-500">Already have an account? </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-primary-600 font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
