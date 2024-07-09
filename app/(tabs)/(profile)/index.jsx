import { View, Text, Pressable, StyleSheet } from "react-native";
import auth from "@react-native-firebase/auth";
import { Link, router } from "expo-router";
import { Image } from "expo-image";

import { firebase } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";

export default function MyProfilePage() {
  const user = firebase.auth().currentUser;
  const [username, setUsername] = useState(null);
  const [displayNameTest, setDisplayNameTest] = useState(user.displayName);

  const logoutUser = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        router.replace("/");
      });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userCollection = await firestore().collection("Users").get();
      userCollection.docs.map((doc) => {
        if (doc._data.uid === user.uid) {
          setUsername(doc._data.username);
        }
      });
    };
    fetchCurrentUser();

    firebase
      .auth()
      .currentUser.reload()
      .then(() => {
        const updatedUser = firebase.auth().currentUser;
        setDisplayNameTest(updatedUser.displayName);
      });
  }, [user]);

  return (
    <View className="flex-1 items-center justify-center bg-white m-1">
      <View className="w-8 h-8 rounded-full bg-orange-400 justify-center items-center absolute top-16 right-4">
        <Link href={{ pathname: "/profile-edit", params: { username } }}>
          <Icon name="pencil" style={{ color: "white" }} />
        </Link>
      </View>
      <View className="relative mb-20">
        <Image
          source={user.photoURL}
          className="mt-24 w-40 h-40 rounded-full self-center"
        />
      </View>

      <View></View>
      <View>
        <Text className="mt-3">Name: {displayNameTest}</Text>
        <Text className="mt-3">Username: {username}</Text>
        <Text className="mt-3">Email: {user.email}</Text>
      </View>

      <Text className="mt-10">Public Profile coming soon!</Text>

      <Pressable
        className="p-3 bg-orange-400 w-full rounded-md mt-20"
        onPress={logoutUser}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Log Out{" "}
        </Text>
      </Pressable>
    </View>
  );
}
