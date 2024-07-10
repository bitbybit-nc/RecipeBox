import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export function StarRatingVote({ rating, onRatingChange }) {
    const starIcons = [];
    const ceilRating = Math.ceil(rating);

    for (let i = 1; i <= 5; i++) {
        starIcons.push(
            <Pressable key={i} onPress={() => onRatingChange(i)}>
                <FontAwesome
                    name={i <= ceilRating ? "star" : "star-o"}
                    size={24}
                    color='#708090'
                />
            </Pressable>
        );
    }

    return (
        <View>
            {rating === NaN ? (
                <View className='flex-row mt-1'>
                    {starIcons}
                    <Text className='ml-2 text-black'>0</Text>
                </View>
            ) : (
                <View className='flex-row mt-1'>
                    {starIcons}
                    <Text className='ml-2 text-black'>{ceilRating}</Text>
                </View>
            )}
        </View>
    );
}
