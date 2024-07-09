import { useLocalSearchParams, router, useNavigation } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useState, useEffect } from "react";
import firestore, { FieldValue } from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import { Fontisto } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

export default function RecipePreview() {
  const isFocused = useIsFocused();
  const user = firebase.auth().currentUser;
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [dietariesChosen, setDietariesChosen] = useState([]);
  const [cookTime, setCookTime] = useState({ hours: 0, mins: 0 });
  const [currentSelectionCollection, setCurrentSelectionCollection] =
    useState(null);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFromPencil, setIsLoadingFromPencil] = useState(false);

  const [newRecipe, setNewRecipe] = useState({
    category: [],
    cook_time: "",
    cooking_method: "",
    dietary_needs: [],
    ingredients: "",
    is_public: true,
    rating: 0,
    recipe_img_url: "",
    saved_count: 0,
    source_url: "",
    title: "",
    uid: user.uid,
    timestamp: firestore.FieldValue.serverTimestamp(),
  });

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

  useEffect(() => {
    setNewRecipe((prevRecipe) => ({
      ...prevRecipe,
      dietary_needs: dietariesChosen.length
        ? dietariesChosen.map((chosen) => chosen.id)
        : [],
      recipe_img_url: image,
      cook_time: formatCookTime(cookTime),
    }));
  }, [dietariesChosen, image, cookTime]);

  useEffect(() => {
    if (params.currentSelected) {
      firestore()
        .collection("Collections")
        .doc(params.currentSelected)
        .get()
        .then((doc) => {
          setCurrentSelectionCollection(doc.data());
        });
    }
  }, [params.currentSelected]);

  const formatCookTime = (time) => {
    const hoursInMins = Number(time.hours) * 60;
    return Number(time.mins) + hoursInMins;
  };

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

  function handleInput(key, value) {
    setNewRecipe((recipe) => {
      return { ...recipe, [key]: value };
    });
  }

  async function handleRecipeSubmit() {
    try {
      if (
        !image ||
        (newRecipe.title === "") | (newRecipe.ingredients === "") ||
        newRecipe.cooking_method === "" ||
        newRecipe.cook_time === "" ||
        !currentSelectionCollection
      ) {
        if (!image) {
          alert("Please upload an image");
        } else if (newRecipe.title === "") {
          alert("Please add a recipe title");
        } else if (!currentSelectionCollection) {
          alert("Please add a collection to add this recipe to");
        } else if (newRecipe.ingredients === "") {
          alert("Please add ingredients for this recipe");
        } else if (newRecipe.cooking_method === "") {
          alert("Please add a method for this recipe");
        } else if (newRecipe.cook_time === "") {
          alert("Please add cook time for this recipe");
        }
      } else {
        const result = await firestore().collection("Recipes").add(newRecipe);
        const recipeId = result.id;
        await firestore()
          .collection("Collections")
          .doc(params.currentSelected)
          .update({
            recipes_list: FieldValue.arrayUnion(recipeId),
          });

        setNewRecipe({
          category: [],
          cook_time: "",
          cooking_method: "",
          dietary_needs: [],
          ingredients: "",
          is_public: true,
          rating: 0,
          recipe_img_url: "",
          saved_count: 0,
          source_url: "",
          title: "",
          uid: user._user.uid,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        setCurrentSelectionCollection(null);
        setCookTime({ hours: 0, mins: 0 });
        setDietariesChosen([]);
        setImage(null);
        router.navigate({
          pathname: `/(collections)/collection/${params.currentSelected}`,
          params: {
            user: user.uid,
            location: "(collections)",
            recipeId: recipeId,
          },
        });
        router.setParams({
          currentSelected: undefined,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
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
        `Recipes/${user._user.uid}/${new Date().getTime()}.jpg`
      );

      try {
        setIsLoading(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        setImage(imageUrlDownload);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const pickImageFromPencil = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const reference = await storage().ref(
        `Recipes/${user._user.uid}/${new Date().getTime()}.jpg`
      );

      try {
        setIsLoadingFromPencil(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        setImage(imageUrlDownload);
        setIsLoadingFromPencil(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleCollectionModal = () => {
    router.navigate({
      pathname: "/add-collection-choice",
      params: { id: user.uid, currentSelected: params.currentSelected },
    });
  };

  const resetCollections = () => {
    if (params.currentSelected) {
      navigation.setParams({
        currentSelected: undefined,
      });
    }
  };

  return (
    <ScrollView className="bg-white">
      <View className="m-2 p-2">
        <View>
          {isLoadingFromPencil ? (
            <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-7">
              <ActivityIndicator size="large" color="#FB923C" />
            </View>
          ) : (
            image && (
              <View className="w-full relative mb-4">
                <Image
                  source={{ uri: image }}
                  className="w-full h-40 rounded-lg"
                />
                <View className="absolute top-3 right-3">
                  <Pressable
                    className="bg-orange-400 w-6 h-6 rounded-full justify-center items-center"
                    onPress={pickImageFromPencil}
                  >
                    <Icon name="pencil" style={{ color: "white" }} />
                  </Pressable>
                </View>
              </View>
            )
          )}
        </View>
        {image ? null : isLoading ? (
          <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-7">
            <ActivityIndicator size="large" color="#FB923C" />
          </View>
        ) : (
          <View className="w-full h-40 rounded-lg bg-slate-100 items-center justify-center mb-7">
            <Button title="Add Recipe Image" onPress={pickImage} />
          </View>
        )}

        <TextInput
          className="bg-slate-100 rounded-md p-3 mb-3"
          placeholder="Recipe Title"
          onChangeText={(text) => handleInput("title", text)}
          value={newRecipe.title}
        />

        <View className="mb-3 bg-slate-100 rounded-md p-2">
          <TextInput
            placeholder="Insert recipe URL here"
            onChangeText={(text) => handleInput("source_url", text)}
            value={newRecipe.source_url}
            autoCorrect={false}
            dataDetectorTypes="link"
            inputMode="url"
            keyboardType="url"
            autoCapitalize="none"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 placeholder:text-gray-400"
          />
        </View>

        <View className="mt-2 mb-6 ml-3">
          <Pressable
            onPress={handleCollectionModal}
            className="items-center justify-center bg-orange-300 rounded-md p-3 flex-row gap-x-3"
          >
            <Text className="block text-sm font-medium text-gray-900">
              Select Collection
            </Text>
            <FontAwesome6
              name="arrow-alt-circle-up"
              size={16}
              color="background-color: rgb(17 24 39)"
            />
          </Pressable>
          {currentSelectionCollection ? (
            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center">
                <Text className="block text-sm font-medium leading-6 text-gray-900 mr-2">
                  Chosen:
                </Text>
                <View className="bg-slate-200 rounded-md p-2 block">
                  <Text className="">{currentSelectionCollection.name}</Text>
                </View>
              </View>
              <Pressable className="mr-5" onPress={resetCollections}>
                <Fontisto name="close" size={18} color="black" />
              </Pressable>
            </View>
          ) : null}
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

        <View className="mt-3">
          <Text className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Categories
          </Text>
          <TextInput
            className="bg-zinc-200 rounded-md mb-3 p-3"
            placeholder="Pasta, Main Course"
            onChangeText={(text) => handleInput("category", text)}
            value={newRecipe.category}
          />
        </View>
        <View className="my-3">
          <View className="flex-row gap-x-3 items-center">
            <FontAwesome6 name="clock" size={24} color="black" />
            <View className="items-center flex-row">
              <TextInput
                className="bg-zinc-200 rounded-md px-3 py-2"
                inputMode="numeric"
                keyboardType="numeric"
                placeholder="1"
                onChangeText={(hours) =>
                  setCookTime({ ...cookTime, hours: hours })
                }
                value={cookTime.hours}
              />
              <Text className="ml-2">Hour(s)</Text>
            </View>
            <View className="items-center flex-row">
              <TextInput
                className="bg-zinc-200 rounded-md px-3 py-2"
                inputMode="numeric"
                keyboardType="numeric"
                placeholder="30"
                onChangeText={(mins) =>
                  setCookTime({ ...cookTime, mins: mins })
                }
                value={cookTime.mins}
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
            className="bg-zinc-200 rounded-md p-3"
            multiline={true}
            placeholder="2 large sweet potatoes2 tablespoons olive oilSalt, to tastePepper, to taste1 ripe avocado1/2 cup Greek yogurt1 tablespoon lime juice2 tablespoons fresh cilantro, chopped"
            onChangeText={(text) => handleInput("ingredients", text)}
            value={newRecipe.ingredients}
          />
        </View>
        <View className="mb-3">
          <Text className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Cooking instructions
          </Text>
          <TextInput
            className="bg-zinc-200 rounded-md p-3"
            multiline={true}
            placeholder="1. Preheat oven to 425°F (220°C). 2. Cut the cauliflower into florets.3. Toss the cauliflower with olive oil, turmeric, cumin, salt, and pepper.4. Spread the cauliflower on a baking sheet.5. Roast in the preheated oven for 20-25 minutes, or until tender and browned.6. Remove from the oven and squeeze lemon juice over the top before serving."
            onChangeText={(text) => handleInput("cooking_method", text)}
            value={newRecipe.cooking_method}
          />
        </View>
        <Pressable
          className="mt-5 p-3 bg-orange-400 w-full rounded-md"
          onPress={handleRecipeSubmit}
        >
          <Text className="text-white text-center text-sm font-medium leading-6">
            Submit Recipe
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dietaryImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
  dropdown: {
    // marginLeft: -5,
    // marginRight: 10,
    marginTop: -220,
    width: 300,
    borderRadius: 50,
  },
});
