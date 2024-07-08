import {
  Link,
  useLocalSearchParams,
  useRouter,
  Stack,
  router,
} from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  item,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { FA6Style } from "@expo/vector-icons/build/FontAwesome6";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
// import { Menu, PaperProvider, Divider } from "react-native-paper";
import { Picker } from "react-native-web";

export default function RecipePreview() {
  const user = firebase.auth().currentUser;

  const params = useLocalSearchParams();
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    source_url: params.url,
    title: "",
    uid: user._user.uid,
  });

  useEffect(() => {
    const fetchDietaryOptions = async () => {
      const result = await firestore().collection("Dietary_needs").get();
      const options = result.docs.map((doc) => ({
        name: doc._data.slug,
        displayName: doc._data.display_name,
        imgUrl: doc._data.image_url,
      }));
      setDietaryOptions(options);
    };
    fetchDietaryOptions();
  }, []);

  useEffect(() => {
    setNewRecipe((prevRecipe) => ({
      ...prevRecipe,
      dietary_needs: selected,
      recipe_img_url: image,
    }));
  }, [selected, image]);

  function handleInput(key, value) {
    setNewRecipe((recipe) => {
      return { ...recipe, [key]: value };
    });
  }

  async function handleRecipeSubmit() {
    try {
      const result = await firestore().collection("Recipes").add(newRecipe);
      const recipeId = result.id;
      router.push({ pathname: "/recipe-card", params: { recipeId } });
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
        `Users/${user._user.uid}/${new Date().getTime()}.jpg`
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

  // const [visible, setVisible] = useState(false);
  // const openMenu = () => setVisible(true);
  // const closeMenu = () => setVisible(false);

  const [isListOpen, setIsListOpen] = useState(false);

  return (
    <ScrollView>
      <View className="m-2">
        <View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FB923C" />
          ) : (
            image && (
              <View>
                <Image
                  source={{ uri: image }}
                  className="w-4/5 h-44 self-center rounded-md"
                />
                <View>
                  <Pressable className="bg-zinc-300" onPress={pickImage}>
                    <Text>Replace Btn</Text>
                  </Pressable>
                </View>
              </View>
            )
          )}
        </View>
        <View>
          {image ? null : (
            <Button
              title="Add Recipe Image from Camera Roll"
              onPress={pickImage}
            />
          )}
        </View>
        <Text className="text-xs">Recipe Title</Text>
        <TextInput
          className="bg-zinc-200 rounded-md p-1"
          placeholder="Recipe Title"
          onChangeText={(text) => handleInput("title", text)}
        />
        <View>
          <Text className="text-xs">Original Source</Text>
          <Text className="bg-zinc-200 rounded-md p-1 text-zinc-500">
            {params.url}
          </Text>
        </View>
        <Text className="text-xs">Dietary info</Text>

        <View
          className="flex-row items-center justify-start mb-4"
          style={[styles.dietaryImagesContainer, { flexDirection: "row" }]}
        >
          {dietaryOptions &&
            dietaryOptions.map((option, index) => {
              const formattedName = option.name.includes("_")
                ? option.name.replace("_", " ")
                : option.name;

              return selected.map((element, selectedIndex) => {
                if (formattedName.toLowerCase() === element.toLowerCase()) {
                  return (
                    <View>
                      <Image
                        style={styles.tinyLogo}
                        key={selectedIndex}
                        source={{ uri: option.imgUrl }}
                      />
                    </View>
                  );
                }
              });
            })}
        </View>

        {/* <View style={{ zIndex: 100 }}>
          <View className="p-0 m-0">
            <PaperProvider>
                <Menu
                  elevation="MD3Elevation"
                  style = {styles.dropdown}
                  anchor={<Button onPress={openMenu}>Show options</Button>}
                  visible={visible}
                  onDismiss={closeMenu}
                >
                  <View className="bg-zinc-100 rounded-xl">
                    {dietaryOptions.map((option) => (
                      <Menu.Item onPress={() => {}} title ={option.displayName} />
                    ))}
                  </View>
                </Menu>
            </PaperProvider>
          </View>
        </View> */}
        <MultipleSelectList
          setSelected={(val) => setSelected(val)}
          data={dietaryOptions.map((option) => option.displayName)}
          save="name"
          search={false}
        />
        <View>
          <Text className="text-xs">Categories</Text>
          <TextInput
            className="bg-zinc-200 rounded-md p-1"
            placeholder="Categories"
            onChangeText={(text) => handleInput("category", text)}
          />
        </View>
        <View>
          <Text className="text-xs">Cooking time</Text>
          <TextInput
            className="bg-zinc-200 rounded-md p-1"
            placeholder="Cooking time"
            onChangeText={(text) => handleInput("cook_time", text)}
          />
        </View>
        <View>
          <Text className="text-xs">Ingredient List</Text>
          <TextInput
            className="bg-zinc-200 rounded-md p-1"
            multiline={true}
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            onChangeText={(text) => handleInput("ingredients", text)}
          />
        </View>
        <View>
          <Text className="text-xs">Cooking instructions</Text>
          <TextInput
            className="bg-zinc-200 rounded-md p-1"
            multiline={true}
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            onChangeText={(text) => handleInput("cooking_method", text)}
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
