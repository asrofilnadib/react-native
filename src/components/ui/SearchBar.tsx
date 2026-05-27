import { Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search foods',
  onPress,
  editable = true,
}: Props) {
  const inner = (
    <View className="flex-row items-center rounded-xl bg-gray-100 px-4 py-3">
      <Text className="mr-2 text-textLight">🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#757575"
        editable={editable}
        className="flex-1 text-base text-text"
      />
    </View>
  );

  if (onPress && !editable) {
    return (
      <Pressable onPress={onPress} className="w-full">
        {inner}
      </Pressable>
    );
  }

  return inner;
}
