import { View, Text } from "react-native";
import { HelloWave } from "@/components/HelloWave";

export default function ImportRecipePage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>This is the import a recipe page</Text>
      <HelloWave />
    </View>
  );
}
