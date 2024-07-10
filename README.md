# RecipeBox
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

Requirements:
- Node: v22.3.0

General info:
This project is a mobile application called "RecipeBox", an app created to allow users to record and see recipes from various online sources, post and delete recipes, and collections and vote on different recipes. It was created with a React Native front-end and a firebase back-end and database.

Features:
=================================================================================================================================================================================================
Login:

- Can create new user, with username and password
- Can reset password if forgotten
- Can log in using an already set profile
- Will prevent login if user has not signed up yet or if username/password is incorrect

Collections:

- Can create and add new collections, by clicking the 'Add Collection' button, (private or public) specific to each user - a user's total collections will only render on their logged in app
- Will have a My Recipes collection, with a list of all recipes on the app
- Can click collections to be sent to an individual collection page, with all the recipes listed

Individual Collections (after clicking a collection):

- Can view a list of recipes in this collection
- Can search for a specific recipe using the search bar on screen

Edit individual Collections (after clicking 'Edit' on the individual collection page):

- Can change and save, using the 'Save Changes' button, the name and privacy setting of collections
- Can remove recipes from collections
- Can delete collections using the delete button, prompting a secondary "Are you sure?" popup. Can click 'Yes' or 'No' to confirm

Search Recipes:

- Can view a list of all recipes on this app
- Can click on a recipe to go to an individual recipe page
- Can use the search bar to filter through the recipes, which updates as you type
- Can filter using the 'Filter' button, being able to filter by dietary needs, and being able to change sort by for when the recipes were made or the recipe rating
- Can use the 'Reset' button to reset the filters to default

Individual Recipes (after clicking on an individual recipe):

- Can view the details of a recipe including a picture, the dietary needs, the category the recipe falls under, the cooking time, the ingredients, the cooking method, and the user who imported the recipe.
- Can click the 'save' button to add the recipe to a list of your specific collections

Import Recipes:
This guide provides a structured approach to utilizing the "Import a Recipe" page, ensuring users can efficiently add and categorize new recipes.

- Add Recipe Image:
A placeholder to add an image of the recipe.
Users can upload a picture representing the final dish.

- Recipe Title:
A text input field where users can enter the title of the recipe

- Recipe URL:
A text input field where users can insert a URL link to the recipe.

- Select Collection:
A button to select or create a collection where the recipe will be stored.

- Dietary Needs:
Icon-based selection options for dietary needs, including:
Dairy Free
Gluten Free
Keto
Nut Free
Paleo
Vegan

- Categories:
A text input field to categorize the recipe, for example, "Pasta, Main Course".

- Preparation Time:
Input fields to specify the preparation time in hours and minutes.

- Ingredients:
A section to list the ingredients required for the recipe.
An "Import from Screenshot" button to import ingredient lists from images.

- Cooking Instructions:
A section to provide step-by-step cooking instructions.
An "Import from Screenshot" button to import cooking instructions from images.

- Submit Recipe:
A button to submit the recipe once all fields are filled out.

Profile:
- Can view users own profile, which shows the user profile, username, display name and email address
- Can edit the display name and profile picture of the user using the edit pencil icon
- Can view an 'About Me' bio section
- Can view the dietary requirements of the user
- Can view a list of the total recipes the user imported in a 'My Recipes' list
- Can click the 'Log Out' button to log the user out and redirect back to the Login page

## Get started
1. Install dependencies
   ```bash
   npm install
   ```

2. Start the app
   ```bash
    npx expo start
   ```
3. In the root directory of your app, create a "google-services.json" and "GoogleService-Info.plist" files

4. Create a .gitignore file (no file extensions), and add the following:
```bash
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
old.*

google-services.json
GoogleService-Info.plist
android/
ios/

# macOS
.DS_Store
   ```
5. In the output, you'll find options to open the app in a:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

6. To work on the files: edit the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project
When you're ready, run:
```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more
To learn more about developing your project with Expo, look at the following resources:
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)