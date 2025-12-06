import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, LayoutAnimation } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Sparkles, Mic, Copy, ArrowUp, Zap } from 'lucide-react-native';

import { promptService, PromptImprovementResponse } from '../../src/services/prompt.service';
import { useAuthStore } from '../../src/store/authStore';

// Types for Chat
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  data?: PromptImprovementResponse['data'];
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState(user?.preferredLanguage || 'en');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone usage is required for voice prompts.');
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

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const tempId = Date.now().toString();

        // Send to backend
        const response: any = await promptService.improveVoicePrompt(uri, language);
        const data = response.data || response;

        const userMsg: Message = { id: tempId, role: 'user', content: data.originalInput };
        const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', data: data };

        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to process voice recording');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!prompt.trim()) return;

    Keyboard.dismiss(); // Dismiss keyboard to see result better
    const currentPrompt = prompt;
    setPrompt(''); // Clear input immediately
    setIsLoading(true);

    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: currentPrompt };
    setMessages(prev => [...prev, userMsg]);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await promptService.improvePrompt(currentPrompt, language);

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', data: response.data };
      setMessages(prev => [...prev, assistantMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

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

  // Render Item for Chat
  const renderItem = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return (
        <Animated.View entering={FadeInUp.duration(300)} className="self-end mb-6 max-w-[85%]">
          <View className="bg-primary-600 rounded-2xl rounded-tr-sm px-5 py-3 shadow-md shadow-primary-900/20">
            <Text className="text-white text-base leading-6 font-medium">{item.content}</Text>
          </View>
        </Animated.View>
      );
    }

    // Assistant Message (Result Card)
    const result = item.data;
    if (!result) return null;

    return (
      <Animated.View entering={FadeInUp.duration(500)} className="self-start mb-8 w-full max-w-[95%]">
        <View className="flex-row items-center mb-3 ml-1">
          <View className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary-400 to-secondary-600 bg-secondary-500 items-center justify-center mr-2 shadow-sm">
            <Sparkles size={16} color="white" />
          </View>
          <Text className="text-gray-300 font-semibold text-sm">PromptMaster AI</Text>
        </View>

        {/* Improved Result Card */}
        <View className="bg-surface-dark border border-gray-700/50 rounded-2xl overflow-hidden shadow-lg shadow-black/30">

          {/* Critique Header (if exists) */}
          {result.englishCritique && (
            <View className="bg-orange-500/10 px-4 py-3 border-b border-orange-500/10 flex-row gap-2">
              <Zap size={16} color="#FB923C" className="mt-0.5" />
              <Text className="text-orange-300 text-sm leading-5 flex-1 font-medium">
                {language !== 'en' && result.localCritique ? result.localCritique : result.englishCritique}
              </Text>
            </View>
          )}

          {/* English Version */}
          <View className="p-4 border-b border-gray-800">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-primary-400 font-bold text-xs uppercase tracking-wider">🇺🇸 Optimised English</Text>
              <TouchableOpacity
                onPress={() => result.improvedEnglish && copyToClipboard(result.improvedEnglish)}
                className="bg-gray-800 p-1.5 rounded-lg"
              >
                <Copy size={14} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
            <Text className="text-white text-base leading-6 font-medium">{result.improvedEnglish}</Text>
          </View>

          {/* Local Version (if applicable) */}
          {result.improvedLocal && language !== 'en' && (
            <View className="p-4 bg-gray-800/30">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-secondary-400 font-bold text-xs uppercase tracking-wider">
                  {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.label} Version
                </Text>
                <TouchableOpacity
                  onPress={() => result.improvedLocal && copyToClipboard(result.improvedLocal)}
                  className="bg-gray-800 p-1.5 rounded-lg"
                >
                  <Copy size={14} color="#D1D5DB" />
                </TouchableOpacity>
              </View>
              <Text className="text-white text-base leading-6 font-medium">{result.improvedLocal}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark" edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View className="px-6 pb-4 pt-2 border-b border-gray-800/50 flex-row justify-between items-center z-10 bg-background-dark">
          <View>
            <Text className="text-xl font-bold text-white tracking-tight">PromptMaster</Text>
            <Text className="text-xs text-secondary-500 font-medium tracking-wide">AI AGENTS MODE</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 items-center justify-center overflow-hidden"
          >
            <Text className="text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}
          className="flex-1"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-32 opacity-80 px-10">
              <View className="w-20 h-20 bg-primary-500/10 rounded-full items-center justify-center mb-6">
                <Sparkles size={40} color="#6366F1" />
              </View>
              <Text className="text-white text-2xl font-bold text-center mb-2">How can I help?</Text>
              <Text className="text-gray-400 text-center leading-6">
                I can refine your prompts, translate ideas, and optimize text for AI models.
              </Text>
            </View>
          }
        />

        {/* Input Area (Sticky Bottom) */}
        <View
          className="bg-surface-dark border-t border-gray-800 px-4 pt-3 shadow-2xl"
          style={{ paddingBottom: isKeyboardVisible ? 20 : 100 }}
        >
          {/* Language Pills */}
          <View className="flex-row mb-3">
            <FlatList
              data={languages}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: lang }) => (
                <TouchableOpacity
                  onPress={() => setLanguage(lang.code)}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    borderWidth: 1,
                    backgroundColor: language === lang.code ? '#6366F1' : '#1F2937',
                    borderColor: language === lang.code ? '#6366F1' : '#374151',
                  }}
                >
                  <Text style={{
                    color: language === lang.code ? '#FFFFFF' : '#9CA3AF',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {lang.flag} {lang.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.code}
            />
          </View>

          {/* Input Bar */}
          <View className="flex-row items-end gap-3">
            <View className="flex-1 bg-gray-900/50 rounded-[24px] border border-gray-700 px-5 py-3 min-h-[56px] max-h-[140px] flex-row items-center">
              <TextInput
                placeholder={language === 'am' ? 'እዚህ ጋር ይፃፉ...' : "Send a message..."}
                placeholderTextColor="#6B7280"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                className="flex-1 text-white text-base leading-5 pt-0 pb-0"
                textAlignVertical="center"
                style={{ maxHeight: 120 }}
              />
              <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} className="ml-3 p-1">
                {isRecording ? (
                  <Animated.View
                    entering={FadeInUp}
                    className="w-5 h-5 bg-red-500 rounded-full shadow-red-500/50 shadow-lg animate-pulse"
                  />
                ) : (
                  <Mic size={22} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              onPress={handleImprove}
              disabled={!prompt.trim() || isLoading}
              className={`w-14 h-14 rounded-full items-center justify-center shadow-lg ${prompt.trim() ? 'bg-primary-600 shadow-primary-600/40' : 'bg-gray-800'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <ArrowUp size={26} color={prompt.trim() ? "white" : "#4B5563"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
