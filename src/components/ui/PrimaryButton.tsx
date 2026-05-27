import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  className = '',
}: Props) {
  const base = 'rounded-xl py-4 px-6 items-center justify-center min-h-[52px]';
  const variants = {
    primary: 'bg-primary',
    outline: 'border-2 border-primary bg-transparent',
    secondary: 'bg-secondary',
  };
  const textVariants = {
    primary: 'text-white font-semibold text-base',
    outline: 'text-primary font-semibold text-base',
    secondary: 'text-text font-semibold text-base',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#D32F2F' : '#fff'} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </Pressable>
  );
}
