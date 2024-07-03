// import { View, Text, TextInput, Button } from "react-native";
// import firestore from "@react-native-firebase/firestore";
// import { useState } from "react";
// import { useRouter, Link } from "expo-router";

// export default function ImportRecipePage() {
//     const [url, setUrl] = useState("");
//     const router = useRouter();

//     function handleSubmit() {
//         router.push({ pathname: "../pages/recipe-preview", params: { url } });
//     }

//     return (
//         <View className='flex-1 items-center justify-center bg-white'>
//             <TextInput
//                     style={{
//                       backgroundColor: "#dedede",
//                       height: 30,
//                       fontSize: 13,
//                   }}
//                 placeholder='Insert recipe URL here - import.jsx'
//                 value={url}
//                 onChangeText={setUrl}
//             />
//             <Button
//                 onPress={handleSubmit}
//                 title='Submit'
//                 accessibilityLabel='Submit URL button'
//             />
//         </View>
//     );
// }
