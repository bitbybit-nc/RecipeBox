import React, { useEffect, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { RecipeCard } from "../../../../components/RecipeCard";

function SingleRecipe() {
  const { id, user, recipeUser, collectionAdded } = useLocalSearchParams();
  const navigation = useNavigation();
  const location = "(collections)";
  const handleEdit = () => {
    router.navigate({
      pathname: `/edit-recipe/${id}`,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerRight: () => {
        return user === recipeUser ? (
          <Button title="Edit" onPress={handleEdit} />
        ) : null;
      },
      headerLeft: () => (
        <Pressable
          onPress={() => router.back()}
          className="flex-row justify-center items-center"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>Back</Text>
        </Pressable>
      ),
      unmountOnBlur: true,
    });
  }, []);

  return (
    <RecipeCard
      id={id}
      user={user}
      collectionAdded={collectionAdded}
      location={location}
    />
  );
}

export default SingleRecipe;
