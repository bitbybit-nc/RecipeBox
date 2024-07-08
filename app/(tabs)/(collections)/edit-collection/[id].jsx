import {
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from "expo-router";
import React, { useState, useEffect } from "react";
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
import * as ImagePicker from "expo-image-picker";

function EditCollection() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const user = auth().currentUser;
  const router = useRouter();
  const [collectionName, setCollectionName] = useState("");
  const [url, setUrl] = useState("");
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [collectionVisibility, setCollectionVisibility] = useState(
    collectionVisibility || false
  );
  const [collectionDescription, setCollectionDescription] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipesToRemove, setRecipesToRemove] = useState([]);
  const [updatedCollection, setUpdatedCollection] = useState();
  const errorimageUrl =
    "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";

  useEffect(() => {
    navigation.setOptions({
      unmountOnBlur: true,
      title: "Edit",
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
          setImage(data.image_url)
          setCollectionVisibility(data.is_public);
          setCollectionDescription(data.description);
          if (data.image_url) setVisible(true);

          if (data.recipes) {
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
            setUpdatedCollection(params.id);
            router.navigate({
              pathname: "/(collections)",
              params: {
                collectionName: collectionName,
                url: url,
                collectionDescription: collectionDescription,
                image: image,
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
            setUpdatedCollection(params.id);
            router.navigate({
              pathname: "/(collections)",
              params: {
                collectionName: collectionName,
                url: url,
                collectionDescription: collectionDescription,
                image: image,
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

  return (
    <ScrollView>
      <View className="flex-1 p-4 bg-white">
        <View className="m-3 p-3 w-screen items-center flex-row justify-center">
          <View className="w-9/12">
            <Pressable onPress={pickImage}>
              <View>
                <Image
                  source={{
                    uri: image || url || errorimageUrl,
                  }}
                  style={styles.midLogo}
                />
                {!image && !url && (
                  <Text className="text-center text-sm font-medium leading-6">
                    Add to collection image
                  </Text>
                )}
              </View>
            </Pressable>
          </View>
        </View>

        <View>
          <TextInput
            className="h-10 border border-gray-400 mb-4 px-2"
            placeholder="Collection Name"
            value={collectionName}
            onChangeText={setCollectionName}
          />

          <TextInput
            className="h-20 border border-gray-400 mb-4 px-2"
            placeholder="Collection Description"
            value={collectionDescription}
            onChangeText={setCollectionDescription}
          />
        </View>
        <View className="flex-row items-center justify-between mt-4 mb-4">
          <Text className="text-xl font-medium text-black">
            {collectionVisibility
              ? "Collection is: Public"
              : "Collection is: Private"}
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "rgb(54 83 20)" }}
            className="scale-100"
            thumbColor={collectionVisibility ? "rgb(134 239 172)" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleCollectionVisibility}
            value={collectionVisibility}
          />
        </View>
        <View className="m-3 p-3  justify-center bg-red-200">
          {recipes.length > 0 ? (
            <Text className="text-xl font-medium text-black ">
              remove from: {collectionName}
            </Text>
          ) : (
            <Text className="text-xl  font-medium text-black">
              No recipes found in this collection.
            </Text>
          )}
          {recipes === ""
            ? recipes.map((recipe, index) => (
                <View
                  key={index}
                  className="flex-row  justify-center items-center mt-4 mb-4"
                >
                  <Pressable
                    onPress={() => handleRemoveRecipe(recipe.id)}
                    className={`text-m font-medium text-black ${
                      recipesToRemove.includes(recipe.id)
                        ? "opacity-20 bg-red-200"
                        : ""
                    }`}
                  >
                    <View className="flex-row  justify-center items-center">
                      <Image
                        source={
                          recipe.recipe_img_url
                            ? { uri: recipe.recipe_img_url }
                            : { uri: errorimageUrl }
                        }
                        style={[
                          styles.recipeImage,
                          recipesToRemove.includes(recipe.id) &&
                            styles.recipeImageRemoved,
                        ]}
                      />
                    </View>
                    <Text className={`text-m font-medium text-black`}>
                      {recipe.title}
                    </Text>
                  </Pressable>
                </View>
              ))
            : null}
        </View>
        <View>
          <Button title="Save Changes" onPress={handleEditCollection} />
          <Button
            title="Delete Collection"
            onPress={handleDelete}
            color="red"
          />
        </View>
      </View>
    </ScrollView>
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