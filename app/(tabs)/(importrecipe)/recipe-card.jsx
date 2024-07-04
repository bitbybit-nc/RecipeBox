import { Link, useLocalSearchParams, useRouter } from "expo-router";
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
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

export default function RecipeCard() {
    // const  params  = useLocalSearchParams();
    const router = useRouter();
    const [currentRecipe, setCurrentRecipe] = useState([]);
    const [dietaryImages, setDietaryImages] = useState([]);

    useEffect(() => {
        firestore()
            .collection("Dietary_needs")
            .get()
            .then((dietaryCategory) => {
                const images = {};

                dietaryCategory.forEach((doc) => {
                    images[doc._data.slug] = doc._data.image_url;
                });
                setDietaryImages(images);
            })
            .catch((err) => err);

        firestore()
            .collection("Recipes")
            .doc(`LQM1aJAUX3DAWsTh40Z8`)
            .get()
            .then((result) => {
                setCurrentRecipe(result._data);
            })
            .catch((err) => err);
    }, []);




    // console.log(dietaryImages['Nut_free'])
    return (
        <View
            style={styles.mainContainer}
            className='flex-1 items-center justify-center bg-white '
        >
            <View style={styles.headerContainer}>
                <Text className='text-xl font-medium text-black mb-4'>
                    {currentRecipe.title}
                </Text>
                <Button
                    title='Edit'
                    onPress={() =>  router.push({ pathname: "/edit-recipe-card", params:  currentRecipe  })}
                    style={styles.editButton}
                />
            </View>
            <Image
                style={styles.midLogo}
                source={{
                    uri: currentRecipe.recipe_img_url,
                }}
            />
            <Text className='text-black mb-4'>{`URL: ${currentRecipe.source_url}`}</Text>

            <View
                className='flex-row items-center justify-start mb-4'
                style={[
                    styles.dietaryImagesContainer,
                    { flexDirection: "row" },
                ]}
            >
                {currentRecipe.dietary_needs &&
                    currentRecipe.dietary_needs.map((dietaryOption, index) => {
                        return (
                            <View className='mr-2' key={index}>
                                <Image
                                    style={styles.tinyLogo}
                                    source={{
                                        uri: dietaryImages[dietaryOption],
                                    }}
                                />
                            </View>
                        );
                    })}
            </View>

            <View style={styles.cookingTimeContainer}>
                <Text className='text-xl font-medium text-black'>
                    Cooking time:
                </Text>
                <Text className='text-m font-medium text-black'>
                    {currentRecipe.cook_time}
                </Text>
            </View>
            <View style={styles.ingredientsContainer}>
                <Text className='text-xl font-medium text-black'>
                    Ingredients:
                </Text>
                <Text className='text-s font-medium text-black'>
                    {currentRecipe.ingredients}
                </Text>
            </View>
            <View style={styles.cookingMethodContainer}>
                <Text className='text-xl font-medium text-black'>
                    Cooking method:
                </Text>
                <Text className='text-s font-medium text-black'>
                    {currentRecipe.cooking_method}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        marginTop: 60,
        alignItems: "center",
        justifyContent: "flex-start",
    },

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

    editButton: {
        marginLeft: 10,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "70%",
        paddingTop: 10,
        marginBottom: 10,
    },
    cookingTimeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "70%",
        marginBottom: 10,
    },
    ingredientsContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        width: "70%",
        marginBottom: 20,
    },
    cookingMethodContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        width: "70%",
        marginBottom: 10,
    },
});
