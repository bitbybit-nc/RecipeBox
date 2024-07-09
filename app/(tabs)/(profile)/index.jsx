import { View, Text, Pressable, StyleSheet, FlatList, ScrollView } from "react-native";
import auth from "@react-native-firebase/auth";
import { Link, router, } from "expo-router";
import { Image } from "expo-image";
import { firebase } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";

export default function MyProfilePage() {
  const user = firebase.auth().currentUser;
  const [username, setUsername] = useState(null);
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [displayNameTest, setDisplayNameTest] = useState(user.displayName);

  const logoutUser = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        router.replace("/");
      });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userCollection = await firestore().collection("Users").get();
      userCollection.docs.map((doc) => {
        if (doc._data.uid === user.uid) {
          setUsername(doc._data.username);
        }
      });
    };
    fetchCurrentUser();
    
    firestore()
      .collection("Recipes")
      .where("uid", "==", user.uid)
      .get()
      .then((querySnapshot) => {
        const recipesList = [];
        querySnapshot.forEach((documentSnapshot) => {
          recipesList.push({
            data: documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setRecipes(recipesList);
        console.log(recipes)
        setLoading(false);
    });
    
    
    firebase
      .auth()
      .currentUser.reload()
      .then(() => {
        const updatedUser = firebase.auth().currentUser;
        setDisplayNameTest(updatedUser.displayName);
      });
  }, [user]);

  return (
    <View className="flex-1 items-center justify-center bg-white m-1">
      <View className="w-8 h-8 rounded-full bg-orange-400 justify-center items-center absolute top-16 right-4">
        <Link href={{ pathname: "/profile-edit", params: { username } }}>
          <Icon name="pencil" style={{ color: "white" }} />
        </Link>
      </View>
      <View className="relative mb-20">
        <Image
          source={user.photoURL}
          className="mt-24 w-40 h-40 rounded-full self-center"
        />
      </View>

      <View>
        <Text className="mt-3">Name: {displayNameTest}</Text>
        <Text className="mt-3">Username: {username}</Text>
        <Text className="mt-3">Email: {user.email}</Text>
      </View>
      <View >
        <Text>My Recipes</Text>
        
        <ScrollView className="bg-slate-100 rounded-md p-4 mb-3" style={{ maxHeight: 80, width: 200, margin: 10}}>
          {recipes.map((recipe) => {
            return (
              <View key={recipe.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text key={recipe.id}>{recipe.data.title}</Text>
                <Image source={{ uri: recipe.data.recipe_img_url }} style={{ width: 50, height: 50, marginLeft: 10 }}></Image>
              </View>
          )
          })}
        </ScrollView>
      </View>

      <Text className="mt-10">Public Profile coming soon!</Text>

      <Pressable
        className="p-3 bg-orange-400 w-full rounded-md mt-20"
        onPress={logoutUser}
      >
        <Text className="text-white text-center text-sm font-medium leading-6">
          Log Out{" "}
        </Text>
      </Pressable>
    </View>
  );
}
