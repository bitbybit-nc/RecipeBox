module.exports = ({ config }) => {
  return {
    ...config,
    expo: {
      android: {
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
        package: "com.bitbybitnorthcoders.RecipeBox",
      },
      ios: {
        googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
        bundleIdentifier: "com.bitbybitnorthcoders.RecipeBox",
      },
      extra: {
        eas: {
          projectId: "84207088-82b6-41e9-b2e2-f7b4fd5baa29",
        },
      },
      plugins: [
        "expo-router",
        "@react-native-firebase/app",
        "@react-native-firebase/auth",
        "@react-native-firebase/crashlytics",
        [
          "expo-build-properties",
          {
            ios: {
              useFrameworks: "static",
            },
          },
        ],
      ],
    },
  };
};
