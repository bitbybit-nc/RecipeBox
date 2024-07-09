import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export function TextFromScreenshot({ setText, fieldName }) {
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const pickScreenshotImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                await analyzeImage(result.assets[0].uri);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const analyzeImage = async (uri) => {
        try {
            setIsLoading(true);
            if (!uri) {
                Alert.alert("Select image first");
                return;
            }

            const apiKey = "AIzaSyDtzq8JepiKjjdVvvYcMjcgN6I8BNm_NgQ";
            const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

            const base64ImageData = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const requestData = {
                requests: [
                    {
                        image: { content: base64ImageData },
                        features: [
                            {
                                type: "TEXT_DETECTION",
                                maxResults: 3,
                            },
                        ],
                    },
                ],
            };

            const apiResponse = await axios.post(apiURL, requestData);
            const analyzedText =
                apiResponse.data.responses[0].fullTextAnnotation.text || "";

            const updatedText = inputText + "\n" + analyzedText;
            setInputText(updatedText.trim());
            setText(updatedText.trim());
        } catch (err) {
            console.log(err);
            Alert.alert("Error analyzing Image");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserInputChange = (text) => {
        setInputText(text);
        setText(text);
    };
    return (
        <View className='mb-3'>
            <Text className='block text-sm font-medium leading-6 text-gray-900 mb-1'>
                {fieldName}..
            </Text>
            <View className='relative'>
                <TextInput
                    className='bg-zinc-200 rounded-md p-3'
                    multiline={true}
                    onChangeText={handleUserInputChange}
                    value={inputText}
                    placeholder={ "1. Preheat oven to 425°F (220°C). 2. Cut the cauliflower into florets.3. Toss the cauliflower with olive oil, turmeric, cumin, salt, and pepper.4. Spread the cauliflower on a baking sheet.5. Roast in the preheated oven for 20-25 minutes, or until tender and browned.6. Remove from the oven and squeeze lemon juice over the top before serving"
                    }
                />
                <Pressable
                    className='absolute top-2 right-2 bg-orange-500 rounded-lg p-1'
                    onPress={pickScreenshotImage}
                >
                    <Text className='text-white'>
                        {isLoading ? "Importing..." : "Import from Screenshot"}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

export default TextFromScreenshot;
