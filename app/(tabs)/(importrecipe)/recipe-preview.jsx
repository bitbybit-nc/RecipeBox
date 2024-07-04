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
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { FA6Style } from "@expo/vector-icons/build/FontAwesome6";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

export default function RecipePreview() {
  const user = firebase.auth().currentUser;

  const params = useLocalSearchParams();
  const [dietaryOptions, setDietaryOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [image, setImage] = useState(null);
  const [recipeId, setRecipeId] = useState(null);
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
    firestore()
      .collection("Dietary_needs")
      .get()
      .then((result) => {
        const options = result.docs.map((doc) => ({
          name: doc._data.display_name,
          imgUrl: doc._data.image_url,
        }));
        setDietaryOptions(options);
      });
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

  function handleRecipeSubmit() {
    firestore()
      .collection("Recipes")
      .add(newRecipe)
      .then((result) => setRecipeId(result._documentPath._parts[1]));

    }
    
    useEffect(() => {
      if (recipeId !== null) {
        router.push({ pathname: "/recipe-card", params: { recipeId } })
      }
  }, [recipeId]);

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

      await reference.putFile(imageUri);
      const imageUrlDownload = await reference.getDownloadURL();
      setImage(imageUrlDownload);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View>
          {image ? (
            <Image source={{ uri: image }} className="w-10 h-10 self-center " />
          ) : null}
        </View>
        <Text
          style={{
            marginTop: 10,
            fontSize: 15,
          }}
        >
          Recipe Title:
        </Text>
        <TextInput
          style={{ backgroundColor: "#dedede" }}
          placeholder="Recipe Title"
          onChangeText={(text) => handleInput("title", text)}
        />
        <Text>URL: {params.url}</Text>
        <View>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
        <Text>Dietary info</Text>
        <FlatList
          data={selected}
          renderItem={({ item }) => {
            return dietaryOptions.map((option) => {
              if (option.name === item) {
                return (
                  <View>
                    <Image
                      style={styles.tinyLogo}
                      source={{ uri: option.imgUrl }}
                    />
                  </View>
                );
              }
            });
          }}
          keyExtractor={(item) => item.name}
          horizontal
          style={styles.selectedList}
        />
        <MultipleSelectList
          setSelected={(val) => setSelected(val)}
          data={dietaryOptions.map((option) => option.name)}
          save="name"
        />
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 15,
            }}
          >
            Categories:
          </Text>
          <TextInput
            style={{
              backgroundColor: "#dedede",
            }}
            placeholder="Categories"
            onChangeText={(text) => handleInput("category", text)}
          />
        </View>
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 15,
            }}
          >
            Cooking time:
          </Text>
          <TextInput
            style={{
              backgroundColor: "#dedede",
            }}
            placeholder="cooking time"
            onChangeText={(text) => handleInput("cook_time", text)}
          />
        </View>
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 15,
            }}
          >
            Ingredient List:
          </Text>
          <TextInput
            style={{
              backgroundColor: "#dedede",
              height: 100,
              fontSize: 15,
            }}
            multiline={true}
            placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
            onChangeText={(text) => handleInput("ingredients", text)}
          />
        </View>
        <View>
          <Text
            style={{
              marginTop: 10,
              fontSize: 15,
            }}
          >
            Cooking instructions
          </Text>
          <TextInput
            style={{
              backgroundColor: "#dedede",
              height: 100,
              fontSize: 13,
            }}
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
