import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import firestore, { FieldValue } from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/auth";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export function AddCollectionInfo({ currentCollections, id, location }) {
  const [collectionList, setCollectionList] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState();
  const [isPickerHidden, setIsPickerHidden] = useState(false);
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
      const collectionWithouDefault = collections.filter(
        (collection) => collection.data.name !== "My Recipes"
      );
      if (currentCollections) {
        const currentCollecttionIds = currentCollections.map((item) => item.id);
        const isSubset = (array1, array2) =>
          array2.every((element) => !array1.includes(element));

        const filtered = collectionWithouDefault.filter((collection) =>
          isSubset(collection.id, currentCollecttionIds)
        );

        setCollectionList(filtered);
        if (!filtered.length) {
          setIsPickerHidden(true);
        } else {
          setSelectedCollection(filtered[0].id);
        }
      } else {
        setCollectionList(collectionWithouDefault);
        setSelectedCollection(collectionWithouDefault[0].id);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCollection = async () => {
    try {
      const recipeDoc = await firestore().collection("Recipes").doc(id).get();
      const recipeData = recipeDoc.data();
      const savedCount = recipeData.saved_count;

      const currentCollectionRecipes = currentCollections
        .map((item) => item.data.recipes_list)
        .flat();

      if (!currentCollectionRecipes.includes(selectedCollection)) {
        await firestore()
          .collection("Collections")
          .doc(selectedCollection)
          .update({
            recipes_list: FieldValue.arrayUnion(id),
          });

        await firestore()
          .collection("Recipes")
          .doc(id)
          .update({
            saved_count: savedCount + 1,
          });

        alert(`Added To Your Collection`);
        router.navigate({
          pathname: `/${location}/recipe/${id}`,
          params: {
            collectionAdded: selectedCollection,
            user: user.uid,
            updatedRecipe: true,
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View className="justify-between h-full py-10">
      <Text className="text-lg font-medium text-center mt-3">
        CHOOSE A COLLECTION{" "}
      </Text>

      {isPickerHidden ? (
        <View className="items-center">
          <Text>Added To All Your Collections!</Text>
        </View>
      ) : (
        <View>
          {collectionList.length ? (
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
          ) : null}
        </View>
      )}

      {isPickerHidden ? (
        <View className="mt-5 p-3 bg-slate-400 w-2/3 rounded-md self-center">
          <Text className="text-white text-center text-sm font-medium leading-6">
            Add To Collection
          </Text>
        </View>
      ) : (
        <Pressable
          className="mt-5 p-3 bg-orange-400 w-2/3 rounded-md self-center"
          onPress={handleAddToCollection}
        >
          <Text className="text-white text-center text-sm font-medium leading-6">
            Add To Collection
          </Text>
        </Pressable>
      )}
    </View>
  );
}
