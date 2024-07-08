import { View, Text, TextInput, Button, Pressable } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { useRouter, Link } from "expo-router";

export default function ImportRecipePage() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleSubmit() {
    router.push({ pathname: "/recipe-preview", params: { url } });
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="p-4 w-full">
        <View className="mt-2 bg-slate-100 rounded-md p-2">
          <TextInput
            placeholder="Insert recipe URL here"
            value={url}
            onChangeText={setUrl}
            autoCorrect={false}
            autoCapitalize="none"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
          />
        </View>

        <Pressable
          className="mt-5 p-3 bg-orange-400 w-full rounded-md"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center text-sm font-medium leading-6">
            Submit URL
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
