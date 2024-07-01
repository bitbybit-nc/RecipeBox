import { View, Text } from "react-native";
import { HelloWave } from "@/components/HelloWave";

export default function MyProfilePage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>This is my profile page</Text>
      <HelloWave />
    </View>
  );
}
