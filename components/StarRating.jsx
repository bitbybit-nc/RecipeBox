import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export function StarRating({ rating }) {
    const starIcons = [];
    const ceilRating = Math.ceil(rating);

    for (let i = 1; i <= 5; i++) {
        starIcons.push(
            <FontAwesome
                name={i <= ceilRating ? "star" : "star-o"}
                size={24}
                color='#708090'
            />
        );
    }

    return (
        <View className='flex-row mt-1'>
            {starIcons}
            <Text className='ml-2 text-black'>{ceilRating}</Text>
        </View>
    );
}
