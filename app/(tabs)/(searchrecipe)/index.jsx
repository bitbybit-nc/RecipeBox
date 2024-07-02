import { View, Text, Button } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { Link } from "expo-router";

export default function SearchRecipesPage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>This is the search page</Text>
      <HelloWave />

      <Link href={"/search-view"}>TAKE ME TO INNER PAGE</Link>
    </View>
  );
}
