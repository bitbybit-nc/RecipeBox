import { CollectionList } from "@/components/CollectionList";
import { Link, router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/auth";
import { Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  const { updatedCollection, collectionAdded } = useLocalSearchParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const user = firebase.auth().currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      unmountOnBlur: true,
      headerLeft: () => (
        <Image
          className="w-[100] h-[25] mb-2 self-center justify-center"
          source={{
            uri: "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/logo.png?alt=media&token=50bf93ef-63c5-4d56-8b6e-7cf1ffbbf2e8",
          }}
        />
      ),
      headerRight: () => (
        <Pressable onPress={handleAddCollection}>
          <Feather name="plus" size={24} color="black" />
        </Pressable>
      ),
    });

    setLoading(true);
    setEmpty(false);

    firestore()
      .collection("Collections")
      .where("user_id", "==", user.uid)
      .onSnapshot((querySnapshot) => {
        const collectionsList = [];
        querySnapshot.forEach((documentSnapshot) => {
          collectionsList.push({
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });

        if (collectionsList.length === 0) {
          setEmpty(true);
        }

        const findMyRecipe = collectionsList.filter(
          (collection) => collection.data.name === "My Recipes"
        );
        const filtered = collectionsList.filter(
          (collection) => collection.data.name !== "My Recipes"
        );

        setCollections([...findMyRecipe, ...filtered]);
        setLoading(false);
      });
  }, [updatedCollection, collectionAdded]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  function handleAddCollection() {
    router.push("/add-collection");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView className="flex-1 pt-3 px-3.5">
        {empty ? (
          <View className="items-center">
            <Text>Add your collections here!</Text>
          </View>
        ) : (
          <View className="flex-wrap flex-row gap-4">
            {collections.map((collection, index) => (
              <View className="w-[45%]" key={index}>
                <CollectionList
                  collection={collection.data}
                  id={collection.id}
                  user={user.uid}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
