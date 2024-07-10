import { Link, useLocalSearchParams, router } from "expo-router";
import {
    StyleSheet,
    View,
    Text,
    Image,
    Pressable,
    ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import { SimpleLineIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { StarRating } from "../components/StarRating";

export function RecipeCard({
    id,
    user,
    collectionAdded,
    navigation,
    location,
    updatedRecipe,
}) {
    const [currentRecipe, setCurrentRecipe] = useState({});
    const [currentCollections, setCurrentCollections] = useState([]);
    const [recipeUser, setRecipeUser] = useState();
    const [dietaryImages, setDietaryImages] = useState({});
    const [dietaryImagesText, setDietaryImagesText] = useState([]);
    const [userHasVoted, setUserHasVoted] = useState(false);
    const [userRating, setUserRating] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const dietaryCategory = await firestore()
                        .collection("Dietary_needs")
                        .get();
                    const images = {};
                    const text = {};

                    dietaryCategory.forEach((doc) => {
                        const data = doc.data();
                        images[data.slug] = data.image_url;
                        text[data.slug] = data.display_name;
                    });

                    setDietaryImages(images);
                    setDietaryImagesText(text);

                    const recipeDoc = await firestore()
                        .collection("Recipes")
                        .doc(id)
                        .get();
                    if (recipeDoc.exists) {
                        const recipeData = recipeDoc.data();
                        setCurrentRecipe(recipeData);

                        const { rating_count, rating_sum } = recipeData;

                        setUserRating(
                            recipeData.rating ? rating_sum / rating_count : 0
                        );

                        const userDoc = await firestore()
                            .collection("Users")
                            .where("uid", "==", recipeData.uid)
                            .get();
                        const userForRecipe = [];
                        userDoc.forEach((doc) => {
                            const data = doc.data();
                            userForRecipe.push(data);
                        });
                        setRecipeUser(userForRecipe[0]);
                    }

                    const collectionsDoc = await firestore()
                        .collection("Collections")
                        .where("recipes_list", "array-contains", id)
                        .where("user_id", "==", user)
                        .get();

                    const collectionsForUser = [];
                    collectionsDoc.forEach((doc) => {
                        const data = doc.data();
                        collectionsForUser.push({ data: data, id: doc.id });
                    });
                    setCurrentCollections(collectionsForUser);

                    const userVoteDoc = await firestore()
                        .collection("Users")
                        .doc(user)
                        .get();

                    if (userVoteDoc.exists) {
                        const userVoteData = userVoteDoc.data();
                        if (userVoteData.voted_recipes.includes(id)) {
                            setUserHasVoted(true);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };

        fetchData();
    }, [id, collectionAdded, navigation, updatedRecipe]);

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

    const handleRatingChange = async (newRating) => {
        try {
            await firestore()
                .collection("Recipes")
                .doc(id)
                .update({
                    rating_count: firestore.FieldValue.increment(1),
                    rating_sum: firestore.FieldValue.increment(newRating),
                });

            const updatedRecipeDoc = await firestore()
                .collection("Recipes")
                .doc(id)
                .get();

            if (updatedRecipeDoc.exists) {
                const updatedRecipeData = updatedRecipeDoc.data();
                setCurrentRecipe(updatedRecipeData);

                const newRatingSum = updatedRecipeData.rating_sum;
                const newRatingCount = updatedRecipeData.rating_count;
                const newAverageRating = Math.ceil(
                    newRatingSum / newRatingCount
                );

                if (newAverageRating > 5) {
                    newAverageRating = 5;
                }
                setUserRating(newAverageRating);
                setUserHasVoted(true);

                await firestore().collection("Recipes").doc(id).update({
                    rating: newAverageRating,
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <ScrollView>
            <View className='flex-1 mx-2 px-3 py-3'>
                <Image
                    className='w-full h-52 rounded-lg'
                    source={{ uri: currentRecipe.recipe_img_url }}
                />

                <Text className='my-2 font-medium text-lg'>
                    {currentRecipe.title}
                </Text>
                <View className='mb-4'>
                    <StarRating
                        rating={userRating}
                        handleRatingChange={handleRatingChange}
                        userHasVoted={userHasVoted}
                    />
                </View>

                <View className='flex-row mb-3 '>
                    {currentRecipe.dietary_needs &&
                        currentRecipe.dietary_needs.map(
                            (dietaryOption, index) => {
                                return (
                                    <View
                                        className='items-center mr-3'
                                        key={index}
                                    >
                                        <View className='mr-1 bg-white rounded-full p-1 items-center justify-center'>
                                            <Image
                                                className='w-8 h-8'
                                                source={{
                                                    uri: dietaryImages[
                                                        dietaryOption
                                                    ],
                                                }}
                                            />
                                        </View>
                                        <Text className='mt-1 text-xs'>
                                            {dietaryImagesText[dietaryOption]}
                                        </Text>
                                    </View>
                                );
                            }
                        )}
                </View>

                <View>
                    <Text className='text-lg font-small text-black mb-2 mt-2'>
                        Categories:
                    </Text>
                    <Text className='text-sm mb-4'>
                        {currentRecipe.category}
                    </Text>
                </View>

                <View className='flex-row justify-between items-center'>
                    <View className='rounded-lg pt-3 flex-row gap-2 items-center mb-4'>
                        <SimpleLineIcons name='clock' size={24} color='black' />
                        <Text className=''>
                            {formatCookTime(currentRecipe.cook_time)}
                        </Text>
                    </View>

                    <View className=''>
                        <Pressable
                            className='p-2'
                            onPress={() =>
                                router.push({
                                    pathname: `/${location}/recipe/add-to-collection`,
                                    params: {
                                        currentCollections:
                                            JSON.stringify(currentCollections),
                                        id: id,
                                        location: location,
                                    },
                                })
                            }
                        >
                            <View className='flex-row items-center'>
                                {!currentCollections.length ? (
                                    <View className='items-center'>
                                        <SimpleLineIcons
                                            name='plus'
                                            size={24}
                                            color='black'
                                        />
                                        <Text>{currentRecipe.saved_count}</Text>
                                        <Text>Save</Text>
                                    </View>
                                ) : (
                                    <View className='items-center'>
                                        <FontAwesome
                                            name='heart'
                                            size={24}
                                            color='black'
                                        />
                                        <Text>{currentRecipe.saved_count}</Text>
                                        <Text>Saved</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    </View>
                </View>

                <View className='w-full mb-4'>
                    <Text className='text-lg font-medium text-black mb-2 mt-2'>
                        Ingredients:
                    </Text>
                    <Text className='text-sm'>{currentRecipe.ingredients}</Text>
                </View>

                <View className='w-full mb-4'>
                    <Text className='text-lg font-medium text-black mb-2'>
                        Cooking method:
                    </Text>
                    <Text className='text-sm'>
                        {currentRecipe.cooking_method}
                    </Text>
                </View>

                <View>
                    <Text className='font-medium mb-2'>Created By:</Text>
                    <View className='flex-row items-center'>
                        <Image
                            className='rounded-full w-7 h-7'
                            source={{
                                uri:
                                    recipeUser &&
                                    recipeUser.photoURL !== undefined
                                        ? recipeUser.photoURL
                                        : "https://firebasestorage.googleapis.com/v0/b/recipebox-3895d.appspot.com/o/Users%2Fplaceholder.png?alt=media&token=6fec34d3-f856-4565-a218-f822ca392a70",
                            }}
                        />
                        <Text className='ml-2 text-black'>
                            {recipeUser ? recipeUser.username : "ANON"}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

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
});
