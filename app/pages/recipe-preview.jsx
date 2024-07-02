import { useLocalSearchParams, useRoute } from "expo-router";
import { View, Text } from "react-native";

export default function RecipePreview() {
const params = useLocalSearchParams()

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>source URL: {params.url}</Text>
    </View>
  );
}
