import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Импортируем функции для работы с Remote Config
import { getStringValue, refreshRemoteConfig } from '../firebase/remote-config';

// Импортируем онбординг для потери веса
import WeightLossOnboarding from './weight-loss';

// Импортируем новый унифицированный онбординг с модернизированным дизайном
import WeightLoss3Onboarding from './weight-loss3';

const { width } = Dimensions.get('window');

// Определяем типы данных для экрана онбординга
type OnboardingScreen = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// Значения по умолчанию, на случай ошибки при загрузке из Remote Config
const DEFAULT_ONBOARDING_DATA: OnboardingScreen[] = [
  {
    id: '1',
    title: 'Добро пожаловать в NutriChecker',
    description: 'Ваш личный помощник для выбора здоровой пищи и отслеживания аллергенов.',
    icon: 'nutrition-outline',
  },
  {
    id: '2',
    title: 'Сканируйте продукты',
    description: 'Просто отсканируйте любой продукт, чтобы получить подробную информацию о его составе и предупреждения об аллергенах.',
    icon: 'scan-outline',
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingScreen[]>(DEFAULT_ONBOARDING_DATA);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  
  // Состояние для отображения кнопок выбора версии онбординга
  // Устанавливаем значение true, чтобы всегда показывать экран выбора при запуске
  const [showOnboardingOptions, setShowOnboardingOptions] = useState(true);
  
  // Обработчик длительного нажатия на заголовок для доступа к выбору версии онбординга
  const handleLongPressTitle = () => {
    setShowOnboardingOptions(true);
    console.log('==== Открыт экран выбора версии онбординга ====');
  };

  // Загружаем данные из Remote Config при инициализации компонента
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        // Обновляем данные Remote Config
        await refreshRemoteConfig();
        
        // Получаем версию онбординга из Firebase
        const version = getStringValue('onboarding_version', '');
        
        // Если версия не задана или это первый запуск, сразу показываем выбор онбординга
        if (!version) {
          // Если версия не задана, показываем экран выбора
          setShowOnboardingOptions(true);
          console.log('==== Показываем экран выбора онбординга ====');
        }
        
        // Устанавливаем версию из Firebase или по умолчанию наш новый онбординг
        setCurrentVersion(version || 'weight_loss_3');
        
        // Получаем конфигурацию онбординга
        const configJson = getStringValue('onboarding_config', '');
        
        if (configJson) {
          try {
            const config = JSON.parse(configJson);
            if (config && config[version] && Array.isArray(config[version].screens)) {
              setOnboardingData(config[version].screens);
              
              // Более заметный и информативный лог
              console.log('=============================================');
              console.log(`✅ ЗАГРУЖЕН ОНБОРДИНГ: ${version.toUpperCase()}`);
              console.log(`ℹ️ Количество экранов: ${config[version].screens.length}`);
              console.log(`ℹ️ Первый экран: "${config[version].screens[0].title}"`);
              console.log(`ℹ️ Последний экран: "${config[version].screens[config[version].screens.length - 1].title}"`);
              console.log('=============================================');
            } else {
              console.warn('Неверный формат данных онбординга в Remote Config');
              setOnboardingData(DEFAULT_ONBOARDING_DATA);
            }
          } catch (parseError) {
            console.error('Ошибка при разборе JSON онбординга:', parseError);
            setOnboardingData(DEFAULT_ONBOARDING_DATA);
          }
        } else {
          console.warn('Конфигурация онбординга не найдена в Remote Config');
          setOnboardingData(DEFAULT_ONBOARDING_DATA);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных онбординга:', error);
        setOnboardingData(DEFAULT_ONBOARDING_DATA);
      } finally {
        setLoading(false);
      }
    };
    
    loadOnboardingData();
  }, []);
  
  const renderItem = ({ item }: { item: OnboardingScreen }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
        <Ionicons name={item.icon as any} size={80} color={isDark ? "#FFFFFF" : "#007AFF"} />
      </View>
      <TouchableOpacity onLongPress={handleLongPressTitle}>
        <Text style={[styles.title, isDark && styles.darkText]}>{item.title}</Text>
      </TouchableOpacity>
      <Text style={[styles.description, isDark && styles.darkTextSecondary]}>{item.description}</Text>
    </View>
  );
  
  const goToNextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };
  
  const goToPrevSlide = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const completeOnboarding = async () => {
    try {
      // Сохраняем статус прохождения онбординга
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Логируем успешное прохождение
      console.log('=============================================');
      console.log(`✅ ОНБОРДИНГ ЗАВЕРШЕН! Пользователь перенаправлен на главный экран`);
      console.log('=============================================');
      
      // Перенаправляем на главный экран
      router.replace('/(tabs)/main01');
    } catch (error) {
      console.error('Ошибка при сохранении статуса онбординга:', error);
      router.replace('/(tabs)/main01');
    }
  };
  
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };
  
  // Показываем индикатор загрузки, пока данные загружаются
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer, styles.loadingContainer]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Загрузка онбординга...
        </Text>
      </SafeAreaView>
    );
  }

  // Добавили возможность выбора версии онбординга
  if (showOnboardingOptions) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer, styles.optionsContainer]} edges={['top', 'left', 'right']}>
        <Text style={[styles.title, isDark && styles.darkText, { marginBottom: 30 }]}>
          Выберите версию онбординга
        </Text>
        
        <TouchableOpacity 
          style={[styles.onboardingOptionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => {
            setCurrentVersion('standard');
            setShowOnboardingOptions(false);
            console.log('Выбран стандартный онбординг');
          }}
        >
          <Text style={styles.onboardingOptionText}>Стандартный онбординг</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.onboardingOptionButton, { backgroundColor: '#34C759' }]}
          onPress={() => {
            setCurrentVersion('weight_loss');
            setShowOnboardingOptions(false);
            console.log('Выбран онбординг для похудения');
          }}
        >
          <Text style={styles.onboardingOptionText}>Онбординг для похудения</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.onboardingOptionButton, { backgroundColor: '#5856D6' }]}
          onPress={() => {
            setCurrentVersion('weight_loss_3');
            setShowOnboardingOptions(false);
            console.log('Выбран новый унифицированный онбординг');
          }}
        >
          <Text style={styles.onboardingOptionText}>Новый унифицированный онбординг</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.onboardingOptionButton, { backgroundColor: '#FF3B30', marginTop: 40 }]}
          onPress={() => setShowOnboardingOptions(false)}
        >
          <Text style={styles.onboardingOptionText}>Вернуться</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // Запуск выбранного онбординга
  if (currentVersion === 'weight_loss') {
    return <WeightLossOnboarding />;
  } else if (currentVersion === 'weight_loss_3') {
    return <WeightLoss3Onboarding />;
  }
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]} edges={['top', 'left', 'right']}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      />
      
      <View style={styles.indicatorContainer}>
        {onboardingData.map((_, index: number) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentIndex && styles.activeIndicator,
              isDark && index === currentIndex && styles.darkActiveIndicator,
            ]}
          />
        ))}
      </View>

      {/* Белый контейнер с кнопками внизу экрана */}
      <View style={styles.fixedBottomContainer}>
        <View style={styles.buttonContainer}>
          {currentIndex > 0 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton, isDark && styles.darkNavButton]}
              onPress={goToPrevSlide}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.skipButton, isDark && styles.darkNavButton]}
              onPress={completeOnboarding}
            >
              <Text style={[styles.skipText, isDark && styles.darkText]}>Пропустить</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={goToNextSlide}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Начать' : 'Далее'}
            </Text>
            {currentIndex < onboardingData.length - 1 && (
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F7FF', // Изменили на светло-голубой фон для всего контейнера
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    color: '#000000',
  },
  // Добавленные стили для экрана выбора версии онбординга
  optionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  onboardingOptionButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  onboardingOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  darkIconContainer: {
    backgroundColor: '#0A3055',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#666666',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20, // Отступ сверху
    paddingBottom: 100, // Очень большой отступ снизу, чтобы гарантировать покрытие всей нижней части
    backgroundColor: '#FFFFFF', // Белый фон для всего футера
    // Тень для визуального разделения с основным контентом
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
    // Добавляем height, чтобы гарантировать, что белый фон будет достаточно большим
    height: 250,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100, // Размещаем выше кнопок
    left: 0,
    right: 0,
    zIndex: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#007AFF',
  },
  darkActiveIndicator: {
    backgroundColor: '#0A84FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    backgroundColor: '#F0F0F0',
  },
  darkNavButton: {
    backgroundColor: '#1C1C1E',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingLeft: 0,
  },
  skipText: {
    fontSize: 16,
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Добавляем белый фон под кнопками
  bottomWhiteBackground: {
    position: 'absolute',
    bottom: -50, // Выводим за пределы экрана для надежного покрытия
    left: 0,
    right: 0,
    height: 150, // Достаточно высокий, чтобы покрыть всю нижнюю часть экрана
    backgroundColor: '#FFFFFF',
    zIndex: -1, // размещаем под кнопками
  },
  // Фиксированный белый контейнер для кнопок внизу экрана
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 30, // Увеличенный отступ снизу для iOS с жестовой навигацией
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 999, // Высокий z-index, чтобы контейнер был поверх всех элементов
  },
}); 