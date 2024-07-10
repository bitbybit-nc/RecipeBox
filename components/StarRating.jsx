import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export function StarRating({ rating, handleRatingChange, userHasVoted }) {
    const starIcons = [];
    const ceilRating = Math.ceil(rating);

    for (let i = 1; i <= 5; i++) {
        starIcons.push(
            <Pressable
                key={i}
                onPress={() => handleRatingChange && handleRatingChange(i)}
                disabled={userHasVoted || !handleRatingChange}
            >
                <FontAwesome
                    name={i <= ceilRating ? "star" : "star-o"}
                    size={24}
                    color={userHasVoted ? "#FFA500" : "#708090"}
                />
            </Pressable>
        );
    }

    return (
        <View className='flex-row mt-1'>
            {starIcons}
            <Text className='ml-2 text-black'>{ceilRating}</Text>
        </View>
    );
}
