import React from "react";
import { View, Text, TextInput, Button, Image, Pressable } from "react-native";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";

function EditCollection() {
  const [collectionName, setCollectionName] = useState("");
  const [url, setUrl] = useState("");
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [doc, setDoc] = useState("");
  const { id } = useLocalSearchParams();

  const user = firebase.auth().currentUser;

  useEffect(() => {
    if (url !== "") {
      setVisible(true);
      setImage(null);
    } else {
      setVisible(false);
    }
    console.log(id)
  }, [url]);

  const handleEditCollection = async () => {
    firestore()
      .collection("Collections")
      .doc("ABC")
      .update({
        name: collectionName,
        image_url: image ? image.assets[0].uri : url,
      })
      .then(() => {
        console.log("User updated!");
      });

    setCollectionName("");
    setUrl("");
    setImage(null);
    setVisible(false);
    console.log("CLICK");
  };

  const pickImage = async () => {
    setUrl("");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Edit Collection</Text>
      <View className="mb-4">
        <Pressable onPress={pickImage}>
          {image && (
            <Image
              source={{ uri: image }}
              className="w-32 h-32 rounded-full self-center "
            />
          )}
          <Text className="text-center text-sm font-medium leading-6">
            Upload Collection Image
          </Text>
        </Pressable>
      </View>
      {visible && (
        <View className="items-center justify-center mt-4">
          {url && (
            <Image
              source={{ uri: url }}
              className="w-32 h-32 rounded-full self-center"
            />
          )}
        </View>
      )}

      <TextInput
        className="h-10 border border-gray-400 mb-4 px-2"
        placeholder="Image URL"
        value={url}
        onChangeText={setUrl}
      />

      <TextInput
        className="h-10 border border-gray-400 mb-4 px-2"
        placeholder="Collection Name"
        value={collectionName}
        onChangeText={setCollectionName}
      />

      <Button title="Confirm" onPress={handleEditCollection} />
    </View>
  );
}

export default EditCollection;