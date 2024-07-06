import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";

import { Link, useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import firestore, { Filter } from "@react-native-firebase/firestore";
import { RecipeSmallCard } from "../../../components/RecipeSmallCard";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { firebase } from "@react-native-firebase/auth";

export default function SearchRecipesPage() {
  const user = firebase.auth().currentUser;
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [updateSearch, setUpdateSearch] = useState("");
  const { dietaries, matchAndDietaries, ratingOrder } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

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
  }, [navigation, dietaries, matchAndDietaries]);

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
      return recipe.title.toLowerCase().includes(formattedSearch);
    });
    setFilteredRecipes(filter);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="m-4 mt-16">
        <View className="pt-7 ml-4">
          <View className="px-3 py-5 items-center bg-slate-100 rounded-full flex-row gap-x-2 border border-slate-200">
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
          <View className="mt-5 p-3 bg-orange-400 self-end rounded-lg">
            <Pressable onPress={resetFetch}>
              <Text>Reset</Text>
            </Pressable>
          </View>
          <View className="mt-5 p-3 bg-orange-400 self-end rounded-lg">
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
              <Text>Filter</Text>
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
