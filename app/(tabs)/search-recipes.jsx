import { View, Text } from "react-native";
import { HelloWave } from "@/components/HelloWave";

export default function SearchRecipesPage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>This is the search page</Text>
      <HelloWave />
    </View>
  );
}
