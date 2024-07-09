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
  Pressable,
  ActivityIndicator,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore, { FieldValue } from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";

function EditRecipeCard() {
  const params = useLocalSearchParams();
  const router = useRouter();
  // const [dietaryImages, setDietaryImages] = useState([]);
  // const [reselectedDietaryImages, setReselectedDietaryImages] = useState([]);
  const [cookTime, setCookTime] = useState({ hours: 0, mins: 0 });
  const [selectedDietaryNeeds, setSelectedDietaryNeeds] = useState([]);
  const [dietaryOptions, setDietaryOptions] = useState([]);

  const [title, setTitle] = useState();
  const [sourceUrl, setSourceUrl] = useState();
  const [recipeUid, setRecipeUid] = useState();
  const [ingredients, setIngredients] = useState();
  const [cookingMethod, setCookingMethod] = useState();
  const [recipeImage, setRecipeImage] = useState();
  const [category, setCategory] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const recipeInfo = await firestore()
          .collection("Recipes")
          .doc(params.id)
          .get();

        const dietaries = await firestore().collection("Dietary_needs").get();

        Promise.all([recipeInfo, dietaries]).then((response) => {
          const recipe = response[0].data();
          const dietaries = response[1].docs.map((doc) => {
            return { id: doc.id, data: doc.data() };
          });

          setRecipeImage(recipe.recipe_img_url);
          setTitle(recipe.title);
          setSourceUrl(recipe.source_url);
          setCookTime(formatCookTime(recipe.cook_time));
          setIngredients(recipe.ingredients);
          setCookingMethod(recipe.cooking_method);
          setCategory(recipe.category);
          setRecipeUid(recipe.uid);

          const images = [];
          dietaries.forEach((doc) => {
            images.push({ id: doc.id, imgUrl: doc.data.image_url });
          });

          if (recipe.dietary_needs.length > 0) {
            const filtered = images.filter((item) => {
              return !recipe.dietary_needs.includes(item.id);
            });
            const selected = images.filter((item) => {
              return recipe.dietary_needs.includes(item.id);
            });
            setDietaryOptions(filtered);
            setSelectedDietaryNeeds(selected);
          } else {
            setDietaryOptions(images);
          }
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecipeDetails();
  }, []);

  const handleSubmit = async () => {
    const selectDietariesID = selectedDietaryNeeds.map((dietary) => dietary.id);
    const updatedRecipe = {
      title: title,
      source_url: sourceUrl,
      cook_time: formatCookTimeMins(cookTime),
      ingredients: ingredients,
      recipe_img_url: recipeImage,
      cooking_method: cookingMethod,
      dietary_needs: selectDietariesID,
      timestamp: FieldValue.serverTimestamp(),
    };
    try {
      await firestore()
        .collection("Recipes")
        .doc(params.id)
        .update(updatedRecipe);

      Alert.alert(
        "Success",
        "Recipe updated successfully",
        [
          {
            text: "OK",
            onPress: () =>
              router.navigate({
                pathname: `/(collections)/recipe/${params.id}`,
                params: {
                  updatedRecipe: JSON.stringify(updatedRecipe),
                  user: params.user,
                  recipeUser: recipeUid,
                },
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
              await firestore().collection("Recipes").doc(params.id).delete();

              await firestore()
                .collection("Collections")
                .where("recipes_list", "array-contains", params.id)
                .get()
                .then((snapshot) => {
                  snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.recipes_list.includes(params.id)) {
                      firestore()
                        .collection("Collections")
                        .doc(doc.id)
                        .update({
                          recipes_list: firestore.FieldValue.arrayRemove(
                            params.id
                          ),
                        });
                    }
                  });
                });

              Alert.alert(
                "Deleted",
                "Recipe deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      router.navigate({
                        pathname: "/(collections)",
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

  const formatCookTime = (time) => {
    const hoursFromMins = Math.floor(Number(time) / 60);
    const mins = time - hoursFromMins * 60;
    return { hours: hoursFromMins, mins: mins };
  };

  const formatCookTimeMins = (time) => {
    const hoursInMins = Number(time.hours) * 60;
    return Number(time.mins) + hoursInMins;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const reference = await storage().ref(
        `Recipes/${params.user}/${new Date().getTime()}.jpg`
      );

      try {
        setIsLoading(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        setRecipeImage(imageUrlDownload);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const addDietary = (dietary) => {
    const index = dietaryOptions.map((item) => item.id).indexOf(dietary.id);
    setSelectedDietaryNeeds([...selectedDietaryNeeds, dietary]);
    dietaryOptions.splice(index, 1);
    setDietaryOptions([...dietaryOptions]);
  };

  const removeDietary = (dietary) => {
    const dietaryToRemoveIndex = selectedDietaryNeeds
      .map((item) => item.id)
      .indexOf(dietary.id);
    selectedDietaryNeeds.splice(dietaryToRemoveIndex, 1);
    setSelectedDietaryNeeds([...selectedDietaryNeeds]);
    setDietaryOptions([dietary, ...dietaryOptions]);
  };

  return (
    <ScrollView className="bg-white">
      <View className="m-2 p-2">
        <View>
          {isLoading ? (
            <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-7">
              <ActivityIndicator size="large" color="#FB923C" />
            </View>
          ) : (
            recipeImage && (
              <View className="w-full relative mb-4">
                <Image
                  source={{ uri: recipeImage }}
                  className="w-full h-40 rounded-lg"
                />
                <View className="absolute top-3 right-3">
                  <Pressable
                    className="bg-orange-400 w-6 h-6 rounded-full justify-center items-center"
                    onPress={pickImage}
                  >
                    <Icon name="pencil" style={{ color: "white" }} />
                  </Pressable>
                </View>
              </View>
            )
          )}
        </View>

        <TextInput
          className="bg-slate-100 rounded-md p-3 mb-3"
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
        />
        <TextInput
          className="bg-slate-100 rounded-md p-3 mb-3"
          value={sourceUrl}
          onChangeText={setSourceUrl}
          placeholder="Source URL"
        />

        <Text className="block text-sm font-medium leading-6 text-gray-900">
          Dietary Needs
        </Text>
        <View className="mt-2">
          <FlatList
            data={dietaryOptions}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => addDietary(item)}
                className="items-center mr-3"
              >
                <View
                  key={item.id}
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
        <View className="mb-2">
          {selectedDietaryNeeds.length ? (
            <Text className="mb-1 text-xs">Selected:</Text>
          ) : null}
          <FlatList
            data={selectedDietaryNeeds}
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

        <View className="mt-3">
          <Text className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Categories
          </Text>
          <TextInput
            className="bg-slate-100 rounded-md mb-3 p-3"
            onChangeText={setCategory}
            value={category}
          />
        </View>

        <View className="my-3">
          <View className="flex-row gap-x-3 items-center">
            <FontAwesome6 name="clock" size={24} color="black" />
            <View className="items-center flex-row">
              <TextInput
                className="bg-slate-100 rounded-md px-3 py-2"
                inputMode="numeric"
                keyboardType="numeric"
                onChangeText={(hours) =>
                  setCookTime({ ...cookTime, hours: Number(hours) })
                }
                value={`${cookTime.hours}`}
              />
              <Text className="ml-2">Hour(s)</Text>
            </View>
            <View className="items-center flex-row">
              <TextInput
                className="bg-slate-100 rounded-md px-3 py-2"
                inputMode="numeric"
                keyboardType="numeric"
                onChangeText={(mins) =>
                  setCookTime({ ...cookTime, mins: Number(mins) })
                }
                value={`${cookTime.mins}`}
              />
              <Text className="ml-2">Mins</Text>
            </View>
          </View>
        </View>

        <View className="mb-3">
          <Text className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Ingredient List
          </Text>
          <TextInput
            className="bg-slate-100 rounded-md p-3"
            multiline={true}
            placeholder="2 large sweet potatoes2 tablespoons olive oilSalt, to tastePepper, to taste1 ripe avocado1/2 cup Greek yogurt1 tablespoon lime juice2 tablespoons fresh cilantro, chopped"
            onChangeText={setIngredients}
            value={ingredients}
          />
        </View>

        <View className="mb-3">
          <Text className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Cooking instructions
          </Text>
          <TextInput
            className="bg-slate-100 rounded-md p-3"
            multiline={true}
            placeholder="1. Preheat oven to 425°F (220°C). 2. Cut the cauliflower into florets.3. Toss the cauliflower with olive oil, turmeric, cumin, salt, and pepper.4. Spread the cauliflower on a baking sheet.5. Roast in the preheated oven for 20-25 minutes, or until tender and browned.6. Remove from the oven and squeeze lemon juice over the top before serving."
            onChangeText={setCookingMethod}
            value={cookingMethod}
          />
        </View>

        <View className="flex-row justify-evenly mt-4">
          <Button title="Delete Recipe" onPress={handleDelete} color="red" />
          <Button title="Save Recipe" onPress={handleSubmit} />
        </View>
      </View>
    </ScrollView>
  );
}

export default EditRecipeCard;
