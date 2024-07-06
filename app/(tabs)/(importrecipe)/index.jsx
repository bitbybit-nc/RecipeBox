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
      <TextInput
        style={{
          backgroundColor: "#dedede",
          height: 30,
          fontSize: 13,
          width: 300,
        }}
        placeholder="Insert recipe URL here - index.jsx"
        value={url}
        onChangeText={setUrl}
      />

      <Pressable
        className="mt-5 p-3 bg-orange-400 w-full rounded-md"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Submit URL
        </Text>
      </Pressable>
    </View>
  );
}
