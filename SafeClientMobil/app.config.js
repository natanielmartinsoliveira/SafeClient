// app.config.js substitui app.json para suportar variáveis de ambiente de build
// O APP_SIGNING_SECRET vem do EAS (eas secret:create) ou do .env local
module.exports = {
  expo: {
    name: 'SafeClient',
    slug: 'safeclient',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'safeclient',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.safeclient.app',
      supportsTablet: true,
    },
    android: {
      package: 'com.safeclient.app',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: { backgroundColor: '#000000' },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    // Variáveis expostas ao app em runtime via expo-constants
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      appSigningSecret: process.env.APP_SIGNING_SECRET || '',
      contactsApiKey: process.env.CONTACTS_API_KEY || '',
      eas: {
        projectId: '14de4d86-021a-40c4-ba76-7781e2dd1f3f',
      },
    },
  },
};

