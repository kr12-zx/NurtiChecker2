import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';
import { getBooleanValue, refreshRemoteConfig } from './firebase/remote-config';

// Ключ для хранения в AsyncStorage
const HAS_COMPLETED_ONBOARDING_KEY = 'hasCompletedOnboarding';

export default function AppIndex() {
  const [loading, setLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Принудительно обновляем данные Remote Config с очисткой кэша
        console.log('⚙️ Начинаем принудительное обновление Remote Config...');
        await refreshRemoteConfig();
        
        // Проверяем, нужно ли показывать онбординг
        // Сначала проверяем, проходил ли пользователь онбординг ранее
        const hasCompletedOnboarding = await AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY);

        // Проверяем Remote Config флаг (может быть полезен для А/B тестирования)
        const forceShowOnboarding = getBooleanValue('force_show_onboarding');

        // Показываем онбординг, если пользователь его не проходил или если включен принудительный показ
        setShouldShowOnboarding(forceShowOnboarding || !hasCompletedOnboarding);

        // Логируем решение
        console.log('=============================================');
        console.log(`ℹ️ Показываем онбординг: ${forceShowOnboarding || !hasCompletedOnboarding ? 'ДА' : 'НЕТ'}`);
        console.log(`ℹ️ Пользователь уже проходил онбординг: ${hasCompletedOnboarding ? 'ДА' : 'НЕТ'}`);
        console.log(`ℹ️ Принудительный показ онбординга (Remote Config): ${forceShowOnboarding ? 'ДА' : 'НЕТ'}`);
        console.log('=============================================');
      } catch (error) {
        console.error('Ошибка при проверке онбординга:', error);
        setShouldShowOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  // Показываем загрузку, пока проверяем условия
  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color={isDark ? "#0A84FF" : "#007AFF"} />
      </View>
    );
  }

  // В зависимости от проверки перенаправляем на онбординг или на главный экран
  return <Redirect href={shouldShowOnboarding ? "/onboarding" : "/(tabs)/main01"} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  darkLoadingContainer: {
    backgroundColor: '#000000'
  }
});
