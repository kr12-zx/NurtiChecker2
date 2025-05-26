import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Dimensions, 
  FlatList, 
  useColorScheme,
  TouchableOpacity,
  Text,
  StyleSheet, 
} from 'react-native';
import { onboardingStyles } from './styles';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Импортируем экраны онбординга
import WelcomeScreen from './WelcomeScreen';
import BirthdayScreen from './BirthdayScreen';
import HeightScreen from './HeightScreen';
import GenderScreen from './GenderScreen';
import CurrentWeightScreen from './CurrentWeightScreen';
import GoalWeightScreen from './GoalWeightScreen';
import WeightLossRateScreen from './WeightLossRateScreen';
import ActivityLevelScreen from './ActivityLevelScreen';
import DietPreferenceScreen from './DietPreferenceScreen';
import MealFrequencyScreen from './MealFrequencyScreen';
import ChallengesScreen from './ChallengesScreen';
import StressResponseScreen from './StressResponseScreen';
import ConfidenceLevelScreen from './ConfidenceLevelScreen';
import PaywallScreen from '../../../components/PaywallScreen';

// Импортируем новый оркестратор
import WeightLoss2Onboarding from '../weight-loss2/WeightLoss2Onboarding';

// Импортируем типы
import { UserProfile, UnitSettings, Gender } from '../../types/onboarding';

// Начальное состояние профиля пользователя
const initialUserProfile: Partial<UserProfile> = {
  birthday: new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ~30 лет
  height: 170, // см
  gender: 'prefer-not-to-say',
  currentWeight: 70, // кг
  goalWeight: 65, // кг
  weightLossRate: 0.5, // кг в неделю
  primaryGoal: 'lose-weight',
  activityLevel: 'moderately-active',
  dietPreference: 'standard',
  mealFrequency: '3-meals',
  challenges: ['lack-of-motivation'],
  stressResponse: 'emotional-eater',
  confidenceLevel: 3,
};

// Начальные настройки единиц измерения
const initialUnitSettings: UnitSettings = {
  weight: 'kg',
  height: 'cm',
  system: 'metric',
};

