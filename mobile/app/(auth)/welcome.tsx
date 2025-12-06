import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // NOTE: Need to check if installed, if not, fallback to View with background color
import { ArrowRight, Sparkles, Globe, Mic } from 'lucide-react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            <View className="flex-1 px-6 justify-between py-10">

                {/* Header Content */}
                <View className="items-center mt-10">
                    <View className="bg-primary-500/10 p-4 rounded-full mb-6">
                        <Sparkles size={48} color="#6366F1" />
                    </View>
                    <Text className="text-4xl font-bold text-white text-center mb-4">
                        PromptMaster <Text className="text-primary-500">Pro</Text>
                    </Text>
                    <Text className="text-gray-400 text-lg text-center leading-relaxed">
                        Master the art of AI prompting in your native language.
                        Translate, critique, and perfect your ideas instantly.
                    </Text>
                </View>

                {/* Features Grid */}
                <View className="gap-6 pt-4">
                    <View className="flex-row items-center gap-4 bg-surface-dark/50 p-4 rounded-xl border border-gray-800">
                        <View className="bg-blue-500/20 p-3 rounded-lg">
                            <Globe size={24} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-lg">Multilingual AI</Text>
                            <Text className="text-gray-400 text-sm">Amharic, Afaan Oromo, Tigrinya & more....</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-4 bg-surface-dark/50 p-4 rounded-xl border border-gray-800">
                        <View className="bg-purple-500/20 p-3 rounded-lg">
                            <Sparkles size={24} color="#A855F7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-lg">Smart Critique</Text>
                            <Text className="text-gray-400 text-sm">Get expert feedback on your prompts.</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-4 bg-surface-dark/50 p-4 rounded-xl border border-gray-800">
                        <View className="bg-green-500/20 p-3 rounded-lg">
                            <Mic size={24} color="#22C55E" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-lg">Voice Input</Text>
                            <Text className="text-gray-400 text-sm">Speak naturally, we handle the rest.</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View className="gap-4 mb-7 pt-2">
                    <TouchableOpacity
                        onPress={() => router.push('/register')}
                        className="bg-primary-600 p-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-primary-500/20"
                    >
                        <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                        className="p-4 rounded-2xl flex-row justify-center items-center border border-gray-700 bg-surface-dark"
                    >
                        <Text className="text-white font-semibold text-lg">I already have an account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
