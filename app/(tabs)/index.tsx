import { View, Text } from "react-native";
import { HelloWave } from "@/components/HelloWave";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>This is the index page</Text>
      <HelloWave />
    </View>
  );
}
