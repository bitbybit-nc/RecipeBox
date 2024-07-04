import { Link, useLocalSearchParams, useRouter, Stack } from "expo-router";
import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    Image,
    Item,
    Alert,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

function editRecipeCard({}) {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dietaryNeedsArray = params.dietary_needs
        ? params.dietary_needs.split(",")
        : [];
    const [dietaryImages, setDietaryImages] = useState([]);

    const [title, setTitle] = useState(params.title || "");
    const [sourceUrl, setSourceUrl] = useState(params.source_url || "");
    const [cookTime, setCookTime] = useState(params.cook_time || "");
    const [ingredients, setIngredients] = useState(params.ingredients || "");
    const [cookingMethod, setCookingMethod] = useState(
        params.cooking_method || ""
    );

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
    }, []);

    const handleSubmit = () => {
        const updatedRecipe = {
            title,
            source_url: sourceUrl,
            cook_time: cookTime,
            ingredients,
            cooking_method: cookingMethod,
            dietary_needs: dietaryNeedsArray,
        };

        firestore()
            .collection("Recipes")
            .doc(params.recipeId)
            .update(updatedRecipe)
            .then(() => {
                const recipeId = params.recipeId
                Alert.alert(
                    "Success",
                    "Recipe updated successfully",
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                router.push({
                                    pathname: "/recipe-card",
                                    params: { recipeId },
                                }),
                        },
                    ],
                    { cancelable: false }
                );
            })
            .catch((err) => err);
    };

    const handleDelete = () => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this recipe?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => {
                        firestore()
                            .collection("Recipes")
                            .doc(params.recipeId)
                            .delete()
                            .then(() => {
                                Alert.alert(
                                    "Deleted",
                                    "Recipe deleted successfully",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () =>
                                                router.push({
                                                    pathname: "/recipe-card",
                                                    params: { recipeId: 'LQM1aJAUX3DAWsTh40Z8' },
                                                }),
                                        },
                                    ],
                                    { cancelable: false }
                                );
                            })
                            .catch((err) => console.error(err));
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={{ backgroundColor: "#dedede" }}
                value={title}
                onChangeText={setTitle}
                placeholder='Title'
            />
            <TextInput
                style={{ backgroundColor: "#dedede" }}
                value={sourceUrl}
                onChangeText={setSourceUrl}
                placeholder='Source URL'
            />
            <View>
                <View
                    className='flex-row items-center justify-start mb-4'
                    style={[
                        styles.dietaryImagesContainer,
                        { flexDirection: "row" },
                    ]}
                >
                    {dietaryNeedsArray &&
                        dietaryNeedsArray.map((dietaryOption, index) => (
                            <View className='mr-2' key={index}>
                                <Image
                                    style={styles.tinyLogo}
                                    source={{
                                        uri: dietaryImages[dietaryOption],
                                    }}
                                />
                            </View>
                        ))}
                </View>
            </View>
            <View>
                <Text
                    style={{
                        marginTop: 10,
                        fontSize: 22,
                    }}
                >
                    Cooking time:
                </Text>
                <TextInput
                    style={{ backgroundColor: "#dedede" }}
                    value={cookTime}
                    onChangeText={setCookTime}
                    placeholder='Cooking Time'
                />
            </View>
            <View>
                <Text
                    style={{
                        marginTop: 10,
                        fontSize: 22,
                    }}
                >
                    Ingredient List:
                </Text>
                <TextInput
                    style={{
                        backgroundColor: "#dedede",
                        height: 140,
                        fontSize: 13,
                    }}
                    multiline={true}
                    value={ingredients}
                    onChangeText={setIngredients}
                    placeholder='Ingredients'
                />
            </View>
            <View>
                <Text
                    style={{
                        marginTop: 10,
                        fontSize: 22,
                    }}
                >
                    Cooking instructions
                </Text>
                <TextInput
                    style={{
                        backgroundColor: "#dedede",
                        height: 140,
                        fontSize: 13,
                    }}
                    multiline={true}
                    value={cookingMethod}
                    onChangeText={setCookingMethod}
                    placeholder='Cooking Method'
                />
            </View>
            <Button title='Save Recipe' onPress={handleSubmit} />
            <Button title='Delete Recipe' onPress={handleDelete} color='red' />
        </View>
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

export default editRecipeCard;
