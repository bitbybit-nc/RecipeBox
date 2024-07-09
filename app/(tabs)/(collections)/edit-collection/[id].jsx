import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import React, { useState, useEffect, Fragment } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { RecipeSmallDisplay } from "../../../../components/RecipeSmallDisplay";

function EditCollection() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const user = auth().currentUser;
  const router = useRouter();
  const [collectionName, setCollectionName] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFromPencil, setIsLoadingFromPencil] = useState(false);
  const [collectionVisibility, setCollectionVisibility] = useState(
    collectionVisibility || false
  );
  const [collectionDescription, setCollectionDescription] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipesToRemove, setRecipesToRemove] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      unmountOnBlur: true,
      title: "Edit Collection",
    });

    const fetchData = async () => {
      try {
        const collectionDoc = await firestore()
          .collection("Collections")
          .doc(params.id)
          .get();

        if (collectionDoc.exists) {
          const data = collectionDoc.data();

          setCollectionName(data.name);
          setUrl(data.image_url);
          setImage(data.image_url);
          setCollectionVisibility(data.is_public);
          setCollectionDescription(data.description);

          if (data.recipes_list) {
            const recipePromises = data.recipes_list.map(async (recipeId) => {
              const recipeDoc = await firestore()
                .collection("Recipes")
                .doc(recipeId)
                .get();
              if (recipeDoc.exists) {
                return { id: recipeId, ...recipeDoc.data() };
              }
              return null;
            });

            const recipes = await Promise.all(recipePromises);
            setRecipes(recipes.filter((recipe) => recipe !== null));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [params.id]);

  const handleEditCollection = async () => {
    try {
      if (recipes.length > 0) {
        const updatedRecipesList = recipes
          .filter((recipe) => !recipesToRemove.includes(recipe.id))
          .map((recipe) => recipe.id);

        await firestore()
          .collection("Collections")
          .doc(params.id)
          .update({
            name: collectionName,
            image_url: image,
            is_public: collectionVisibility,
            description: collectionDescription,
            recipes_list: updatedRecipesList,
          })
          .then(() => {
            router.navigate({
              pathname: "/(collections)",
              params: {
                updatedCollection: {
                  collectionName: collectionName,
                  url: url,
                  collectionDescription: collectionDescription,
                  image: image,
                  recipes_list: updatedRecipesList,
                },
              },
            });
          });
        console.log("Collection updated!");
      } else {
        await firestore()
          .collection("Collections")
          .doc(params.id)
          .update({
            name: collectionName,
            image_url: image,
            is_public: collectionVisibility,
            description: collectionDescription,
          })
          .then(() => {
            router.navigate({
              pathname: "/(collections)",
              params: {
                updatedCollection: {
                  collectionName: collectionName,
                  url: url,
                  collectionDescription: collectionDescription,
                  image: image,
                  recipes_list: updatedRecipesList,
                },
              },
            });
          });

        console.log("Collection updated!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveRecipe = async (recipeId) => {
    setRecipesToRemove((prevState) =>
      prevState.includes(recipeId)
        ? prevState.filter((id) => id !== recipeId)
        : [...prevState, recipeId]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this collection?",
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
                .collection("Collections")
                .doc(params.id)
                .delete();
              Alert.alert("Deleted", "Collection deleted successfully", [
                {
                  text: "OK",
                  onPress: () =>
                    router.push({
                      pathname: "/(collections)",
                    }),
                },
              ]);
            } catch (error) {
              console.error(error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleCollectionVisibility = () => {
    setCollectionVisibility(!collectionVisibility);
  };

  const pickImage = async () => {
    setUrl("");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const reference = storage().ref(
        `Users/${user.uid}/${new Date().getTime()}.jpg`
      );

      try {
        setIsLoading(true);
        await reference.putFile(imageUri);
        const imageUrlDownload = await reference.getDownloadURL();
        setImage(imageUrlDownload);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
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

  return (
    <Fragment>
      <ScrollView className="mb-10">
        <View className="flex-1 p-4 bg-white">
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

          <View>
            <TextInput
              className="bg-slate-100 rounded-md p-3 mb-4"
              placeholder="Collection Name"
              value={collectionName}
              onChangeText={setCollectionName}
            />

            <View className="mb-4">
              <TextInput
                className="bg-slate-100 h-32 rounded-md p-3"
                placeholder="Collection Description"
                multiline
                rows={4}
                numberOfLines={4}
                maxLength={50}
                autoComplete="off"
                textAlignVertical="top"
                value={collectionDescription}
                onChangeText={setCollectionDescription}
              />
            </View>
          </View>

          <View className="flex-row items-center gap-x-3 mt-4 mb-4">
            <Switch
              trackColor={{ false: "#767577", true: "rgb(54 83 20)" }}
              className="scale-75"
              thumbColor={collectionVisibility ? "rgb(134 239 172)" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleCollectionVisibility}
              value={collectionVisibility}
            />
            <Text className="text-lg text-black">
              {collectionVisibility
                ? "Collection is: Public"
                : "Collection is: Private"}
            </Text>
          </View>

          <View className="mt-3">
            {recipes.length > 0 ? (
              <Text className="text-lg text-center">
                Remove from: {collectionName}
              </Text>
            ) : (
              <Text className="text-md text-center">
                No recipes found in this collection.
              </Text>
            )}
          </View>

          <View className="my-3 justify-center">
            <View className="flex-wrap flex-row gap-y-3 justify-between w-full">
              {recipes
                ? recipes.map((recipe, index) => (
                    <Pressable
                      key={index}
                      onPress={() => handleRemoveRecipe(recipe.id)}
                      className={`w-1/2 ${index % 2 ? "pl-3" : "pr-3"}
                      ${
                        recipesToRemove.includes(recipe.id) ? "opacity-20" : ""
                      }`}
                    >
                      <RecipeSmallDisplay recipe={recipe} />
                    </Pressable>
                  ))
                : null}
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 bg-slate-100 py-2 px-8 justify-between flex-row">
        <Button title="Delete Collection" onPress={handleDelete} color="red" />
        <Button title="Save Changes" onPress={handleEditCollection} />
      </View>
    </Fragment>
  );
}

export default EditCollection;

const styles = StyleSheet.create({
  midLogo: {
    width: 300,
    height: 100,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  recipeImage: {
    width: 200,
    height: 40,
  },
});
