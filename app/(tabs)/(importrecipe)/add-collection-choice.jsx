import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import firestore, { FieldValue } from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

function AddCollectionToNewRecipe() {
  const { currentSelected, id } = useLocalSearchParams();
  const [collectionList, setCollectionList] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState();
  const user = firebase.auth().currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const collectionsSnapshot = await firestore()
        .collection("Collections")
        .where("user_id", "==", user.uid)
        .get();
      const collections = [];
      collectionsSnapshot.forEach((doc) => {
        collections.push({ data: doc.data(), id: doc.id });
      });
      if (currentSelected) {
        const filtered = collections.filter(
          (collection) => collection.id !== currentSelected
        );

        setCollectionList(filtered);
      } else {
        setCollectionList(collections);
      }
    };
    fetchData();
  }, [id]);

  const handleSelectCollection = () => {
    router.navigate({
      pathname: "/(importrecipe)",
      params: { id: id, currentSelected: selectedCollection },
    });
  };

  return (
    <View className="justify-between h-full py-20">
      <Text className="text-lg font-medium text-center mt-3">
        CHOOSE A COLLECTION{" "}
      </Text>

      <View>
        <Picker
          selectedValue={selectedCollection}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedCollection(itemValue)
          }
        >
          {collectionList.map((collection, index) => (
            <Picker.Item
              label={collection.data.name}
              value={collection.id}
              key={index}
            />
          ))}
        </Picker>
      </View>

      <Pressable
        className="mt-5 p-3 bg-orange-400 w-2/3 rounded-md self-center"
        onPress={handleSelectCollection}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Add To Collection
        </Text>
      </Pressable>
    </View>
  );
}

export default AddCollectionToNewRecipe;
