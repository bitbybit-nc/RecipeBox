import { View, Text, ImageBackground, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { StarRating } from "./StarRating";
import { router } from "expo-router";

export function RecipeSmallDisplay({ recipe }) {
  const [dietary, setDietary] = useState([]);
  useEffect(() => {
    if (recipe.dietary_needs.length) {
      firestore()
        .collection("Dietary_needs")
        .where("__name__", "in", recipe.dietary_needs)
        .get()
        .then((querySnapshot) => {
          const dietaryArray = [];
          querySnapshot.forEach((documentSnapshot) => {
            dietaryArray.push(documentSnapshot.data());
          });
          setDietary(dietaryArray);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [recipe]);

  const formatCookTime = (mins) => {
    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      const restOfMins = mins - hours * 60;
      return hours === 1
        ? hours + " hr " + restOfMins + " mins "
        : hours + " hrs " + restOfMins + " mins ";
    } else {
      return mins + " mins ";
    }
  };

  return (
    <View className="mt-1 rounded-md">
      <ImageBackground
        source={{
          uri: recipe.recipe_img_url,
        }}
        imageStyle={{ borderRadius: 6 }}
        resizeMode="cover"
        className="justify-between w-full h-40"
      >
        <View className="bg-orange-500 rounded-lg p-1 items-end self-end mt-2 mr-2">
          <Text className="text-white">{formatCookTime(recipe.cook_time)}</Text>
        </View>

        <View className="flex-row ml-2 mb-2 ">
          {dietary.map((type, index) => {
            return (
              <View key={index} className="mr-1 bg-white rounded-full p-1">
                <Image className="w-5 h-5" source={{ uri: type.image_url }} />
              </View>
            );
          })}
        </View>
      </ImageBackground>

      <StarRating rating={recipe.rating} userHasVoted={userHasVoted} />
      <Text className="text-left pt-1 leading-4 font-medium">
        {recipe.title}
      </Text>
    </View>
  );
}
