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
