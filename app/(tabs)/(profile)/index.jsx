import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import auth from "@react-native-firebase/auth";
import { Link, router, } from "expo-router";
import { Image } from "expo-image";
import { firebase } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { RecipeSmallCard } from "../../../components/RecipeSmallCard"

export default function MyProfilePage() {
  const user = firebase.auth().currentUser;
  const [username, setUsername] = useState(null);
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [displayNameTest, setDisplayNameTest] = useState(user.displayName);
  const [dietaryOptions, setDietaryOptions] = useState("")

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
        if (doc._data.uid === user.uid) {
          setUsername(doc._data.username);
        }
      });
    };
    fetchCurrentUser();

    firestore()
      .collection("Recipes")
      .where("uid", "==", user.uid)
      .get()
      .then((querySnapshot) => {
        const recipesList = [];
        querySnapshot.forEach((documentSnapshot) => {
          recipesList.push({
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setRecipes(recipesList);
        console.log(recipes)
        setLoading(false);
      });

    firebase
      .auth()
      .currentUser.reload()
      .then(() => {
        const updatedUser = firebase.auth().currentUser;
        setDisplayNameTest(updatedUser.displayName);
      });
  }, [user]);
  
  useEffect(() => {
    const fetchDietaryOptions = async () => {
      const result = await firestore().collection("Dietary_needs").get();
      const options = result.docs.map((doc) => ({
        name: doc._data.slug,
        displayName: doc._data.display_name,
        imgUrl: doc._data.image_url,
        slug: doc._data.slug,
        id: doc.id,
      }));
      if (!dietariesChosen.length) {
        setDietaryOptions(options);
      } else {
        const chosenIds = dietariesChosen.map((chosenItem) => chosenItem.id);
        const filteredOptions = options.filter(
          (item) => !item.id.includes(chosenIds)
        );
        setDietaryOptions(filteredOptions);
      }
    };
    fetchDietaryOptions();
  }, [isFocused]);

  const addDietary = (dietary) => {
    const index = dietaryOptions.map((item) => item.id).indexOf(dietary.id);
    setDietariesChosen([...dietariesChosen, dietary]);
    dietaryOptions.splice(index, 1);
    setDietaryOptions([...dietaryOptions]);
  };

  const removeDietary = (dietary) => {
    const dietaryToRemoveIndex = dietariesChosen
      .map((item) => item.id)
      .indexOf(dietary.id);
    dietariesChosen.splice(dietaryToRemoveIndex, 1);
    setDietariesChosen([...dietariesChosen]);
    setDietaryOptions([dietary, ...dietaryOptions]);
  };

  return (
    <View className="flex-1 p-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-medium text-lg">My Profile</Text>
        <View className="w-8 h-8 rounded-full bg-orange-400 justify-center items-center">
          <Link href={{ pathname: "/profile-edit", params: { username } }}>
            <Icon name="pencil" style={{ color: "white" }} />
          </Link>
        </View>
      </View>

      <View className="flex-row items-center mb-20">
        <Image
          source={user.photoURL}
          className="mt-24 w-40 h-40 rounded-full"
        />
        <View className="ml-5 mt-10">
          <View className="mt-3">
            <Text className="text-left pt-1 leading-4 font-medium">Name:
              <Text className="font-normal"> {displayNameTest}</Text>
            </Text>
          </View>

          <View className="mt-3">
            <Text className="text-left pt-1 leading-4 font-medium">Username:
              <Text className="font-normal"> {username}</Text>
            </Text>
          </View>

          <View className="mt-3">
            <Text className="text-left pt-1 leading-4 font-medium">Email:
              <Text className="font-normal"> {user.email}</Text>
            </Text>
          </View>
        </View>
      </View>
      <Text className="block text-sm font-medium leading-6 text-gray-900">
          Dietary Needs
        </Text>
        <View className="my-2">
          <FlatList
            data={dietaryOptions}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => addDietary(item)}
                className="items-center mr-3"
              >
                <View
                  key={item.slug}
                  className="mr-1 bg-slate-100 rounded-full p-1 items-center justify-center"
                >
                  <Image className="w-8 h-8" source={{ uri: item.imgUrl }} />
                </View>
                <Text className="mt-1 text-xs">{item.displayName}</Text>
              </Pressable>
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(dietary, index) => index}
          />
        </View>
        <View className="my-2">
          {dietariesChosen.length ? (
            <Text className="mb-1 text-xs">Selected:</Text>
          ) : null}
          <FlatList
            data={dietariesChosen}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => removeDietary(item)}
                className="items-center mr-3"
              >
                <View
                  key={item.slug}
                  className="bg-green-300 rounded-full p-1 items-center justify-center"
                >
                  <Image className="w-8 h-8" source={{ uri: item.imgUrl }} />
                </View>
                <Text className="mt-1 text-xs">{item.displayName}</Text>
              </Pressable>
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(dietary, index) => index}
          />
        </View>
      <TextInput
          className="bg-slate-100 rounded-md p-3 mb-3"
          placeholder="Enter bio here"
          value=""
        />

      <View>
        <Text className="text-center font-medium mb-4 text-lg">My Recipes</Text>
        <View >
          {!recipes.length ? (
            <Text className="text-center mt-20">No Recipes Found</Text>
          ) : (
            <FlatList
              data={recipes}
              renderItem={(recipe, index) => (
                <RecipeSmallCard
                  key={index}
                  recipe={recipe}
                  user={user}
                  location={"(profile)"}
                />
              )}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              keyExtractor={(recipe, index) => index}
            />
          )}
        </View>
      </View>

      <Pressable
        className="p-3 bg-orange-400 w-full rounded-md mt-20"
        onPress={logoutUser}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Log Out{" "}
        </Text>
      </Pressable>
    </View>
  );
}
