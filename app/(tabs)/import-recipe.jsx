import { View, Text, TextInput, Button } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { useRouter, Link } from "expo-router";

export default function ImportRecipePage() {
  const [url, setUrl] = useState("");
  const router = useRouter()

  function handleSubmit() {
    router.push({ pathname: '../pages/recipe-preview', params: { url } })
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-white"
    >
      <TextInput placeholder="Insert recipe URL here" value={url} onChangeText={setUrl} />
      <Button
        onPress= {handleSubmit}
        title="Submit"
        accessibilityLabel="Submit URL button"
        />
    </View>
  );
}