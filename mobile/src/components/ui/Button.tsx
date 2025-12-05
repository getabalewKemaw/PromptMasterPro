import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className,
    icon,
}: ButtonProps) => {
    const baseStyles = 'flex-row items-center justify-center rounded-xl font-medium';

    const variants = {
        primary: 'bg-primary-600 active:bg-primary-700',
        secondary: 'bg-secondary-500 active:bg-secondary-600',
        outline: 'border-2 border-primary-600 bg-transparent active:bg-primary-50',
        ghost: 'bg-transparent active:bg-gray-100',
    };

    const sizes = {
        sm: 'px-4 py-2',
        md: 'px-6 py-3',
        lg: 'px-8 py-4',
    };

    const textStyles = {
        primary: 'text-white font-bold',
        secondary: 'text-white font-bold',
        outline: 'text-primary-600 font-bold',
        ghost: 'text-gray-700 font-medium',
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            className={twMerge(
                baseStyles,
                variants[variant],
                sizes[size],
                disabled && 'opacity-50',
                className
            )}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#4F46E5' : 'white'} />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={twMerge('text-center text-base', textStyles[variant])}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};
