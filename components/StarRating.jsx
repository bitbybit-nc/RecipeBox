import { View, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export function StarRating({ rating }) {
  const starIcons = [];
  const fullStars = Math.floor(rating);
  const isThereHalfStars = rating.toString().indexOf(".");

  for (let i = 0; i < fullStars; i++) {
    starIcons.push(
      <FontAwesome key={i} name="star" size={16} color="#708090" />
    );
  }
  if (isThereHalfStars === 1) {
    starIcons.push(
      <FontAwesome
        key={"halfstar-1"}
        name="star-half"
        size={16}
        color="#708090"
      />
    );
  }

  return (
    <View className="mt-1">
      {rating === 0 ? (
        <Text className="text-xs text-slate-500">No Ratings Yet</Text>
      ) : (
        <View className="flex-row gap-0.5">{starIcons}</View>
      )}
    </View>
  );
}
