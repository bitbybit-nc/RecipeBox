import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import firestore from "@react-native-firebase/firestore";

function FilterPage() {
  const { dietaries, matchAndDietaries, ratingOrder } = useLocalSearchParams();
  const [dietaryList, setDietaryList] = useState([]);
  const [dietariesChosen, setDietariesChosen] = useState(() => {
    if (dietaries !== undefined && dietaries !== "undefined") {
      return JSON.parse(dietaries);
    } else {
      return {
        chosen: [],
      };
    }
  });
  const [isDietaryAllEnabled, setIsDietaryAllEnabled] = useState(() => {
    if (matchAndDietaries === "true") {
      return true;
    } else {
      return false;
    }
  });
  const toggleDietarySwitch = () =>
    setIsDietaryAllEnabled((previousState) => !previousState);

  const [isRatingOrderEnabled, setIsRatingOrderEnabled] = useState(() => {
    if (ratingOrder === "true") {
      return true;
    } else {
      return false;
    }
  });
  const toggleRatingSwitch = () =>
    setIsRatingOrderEnabled((previousState) => !previousState);

  useEffect(() => {
    firestore()
      .collection("Dietary_needs")
      .get()
      .then((querySnapshot) => {
        const dietaryArray = [];
        querySnapshot.forEach((documentSnapshot) => {
          dietaryArray.push({
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        if (
          dietaries &&
          dietaries !== '{"chosen":[]}' &&
          dietaries !== "undefined"
        ) {
          const chosenIds = dietariesChosen.chosen.map(
            (chosenItem) => chosenItem.id
          );
          const filteredArray = dietaryArray.filter(
            (item) => !item.id.includes(chosenIds)
          );
          setDietaryList(filteredArray);
        } else {
          setDietaryList(dietaryArray);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const addDietary = (dietary) => {
    if (!dietariesChosen.chosen.map((item) => item.id).includes(dietary.id)) {
      const index = dietaryList.map((item) => item.id).indexOf(dietary.id);
      setDietariesChosen({ chosen: [...dietariesChosen.chosen, dietary] });
      dietaryList.splice(index, 1);
      setDietaryList([...dietaryList]);
    }
  };

  const removeDietary = (dietary) => {
    if (dietariesChosen.chosen.map((item) => item.id).includes(dietary.id)) {
      const dietaryToRemoveIndex = dietariesChosen.chosen
        .map((item) => item.id)
        .indexOf(dietary.id);
      dietariesChosen.chosen.splice(dietaryToRemoveIndex, 1);
      setDietariesChosen({ chosen: [...dietariesChosen.chosen] });
      setDietaryList([dietary, ...dietaryList]);
    }
  };

  const setFilters = () => {
    router.navigate({
      pathname: "/(searchrecipe)",
      params: {
        dietaries: JSON.stringify(dietariesChosen),
        matchAndDietaries: isDietaryAllEnabled,
        ratingOrder: isRatingOrderEnabled,
      },
    });
  };

  return (
    <View>
      <View className="m-3 p-3 w-screen">
        <Text className="block text-sm font-medium leading-6 text-gray-900">
          Dietary Needs
        </Text>

        <View className="">
          <View className="my-2">
            <FlatList
              data={dietaryList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => addDietary(item)}
                  className="items-center mr-3"
                >
                  <View
                    key={item.data.slug}
                    className="mr-1 bg-white rounded-full p-1 items-center justify-center"
                  >
                    <Image
                      className="w-8 h-8"
                      source={{ uri: item.data.image_url }}
                    />
                  </View>
                  <Text className="mt-1 text-xs">{item.data.display_name}</Text>
                </Pressable>
              )}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(dietary, index) => index}
            />
          </View>
          <View className="my-2">
            {dietariesChosen.chosen.length ? (
              <Text className="mb-1 text-xs">Filter by:</Text>
            ) : null}
            <FlatList
              data={dietariesChosen.chosen}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => removeDietary(item)}
                  className="items-center mr-3"
                >
                  <View
                    key={item.data.slug}
                    className="bg-green-300 rounded-full p-1 items-center justify-center"
                  >
                    <Image
                      className="w-8 h-8"
                      source={{ uri: item.data.image_url }}
                    />
                  </View>
                  <Text className="mt-1 text-xs">{item.data.display_name}</Text>
                </Pressable>
              )}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(dietary, index) => index}
            />
          </View>
        </View>
        {dietariesChosen.chosen.length > 1 ? (
          <View className="flex-row items-center my-2">
            <Switch
              trackColor={{ false: "#767577", true: "rgb(54 83 20)" }}
              className="scale-75"
              thumbColor={isDietaryAllEnabled ? "rgb(134 239 172)" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDietarySwitch}
              value={isDietaryAllEnabled}
            />
            {isDietaryAllEnabled ? (
              <Text className="ml-2">Match All</Text>
            ) : (
              <Text className="ml-2">Match Some</Text>
            )}
          </View>
        ) : null}

        <View>
          <Text className="block text-sm font-medium leading-6 text-gray-900">
            Rating
          </Text>
          <View className="flex-row items-center my-2">
            <Switch
              trackColor={{ false: "#767577", true: "rgb(54 83 20)" }}
              className="scale-75"
              thumbColor={isRatingOrderEnabled ? "rgb(134 239 172)" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleRatingSwitch}
              value={isRatingOrderEnabled}
            />
            {isRatingOrderEnabled ? (
              <Text className="ml-2">Yes! Highest rating first</Text>
            ) : (
              <Text className="ml-2">Show highest rated first?</Text>
            )}
          </View>
        </View>
      </View>

      <Pressable
        className="m-2 p-3 bg-orange-400 w-1/2 self-center rounded-md"
        onPress={setFilters}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Filter Recipes
        </Text>
      </Pressable>
    </View>
  );
}

export default FilterPage;
