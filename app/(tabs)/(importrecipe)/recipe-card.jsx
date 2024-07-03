import { Link, useLocalSearchParams, useRoute } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  item,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

export default function RecipeCard(recipe_id) {
  const params = useLocalSearchParams();
  const [currentRecipe, setCurrentRecipe] = useState([]);


  useEffect(() => {
    firestore()
      .collection("Recipes")
      .doc(`xOveArWmWclky1keMqEJ`)
      .get()
      .then((result) => {
        setCurrentRecipe(result._data)
      });
  }, []);

  console.log(currentRecipe, 'currentRecipe<<<<<')

  return (
    <View>
      <Text>Hello Recipe Card!</Text>
    </View>
  );
}
