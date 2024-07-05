import { useLocalSearchParams } from "expo-router";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";


function SingleCollection() {
  const { id } = useLocalSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false)
  const [empty, setEmpty] = useState(false)

  const styles = StyleSheet.create({
    heading: { flex: 1, padding: 16, backgroundColor: '#fff' },
    recipes: { flex: 1, backgroundColor: '#FFEB3B', padding: 16 }
  })

  useEffect(() => {
    setLoading(true)
      firestore()
      .collection('Collections')
      .doc(id)
      .get()
      .then((querySnapshot) => {
      
        return querySnapshot.data()
      })
      .then((data)=> {
        console.log(data)
        if (data.recipes_list.length !== 0){
          firestore()
          .collection('Recipes')
          .where('__name__', 'in', data.recipe_id)
          .get()
          .then((querySnapshot) => {
            const recipesList = []
            querySnapshot.forEach((documentSnapshot) => {
              recipesList.push(documentSnapshot.data())
            })
            setRecipes(recipesList)
            setLoading(false)
          })
        } else {
          setLoading(false)
          setEmpty(true)
        }
      })
  }, []) 
 
  if (loading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }

  if (empty) {
    <View>
      <Text> This is empty </Text>
    </View>
  }

  return (
    <View style={styles.heading}>
        <Text>HELLO FROM COLLECTION INNER TAB ID: {id}</Text>
    <View style={styles.recipes}>

     {recipes.map((recipe, index)=> {
      return <Text key={index}>{recipe.title}</Text>
     })}
    </View>
  </View>
  );
}

export default SingleCollection;







