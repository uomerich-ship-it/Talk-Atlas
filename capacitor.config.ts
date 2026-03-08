import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.talkAtlas.app',
  appName: 'TalkAtlas',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'api-free.deepl.com',
      'api.mymemory.translated.net',
      'raw.githubusercontent.com',
      'unpkg.com'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      backgroundColor: '#020202',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: { style: 'dark', backgroundColor: '#020202' }
  },
  ios: { contentInset: 'always', backgroundColor: '#020202' },
  android: { backgroundColor: '#020202' }
};
export default config;
