import { View, Text, TextInput, Pressable } from "react-native";
import auth from "@react-native-firebase/auth";
import { HelloWave } from "@/components/HelloWave";
import { SmallErrorNotice } from "@/components/SmallErrorNotice";
import { useState } from "react";
import { Link, Redirect, router } from "expo-router";
import { firebase } from "@react-native-firebase/auth";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorToggle, setErrorToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const user = firebase.auth().currentUser;
  if (user) {
    return <Redirect href="/(tabs)" />;
  }
  const loginUser = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log("User signed in!");
        router.replace("/(tabs)");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-email") {
          setErrorToggle(true);
          setErrorMessage("That email is invalid");
        }

        console.error(error);
      });
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-medium text-black">
        Login <HelloWave />{" "}
      </Text>

      <View className="m-3 p-3 w-screen items-center flex-row justify-center">
        <View className="w-9/12">
          <Text className="block text-sm font-medium leading-6 text-gray-900">
            Email address
          </Text>
          <View className="mt-2 bg-slate-100 rounded-md p-2">
            <TextInput
              placeholder="yourname@gmail.com"
              value={email}
              onChangeText={setEmail}
              autoCorrect={false}
              autoCapitalize="none"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
            />
          </View>

          <Text className="block text-sm font-medium leading-6 text-gray-900 mt-2">
            Password
          </Text>
          <View className="mt-2 bg-slate-100 rounded-md p-2">
            <TextInput
              placeholder="*********"
              value={password}
              onChangeText={setPassword}
              autoCorrect={false}
              secureTextEntry
              autoCapitalize="none"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
            />
          </View>

          <Pressable
            className="mt-5 p-3 bg-orange-400 w-full rounded-md"
            onPress={loginUser}
          >
            <Text className="text-white text-center text-sm font-medium leading-6">
              Log In
            </Text>
          </Pressable>

          {errorToggle ? <SmallErrorNotice message={errorMessage} /> : null}

          <View className="mt-10">
            <Link href="/create-user">
              <Text className="text-center text-gray-600">
                Create An Account
              </Text>
            </Link>

            <Link href="/password-reset" className="mt-5">
              <Text className="text-center text-gray-600">
                Forgot Your Password?
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
