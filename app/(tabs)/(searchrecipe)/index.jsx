import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  Image,
} from "react-native";

import { Link, useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import firestore, { Filter } from "@react-native-firebase/firestore";
import { RecipeSmallCard } from "../../../components/RecipeSmallCard";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { firebase } from "@react-native-firebase/auth";
import { useIsFocused } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

export default function SearchRecipesPage() {
  const isFocused = useIsFocused();
  const user = firebase.auth().currentUser;
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [updateSearch, setUpdateSearch] = useState("");
  const { dietaries, matchAndDietaries, ratingOrder } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const location = "(searchrecipe)";

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: "Search",
      unmountOnBlur: true,
    });
    const dietariesJSON =
      dietaries !== undefined && dietaries !== "undefined"
        ? JSON.parse(dietaries)
        : undefined;

    let finalQuery = firestore().collection("Recipes");
    setIsLoading(true);

    if (ratingOrder === "true") {
      finalQuery = finalQuery.orderBy("rating", "desc");
    } else {
      finalQuery = finalQuery.orderBy("timestamp", "desc");
    }

    if (dietariesJSON && dietariesJSON.chosen.length > 0) {
      const chosenIds = dietariesJSON.chosen.map((item) => item.id);

      if (dietariesJSON.chosen.length > 1) {
        finalQuery = finalQuery.where(
          "dietary_needs",
          "array-contains-any",
          chosenIds
        );
      } else {
        finalQuery = finalQuery.where(
          "dietary_needs",
          "array-contains",
          chosenIds[0]
        );
      }
      finalQuery = finalQuery
        .get()
        .then((QuerySnapshot) => {
          const recipeList = [];
          QuerySnapshot.forEach((documentSnapshot) => {
            recipeList.push({
              data: documentSnapshot.data(),
              id: documentSnapshot.id,
            });
          });
          if (matchAndDietaries === "true") {
            const isSubset = (array1, array2) =>
              array2.every((element) => array1.includes(element));

            const filtered = recipeList.filter((item) =>
              isSubset(item.data.dietary_needs, chosenIds)
            );

            setRecipes(filtered);
          } else {
            setRecipes(recipeList);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      finalQuery = finalQuery.get().then((QuerySnapshot) => {
        const recipeList = [];
        QuerySnapshot.forEach((documentSnapshot) => {
          recipeList.push({
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setRecipes(recipeList);
        setIsLoading(false);
      });
    }
  }, [navigation, dietaries, matchAndDietaries, isFocused]);

  const resetFetch = () => {
    if (dietaries) {
      navigation.setParams({
        dietaries: undefined,
        matchAndDietaries: undefined,
      });
    }
  };

  const handleSearch = (query) => {
    setUpdateSearch(query);
    const formattedSearch = query.toLowerCase();
    const filter = recipes.filter((recipe) => {
      return recipe.data.title.toLowerCase().includes(formattedSearch);
    });
    setFilteredRecipes(filter);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="mx-4 mt-16 mb-2">
        <View>
          <Image
            className="w-[130] h-[34] mb-2 self-center justify-center"
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/logo.png?alt=media&token=50bf93ef-63c5-4d56-8b6e-7cf1ffbbf2e8",
            }}
          />
        </View>
        <View className="items-center mx-1">
          <View className="px-3 w-full py-5 items-center bg-slate-100 rounded-full flex-row gap-x-2 border border-slate-200">
            <FontAwesome name="search" size={15} color="grey" />
            <TextInput
              placeholder="Search Recipes..."
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(search) => handleSearch(search)}
              value={updateSearch}
            />
          </View>
        </View>
        <View className="flex-row gap-3 justify-end mt-1">
          <View className="mt-2 p-3 bg-orange-400 self-end rounded-full">
            <Pressable onPress={resetFetch}>
              <Feather name="refresh-ccw" size={14} color="white" />
            </Pressable>
          </View>
          <View className="mt-5 p-3 bg-orange-400 self-end rounded-full">
            <Link
              href={{
                pathname: "/filter",
                params: {
                  dietaries: dietaries,
                  matchAndDietaries: matchAndDietaries,
                  ratingOrder: ratingOrder,
                },
              }}
            >
              <Ionicons name="filter" size={14} color="white" />
            </Link>
          </View>
        </View>
      </View>
      {isLoading ? (
        <View className="items-center justify-center bg-white">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View className="mx-3 flex-1">
          {!recipes.length || (updateSearch && !filteredRecipes.length) ? (
            <Text className="text-center mt-20">No Recipes Found</Text>
          ) : (
            <FlatList
              data={updateSearch === "" ? recipes : filteredRecipes}
              renderItem={(recipe, index) => (
                <RecipeSmallCard
                  key={recipe.index}
                  recipe={recipe}
                  user={user.uid}
                  location={location}
                />
              )}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              horizontal={false}
              keyExtractor={(recipe, index) => index}
            />
          )}
        </View>
      )}
    </View>
  );
}
