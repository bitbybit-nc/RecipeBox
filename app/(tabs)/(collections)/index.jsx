import { CollectionList } from "@/components/CollectionList";
import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/auth";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  scrollViewContent: {
    flexGrow: 1,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  collectionItem: {
    width: "48%",
    marginBottom: 16,
  },
});

export default function HomeScreen() {
  const { collectionName, url, collectionDescription, image, collectionAdded } =
    useLocalSearchParams();
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
  }, [collectionName, url, collectionDescription, image, collectionAdded]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        My Collections
      </Text>
      <ScrollView style={{ flex: 1 }}>
        {empty ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text>Add your collections here!</Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {collections.map((collection, index) => (
              <View style={{ width: "48%", marginBottom: 16 }} key={index}>
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
      <View
        style={{
          position: "absolute",
          bottom: 32,
          left: "43%",
          transform: [{ translateX: -50 }],
          backgroundColor: "#FF9F00",
          borderRadius: 20,
          paddingHorizontal: 14,
        }}
      >
        <Link
          href="/add-collection"
          collections={collections}
          setCollections={setCollections}
          asChild
        >
          <Button
            title="Add Collection +"
            color="white"
            style={styles.addButton}
          />
        </Link>
      </View>
    </View>
  );
}
