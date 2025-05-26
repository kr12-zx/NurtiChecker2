import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

// u0418u043cu043fu043eu0440u0442 Firebase u0444u0443u043du043au0446u0438u0439// Импорт Firebase функций
import { initializeAnalytics, setupRemoteConfig } from './firebase';
// Импорт сервиса пользователя для инициализации ID
import { initializePushNotifications } from '../services/pushNotifications';
import { getUserId } from '../services/userService';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showOnboarding, setShowOnboarding] = useState(true);

  // In a real app, we would check if the user has completed onboarding
  // const [showOnboarding, setShowOnboarding] = useState(false);
  // useEffect(() => {
  //   const checkOnboarding = async () => {
  //     try {
  //       const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
  //       setShowOnboarding(hasCompletedOnboarding !== 'true');
  //     } catch (error) {
  //       console.error('Error checking onboarding status:', error);
  //       setShowOnboarding(true);
  //     }
  //   };
  //   checkOnboarding();
  // }, []);

  // Load fonts
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Инициализация Firebase при загрузке приложения
      console.log('Инициализация Firebase сервисов...');
      
      // Обернем все вызовы Firebase в try-catch, чтобы приложение не крашнулось
      try {
        // Сначала настраиваем RemoteConfig с обработкой ошибок
        setupRemoteConfig()
          .then(() => console.log('RemoteConfig успешно настроен'))
          .catch(err => console.error('Ошибка при настройке RemoteConfig:', err));

        // Затем инициализируем analytics
        initializeAnalytics()
          .then(() => console.log('Analytics успешно настроен'))
          .catch(err => console.error('Ошибка при настройке Analytics:', err));

        // Инициализируем ID пользователя (генерируется при первом запуске)
        getUserId()
          .then((userId: string) => console.log('ID пользователя инициализирован:', userId))
          .catch((err: any) => console.error('Ошибка при инициализации ID пользователя:', err));
      } catch (error) {
        // Главное - не крашнуть приложение даже если Firebase не запустился
        console.error('Ошибка при инициализации Firebase сервисов:', error);
      }
      
      // В любом случае скрываем SplashScreen
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Инициализация пользователя и push-уведомлений
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Инициализируем ID пользователя
        const userId = await getUserId();
        console.log('🆔 ID пользователя:', userId);

        // Инициализируем push-уведомления
        const pushInitialized = await initializePushNotifications();
        if (pushInitialized) {
          console.log('🔔 Push-уведомления успешно инициализированы');
        } else {
          console.log('⚠️ Push-уведомления не инициализированы (симулятор или отказ пользователя)');
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
      }
    };

    initializeApp();
  }, []);

  // If the fonts haven't loaded yet, don't show anything
  if (!loaded) {
    return null;
  }
  
  // Show onboarding for first-time users
  if (showOnboarding) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding/index" />
        </Stack>
      </ThemeProvider>
    );
  }

  // Main app navigation
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#007AFF',
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#8E8E93' : '#8E8E93',
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
          },
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
          },
          headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="diets/index"
          options={{
            title: 'Diets',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="nutrition-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan/index"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="scan-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history/index"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="allergens/index"
          options={{
            title: 'Allergens',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="alert-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
