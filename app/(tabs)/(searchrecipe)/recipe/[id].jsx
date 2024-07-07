import React, { useEffect, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { RecipeCard } from "../../../../components/RecipeCard";
import { Ionicons } from "@expo/vector-icons";

function SingleRecipe() {
  const { id, user, recipeUser, collectionAdded } = useLocalSearchParams();
  const navigation = useNavigation();

  const handleEdit = () => {
    if (currentRecipe) {
      router.navigate({
        pathname: "/edit-recipe-card",
        params: {
          ...currentRecipe,
          recipeId: id,
        },
      });
    }
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
          <Text>Search</Text>
        </Pressable>
      ),
      unmountOnBlur: true,
    });
  }, []);

  return <RecipeCard id={id} user={user} collectionAdded={collectionAdded} />;
}

export default SingleRecipe;
