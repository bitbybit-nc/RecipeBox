import { Link, useLocalSearchParams, useRoute } from "expo-router";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    Image,
    item,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

export default function RecipeCard(recipe_id) {
    const { params } = useLocalSearchParams();
    const [currentRecipe, setCurrentRecipe] = useState([]);
    const [dietaryImages, setDietaryImages] = useState([]);

    useEffect(() => {
        firestore()
            .collection("Dietary-needs")
            .get()
            .then((dietaryCategory) => {
                const images = {};
                dietaryCategory.forEach((doc) => {
                    images[doc._data["name"]] = doc._data["image-url"];
                });
                setDietaryImages(images);
            })
            .catch((err) => console.log(err));

        firestore()
            .collection("Recipes")
            .doc(`EpnFrVebE1srTnUThVb6`)
            .get()
            .then((result) => {
                setCurrentRecipe(result._data);
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <View className='flex-1 items-center justify-center bg-white'>
            <Text className='text-xl font-medium text-black'>
                {currentRecipe.title}
            </Text>
            <Image
                style={styles.midLogo}
                source={{
                    uri: currentRecipe["recipe-img-url"],
                }}
            />
            <Text>{`URL: ${currentRecipe["source-url"]}`}</Text>

            <View
                style={[
                    styles.dietaryImagesContainer,
                    { flexDirection: "row" },
                ]}
            >
                {currentRecipe["dietary-needs"] &&
                    currentRecipe["dietary-needs"].map(
                        (dietaryOption, index) => {
                            const url = dietaryOption.toLowerCase();
                            return (
                                <View key={index}>
                                    <Image
                                        style={styles.tinyLogo}
                                        source={{
                                            uri: dietaryImages[url],
                                        }}
                                    />
                                </View>
                            );
                        }
                    )}
            </View>

            <View>
                <Text className='text-xl font-medium text-black'>
                    Cooking time:
                </Text>
                <Text className='text-m font-medium text-black'>
                    {currentRecipe["cook-time"]}
                </Text>
            </View>
            <View>
                <Text className='text-xl font-medium text-black'>
                    Ingredients:
                </Text>
                <Text className='text-s font-medium text-black'>
                    {currentRecipe["ingredients"]}
                </Text>
            </View>
            <View>
                <Text className='text-xl font-medium text-black'>
                    Cooking method:
                </Text>
                <Text className='text-s font-medium text-black'>
                    {currentRecipe["cooking-method"]}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dietaryImagesContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    midLogo: {
        width: 300,
        height: 100,
    },
    tinyLogo: {
        width: 50,
        height: 50,
    },
});
