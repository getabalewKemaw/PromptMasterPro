import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Sparkles, Mic, Copy } from 'lucide-react-native';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { promptService, PromptImprovementResponse } from '../../src/services/prompt.service';
import { useAuthStore } from '../../src/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptImprovementResponse['data'] | null>(null);
  const { user } = useAuthStore();

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [language, setLanguage] = useState(user?.preferredLanguage || 'en');

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to use voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsLoading(true);
    setResult(null);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Send to backend
        const response: any = await promptService.improveVoicePrompt(uri, language);
        const data = response.data || response;

        setResult(data);
        setPrompt(data.originalInput);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to process voice recording');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!prompt.trim()) {
      Alert.alert('Empty Prompt', 'Please enter a prompt first.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await promptService.improvePrompt(prompt, language);
      setResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to improve prompt. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Prompt copied to clipboard.');
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'am', label: 'Amharic', flag: '🇪🇹' },
    { code: 'om', label: 'Oromo', flag: '🌳' },
    { code: 'ti', label: 'Tigrinya', flag: '⛰️' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(800)} className="mb-8 flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-white">
                Hello, <Text className="text-secondary-500">{user?.name?.split(' ')[0] || 'Master'}</Text>
              </Text>
              <Text className="text-gray-400 text-base mt-1">
                Refine your prompt in any language.
              </Text>
            </View>

            {/* Profile Icon (Clickable) */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              className="rounded-full shadow-lg shadow-black/50"
            >
              <View className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center border border-gray-600">
                <Text className="text-white font-bold text-xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Input Section */}
          <View className="bg-surface-dark border border-gray-800 rounded-3xl p-4 mb-6 relative">
            <View className="flex-row border-b border-gray-800 mb-4 pb-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => setLanguage(lang.code)}
                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${language === lang.code ? 'bg-primary-600' : 'bg-gray-800'
                      }`}
                  >
                    <Text className="mr-2">{lang.flag}</Text>
                    <Text
                      className={`text-sm font-medium ${language === lang.code ? 'text-white' : 'text-gray-400'
                        }`}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Input
              placeholder={language === 'am' ? 'ለምሳሌ፡ ስለ ቡና ኢሜይል ጻፍ...' : "Describe what you want to do..."}
              placeholderTextColor="#6B7280"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              className="h-32 text-lg text-white bg-transparent border-0 pb-12"
              textAlignVertical="top"
            />

            {/* Microphone Button */}
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              className={`absolute bottom-4 right-4 p-4 rounded-full shadow-lg items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-primary-600'
                }`}
            >
              {isRecording ? (
                <View className="w-5 h-5 bg-white rounded-sm animate-pulse" />
              ) : (
                <Mic size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {isRecording && (
            <Animated.Text
              entering={FadeInUp}
              className="text-center text-red-500 font-medium mb-4"
            >
              Recording... Speak now
            </Animated.Text>
          )}

          <Button
            title="Improve Prompt"
            onPress={handleImprove}
            isLoading={isLoading}
            size="lg"
            icon={<Sparkles size={20} color="white" />}
            className="shadow-lg shadow-primary-500/20 mb-8 rounded-2xl"
          />

          {/* Results Section */}
          {result && (
            <Animated.View entering={FadeInUp.springify()} className="space-y-6">

              {/* Critique Section (New) */}
              {result.englishCritique && (
                <View className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/20">
                  <Text className="text-orange-400 font-bold text-lg mb-2">💡 AI Critique</Text>
                  <Text className="text-gray-300 text-base leading-6">
                    {language !== 'en' && result.localCritique ? result.localCritique : result.englishCritique}
                  </Text>
                </View>
              )}

              {/* English Result */}
              <View className="bg-surface-dark p-5 rounded-2xl border border-primary-900/50">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-primary-400 font-bold text-lg">🇺🇸 Improved (English)</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(result.improvedEnglish)}
                    className="flex-row items-center bg-gray-800 px-3 py-1.5 rounded-lg"
                  >
                    <Copy size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 font-medium ml-2 text-xs">Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-white text-lg leading-7 font-medium">
                  {result.improvedEnglish}
                </Text>
              </View>

              {/* Local Result */}
              {result.improvedLocal && language !== 'en' && (
                <View className="bg-surface-dark p-5 rounded-2xl border border-secondary-900/50">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-secondary-400 font-bold text-lg">
                      {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.label} Version
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(result.improvedLocal!)}
                      className="flex-row items-center bg-gray-800 px-3 py-1.5 rounded-lg"
                    >
                      <Copy size={14} color="#9CA3AF" />
                      <Text className="text-gray-400 font-medium ml-2 text-xs">Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-white text-lg leading-7 font-medium">
                    {result.improvedLocal}
                  </Text>
                </View>
              )}

            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
