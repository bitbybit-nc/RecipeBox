import React, { useState } from "react";
import { Text, View, Pressable, TextInput } from "react-native";
import auth from "@react-native-firebase/auth";
import { SmallErrorNotice } from "@/components/SmallErrorNotice";
import { router } from "expo-router";

function PasswordReset() {
  const [email, setEmail] = useState();
  const [errorToggle, setErrorToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const resetPassword = async () => {
    try {
      if (!email) {
        console.log("CLICK", email);
        setErrorToggle(true);
        setErrorMessage("Please enter your email");
        return;
      }
      await auth().sendPasswordResetEmail(email);

      alert("Reset link sent to your email");
      router.replace("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-medium text-black">
        Reset Your Password
      </Text>

      <View className="m-3 p-3 w-screen items-center flex-row justify-center">
        <View className="w-9/12">
          <Text className="block text-sm font-medium leading-6 text-gray-900 mt-2">
            Email address
          </Text>
          <View className="mt-2 bg-slate-100 rounded-md p-2">
            <TextInput
              placeholder="sam.parker@gmail.com"
              value={email}
              onChangeText={setEmail}
              autoCorrect={false}
              autoCapitalize="none"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
            />
          </View>

          <Pressable
            className="mt-5 p-3 bg-orange-400 w-full rounded-md"
            onPress={resetPassword}
          >
            <Text className="text-white text-center text-sm font-medium leading-6">
              Reset Password
            </Text>
          </Pressable>

          {errorToggle ? <SmallErrorNotice message={errorMessage} /> : null}
        </View>
      </View>
    </View>
  );
}

export default PasswordReset;
