import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { SmallErrorNotice } from "@/components/SmallErrorNotice";
import { useState } from "react";
import { router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";

export default function SigninPage() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorToggle, setErrorToggle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createNewUser = async () => {
    try {
      setIsLoading(true);
      const createUser = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      const reference = await storage().ref(
        "Users/" +
          createUser.user.uid +
          "/" +
          new Date().getTime() +
          "-" +
          createUser.user.uid +
          ".jpg"
      );

      if (!image) {
        await createUser.user.updateProfile({
          displayName: name,
          photoURL:
            "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Users%2Fplaceholder.png?alt=media&token=6fec34d3-f856-4565-a218-f822ca392a70",
        });
      } else {
        await reference.putFile(image);
        const url = await reference.getDownloadURL();

        await createUser.user.updateProfile({
          displayName: name,
          photoURL: url,
        });
      }

      await firestore().collection("Users").add({
        uid: createUser.user.uid,
        username: username,
      });

      console.log("REGISTERED");

      setIsLoading(false);
      setErrorToggle(false);
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);

      if (error.code === "auth/email-already-in-use") {
        console.log("That email address is already in use!");
        setErrorToggle(true);
        setErrorMessage("That email address is already in use!");
      }

      if (error.code === "auth/invalid-email") {
        console.log("That email address is invalid!");
        setErrorToggle(true);
        setErrorMessage("That email address is invalid!");
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {isLoading ? (
        <Text className="text-xl font-medium text-slate-700 mb-16">
          Creating Your Account {name}
        </Text>
      ) : (
        <Text className="text-xl font-medium text-black">
          Create An Account
        </Text>
      )}

      {isLoading ? (
        <View className="items-center justify-center bg-white">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View className="m-3 p-3 w-screen items-center flex-row justify-center">
          <View className="w-9/12">
            <View className="mb-4">
              <Pressable onPress={pickImage}>
                {image && (
                  <Image
                    source={{ uri: image }}
                    className="w-32 h-32 rounded-full self-center "
                  />
                )}
                <Text className="text-center text-sm font-medium leading-6">
                  Upload Profile Image
                </Text>
              </Pressable>
            </View>

            <Text className="block text-sm font-medium leading-6 text-gray-900">
              Your Name
            </Text>
            <View className="mt-2 bg-slate-100 rounded-md p-2">
              <TextInput
                placeholder="Sam Parker"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
                autoCapitalize="none"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
              />
            </View>

            <Text className="block text-sm font-medium leading-6 text-gray-900 mt-2">
              Username
            </Text>
            <View className="mt-2 bg-slate-100 rounded-md p-2">
              <TextInput
                placeholder="samParker1"
                value={username}
                onChangeText={setUsername}
                autoCorrect={false}
                autoCapitalize="none"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
              />
            </View>

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
              onPress={createNewUser}
            >
              <Text className="text-white text-center text-sm font-medium leading-6">
                Create Account
              </Text>
            </Pressable>

            {errorToggle ? <SmallErrorNotice message={errorMessage} /> : null}
          </View>
        </View>
      )}
    </View>
  );
}
