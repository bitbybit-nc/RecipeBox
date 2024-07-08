import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import EditCollection from "@/app/(tabs)/(collections)/edit-collection/[id]";
import Icon from "react-native-vector-icons/FontAwesome";

const styles = StyleSheet.create({
  container: {
    width: "48%",
    padding: 16,
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  link: {
    fontSize: 16,
    color: "blue",
  },
  editButton: {
    position: "absolute",
    top: -14,
    right: -15,
    backgroundColor: "#FF9F00",
    borderRadius: 16,
    padding: 4,
  },
  editIcon: {
    fontSize: 15,
    color: "white",
  },
});

export function CollectionList({ collection, id, user }) {
  const handleDeleteCollection = () => {
    firestore()
      .collection("Users")
      .doc("ABC")
      .delete()
      .then(() => {
        console.log("User deleted!");
      });
  };

  return (
    <View
      className="p-4 bg-[#fffdd0] rounded-lg shadow-md"
      style={{ width: "100%" }}
    >
      <View>
        <Text className="text-sm font-semibold mb-2 text-[16px]">
          {collection.name}
        </Text>
        <View style={styles.editButton}>
          <Link href={`/edit-collection/${id}`} asChild>
            <Icon name="pencil" style={styles.editIcon} />
          </Link>
        </View>
      </View>
      <View
        className="h-40 mb-4 bg-gray-300 rounded"
        style={{
          width: "100%",
          height: 150,
          borderRadius: 8,
          backgroundColor: "#ddd",
          marginBottom: 8,
        }}
      >
        <Image
          source={{ uri: collection.image_url }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
        />
      </View>
      <TouchableOpacity style={{ marginTop: 8 }}>
        <Link
          href={{ pathname: `/collection/${id}`, params: { user: user } }}
          className="text-blue-500 text-sm"
        >
          View Collection
        </Link>
      </TouchableOpacity>
    </View>
  );
}
