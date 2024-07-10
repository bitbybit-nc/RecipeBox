import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Pressable,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";

function AddCollection() {
  const user = auth().currentUser;
  const router = useRouter();
  const [collectionName, setCollectionName] = useState("");
  const [image, setImage] = useState(null);
  const [collectionVisibility, setCollectionVisibility] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFromPencil, setIsLoadingFromPencil] = useState(false);

  const handleAddCollection = async () => {
    if (!collectionName) {
      alert("Please add a collection name");
    } else {
      firestore()
        .collection("Collections")
        .add({
          name: collectionName,
          recipes_list: [],
          is_public: collectionVisibility,
          user_id: user.uid,
          image_url: image
            ? image
            : "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Collections%2Fcollections-placeholder-1.png?alt=media&token=f3ce7b92-e7e9-4328-90ff-a59c4e0c8093",
        })
        .then(() => {
          router.navigate({
            pathname: "/(collections)",
            params: {
              collectionAdded: JSON.stringify({
                collectionName: collectionName,
                image: image,
                collectionVisibility,
              }),
            },
          });
          console.log("Collection added!");
          setCollectionName("");
          setImage(null);
          setCollectionVisibility(false);
        });
    }
  };

  const handleCollectionVisiblity = async () => {
    setCollectionVisibility(!collectionVisibility);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const reference = storage().ref(
        `Users/Collections/${user.uid}/${new Date().getTime()}.jpg`
      );

      try {
        setIsLoading(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        setImage(imageUrlDownload);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    }
  };

  const pickImageFromPencil = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const reference = await storage().ref(
        `Recipes/${user._user.uid}/${new Date().getTime()}.jpg`
      );

      try {
        setIsLoadingFromPencil(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        setImage(imageUrlDownload);
        setIsLoadingFromPencil(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <View>
        {isLoadingFromPencil ? (
          <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-7">
            <ActivityIndicator size="large" color="#FB923C" />
          </View>
        ) : (
          image && (
            <View className="w-full relative mb-4">
              <Image
                source={{ uri: image }}
                className="w-full h-40 rounded-lg"
              />
              <View className="absolute top-3 right-3">
                <Pressable
                  className="bg-orange-400 w-6 h-6 rounded-full justify-center items-center"
                  onPress={pickImageFromPencil}
                >
                  <Icon name="pencil" style={{ color: "white" }} />
                </Pressable>
              </View>
            </View>
          )
        )}
      </View>
      {image ? null : isLoading ? (
        <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-7">
          <ActivityIndicator size="large" color="#FB923C" />
        </View>
      ) : (
        <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-5">
          <Button title="Add Recipe Image" onPress={pickImage} />
        </View>
      )}

      <View>
        <TextInput
          className="bg-slate-100 rounded-md p-3 mb-4"
          placeholder="Collection Name"
          value={collectionName}
          onChangeText={setCollectionName}
        />
      </View>

      <View className="flex-row items-center gap-x-3 mt-4 mb-4">
        <Switch
          trackColor={{ false: "#767577", true: "rgb(54 83 20)" }}
          className="scale-75"
          thumbColor={collectionVisibility ? "rgb(134 239 172)" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={handleCollectionVisiblity}
          value={collectionVisibility}
        />
        <Text className="text-lg text-black">
          {collectionVisibility
            ? "Collection is: Public"
            : "Collection is: Private"}
        </Text>
      </View>

      <Pressable
        className="mt-5 p-3 bg-orange-400 w-full rounded-md"
        onPress={handleAddCollection}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Submit Recipe
        </Text>
      </Pressable>
    </View>
  );
}

export default AddCollection;
