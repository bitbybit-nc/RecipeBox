import { useLocalSearchParams, useNavigation, router } from "expo-router";
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import firestore, { collection } from "@react-native-firebase/firestore";
import { RecipeSmallCard } from "../../../../components/RecipeSmallCard";
import FontAwesome from "@expo/vector-icons/FontAwesome";

function SingleCollection() {
  const { id, user, recipeId } = useLocalSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [updateSearch, setUpdateSearch] = useState("");
  const navigation = useNavigation();
  const location = "(collections)";
  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerRight: () => {
        return <Button title="Edit" onPress={routeToEdit} />;
      },
      unmountOnBlur: true,
    });
    setLoading(true);
    firestore()
      .collection("Collections")
      .doc(id)
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.data();
        setCollectionName(data.name);
        return data;
      })
      .then((data) => {
        if (data.recipes_list === undefined) {
          const recipesList = [];
          setRecipes(recipesList);
          setLoading(false);
        } else if (data.recipes_list.length) {
          firestore()
            .collection("Recipes")
            .orderBy("timestamp", "desc")
            .where("__name__", "in", data.recipes_list)
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
              setLoading(false);
            });
        } else {
          setLoading(false);
          setEmpty(true);
        }
      });
  }, [collectionName, recipeId]);

  const routeToEdit = () => {
    router.navigate(`/edit-collection/${id}`);
  };

  const handleSearch = (query) => {
    setUpdateSearch(query);
    const formattedSearch = query.toLowerCase();
    const filter = recipes.filter((recipe) => {
      return recipe.data.title.toLowerCase().includes(formattedSearch);
    });
    setFilteredRecipes(filter);
  };

  if (loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if (empty) {
    <View>
      <Text> This is empty </Text>
    </View>;
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-7 mx-4">
        <Text className="text-center font-medium mb-4 text-lg">
          {collectionName}
        </Text>
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
      <View className="mx-3 flex-1">
        {!recipes.length || (updateSearch && !filteredRecipes.length) ? (
          <Text className="text-center mt-20">No Recipes Found</Text>
        ) : (
          <FlatList
            data={updateSearch === "" ? recipes : filteredRecipes}
            renderItem={(recipe, index) => (
              <RecipeSmallCard
                key={index}
                recipe={recipe}
                user={user}
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
    </View>
  );
}

export default SingleCollection;
