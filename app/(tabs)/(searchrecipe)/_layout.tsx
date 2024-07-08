import { Stack } from "expo-router";
import React from "react";
import { Button } from "react-native";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="filter" options={{ title: "Filter Recipes" }} />
      <Stack.Screen name="recipe" options={{ headerShown: false }} />
    </Stack>
  );
}

export default Layout;
