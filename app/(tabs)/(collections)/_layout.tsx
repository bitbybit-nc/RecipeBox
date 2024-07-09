import { Stack } from "expo-router";
import React from "react";
import { Button } from "react-native";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "My Collections" }} />
      <Stack.Screen
        name="add-collection"
        options={{ title: "Add Collection" }}
      />
      <Stack.Screen
        name="edit-collection/[id]"
        options={{ title: "Edit Collection" }}
      />
      <Stack.Screen
        name="edit-recipe/[id]"
        options={{ title: "Edit Recipe" }}
      />
      <Stack.Screen name="recipe" options={{ headerShown: false }} />
      <Stack.Screen name="collection/[id]" options={{ title: "" }} />
    </Stack>
  );
}

export default Layout;
