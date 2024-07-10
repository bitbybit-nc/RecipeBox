import { Link, useLocalSearchParams, router } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

import { Feather } from "@expo/vector-icons";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StarRating } from "../components/StarRating";


export function RecipeCard({
  id,
  user,
  collectionAdded,
  navigation,
  location,
  updatedRecipe,
}) {

    const [currentRecipe, setCurrentRecipe] = useState({});
    const [currentCollections, setCurrentCollections] = useState([]);
    const [recipeUser, setRecipeUser] = useState();
    const [dietaryImages, setDietaryImages] = useState({});
    const [dietaryImagesText, setDietaryImagesText] = useState([]);
    const [userHasVoted, setUserHasVoted] = useState(false);
    const [userRating, setUserRating] = useState(0);


  useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const dietaryCategory = await firestore()
                        .collection("Dietary_needs")
                        .get();
                    const images = {};
                    const text = {};

                    dietaryCategory.forEach((doc) => {
                        const data = doc.data();
                        images[data.slug] = data.image_url;
                        text[data.slug] = data.display_name;
                    });

                    setDietaryImages(images);
                    setDietaryImagesText(text);

                    const recipeDoc = await firestore()
                        .collection("Recipes")
                        .doc(id)
                        .get();
                    if (recipeDoc.exists) {
                        const recipeData = recipeDoc.data();
                        setCurrentRecipe(recipeData);

                        const { rating_count, rating_sum } = recipeData;

                        setUserRating(
                            recipeData.rating ? rating_sum / rating_count : 0
                        );

                        const userDoc = await firestore()
                            .collection("Users")
                            .where("uid", "==", recipeData.uid)
                            .get();
                        const userForRecipe = [];
                        userDoc.forEach((doc) => {
                            const data = doc.data();
                            userForRecipe.push(data);
                        });
                        setRecipeUser(userForRecipe[0]);
                    }

                    const collectionsDoc = await firestore()
                        .collection("Collections")
                        .where("recipes_list", "array-contains", id)
                        .where("user_id", "==", user)
                        .get();

                    const collectionsForUser = [];
                    collectionsDoc.forEach((doc) => {
                        const data = doc.data();
                        collectionsForUser.push({ data: data, id: doc.id });
                    });
                    setCurrentCollections(collectionsForUser);

                    const userVoteDoc = await firestore()
                        .collection("Users")
                        .doc(user)
                        .get();

                    if (userVoteDoc.exists) {
                        const userVoteData = userVoteDoc.data();
                        if (userVoteData.voted_recipes.includes(id)) {
                            setUserHasVoted(true);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };

        fetchData();
    }, [id, collectionAdded, navigation, updatedRecipe]);

  const formatCookTime = (mins) => {
    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      const restOfMins = mins - hours * 60;
      return hours === 1
        ? hours + " hr " + restOfMins + " mins "
        : hours + " hrs " + restOfMins + " mins ";
    } else {
      return mins + " mins ";
    }
  };

  const handleBack = () => {
    router.back();
  };
  
     

  return (
    <ScrollView className="bg-white relative">
      <ImageBackground
        source={{ uri: currentRecipe.recipe_img_url }}
        resizeMode="cover"
        className="justify-between w-full h-80 relative"
      >
        <View className="flex-row items-center justify-between mx-5 mt-14">
          <Pressable
            onPress={handleBack}
            className="rounded-full bg-white active:bg-stone-100"
            style={{
              shadowColor: "#00000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.27,
              shadowRadius: 4.65,

              elevation: 6,
            }}
          >
            <View className=" p-3 ">
              <Ionicons name="arrow-back" size={18} color="black" />
            </View>
          </Pressable>

          <View className="">
            <Pressable
              className="p-2 rounded-full bg-white active:bg-stone-100"
              style={{
                shadowColor: "#00000",
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,

                elevation: 6,
              }}
              onPress={() =>
                router.push({
                  pathname: `/${location}/recipe/add-to-collection`,
                  params: {
                    currentCollections: JSON.stringify(currentCollections),
                    id: id,
                    location: location,
                  },
                })
              }
            >
              <View className="flex-row items-center">
                {!currentCollections.length ? (
                  <View className="items-center flex-row">
                    <Ionicons name="bookmark-outline" size={24} color="black" />
                  </View>
                ) : (
                  <Ionicons name="bookmark" size={24} color="rgb(251 146 60)" />
                )}
              </View>
            </Pressable>
          </View>
        </View>

        <View className="flex-row ml-2 mb-8">
          {currentRecipe.dietary_needs &&
            currentRecipe.dietary_needs.map((dietaryOption, index) => {
              return (
                <View className="items-center mr-1" key={index}>
                  <View
                    style={{
                      shadowColor: "#00000",
                      shadowOffset: {
                        width: 0,
                        height: 3,
                      },
                      shadowOpacity: 0.27,
                      shadowRadius: 4.65,

                      elevation: 6,
                    }}
                    className="mr-0.5 bg-white rounded-full p-2 items-center justify-center"
                  >
                    <Image
                      className="w-6 h-6"
                      source={{
                        uri: dietaryImages[dietaryOption],
                      }}
                    />
                  </View>
                </View>
              );
            })}
        </View>
      </ImageBackground>

      <View className="rounded-lg top-[-20] bg-white z-30">
        <View className="flex-1 mx-2 px-3 py-3">
          <View className="flex-row justify-between items-center">
            <View className="w-3/4">
              <Text className="block text-slate-400 font-medium text-xs">
                {currentRecipe.category}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-xs">
                {currentRecipe.saved_count}
              </Text>
              <Ionicons name="bookmark" size={20} color="rgb(148 163 184)" />
            </View>
          </View>

          <Text className="my-2 font-medium text-lg">
            {currentRecipe.title}
          </Text>

          <View className=" flex-row">
            <View
              className="flex-row items-center  p-2 rounded-md block pr-4 bg-slate-100 mr-3"
              style={{
                shadowColor: "#00000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.65,

                elevation: 6,
              }}
            >
              <View className="bg-white p-3 rounded-full mr-3">
                <Feather name="clock" size={24} color="rgb(251 146 60)" />
              </View>
              <View>
                <Text className="text-slate-400 text-xs">Cooking Time</Text>
                <Text className="text-orange-500 text-md font-semibold">
                  {formatCookTime(currentRecipe.cook_time)}
                </Text>
              </View>
            </View>

            <View
              className="flex-row items-center p-2 rounded-md block pr-4 bg-slate-100"
              style={{
                shadowColor: "#00000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.65,

                elevation: 6,
              }}
            >
              <View className="bg-white p-3 rounded-full mr-3">
                <Feather name="user" size={24} color="rgb(251 146 60)" />
              </View>
              <View>
                <Text className="text-slate-400 text-xs">Serves</Text>
                <Text className="text-orange-500 text-md font-semibold">
                  4 Persons
                </Text>
              </View>
            </View>
          </View>
          <View className="border-b-2 border-slate-100 h-5 mr-2"></View>
          <View className="w-full mt-3">
            <View className="flex-row items-center">
              <FontAwesome6
                name="bowl-food"
                size={18}
                color="rgb(249 115 22)"
              />
              <Text className="ml-2 text-sm font-medium text-black mb-2 mt-2">
                Ingredients:
              </Text>
            </View>
            <Text className="text-sm leading-6 text-gray-900">
              {currentRecipe.ingredients}
            </Text>
          </View>

          <View className="w-full mb-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="chef-hat"
                size={20}
                color="rgb(249 115 22)"
              />
              <Text className="ml-2 text-sm font-medium text-black mb-2 mt-2">
                Cooking method:
              </Text>
            </View>
            <Text className="text-sm text-gray-900">
              {currentRecipe.cooking_method}
            </Text>
          </View>

          <View className="mt-3">
            <Text className="font-medium mb-2">Created By:</Text>
            <View className="flex-row items-center">
              <Image
                className="rounded-full w-7 h-7"
                source={{
                  uri:
                    recipeUser && recipeUser.photoURL !== undefined
                      ? recipeUser.photoURL
                      : "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Users%2Fplaceholder.png?alt=media&token=6fec34d3-f856-4565-a218-f822ca392a70",
                }}
              />
              <Text className="ml-2 text-black">
                {recipeUser ? recipeUser.username : "ANON"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

