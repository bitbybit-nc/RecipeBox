import { Link, useLocalSearchParams, useRoute, Stack } from "expo-router";
import React from "react";
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

function editRecipeCard({}) {
    const params = useLocalSearchParams();
    const dietaryNeedsArray = params.dietary_needs ? params.dietary_needs.split(',') : [];
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
    }, []);

    console.log(dietaryNeedsArray);
    return (
        <View style={styles.container}>
            <TextInput
                style={{ backgroundColor: "#dedede" }}
                placeholder={params.title}
            />
            <Text>URL: {params.source_url}</Text>
            <View>
                <View
                className='flex-row items-center justify-start mb-4'
                style={[
                    styles.dietaryImagesContainer,
                    { flexDirection: "row" },
                ]}
            >
                {dietaryNeedsArray &&
                    dietaryNeedsArray.map((dietaryOption, index) => {
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
                {/* <MultipleSelectList
                    setSelected={(option) => setSelected(option)}
                    data={dietaryNeedsArray.map((option) => option.display_name)}
                    save='name'
                /> */}
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
                    style={{
                        backgroundColor: "#dedede",
                    }}
                    placeholder={params.cook_time}
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
                    placeholder={params.ingredients}
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
                    placeholder={params.cooking_method}
                />
            </View>
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
