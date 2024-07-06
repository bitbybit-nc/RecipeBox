import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    Image,
    Item,
    Modal,
    Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { MultipleSelectList } from "react-native-dropdown-select-list";

export default function RecipeCard() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [currentRecipe, setCurrentRecipe] = useState({});
    const [dietaryImages, setDietaryImages] = useState({});
    const [dietaryImagesText, setDietaryImagesText] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [collectionList, setCollectionList] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);
    const [currentCollection, setCurrentCollection] = useState({});

    // const TESTPARAMS = "xgGW8R2SGvG2FyxnQ6Go";

    useEffect(() => {
        const fetchData = async () => {
            if (params.recipeId) {
                try {
                    const dietaryCategory = await firestore()
                        .collection("Dietary_needs")
                        .get();
                    const images = {};
                    const text = {};

                    dietaryCategory.forEach((doc) => {
                        images[doc._data.slug] = doc._data.image_url;
                        text[doc._data.slug] = doc._data.display_name;
                    });

                    setDietaryImages(images);
                    setDietaryImagesText(text);

                    const recipeDoc = await firestore()
                        .collection("Recipes")
                        .doc(params.recipeId)
                        .get();
                    if (recipeDoc.exists) {
                        setCurrentRecipe(recipeDoc._data);
                    }

                    const collections = await firestore()
                        .collection("Collections")
                        .get();
                    const names = [];
                    let currentCollection = null;

                    collections.forEach((doc) => {
                        names.push(doc._data.name);
                        for (let recipe of doc._data.recipes_list) {
                            if (recipe === params.recipeId) {
                                currentCollection = {
                                    image_url: doc._data.image_url,
                                    name: doc._data.name,
                                };
                                setCurrentCollection(currentCollection);
                            }
                        }
                    });

                    const filteredNames = currentCollection
                        ? names.filter(
                              (name) => name !== currentCollection.name
                          )
                        : names;

                    setCollectionList(filteredNames);
                } catch (err) {
                    console.error(err);
                }
            }
        };

        fetchData();
    }, [params.recipeId, modalVisible]);

    const handleEdit = () => {
        if (currentRecipe) {
            router.push({
                pathname: "/edit-recipe-card",
                params: {
                    ...currentRecipe,
                    recipeId: params.recipeId,
                },
            });
        }
    };

    const handleAddToCollection = async (collectionName) => {
        try {
            const querySnapshot = await firestore()
                .collection("Collections")
                .where("name", "==", collectionName)
                .get();
            if (!querySnapshot.empty) {
                const collectionDoc = querySnapshot.docs[0];
                const collectionId = collectionDoc.id;
                const currentRecipeId = params.recipeId;

                const snapshot = await firestore()
                    .collection("Collections")
                    .where("recipes_list", "array-contains", currentRecipeId)
                    .get();
                for (let doc of snapshot.docs) {
                    const docId = doc.id;
                    const updatedRecipeIds = doc._data.recipes_list.filter(
                        (id) => id !== currentRecipeId
                    );

                    await firestore()
                        .collection("Collections")
                        .doc(docId)
                        .update({ recipes_list: updatedRecipeIds });
                    console.log(`Removed recipe from collection: ${docId}`);
                    setModalVisible(false);
                }

                const updatedRecipeIds = [
                    ...collectionDoc._data.recipes_list,
                    currentRecipeId,
                ];
                await firestore()
                    .collection("Collections")
                    .doc(collectionId)
                    .update({ recipes_list: updatedRecipeIds });

                console.log("Recipe added to collection");
                const newCollection = collectionList.filter(
                    (name) => name !== collectionName
                );
                setFilteredCollections(newCollection);
                setModalVisible(false);
            } else {
                console.log("no collection found");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const displayedCollections = filteredCollections.length
        ? filteredCollections
        : collectionList;

    return (
        <View className='flex-1 items-center justify-center bg-white '>
            <View className='w-full flex-row justify-end p-4'>
                <Button
                    title='Edit'
                    onPress={handleEdit}
                    style={styles.editButton}
                />
            </View>
            <Image
                style={styles.midLogo}
                source={{ uri: currentRecipe.recipe_img_url }}
            />
            <View>
                <Text className='w-full flex-row justify-between items-center p-4'>
                    {currentRecipe.title}
                </Text>
            </View>

            <View
                className='flex-row items-center justify-start mb-4'
                style={[
                    styles.dietaryImagesContainer,
                    { flexDirection: "row" },
                ]}
            >
                {currentRecipe.dietary_needs &&
                    currentRecipe.dietary_needs.map((dietaryOption, index) => (
                        <View key={index}>
                            <View className='mr-2'>
                                <Image
                                    style={styles.tinyLogo}
                                    source={{
                                        uri: dietaryImages[dietaryOption],
                                    }}
                                />
                            </View>
                            <View>
                                <Text>{dietaryImagesText[dietaryOption]}</Text>
                            </View>
                        </View>
                    ))}
            </View>

            <View className='w-full flex-row justify-between items-center px-4 mb-4'>
                <View className='flex-row items-center'>
                    <Text className='text-xl font-medium text-black'>
                        Cooking time:
                    </Text>
                    <Text className='text-m font-medium text-black ml-2'>
                        {currentRecipe.cook_time}
                    </Text>
                </View>
            </View>

            <View className='flex-row items-center'>
                <Image
                    style={styles.profilePic}
                    source={{ uri: "https://via.placeholder.com/150" }}
                />
                <Text className='ml-2 text-black'>John</Text>
            </View>
            {/* <Text  className="text-xl font-medium text-black">{`URL: ${currentRecipe.source_url}`}</Text> */}
            <View className='w-full items-end px-4 mb-4'>
                {!currentCollection.name ? (
                    <Pressable
                        className='p-2 bg-green-200 rounded-md'
                        onPress={() => setModalVisible(true)}
                    >
                        <View className='flex-row items-center'>
                            <Text className='text-m bg-white font-medium text-black ml-2'>
                                Add to collection
                            </Text>
                        </View>
                    </Pressable>
                ) : (
                    <Pressable
                        className='p-2 bg-green-200 rounded-md'
                        onPress={() => setModalVisible(true)}
                    >
                        <View className='flex-row items-center'>
                            <Image
                                style={styles.profilePic}
                                source={{ uri: currentCollection.image_url }}
                            />
                            <Text className='text-m bg-white font-medium text-black ml-2'>
                                {currentCollection.name}
                            </Text>
                        </View>
                    </Pressable>
                )}
            </View>

            <View className='w-full px-4 mb-4'>
                <Text className='text-xl font-medium text-black'>
                    Ingredients:
                </Text>
                <Text className='text-s font-medium text-black'>
                    {currentRecipe.ingredients}
                </Text>
            </View>
            <View className='w-full px-4 mb-4'>
                <Text className='text-xl font-medium text-black'>
                    Cooking method:
                </Text>
                <Text className='text-s font-medium text-black'>
                    {currentRecipe.cooking_method}
                </Text>
            </View>

            <Modal
                animationType='slide'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <View className='flex-1 justify-center items-center'>
                    <View className='bg-white p-8 rounded-md shadow-md'>
                        <Text className='text-xl font-medium text-black mb-4'>
                            Add to collections
                        </Text>
                        {displayedCollections.map((collection, index) => (
                            <Pressable
                                key={index}
                                className='mt-1 p-2 bg-gray-400 w-full rounded-md'
                                onPress={() =>
                                    handleAddToCollection(collection)
                                }
                            >
                                <Text className='text-black'>{collection}</Text>
                            </Pressable>
                        ))}
                        <Pressable
                            className='mt-5 p-3 bg-orange-400 w-full rounded-md'
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text className='text-white text-center text-sm font-medium leading-6'>
                                Hide Modal
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
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
