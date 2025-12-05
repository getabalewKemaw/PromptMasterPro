import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
    ...props
}: InputProps) => {
    return (
        <View className={twMerge('w-full mb-4', containerClassName)}>
            {label && (
                <Text className="text-gray-700 font-medium mb-1.5 ml-1">{label}</Text>
            )}
            <TextInput
                className={twMerge(
                    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base',
                    'focus:border-primary-500 focus:bg-white',
                    error && 'border-red-500 bg-red-50',
                    className
                )}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
        </View>
    );
};
