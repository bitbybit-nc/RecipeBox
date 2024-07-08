import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { firebase } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";

export default function MyProfileEditPage() {
  const [isLoading, setIsLoading] = useState(false);
  const user = firebase.auth().currentUser;
  const { username } = useLocalSearchParams();
  const [userDoc, setUserDoc] = useState({
    username: username,
    photoURL: user.photoURL,
  });
  const [userProfileDB, setUserProfileDB] = useState({
    photoURL: user.photoURL,
    displayName: user.displayName,
  });

  const changeProfileImage = async () => {
    console.log("im doing something!");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const reference = storage().ref(
        `Users/${user._user.uid}/${new Date().getTime()}.jpg`
      );

      console.log(reference, "<<reference");

      try {
        setIsLoading(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        console.log(imageUrlDownload, "imageURLDownload");
        setUserProfileDB({ ...userProfileDB, photoURL: imageUrlDownload });
        setUserDoc({ ...userDoc, photoURL: imageUrlDownload });
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  function handleInput(key, value) {
    setUserProfileDB((currentUserProfile) => {
      return { ...currentUserProfile, [key]: value };
    });
  }

  async function handleProfileSave() {
    try {
      user.updateProfile(userProfileDB);

      const querySnapshot = await firestore().collection("Users").get();
      querySnapshot.docs.map((doc) => {
        if (doc._data.uid === user.uid) {
          firestore().collection("Users").doc(doc.id).update(userDoc);
        }
      });

      await firebase.auth().currentUser.reload();
      router.replace("(profile)");
      console.log("Im saving!");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white m-1">
      <View className="w-8 h-8 rounded-full bg-orange-400 justify-center items-center absolute top-16 left-4">
        <Link href="(profile)">
          <Icon name="arrow-left" style={{ color: "white" }} />
        </Link>
      </View>

      <View className="relative mb-20">
        <Pressable
          onPress={changeProfileImage}
          className="bg-orange-400 w-6 h-6 rounded-full justify-center items-center"
        >
          {/* NB - when using className (w-6 h-6 rounded-full bg-orange-400 justify-center items-center absolute top-0 right-0) - the button doesn't work because of absolute */}
          <Icon name="pencil" style={{ color: "white" }} />
        </Pressable>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FB923C" />
        ) : (
          <View>
            <Image
              source={{ uri: userProfileDB.photoURL }}
              className="w-40 h-40 rounded-full self-center"
            />
          </View>
        )}
      </View>

      <View>
        <Text className="text-xs">Name</Text>
        <TextInput
          className="bg-zinc-200 rounded-md p-1 w-60"
          multiline={true}
          placeholder={user.displayName}
          onChangeText={(text) => handleInput("displayName", text)}
        />
      </View>

      <View>
        <Text className="text-xs">Username</Text>
        <TextInput
          className="bg-zinc-200 rounded-md p-1 w-60"
          multiline={true}
          placeholder={username}
          onChangeText={(text) => setUserDoc({ ...userDoc, username: text })}
        />
      </View>

      <Pressable
        className="mt-16 p-3 bg-orange-400 w-full rounded-md"
        onPress={handleProfileSave}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Save
        </Text>
      </Pressable>
    </View>
  );
}
