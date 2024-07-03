import { Stack } from "expo-router";
import React from "react";

function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="recipe-preview"
        options={{
          headerShown: true,
          title: "Recipe Preview",
        }}
      />
        <Stack.Screen
          name="recipe-card"
          options={{
            headerShown: false,
            title: "Recipe Card",
          }}
        />
    </Stack>
  )
}

export default Layout;