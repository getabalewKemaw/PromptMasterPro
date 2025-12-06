import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input = ({
    label,
    error,
    containerClassName,
    className,
    secureTextEntry,
    ...props
}: InputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = secureTextEntry && !isPasswordVisible;

    return (
        <View className={twMerge('w-full mb-4', containerClassName)}>
            {label && (
                <Text className="text-gray-300 font-medium mb-1.5 ml-1">{label}</Text>
            )}
            <View className="relative">
                <TextInput
                    className={twMerge(
                        'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base',
                        'focus:border-primary-500 focus:bg-gray-800', // Keep dark bg on focus
                        error && 'border-red-500 bg-red-900/10',
                        className
                    )}
                    placeholderTextColor="#6B7280"
                    secureTextEntry={isPassword}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        className="absolute right-4 top-3"
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color="#9CA3AF" />
                        ) : (
                            <Eye size={20} color="#9CA3AF" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
        </View>
    );
};
