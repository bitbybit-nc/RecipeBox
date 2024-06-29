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
      extra: {
        eas: {
          projectId: "254a4dd7-f6c4-47e2-ad5c-29bd10ae17a1",
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
