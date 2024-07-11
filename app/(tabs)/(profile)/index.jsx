import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import auth from "@react-native-firebase/auth";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { firebase } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { RecipeSmallCard } from "../../../components/RecipeSmallCard";
import { ScrollView } from "react-native";

export default function MyProfilePage() {
  const user = firebase.auth().currentUser;
  const [username, setUsername] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [displayNameTest, setDisplayNameTest] = useState(user.displayName);
  const [dietaryOptions, setDietaryOptions] = useState("");

  const logoutUser = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        router.replace("/");
      });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userCollection = await firestore().collection("Users").get();
      userCollection.docs.map((doc) => {
        if (doc.data().uid === user.uid) {
          setUsername(doc.data().username);
        }
      });
    };

    fetchCurrentUser();

    const fetchRecipes = async () => {
      const querySnapshot = await firestore()
        .collection("Recipes")
        .where("uid", "==", user.uid)
        .get();

      const recipesList = [];
      querySnapshot.forEach((documentSnapshot) => {
        recipesList.push({
          item: {
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          },
        });
      });

      setRecipes(recipesList);
      setLoading(false);
    };

    fetchRecipes();

    const reloadUser = async () => {
      await firebase.auth().currentUser.reload();
      const updatedUser = firebase.auth().currentUser;
      setDisplayNameTest(updatedUser.displayName);
    };

    reloadUser();
  }, []);

  return (
    <ScrollView className="flex-1 pt-16 px-2 bg-white">
      <View className="px-4">
        <View className="flex-row items-center justify-between">
          <Image
            className="w-[130] h-[34] mb-2 self-center justify-center"
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/logo.png?alt=media&token=50bf93ef-63c5-4d56-8b6e-7cf1ffbbf2e8",
            }}
          />

          <View className="w-8 h-8 rounded-full bg-orange-400 justify-center items-center">
            <Link href={{ pathname: "/profile-edit", params: { username } }}>
              <Icon name="pencil" style={{ color: "white" }} />
            </Link>
          </View>
        </View>

        <View className="flex flex-row mt-2 mb-6 items-center">
          <Image source={user.photoURL} className="w-24 h-24 rounded-full" />
          <View className="ml-5">
            <View>
              <Text className="text-leftleading-4 text-sm font-semibold">
                {displayNameTest}
              </Text>
              <Text className="text-sm w-60 text-justify">
                Vegetarian guru, looking to connect with the entire world,
                through our one unifying language, FOOD!
              </Text>
            </View>
            {/* <Text className="font-normal"> {displayNameTest}</Text>
              </Text>
            </View>

            <View className="mt-3">
              <Text className="text-leftleading-4 text-sm font-semibold">
                Username:
                <Text className="font-normal"> {username}</Text>
              </Text>
            </View>

            <View className="mt-3">
              <Text className="text-left leading-4 text-sm font-semibold">
                Email:
                <Text className="font-normal"> {user.email}</Text>
              </Text>
            </View> */}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold">Dietary Preferences</Text>
          <View className="flex flex-row">
            <View className="mb-2 bg-white rounded-full p-1 mx-0.5 items-center">
              <Image
                className="w-12 h-12"
                source={{
                  uri: "https://img.icons8.com/?size=100&id=ty3PIygUOqhK&format=png&color=000000",
                }}
              />
              <Text className="text-[10px]">Dairy Free</Text>
            </View>
            <View className="mb-2 bg-white rounded-full p-1 mx-0.5 items-center">
              <Image
                className="w-12 h-12"
                source={{
                  uri: "https://img.icons8.com/?size=100&id=13302&format=png&color=0000000",
                }}
              />
              <Text className="text-[10px]">Gluten Free</Text>
            </View>
          </View>
        </View>

        {/* <View className="rounded-lg mb-6">
          <Text className="text-sm font-semibold">About me</Text>
          <Text className="text-sm">
            Vegetarian guru, looking to connect with the entire world, through
            our one unifying language, FOOD!
          </Text>
        </View> */}
      </View>

      <View>
        <Text className="text-center font-medium mb-4 text-lg">My Recipes</Text>
        <View>
          {!recipes.length ? (
            <Text className="text-center mt-20">No Recipes Found</Text>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {recipes.map((recipe, index) => {
                return (
                  <RecipeSmallCard
                    key={index}
                    recipe={recipe}
                    user={user.uid}
                    location={"(profile)"}
                  />
                );
              })}
            </View>
          )}
        </View>
      </View>

      <Pressable
        className="p-3 bg-orange-400 w-full rounded-md mt-20 mb-20"
        onPress={logoutUser}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Log Out{" "}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
