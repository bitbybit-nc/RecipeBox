import { Link, useLocalSearchParams, useRouter, Stack } from "expo-router";
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  Item,
  Alert,
  ScrollView,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

function EditRecipeCard({}) {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [dietaryImages, setDietaryImages] = useState([]);
  const [reselectedDietaryImages, setReselectedDietaryImages] = useState([]);
  const [selectedDietaryNeeds, setSelectedDietaryNeeds] = useState();

  const [title, setTitle] = useState();
  const [sourceUrl, setSourceUrl] = useState();
  const [cookTime, setCookTime] = useState();
  const [ingredients, setIngredients] = useState();
  const [cookingMethod, setCookingMethod] = useState();

  useEffect(() => {
    const fetchDietaryImages = async () => {
      try {
        await firestore()
          .collection("Recipes")
          .doc(params.id)
          .get()
          .then((snapShot) => {
            const data = snapShot.data();
            setTitle(data.title);
            setSourceUrl(data.source_url);
            setCookTime(data.cook_time);
            setIngredients(data.ingredients);
            setCookingMethod(data.cooking_method);
            setSelectedDietaryNeeds(data.dietary_needs);
          });

        const dietaryCategory = await firestore()
          .collection("Dietary_needs")
          .get();
        const images = {};
        dietaryCategory.forEach((doc) => {
          images[doc._data.slug] = doc._data.image_url;
        });
        setDietaryImages(images);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDietaryImages();
  }, []);

  const handleSubmit = async () => {
    const updatedRecipe = {
      title,
      source_url: sourceUrl,
      cook_time: cookTime,
      ingredients,
      cooking_method: cookingMethod,
      dietary_needs: selectedDietaryNeeds,
    };

    try {
      await firestore()
        .collection("Recipes")
        .doc(params.recipeId)
        .update(updatedRecipe);

      Alert.alert(
        "Success",
        "Recipe updated successfully",
        [
          {
            text: "OK",
            onPress: () =>
              router.navigate({
                pathname: `/recipe/${params.id}`,
              }),
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this recipe?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await firestore()
                .collection("Recipes")
                .doc(params.recipeId)
                .delete();

              Alert.alert(
                "Deleted",
                "Recipe deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      router.navigate({
                        pathname: `/recipe/${params.id}`,
                      }),
                  },
                ],
                { cancelable: false }
              );
            } catch (err) {
              console.error(err);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput
          style={{ backgroundColor: "#dedede" }}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
        />
        <TextInput
          style={{ backgroundColor: "#dedede" }}
          value={sourceUrl}
          onChangeText={setSourceUrl}
          placeholder="Source URL"
        />
        <View>
          <View
            className="flex-row items-center justify-start mb-4"
            style={[styles.dietaryImagesContainer, { flexDirection: "row" }]}
          >
            {selectedDietaryNeeds &&
              selectedDietaryNeeds.map((dietaryOption, index) => (
                <View className="mr-2" key={index}>
                  <Image
                    style={styles.tinyLogo}
                    source={{
                      uri: reselectedDietaryImages[dietaryOption],
                    }}
                  />
                </View>
              ))}
          </View>
          <View>
            <MultipleSelectList
              setSelected={setReselectedDietaryImages}
              data={() => Object.keys(dietaryImages)}
              save="name"
              defaultOption={selectedDietaryNeeds}
            />
          </View>
        </View>
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 22,
            }}
          >
            Cooking time:
          </Text>
          <TextInput
            style={{ backgroundColor: "#dedede" }}
            value={cookTime}
            onChangeText={setCookTime}
            placeholder="Cooking Time"
          />
        </View>
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 22,
            }}
          >
            Ingredient List:
          </Text>
          <TextInput
            style={{
              backgroundColor: "#dedede",
              height: 140,
              fontSize: 13,
            }}
            multiline={true}
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="Ingredients"
          />
        </View>
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 22,
            }}
          >
            Cooking instructions
          </Text>
          <TextInput
            style={{
              backgroundColor: "#dedede",
              height: 140,
              fontSize: 13,
            }}
            multiline={true}
            value={cookingMethod}
            onChangeText={setCookingMethod}
            placeholder="Cooking Method"
          />
        </View>
        <Button title="Save Recipe" onPress={handleSubmit} />
        <Button title="Delete Recipe" onPress={handleDelete} color="red" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "left",
    margin: 10,
    paddingTop: 20,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
  selectedList: {
    margin: 0,
    padding: 0,
  },
});

export default EditRecipeCard;
