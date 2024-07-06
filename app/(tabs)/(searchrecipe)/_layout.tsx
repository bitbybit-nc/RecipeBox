import { Stack } from "expo-router";
import React from "react";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{}} />
      <Stack.Screen name="search-view" options={{}} />
      <Stack.Screen name="filter" options={{ title: "Filter Recipes" }} />
    </Stack>
  );
}

export default Layout;
