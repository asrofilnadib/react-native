import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function CategoryChip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full px-4 py-2 ${active ? 'bg-primary' : 'bg-gray-100'}`}>
      <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-text'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
