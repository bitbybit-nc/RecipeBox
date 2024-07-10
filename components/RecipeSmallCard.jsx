import { View, Text, ImageBackground, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { StarRating } from "./StarRating";
import { router } from "expo-router";

export function RecipeSmallCard({
  recipe: {
    item: { data, id },
  },
  user,
  location,
}) {
  const [dietary, setDietary] = useState([]);
  useEffect(() => {
    if (data.dietary_needs.length) {
      firestore()
        .collection("Dietary_needs")
        .where("__name__", "in", [...data.dietary_needs])
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
  }, [data, location]);

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

  const navigateToRecipe = () => {
    router.navigate({
      pathname: `/${location}/recipe/${id}`,
      params: { user: user, recipeUser: data.uid },
    });
  };

  return (
    <View className="p-3 mt-1 rounded-md w-1/2">
      <Pressable
        className="w-full items-start flex-col"
        onPress={navigateToRecipe}
      >
        <ImageBackground
          source={{
            uri: data.recipe_img_url,
          }}
          imageStyle={{ borderRadius: 6 }}
          resizeMode="cover"
          className="justify-between w-full h-40"
        >
          {data.trending ? (
            <View className="absolute top-0 left-0 ml-[-12] mt-[-15]">
              <Image
                className="w-8 h-8"
                source={{
                  uri: "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Recipes%2Ftrending-icon1.png?alt=media&token=7f922d7a-5e37-4d6b-946f-47b0675d88ba",
                }}
              />
            </View>
          ) : null}
          <View className="bg-orange-500 rounded-lg p-1 items-end self-end mt-2 mr-2">
            <Text className="text-white">{formatCookTime(data.cook_time)}</Text>
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

        <StarRating rating={data.rating} />
        <Text className="text-left pt-1 leading-4 font-medium">
          {data.title}
        </Text>
      </Pressable>
    </View>
  );
}
