import { View, Text, Pressable } from "react-native";
import auth from "@react-native-firebase/auth";
import { router } from "expo-router";
import { Image } from "expo-image";

import { firebase } from "@react-native-firebase/auth";

export default function MyProfilePage() {
  const user = firebase.auth().currentUser;

  const logoutUser = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        router.replace("/");
      });
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>This is my profile page</Text>
      <View>
        <Image
          source={user.photoURL}
          className="w-40 h-40 rounded-full self-center"
        />
      </View>
      <Text className="mt-3">{user.displayName}</Text>

      <Pressable
        className="mt-5 p-3 bg-orange-400 w-full rounded-md"
        onPress={logoutUser}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Log Out{" "}
        </Text>
      </Pressable>
    </View>
  );
}
