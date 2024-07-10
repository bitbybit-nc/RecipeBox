import React, { useEffect, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { RecipeCard } from "../../../../components/RecipeCard";

function SingleRecipe() {
  const { id, user, recipeUser, collectionAdded, updatedRecipe } =
    useLocalSearchParams();
  const navigation = useNavigation();
  const location = "(collections)";

  const handleEdit = () => {
    router.navigate({
      pathname: `/edit-recipe/${id}`,
      params: { user: user },
    });
  };

  useEffect(() => {
    navigation.setOptions({
      unmountOnBlur: true,
    });
  }, []);

  return (
    <RecipeCard
      id={id}
      user={user}
      collectionAdded={collectionAdded}
      location={location}
      updatedRecipe={updatedRecipe}
    />
  );
}

export default SingleRecipe;
