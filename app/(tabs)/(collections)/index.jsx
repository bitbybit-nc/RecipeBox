import { CollectionList } from "@/components/CollectionList";
import { Link, router, useLocalSearchParams } from "expo-router";
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    // marginBottom: 16,
    textAlign: "center",
  },
  addButton: {
    position: "centre",
    bottom: 32,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#FF9F00",
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    // paddingVertical: 12,
    // paddingHorizontal: 24,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // paddingHorizontal: 16,
  },

  scrollViewContent: {
    flexGrow: 1,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // paddingHorizontal: 16,
    // marginBottom: 16,
  },
  collectionItem: {
    width: "48%",
    // marginBottom: 16,
  },
});

export default function HomeScreen() {
  const { updatedCollection, collectionAdded } = useLocalSearchParams();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const user = firebase.auth().currentUser;

  useEffect(() => {
    setLoading(true);
    setEmpty(false);
    firestore()
      .collection("Collections")
      .get()
      .then((querySnapshot) => {
        const collectionsList = [];
        querySnapshot.forEach((documentSnapshot) => {
          collectionsList.push({
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });

        const filteredList = collectionsList.filter((collection) => {
          return collection.data.user_id === user.uid;
        });

        if (filteredList.length === 0) {
          setEmpty(true);
        }

        setCollections(filteredList);
        setLoading(false);
      });
  }, [updatedCollection, collectionAdded]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
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
              <View className="w-48" key={index}>
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

      {/* <View className="mx-32 p-1 bg-orange-400 w-40 rounded-full absolute bottom-2">
        <Button
          className="m-0 p-0 text-lg font-medium"
          color={"white"}
          onPress={handleAddCollection}
          title="Add Collection"
        />
      </View> */}

      <View className="items-center">
        <Pressable
          className="p-2 bg-orange-400 w-40 rounded-full absolute bottom-2 items-center"
          onPress={handleAddCollection}
        >
          <Text className="text-white text-center text-lg font-medium leading-6">
            Add Collection
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