// Компонент для старого флоу онбординга
function OldWeightLossOnboarding() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = Dimensions.get('window');
  
  // Состояние компонента
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>(initialUserProfile);
  const [unitSettings, setUnitSettings] = useState<UnitSettings>(initialUnitSettings);
  
  // Ссылка на FlatList для программной прокрутки
  const flatListRef = useRef<FlatList>(null);

  // Обработчики навигации
  const goToNextScreen = () => {
    console.log('DEBUG: goToNextScreen called. Current step:', currentStep);
    
    if (currentStep < screens.length - 1) {
      // Самое простое решение - показывать только нужный экран без прокрутки
      try {
        console.log('DEBUG: Updating currentStep from', currentStep, 'to', currentStep + 1);
        setCurrentStep(currentStep + 1);
        console.log('DEBUG: currentStep updated');
      } catch (error) {
        console.error('DEBUG: Error updating step:', error);
      }
    } else {
      console.log('DEBUG: Already at the last screen');
    }
  };

  const goToPrevScreen = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      if (flatListRef.current) {
        try {
          flatListRef.current.scrollToIndex({
            index: prevStep,
            animated: true,
          });
        } catch (error) {
          console.warn('Error scrolling to previous screen:', error);
        }
      }
    }
  };

  // Обработчик завершения онбординга
  const completeOnboarding = async () => {
    try {
      // Сохраняем профиль пользователя
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      // Отмечаем, что онбординг завершен
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      console.log('=============================================');
      console.log('✅ ОНБОРДИНГ ЗАВЕРШЕН! Пользователь перенаправлен на главный экран');
      console.log('=============================================');
      
      router.replace('/(tabs)/main01');
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
  };

  // Обработчик обновления профиля пользователя
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Обработчик изменения единиц измерения
  const updateUnitSettings = (updates: Partial<UnitSettings>) => {
    setUnitSettings(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // Обработчик события скролла
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    
    if (index !== currentStep) {
      setCurrentStep(index);
    }
  };

  // Определяем экраны онбординга
  const screens = [
    // Приветственный экран
    {
      id: 'welcome',
      component: (
        <WelcomeScreen onContinue={goToNextScreen} />
      ),
    },
    // Экран выбора даты рождения
    {
      id: 'birthday',
      component: (
        <BirthdayScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          birthday={userProfile.birthday || ''}
          onBirthdayChange={(birthday) => updateUserProfile({ birthday })}
        />
      ),
    },
    // Экран ввода роста
    {
      id: 'height',
      component: (
        <HeightScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          height={userProfile.height || 170}
          onHeightChange={(height) => updateUserProfile({ height })}
          units={unitSettings.height}
          onUnitsChange={(height) => updateUnitSettings({ height })}
        />
      ),
    },
    // Экран выбора пола
    {
      id: 'gender',
      component: (
        <GenderScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          gender={userProfile.gender || 'prefer-not-to-say' as Gender}
          onGenderChange={(gender) => updateUserProfile({ gender })}
        />
      ),
    },
    // Экран ввода текущего веса
    {
      id: 'current-weight',
      component: (
        <CurrentWeightScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          currentWeight={userProfile.currentWeight || 70}
          onCurrentWeightChange={(currentWeight) => updateUserProfile({ currentWeight })}
          units={unitSettings.weight}
          onUnitsChange={(weight) => updateUnitSettings({ weight })}
        />
      ),
    },
    // Экран выбора целевого веса
    {
      id: 'goal-weight',
      component: (
        <GoalWeightScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          currentWeight={userProfile.currentWeight || 70}
          goalWeight={userProfile.goalWeight || 65}
          onGoalWeightChange={(goalWeight) => updateUserProfile({ goalWeight })}
          units={unitSettings.weight}
        />
      ),
    },
    // Экран выбора темпа снижения веса
    {
      id: 'weight-loss-rate',
      component: (
        <WeightLossRateScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
          weightLossRate={userProfile.weightLossRate || 0.5}
          onWeightLossRateChange={(weightLossRate) => updateUserProfile({ weightLossRate })}
        />
      ),
    },
    // Экран выбора уровня активности
    {
      id: 'activity-level',
      component: (
        <ActivityLevelScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
        />
      ),
    },
    // Экран выбора типа питания
    {
      id: 'diet-preference',
      component: (
        <DietPreferenceScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
        />
      ),
    },
    // Экран выбора частоты приемов пищи
    {
      id: 'meal-frequency',
      component: (
        <MealFrequencyScreen 
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
        />
      ),
    },
    // Экран выбора препятствий
    {
      id: 'challenges',
      component: (
        <ChallengesScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
        />
      ),
    },
    // Экран выбора реакции на стресс
    {
      id: 'stress-response',
      component: (
        <StressResponseScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
        />
      ),
    },
    // Экран уровня уверенности
    {
      id: 'confidence-level',
      component: (
        <ConfidenceLevelScreen
          onContinue={goToNextScreen}
          onBack={goToPrevScreen}
        />
      ),
    },
    // Экран Paywall (заглушка)
    {
      id: 'paywall',
      component: (
        <PaywallScreen 
          onSubscribe={completeOnboarding}
          onSkip={completeOnboarding}
        />
      ),
    },
  ];

  // Функция для отображения индикаторов прогресса
  const renderProgressIndicators = () => {
    return (
      <View style={onboardingStyles.indicatorContainer}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              onboardingStyles.indicator,
              index === currentStep && onboardingStyles.activeIndicator,
              isDark && index === currentStep && onboardingStyles.darkActiveIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  // Функция для отрисовки элемента списка (экрана)
  const renderScreen = ({ item }: { item: { id: string; component: React.ReactNode } }) => {
    // Оптимизация: рендерим только текущий и соседние экраны
    return (
      <View style={[onboardingStyles.screenContainer, { width }]}>
        {item.component}
      </View>
    );
  };

  // Показываем только текущий экран вместо FlatList
  const renderCurrentScreen = () => {
    if (screens[currentStep]) {
      return screens[currentStep].component;
    }
    return null;
  };
  
  console.log('DEBUG: Rendering onboarding with currentStep =', currentStep);
  
  return (
    <SafeAreaView style={[onboardingStyles.container, isDark && onboardingStyles.darkContainer]} edges={['top']}>
      {/* Индикаторы прогресса */}
      {renderProgressIndicators()}
      
      {/* Кнопка пропуска (только на первых экранах) */}
      {currentStep < screens.length - 1 && (
        <TouchableOpacity
          style={[onboardingStyles.skipButton, isDark && onboardingStyles.darkSkipButton]}
          onPress={completeOnboarding}
        >
          <Text style={[onboardingStyles.skipButtonText, isDark && onboardingStyles.darkSkipButtonText]}>
            Пропустить
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Основной контейнер с контентом */}
      <View style={[onboardingStyles.screenContainer, { width }]}>
        {renderCurrentScreen()}
      </View>
    </SafeAreaView>
  );
}

// Основной компонент, который теперь управляет выбором флоу
export default function OnboardingFlowManager() {
  const [selectedFlow, setSelectedFlow] = useState<'old' | 'new' | 'unified' | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Экран выбора флоу
  const FlowSelectionScreen = () => (
    <SafeAreaView style={[flowSelectionStyles.container, isDark && flowSelectionStyles.darkContainer]} edges={['top', 'bottom']}>
      <Text style={[flowSelectionStyles.title, isDark && flowSelectionStyles.darkText]}>Выберите версию онбординга:</Text>
      <TouchableOpacity
        style={[flowSelectionStyles.button, isDark && flowSelectionStyles.darkButton, { marginTop: 15, backgroundColor: '#5C55FA' }]}
        onPress={() => setSelectedFlow('new')}
      >
        <Text style={[flowSelectionStyles.buttonText, { color: '#FFFFFF' }]}>Унифицированный онбординг</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[flowSelectionStyles.button, isDark && flowSelectionStyles.darkButton, { marginTop: 15 }]}
        onPress={() => setSelectedFlow('old')}
      >
        <Text style={[flowSelectionStyles.buttonText, isDark && flowSelectionStyles.darkButtonText]}>Старый онбординг</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[flowSelectionStyles.button, isDark && flowSelectionStyles.darkButton, { marginTop: 15, backgroundColor: '#FF5778' }]}
        onPress={() => setSelectedFlow('unified')}
      >
        <Text style={[flowSelectionStyles.buttonText, { color: '#FFFFFF' }]}>Экспериментальный онбординг</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // Рендеринг в зависимости от выбора
  if (selectedFlow === null) {
    return <FlowSelectionScreen />;
  }

  if (selectedFlow === 'old') {
    return <OldWeightLossOnboarding />;
  }

  if (selectedFlow === 'new') {
    return <WeightLoss2Onboarding />;
  }
  
  if (selectedFlow === 'unified') {
    // Запускаем модернизированный онбординг с настройкой на экран уровня уверенности
    // Мы устанавливаем currentStep в 11, чтобы показать обновленный экран ConfidenceLevelScreen
    // Для этого передаем параметр startAtStep
    return <WeightLoss2Onboarding startAtStep={11} />;
  }

  return null; // На всякий случай, хотя этого не должно произойти
}

// Стили для экрана выбора флоу (можно вынести в onboardingStyles или отдельный файл позже)
const flowSelectionStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubtitle: {
    color: '#AEAEB2',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  darkButton: {
    backgroundColor: '#0A84FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  darkButtonText: {
    // Цвет текста на темных кнопках обычно остается белым
  }
});
