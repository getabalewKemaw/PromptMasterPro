import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { promptService, ImprovedPromptResponse } from '../../src/services/promptService';
import { useAuthStore } from '../../src/store/authStore';

export default function HomeScreen() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImprovedPromptResponse | null>(null);
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
        const data = await promptService.improveVoicePrompt(uri, language);
        setResult(data);
        // Also update the text input with the transcribed text
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
      const data = await promptService.improvePrompt(prompt, language);
      setResult(data);
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
    { code: 'en', label: '🇺🇸 English' },
    { code: 'am', label: '🇪🇹 Amharic' },
    { code: 'om', label: '🌳 Oromo' },
    { code: 'ti', label: '⛰️ Tigrinya' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(800)} className="mb-8">
          <Text className="text-3xl font-bold text-primary-900">
            Hello, <Text className="text-primary-600">{user?.name || 'Master'}</Text> 👋
          </Text>
          <Text className="text-gray-500 text-base mt-1">
            Ready to create some magic?
          </Text>
        </Animated.View>

        {/* Input Section */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-6 relative">
          <View className="flex-row border-b border-gray-100 mb-4 p-2">
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-full mr-2 ${language === lang.code ? 'bg-primary-100' : 'bg-transparent'
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${language === lang.code ? 'text-primary-700' : 'text-gray-500'
                    }`}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            placeholder={language === 'am' ? 'ለምሳሌ፡ ስለ ቡና ኢሜይል ጻፍ...' : "E.g., Write an email about coffee..."}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            className="h-32 text-lg bg-transparent border-0 pb-12"
            textAlignVertical="top"
          />

          {/* Microphone Button */}
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            className={`absolute bottom-4 right-4 p-4 rounded-full shadow-lg ${isRecording ? 'bg-red-500' : 'bg-primary-600'
              }`}
          >
            {isRecording ? (
              <View className="w-6 h-6 bg-white rounded-sm" />
            ) : (
              <Text className="text-white text-xl">🎙️</Text>
            )}
          </TouchableOpacity>
        </View>

        {isRecording && (
          <Animated.Text
            entering={FadeInUp}
            className="text-center text-red-500 font-medium mb-4"
          >
            Recording... Tap to stop
          </Animated.Text>
        )}

        <Button
          title="✨ Improve Prompt"
          onPress={handleImprove}
          isLoading={isLoading}
          size="lg"
          className="shadow-lg shadow-primary-500/30 mb-8"
        />

        {/* Results Section */}
        {result && (
          <Animated.View entering={FadeInUp.springify()} className="space-y-6">

            {/* English Result */}
            <View className="bg-primary-50 p-5 rounded-2xl border border-primary-100">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-primary-800 font-bold text-lg">🇺🇸 Professional English</Text>
                <TouchableOpacity onPress={() => copyToClipboard(result.improvedEnglish)}>
                  <Text className="text-primary-600 font-medium">Copy</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-800 text-base leading-6">
                {result.improvedEnglish}
              </Text>
            </View>

            {/* Local Result (if applicable) */}
            {result.improvedLocal && language !== 'en' && (
              <View className="bg-secondary-50 p-5 rounded-2xl border border-secondary-100">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-secondary-800 font-bold text-lg">
                    {languages.find(l => l.code === language)?.label} Version
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(result.improvedLocal!)}>
                    <Text className="text-secondary-700 font-medium">Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-800 text-base leading-6">
                  {result.improvedLocal}
                </Text>
              </View>
            )}

            <Text className="text-center text-gray-400 text-sm mt-4">
              AI generated content can be inaccurate.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
