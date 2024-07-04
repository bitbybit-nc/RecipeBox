import { Stack, Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";


function Layout() {
  const colorScheme = useColorScheme();

  return (


    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: true }}
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
          headerShown: true,
          title: "Recipe Card",
        }}
      />
      <Stack.Screen
      name="edit-recipe-card"
      options={{
        headerShown: true,
        title: "Edit Recipe",
      }}

      
    />
    </Stack>
  )
}

export default Layout;