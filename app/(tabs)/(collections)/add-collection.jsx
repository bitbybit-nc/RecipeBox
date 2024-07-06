import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    Image,
    Pressable,
    Switch,
    StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

function AddCollection() {
    const user = auth().currentUser;
    const router = useRouter();
    const [collectionName, setCollectionName] = useState("");
    const [url, setUrl] = useState("");
    const [visible, setVisible] = useState(false);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [collectionVisibility, setCollectionVisibility] = useState(false);
    const [collectionDescription, setCollectionDescription] = useState("");

    useEffect(() => {
        if (url !== "") {
            setVisible(true);
            setImage(null);
        } else {
            setVisible(false);
        }
    }, [url]);

    const handleAddCollection = async () => {
        firestore()
            .collection("Collections")
            .add({
                name: collectionName,
                recipes_list: [],
                is_public: collectionVisibility,
                user_id: user.uid,
                image_url: image || url,
                description: collectionDescription,
            })
            .then(() => {
                router.navigate({
                    pathname: "/(collections)",
                });
                console.log("Collection added!");
            });

        setCollectionName("");
        setUrl("");
        setImage(null);
        setVisible(false);
    };

    const handleCollectionVisiblity = async () => {
        setCollectionVisibility(!collectionVisibility);
    };

    const pickImage = async () => {
        setUrl("");
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const reference = storage().ref(
                `Users/${user.uid}/${new Date().getTime()}.jpg`
            );

            try {
                setIsLoading(true);
                await reference.putFile(imageUri);
                const imageUrlDownload = await reference.getDownloadURL();
                setImage(imageUrlDownload);
                setIsLoading(false);
            } catch (err) {
                console.log(err);
                setIsLoading(false);
            }
        }
    };

    return (
        <View className='flex-1 p-4 bg-white'>
            {/* <Text className="text-2xl font-bold mb-4">Add Collection</Text> */}
            <View className='m-3 p-3 w-screen items-center flex-row justify-center'>
                <View className='w-9/12'>
                    <Pressable onPress={pickImage}>
                        {image ? (
                            <View>
                                <Image
                                    source={{ uri: image }}
                                    style={styles.midLogo}
                                />
                            </View>
                        ) : (
                            <View>
                                <Image
                                    source={{
                                        uri: "https://uxwing.com/wp-content/themes/uxwing/download/video-photography-multimedia/add-image-photo-icon.png",
                                    }}
                                    style={styles.midLogo}
                                />
                                <Text className='text-center text-sm font-medium leading-6'>
                                    Add to collection image
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
            {visible && (
                <View className='items-center justify-center mt-4'>
                    {url && (
                        <Image
                            source={{ uri: url }}
                            className='w-32 h-32 rounded-full self-center'
                        />
                    )}
                </View>
            )}
            <View>
                <TextInput
                    className='h-10 border border-gray-400 mb-4 px-2'
                    placeholder='Collection Name'
                    value={collectionName}
                    onChangeText={setCollectionName}
                />

                <TextInput
                    className='h-20 border border-gray-400 mb-4 px-2'
                    placeholder='Collection Description'
                    value={collectionDescription}
                    onChangeText={setCollectionDescription}
                />
            </View>
            <View className='flex-row items-center justify-between mt-4 mb-4'>
                <Text className='text-xl font-medium text-black'>
                    {collectionVisibility
                        ? "Collection is: Public"
                        : "Collection is: Private"}
                </Text>
                <Switch
                    trackColor={{ false: "#767577", true: "rgb(54 83 20)" }}
                    className='scale-100'
                    thumbColor={
                        collectionVisibility ? "rgb(134 239 172)" : "#f4f3f4"
                    }
                    ios_backgroundColor='#3e3e3e'
                    onValueChange={handleCollectionVisiblity}
                    value={collectionVisibility}
                />
            </View>
            <Button title='Add collection' onPress={handleAddCollection} />
        </View>
    );
}

export default AddCollection;

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
