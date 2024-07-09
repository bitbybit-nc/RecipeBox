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

        setRecipeInfo(collectionInfo);

        const sortedRecipes = recipeInfo.sort((a, b) => {
          if (a.timestamp.seconds === b.timestamp.seconds) {
            return b.timestamp.nanoseconds - a.timestamp.nanoseconds;
          }
          return b.timestamp.seconds - a.timestamp.seconds;
        });
        const recipeUrlArr = sortedRecipes.map((recipe) => {
          return recipe.recipe_img_url;
        });

        setRecipeImage(recipeUrlArr);
      } catch (err) {
        console.log(err);
      }
    }
    fetchRecipeImage();
  }, [collection.recipes_list, isFocused]);

  return (
    <View>
      <Pressable
        className="pt-2 pl-1.5 border border-orange-200 rounded-xl relative"
        onPress={handleCollectionPress}
      >
        <View className="h-[180px] w-[180px] mb-1 bg-white rounded gap-1">
          <View className="flex flex-row flex-wrap gap-0.5">
            {recipeImage.length === 0 && !collection.image_url ? (
              <Image
                className="w-[174px] h-[174px]"
                source={{
                  uri: "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Collections%2Fcollections-placeholder-1.png?alt=media&token=f3ce7b92-e7e9-4328-90ff-a59c4e0c8093",
                }}
              />
            ) : recipeImage.length === 0 && collection.image_url ? (
              <Image
                className="w-[174px] h-[174px]"
                source={{
                  uri: collection.image_url,
                }}
              />
            ) : (
              recipeImage.slice(0, 4).map((singleRecipe, index) => {
                return (
                  <Image
                    className="w-[86px] h-[86px]"
                    key={index}
                    source={{ uri: singleRecipe }}
                  />
                );
              })
            )}
          </View>
        </View>

        <View>
          {collection.name.length > 20 ? (
            <Text className="text-sm font-semibold text-base mb-1">
              {collection.name.slice(0, 19) + "..."}
            </Text>
          ) : (
            <Text className="text-sm font-semibold text-base mb-1">
              {collection.name}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
