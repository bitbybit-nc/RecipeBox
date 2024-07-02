import { View, Text } from "react-native";

export function SmallErrorNotice({ message }) {
  return (
    <View className="bg-red-500 p-3 mt-3 rounded-md">
      <Text className="text-center text-white">{message}</Text>
    </View>
  );
}
