import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import firestore from "@react-native-firebase/firestore";
// import EditCollection from "@/app/(tabs)/(collections)/edit-collection/[id]";
// import Icon from "react-native-vector-icons/FontAwesome";

export function CollectionList({ collection, id, user }) {
  const [recipeImage, setRecipeImage] = useState([]);

  function handleCollectionPress() {
    router.push({ pathname: `/collection/${id}`, params: { user: user } });
  }

  useEffect(() => {
    async function fetchRecipeImage() {
      try {
        const imageURL = await Promise.all(
          collection.recipes_list.map(async (doc) => {
            const recipeDoc = await firestore()
              .collection("Recipes")
              .doc(doc)
              .get();
            return recipeDoc._data.recipe_img_url;
          })
        );
        if (imageURL !== undefined) {
          setRecipeImage(imageURL);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchRecipeImage();
  }, [collection.recipes_list]);

  return (
    <View>
      <Pressable
        className="pt-2 pl-1.5 border border-orange-200 rounded-xl relative"
        onPress={handleCollectionPress}
      >
        <View className="h-[180px] w-[180px] mb-1 bg-white rounded gap-1">
          <View className="flex flex-row flex-wrap gap-0.5">
            {recipeImage.length >= 1
              ? recipeImage.map((singleRecipe, index) => {
                  return (
                    <Image
                      className="w-[86px] h-[86px]"
                      key={index}
                      source={{ uri: singleRecipe }}
                    />
                  );
                })
              : null}
          </View>

        </View>
          <View>
            <Text className="text-sm font-semibold text-base mb-1">
              {collection.name}
            </Text>
          </View>
      </Pressable>
    </View>
  );
}

{
  /* <Image
  source={{
    uri:
      collection.image_url !== "" &&
      collection.image_url !== undefined
        ? collection.image_url
        : "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg",
  }}
  style={{ width: "100%", height: "100%", borderRadius: 8 }}
/> */
}

// const styles = StyleSheet.create({
//   container: {
//     width: "48%",
//     padding: 16,
//     marginBottom: 4,
//   },
//   image: {
//     width: "100%",
//     height: 150,
//     borderRadius: 8,
//     backgroundColor: "#ddd",
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginVertical: 8,
//   },
//   link: {
//     fontSize: 16,
//     color: "blue",
//   },
//   editButton: {
//     position: "absolute",
//     top: -14,
//     right: -15,
//     backgroundColor: "#FF9F00",
//     borderRadius: 16,
//     padding: 4,
//   },
//   editIcon: {
//     fontSize: 15,
//     color: "white",
//   },
// });
