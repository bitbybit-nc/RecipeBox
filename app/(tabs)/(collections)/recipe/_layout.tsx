import { Stack } from "expo-router";
import React from "react";
import { Button } from "react-native";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-to-collection"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default Layout;
