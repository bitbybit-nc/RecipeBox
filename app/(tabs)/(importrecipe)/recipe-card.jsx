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
    const [currentRecipe, setCurrentRecipe] = useState([]);
    const [dietaryImages, setDietaryImages] = useState([]);
    const [selectedDietaryNeeds, setSelectedDietaryNeeds] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [collectionList, setCollectionList] = useState([]);
    const [selectedCollectionName, setSelectedCollectionName] = useState("");

    // const TESTPARAMS = "xgGW8R2SGvG2FyxnQ6Go";

    useEffect(() => {
        if (params.id) {
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
                .doc(params.recipeId) //dont delete using for testing
                // .doc("xgGW8R2SGvG2FyxnQ6Go") //dont delete used for testing
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const recipeData = doc._data;
                        setCurrentRecipe(recipeData);
                        setSelectedDietaryNeeds(recipeData.dietary_needs || []);
                    } else {
                        console.log("no recipe");
                    }
                })
                .catch((err) => err);

            firestore()
                .collection("Collections")
                .get()
                .then((collection) => {
                    const names = [];
                    collection.forEach((doc) => {
                        names.push(doc._data.name);
                    });
                    setCollectionList(names);
                })
                .catch((err) => err);
        }
    }, [params.recipeId]);

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

    const handleAddToCollection = (collectionName) => {
        setSelectedCollectionName(collectionName);

        firestore()
            .collection("Collections")
            .where("name", "==", collectionName)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const collectionDoc = querySnapshot.docs[0];
                    const collectionId = collectionDoc.id;
                    const currentRecipeId = params.recipeId;

                    firestore()
                        .collection("Collections")
                        .where(
                            "recipes_list",
                            "array-contains",
                            currentRecipeId
                        )
                        .get()
                        .then((snapshot) => {
                            snapshot.forEach((doc) => {
                                const docId = doc.id;
                                const updatedRecipeIds =
                                    doc._data.recipes_list.filter(
                                        (id) => id !== currentRecipeId
                                    );

                                firestore()
                                    .collection("Collections")
                                    .doc(docId)
                                    .update({
                                        recipes_list: updatedRecipeIds,
                                    })
                                    .then(() => {
                                        console.log(
                                            `Removed recipe from collection: ${docId}`
                                        );
                                        setModalVisible(false);
                                    })
                                    .catch((err) => err);
                            });
                            const updatedRecipeIds = [
                                ...collectionDoc._data.recipes_list,
                                currentRecipeId,
                            ];

                            firestore()
                                .collection("Collections")
                                .doc(collectionId)
                                .update({
                                    recipes_list: updatedRecipeIds,
                                })
                                .then(() => {
                                    console.log("Recipe added to collection");
                                    setModalVisible(false);
                                })
                                .catch((err) => err);
                        });
                } else {
                    console.log("no collection found");
                }
            })
            .catch((err) => err);
    };

    const filteredCollections = collectionList.filter(
        (collectionName) =>
            !currentRecipe.recipes_list ||
            !currentRecipe.recipes_list.includes(params.recipeId)
    );
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
                    onPress={handleEdit}
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

            <View style={styles.centeredView}>
                <View>
                    <Text
                        style={{
                            marginTop: 10,
                            fontSize: 15,
                        }}
                    >
                        Created by user John
                    </Text>
                    <Text
                        style={{
                            marginTop: 10,
                            fontSize: 15,
                        }}
                    >
                        {selectedCollectionName}
                    </Text>
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            Alert.alert("Modal has been closed.");
                            setModalVisible(!modalVisible);
                        }}
                    >
                        <View>
                            <Text style={styles.textStyle}>
                                Add to collections
                            </Text>
                        </View>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                            <Text className='text-xl  font-medium text-black'>
                                                Add to collections
                                            </Text>
                                {filteredCollections.map(
                                    (collectionName, index) => (
                                        <View>

                                            <Pressable
                                                key={index}
                                                className='mt-1 p-1 bg-gray-400 w-full rounded-md'
                                                onPress={() =>
                                                    handleAddToCollection(
                                                        collectionName
                                                    )
                                                }
                                            >
                                                <Text className='mt-1 p-1 bg-gray-400 w-full rounded-md'>
                                                    {collectionName}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )
                                )}
                                <Pressable
                                    className='mt-5 p-3 bg-orange-400 w-full rounded-md'
                                    onPress={() =>
                                        setModalVisible(!modalVisible)
                                    }
                                >
                                    <Text className='text-white text-center text-sm font-medium leading-6'>
                                        Hide Modal
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                    <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.textStyle}>Add to collections</Text>
                    </Pressable>
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

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },

    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 40,
        paddingTop: 80,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
});
