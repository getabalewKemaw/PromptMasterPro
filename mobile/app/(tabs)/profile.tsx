import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { useRouter } from 'expo-router';
import { LogOut, User, Mail, Globe, Settings, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    const getLanguageLabel = (code?: string) => {
        switch (code) {
            case 'am': return 'Amharic 🇪🇹';
            case 'om': return 'Oromo 🌳';
            case 'ti': return 'Tigrinya ⛰️';
            default: return 'English 🇺🇸';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-dark">
            <ScrollView className="flex-1 px-6 pt-6">

                {/* Header */}
                <Text className="text-3xl font-bold text-white mb-8">Profile</Text>

                {/* Profile Card */}
                <View className="bg-surface-dark border border-gray-800 rounded-3xl p-6 mb-8 items-center">
                    <View className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                        <Text className="text-4xl text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-white mb-1">{user?.name}</Text>
                    <Text className="text-gray-400">{user?.email}</Text>
                </View>

                {/* Settings Section */}
                <View className="space-y-4 mb-8">
                    <Text className="text-gray-500 font-medium ml-1 mb-2">ACCOUNT SETTINGS</Text>

                    {/* Item */}
                    <TouchableOpacity className="flex-row items-center justify-between bg-surface-dark p-4 rounded-2xl border border-gray-800">
                        <View className="flex-row items-center gap-4">
                            <View className="bg-blue-500/10 p-2 rounded-lg">
                                <User size={20} color="#3B82F6" />
                            </View>
                            <Text className="text-white text-lg font-medium">Personal Info</Text>
                        </View>
                        <ChevronRight size={20} color="#6B7280" />
                    </TouchableOpacity>

                    {/* Item */}
                    <TouchableOpacity className="flex-row items-center justify-between bg-surface-dark p-4 rounded-2xl border border-gray-800">
                        <View className="flex-row items-center gap-4">
                            <View className="bg-green-500/10 p-2 rounded-lg">
                                <Globe size={20} color="#22C55E" />
                            </View>
                            <View>
                                <Text className="text-white text-lg font-medium">Language</Text>
                                <Text className="text-gray-500 text-sm">{getLanguageLabel(user?.preferredLanguage)}</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* General Section */}
                <View className="space-y-4 mb-12">
                    <Text className="text-gray-500 font-medium ml-1 mb-2">GENERAL</Text>

                    <TouchableOpacity className="flex-row items-center justify-between bg-surface-dark p-4 rounded-2xl border border-gray-800">
                        <View className="flex-row items-center gap-4">
                            <View className="bg-gray-700/50 p-2 rounded-lg">
                                <Settings size={20} color="#9CA3AF" />
                            </View>
                            <Text className="text-white text-lg font-medium">Preferences</Text>
                        </View>
                        <ChevronRight size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <Button
                    title="Log Out"
                    onPress={handleLogout}
                    variant="outline"
                    className="border-red-500/50"
                    icon={<LogOut size={20} color="#EF4444" />}
                />
                <Text className="text-center text-gray-600 mt-6 mb-10">Version 1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}
