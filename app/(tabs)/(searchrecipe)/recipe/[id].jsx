import React, { useEffect, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { RecipeCard } from "../../../../components/RecipeCard";
import { Ionicons } from "@expo/vector-icons";

function SingleRecipe() {
  const { id, user, recipeUser, collectionAdded } = useLocalSearchParams();
  const navigation = useNavigation();
  const location = "(searchrecipe)";

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
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
