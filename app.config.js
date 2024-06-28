export default {
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    bundleIdentifier: "com.bitbybitnorthcoders.RecipeBox",
  },
  ios: {
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
    bundleIdentifier: "com.bitbybitnorthcoders.RecipeBox",
  },
  expo: {
    extra: {
      eas: {
        projectId: "84207088-82b6-41e9-b2e2-f7b4fd5baa29",
      },
    },
  },
};
