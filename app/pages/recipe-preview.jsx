import { useLocalSearchParams, useRoute } from "expo-router";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    Image,
    item,
} from "react-native";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";

export default function RecipePreview() {
    const params = useLocalSearchParams();
    const [dietaryOptions, setDietaryOptions] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        firestore()
            .collection("Dietary-needs")
            .get()
            .then((result) => {
                const options = result.docs.map((doc) => ({
                    name: doc._data.name,
                    imgUrl: doc._data["image-url"],
                }));
                setDietaryOptions(options);
            });
    }, []);
    return (
        <View style={styles.container}>
            <TextInput
                style={{ backgroundColor: "#dedede" }}
                placeholder='recipe-title'
            />
            <Text>URL: {params.url}</Text>
            <View></View>
            <Text>Dietary info</Text>
            <FlatList
                data={selected}
                renderItem={({ item }) => {
                    return dietaryOptions.map((option) => {
                        if (option.name === item) {
                            return (
                                <View>
                                    <Image
                                        style={styles.tinyLogo}
                                        source={{
                                            uri: option.imgUrl,
                                        }}
                                    />
                                </View>
                            );
                        }
                    });
                }}
                keyExtractor={(item) => item.name}
                horizontal
                style={styles.selectedList}
            />
            <MultipleSelectList
                setSelected={(val) => setSelected(val)}
                data={dietaryOptions.map((option) => option.name)}
                save='name'
            />

            <View>
                <Text style={{
                        marginTop: 10,
                        fontSize: 22,
                    }}>Cooking time:</Text>
                <TextInput
                    style={{ 
                      backgroundColor: "#dedede"
                    }}
                    placeholder='cooking time'
                />
            </View>

            <View>
                <Text 
                    style={{
                        marginTop: 10,
                        fontSize: 22,
                    }}>Ingredient List:</Text>

                <TextInput
                    style={{ backgroundColor: "#dedede" }}
                    placeholder='Lettuce'
                />
                <TextInput
                    style={{ backgroundColor: "#dedede" }}
                    placeholder='Tomato'
                />
                <TextInput
                    style={{ backgroundColor: "#dedede" }}
                    placeholder='Cherry'
                />
                <TextInput
                    style={{ backgroundColor: "#dedede" }}
                    placeholder='ingredient name'
                />
                <TextInput
                    style={{ backgroundColor: "#dedede" }}
                    placeholder='ingredient name'
                />
                <Button
                    // onPress={handleIngredientAddField}
                    title='add more ingredients'
                    accessibilityLabel='add-ingredients-table'
                />
            </View>

            <View>
                <Text
                    style={{
                        marginTop: 10,
                        fontSize: 22,
                    }}
                >
                    Cooking instructions
                </Text>
                <TextInput
                    style={{
                        backgroundColor: "#dedede",
                        height: 140,
                        fontSize: 13,
                    }}
                    multiline={true}
                    placeholder='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Vivendum intellegat et qui, ei denique consequuntur vix. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Feugiat ceteros appellantur et sed, at illum virtute persequeris duo. Vivendum intellegat et qui, ei denique consequuntur vix. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. At usu errem possit patrioque, modo justo percipit sed in. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Scripta periculis ei eam, te pro movet reformidans.'
                />
            </View>
            <Button
                // onPress={handleRecipeSubmit}
                title='Submit Recipe'
                accessibilityLabel='recipe-submission-button'
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "left",
        margin: 10,
        paddingTop: 50,
    },
    tinyLogo: {
        width: 50,
        height: 50,
    },
    logo: {
        width: 66,
        height: 58,
    },
    selectedList: {
        margin: 0,
        padding: 0,
    },
});
