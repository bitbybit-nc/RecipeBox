import { View, Text, Image, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { useIsFocused } from "@react-navigation/native";

export function CollectionList({ collection, id, user }) {
  const [recipeInfo, setRecipeInfo] = useState([]);
  const [recipeImage, setRecipeImage] = useState([]);
  const isFocused = useIsFocused();

  function handleCollectionPress() {
    router.push({ pathname: `/collection/${id}`, params: { user: user } });
  }

  useEffect(() => {
    async function fetchRecipeImage() {
      try {
        const collectionInfo = await Promise.all(
          collection.recipes_list.map(async (doc) => {
            const recipeDoc = await firestore()
              .collection("Recipes")
              .doc(doc)
              .get();
            return recipeDoc.data();
          })
        );

        const sortedRecipes = collectionInfo.sort((a, b) => {
          if (a.timestamp.seconds === b.timestamp.seconds) {
            return b.timestamp.nanoseconds - a.timestamp.nanoseconds;
          }
          return b.timestamp.seconds - a.timestamp.seconds;
        });
        const recipeUrlArr = sortedRecipes.map((recipe) => {
          return recipe.recipe_img_url;
        });

        setRecipeInfo(sortedRecipes);
        setRecipeImage(recipeUrlArr);
      } catch (err) {
        console.log(err);
      }
    }
    if (collection.recipes_list.length > 0 && isFocused) {
      fetchRecipeImage();
    }
  }, [collection.recipes_list, isFocused]);

  const fillArray = (array) => {
    const copy = [...array].slice(0, 4);
    const toFill = 4 - recipeImage.length;
    for (let i = 0; i < toFill; i++) {
      copy.push("blank");
    }
    return copy.map((singleRecipe, index) => {
      if (singleRecipe !== "blank") {
        return (
          <Image
            className="w-[76px] h-[76px]"
            key={index}
            source={{ uri: singleRecipe }}
          />
        );
      } else {
        return <View key={index} className="w-[76] h-[76] bg-slate-200"></View>;
      }
    });
  };

  return (
    <View>
      <Pressable
        className="pt-2 pl-1.5 relative"
        onPress={handleCollectionPress}
      >
        <View className="h-[160px] w-[160px] mb-1 bg-white rounded gap-1">
          <View className="flex flex-row flex-wrap gap-0.5 rounded-xl overflow-hidden">
            {recipeImage.length === 0 && !collection.image_url ? (
              <Image
                className="w-[155px] h-[155px]"
                source={{
                  uri: "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Collections%2Fcollections-placeholder-1.png?alt=media&token=f3ce7b92-e7e9-4328-90ff-a59c4e0c8093",
                }}
              />
            ) : recipeImage.length === 0 && collection.image_url ? (
              <Image
                className="w-[155px] h-[155px]"
                source={{
                  uri: collection.image_url,
                }}
              />
            ) : recipeImage.length === 1 ? (
              <Image
                className="w-[155px] h-[155px]"
                source={{ uri: singleRecipe }}
              />
            ) : (
              fillArray(recipeImage)
            )}
          </View>
        </View>

        <View>
          {collection.name.length > 40 ? (
            <Text className="text-sm font-semibold mb-1">
              {collection.name.slice(0, 40) + "..."}
            </Text>
          ) : (
            <Text className="text-sm font-semibold  mb-1">
              {collection.name}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
