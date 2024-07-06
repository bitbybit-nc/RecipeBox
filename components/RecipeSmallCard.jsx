import { View, Text, ImageBackground, Image } from "react-native";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { StarRating } from "./StarRating";

export function RecipeSmallCard({ recipe: { item } }) {
  const [dietary, setDietary] = useState([]);
  // console.log(item);
  useEffect(() => {
    if (item.dietary_needs.length) {
      firestore()
        .collection("Dietary_needs")
        .where("__name__", "in", [...item.dietary_needs])
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
  }, [item]);

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
    <View className="p-3 mt-1 rounded-md w-1/2">
      <ImageBackground
        source={{
          uri: item.recipe_img_url,
        }}
        imageStyle={{ borderRadius: 6 }}
        resizeMode="cover"
        className="justify-between w-full h-40"
      >
        <View className="bg-orange-500 rounded-lg p-1 items-end self-end mt-2 mr-2">
          <Text className="text-white">{formatCookTime(item.cook_time)}</Text>
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

      <StarRating rating={item.rating} />
      <Text className="text-left pt-1 leading-4 font-medium">{item.title}</Text>
    </View>
  );
}
