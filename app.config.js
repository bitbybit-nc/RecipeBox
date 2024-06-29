module.exports = ({ config }) => {
  return {
    ...config,
    expo: {
      android: {
        googleServicesFile:
          process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
        package: "com.bitbybitnorthcoders.RecipeBox",
      },
      ios: {
        googleServicesFile:
          process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
        bundleIdentifier: "com.bitbybitnorthcoders.RecipeBox",
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
