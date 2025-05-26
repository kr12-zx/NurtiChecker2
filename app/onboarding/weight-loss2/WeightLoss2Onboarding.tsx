import React, { useState, useEffect } from 'react';
import {
  View,
  useColorScheme,
  Text, // Для временной заглушки
  TouchableOpacity, // Для временной навигации
  Alert, // Добавлено для уведомлений
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импортируем новую систему стилей
import { containers, typography, getThemeColors } from './unifiedStyles';
// Старые стили (для совместимости со старыми компонентами)
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';

// Импортируем типы (предполагаем, что они общие и лежат в app/types)
import { UserProfile, UnitSettings } from '../../types/onboarding';

// TODO: Импортировать экраны из ./<ScreenName> по мере их создания
import WelcomeScreen from './WelcomeScreen';
import BirthdayScreen from './BirthdayScreen';
import GenderScreen from './GenderScreen';
import UnitsScreen from './UnitsScreen'; // Импорт нового экрана
import HeightWeightScreen from './HeightWeightScreen'; // Импорт нового экрана
import GoalSettingScreen from './GoalSettingScreen'; // Импорт нового экрана
import ActivityLevelScreen from './ActivityLevelScreen'; // Импорт нового экрана
import DietPreferenceScreen from './DietPreferenceScreen'; // Импорт нового экрана
import MealFrequencyScreen from './MealFrequencyScreen'; // Импорт нового экрана
// Импортируем новый экран с современным синим дизайном
import ChallengesScreen from './ChallengesScreen-modernBlue';
import StressResponseScreen from './StressResponseScreen'; // Бывший PsychologicalProfileScreen
import ConfidenceLevelScreen from './ConfidenceLevelScreen'; // Новый отдельный экран
import SummaryScreen from './SummaryScreen'; // Импорт нового экрана

// Начальное состояние профиля пользователя (можно скопировать из старого онбординга или определить заново)
const initialUserProfile: Partial<UserProfile> = {
  birthday: new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  height: 170,
  gender: 'prefer-not-to-say',
  currentWeight: 70,
  goalWeight: 65,
  weightLossRate: 0.5,
  primaryGoal: 'lose-weight',
  activityLevel: 'moderately-active',
  dietPreference: 'standard',
  mealFrequency: '3-meals',
  challenges: [],
  stressResponse: 'not-sure',
  confidenceLevel: 3,
};

// Начальные настройки единиц измерения
const initialUnitSettings: UnitSettings = {
  weight: 'kg',
  height: 'cm',
  system: 'metric', // По умолчанию метрическая
};

interface WeightLoss2OnboardingProps {
  startAtStep?: number; // Необязательный параметр для установки начального экрана
}

export default function WeightLoss2Onboarding({ startAtStep }: WeightLoss2OnboardingProps = {}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // Используем новую функцию получения цветов темы
  const themeColors = getThemeColors(isDark);

  // Если передан startAtStep, используем его, иначе начинаем с 0
  const [currentStep, setCurrentStep] = useState(startAtStep !== undefined ? startAtStep : 0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>(initialUserProfile);
  const [unitSettings, setUnitSettings] = useState<UnitSettings>(initialUnitSettings); // Состояние для настроек единиц
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Загрузка сохраненного состояния при монтировании (если нужно продолжить онбординг)
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        const savedUnits = await AsyncStorage.getItem('unitSettings');
        const savedStep = await AsyncStorage.getItem('currentStep');
        
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
        if (savedUnits) setUnitSettings(JSON.parse(savedUnits));
        if (savedStep) setCurrentStep(parseInt(savedStep, 10));

      } catch (error) {
        console.error('Ошибка загрузки состояния онбординга:', error);
      }
    };
    // loadState(); // Раскомментируйте, если нужна логика продолжения прерванного онбординга
  }, []);

  // Сохранение промежуточного состояния
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
        await AsyncStorage.setItem('unitSettings', JSON.stringify(unitSettings));
        await AsyncStorage.setItem('currentStep', currentStep.toString());
      } catch (error) {
        console.error('Ошибка сохранения промежуточного состояния онбординга:', error);
      }
    };
    // if (!onboardingComplete) saveState(); // Сохраняем, только если онбординг не завершен
  }, [userProfile, unitSettings, currentStep, onboardingComplete]);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prevProfile) => ({ ...prevProfile, ...updates }));
  };

  const updateUnitSettings = (settings: Partial<UnitSettings>) => {
    setUnitSettings((prevSettings) => ({ ...prevSettings, ...settings as UnitSettings }));
  };

  const handleCompleteOnboarding = async () => {
    setOnboardingComplete(true);
    try {
      const finalProfile = { ...userProfile, onboardingCompleted: true, unitSettings };
      await AsyncStorage.setItem('userProfile', JSON.stringify(finalProfile));
      await AsyncStorage.setItem('unitSettings', JSON.stringify(unitSettings)); 
      router.replace('/(tabs)/' as any); 
    } catch (error) {
      console.error('Ошибка при сохранении данных онбординга:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Здесь можно добавить финальную валидацию, если необходимо
      // Сохраняем финальные данные в основные ключи AsyncStorage, используемые приложением
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('unitSettings', JSON.stringify(unitSettings));
      await AsyncStorage.setItem('onboardingCompleted_wl2', 'true'); // Флаг завершения онбординга

      Alert.alert('Онбординг завершен!', 'Ваши данные сохранены.', [
        {
          text: 'OK',
          onPress: () => {
            // Переход на главный экран приложения или куда-либо еще
            // navigation.navigate('AppTabs'); // Пример перехода
            router.replace('/(tabs)/' as any); // или navigation.replace('MainApp')
            // Для теста можно просто вернуться назад или на FlowSelectionScreen
            // if (navigation.canGoBack()) navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить данные. Пожалуйста, попробуйте снова.');
    }
  };

  // --- Обработчики и функции ---
  const goToNextScreen = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleOnboardingComplete();
    }
  };

  const goToPrevScreen = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Определения экранов ---
  // Важно: Функции, передаваемые в props экранов (например, goToNextScreen), должны быть объявлены ДО этого массива.
  const screens: Array<{ id: string; component: React.ReactNode }> = [
    {
      id: 'welcome',
      component: (
        <WelcomeScreen 
          onContinue={goToNextScreen} 
        />
      ),
    },
    {
      id: 'birthday',
      component: (
        <BirthdayScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      ),
    },
    {
      id: 'gender',
      component: (
        <GenderScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'units', // Новый экран
      component: (
        <UnitsScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          unitSettings={unitSettings}
          updateUnitSettings={updateUnitSettings}
        />
      )
    },
    {
      id: 'heightWeight', // Новый экран
      component: (
        <HeightWeightScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
          unitSettings={unitSettings}
        />
      )
    },
    {
      id: 'goalSetting', // Новый экран
      component: (
        <GoalSettingScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
          unitSettings={unitSettings}
        />
      )
    },
    {
      id: 'activityLevel', // Новый экран
      component: (
        <ActivityLevelScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'dietPreference', // Новый экран
      component: (
        <DietPreferenceScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'mealFrequency', // Новый экран
      component: (
        <MealFrequencyScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'challenges', // Новый экран
      component: (
        <ChallengesScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'stressResponse', // Обновленный ID
      component: (
        <StressResponseScreen // Используем новое имя компонента
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'confidenceLevel', // Новый экран
      component: (
        <ConfidenceLevelScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
        />
      )
    },
    {
      id: 'summary', // Новый экран
      component: (
        <SummaryScreen
          onComplete={handleOnboardingComplete} // Используем новую функцию
          onBack={goToPrevScreen}
          userProfile={userProfile}
          unitSettings={unitSettings}
        />
      )
    }
    // Добавьте SummaryScreen после PsychologicalProfileScreen
  ];

  const renderProgressIndicators = () => {
    if (screens.length === 0) return null;
    // TODO: Реализовать индикаторы прогресса согласно дизайн-системе
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 }}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={{
              height: 8,
              width: 8,
              borderRadius: 4,
              backgroundColor: index === currentStep ? themeColors.primary : themeColors.textSecondary,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    );
  };

  // const CurrentScreenComponent = screens[currentStep]?.component;
  // Заменено на более безопасный вариант, чтобы избежать ошибки если screens пуст или currentStep некорректен
  const CurrentScreenComponent = screens.length > 0 && screens[currentStep] ? screens[currentStep].component : null;

  if (onboardingComplete) return null; // Или экран загрузки/сообщения

  if (screens.length === 0 || !CurrentScreenComponent) {
    return (
      <SafeAreaView style={[containers.screen, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
        <View style={containers.content}>
          <Text style={[typography.headline, { color: themeColors.textPrimary }]}>Унифицированный онбординг</Text>
          <Text style={[typography.subtitle, { color: themeColors.textSecondary, marginBottom: 20 }]}>
            Экраны в процессе создания. Скоро здесь будет красиво!
          </Text>
          <TouchableOpacity 
            style={[{backgroundColor: themeColors.primary, padding: 15, borderRadius: 10, alignItems: 'center'}]} 
            onPress={handleCompleteOnboarding} // Временная кнопка для завершения, если нужно протестировать
          >
            <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>Завершить (Тест)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[containers.screen, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      {renderProgressIndicators()}
      <View style={containers.content}>
        {CurrentScreenComponent}
      </View>
      {/* Навигационные кнопки будут частью каждого экрана или общим компонентом ниже */}
    </SafeAreaView>
  );
}
