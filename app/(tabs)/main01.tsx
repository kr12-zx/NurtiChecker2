import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalorieAwareDatePicker, { CalorieStatus, DayCalorieData } from '../../components/CalorieAwareDatePicker';
import CircularProgress from '../../components/CircularProgress';
import { ProductData } from '../../components/ProductCard';
import VitaminMineralCircle from '../../components/VitaminMineralCircle';
import WelcomeCard from '../../components/WelcomeCard';
import { useTranslation } from '../../i18n/i18n';
import { DailyNutritionData, formatDateToString, getDailyNutrition } from '../../services/dailyNutrition';
import { navigateToHistoryDashboard, navigateToProductDetail } from '../../services/navigationService';
import { getRecentScans } from '../../services/scanHistory';
import { getYesterdayCalories, isFirstTimeUser } from '../../utils/calorieCalculations';
import { prefetchImages } from '../../utils/imageCache';
import { getDailyMotivationMessage } from '../../utils/motivationMessages';
import { NutritionCalculationResult } from '../../utils/nutritionCalculator';
import { styles } from './main01.styles';

// Интерфейс для истории сканирований (совместимость с history.tsx)
interface ScanHistoryItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  image: string;
  timestamp: number;
}

// Цвета макронутриентов (такие же как в history.tsx)
const MACRO_COLORS = {
  Protein: {
    light: '#FF6B6B',
    dark: '#FF8A8A'
  },
  Fat: {
    light: '#FFD93D',
    dark: '#FFE066'
  },
  Carbs: {
    light: '#4ECDC4',
    dark: '#6FD8D2'
  }
};

interface MacronutrientData {
  current: number;
  goal: number;
  name: string;
  color: string;
  colorDark: string;
}

interface WeeklyStats {
  averageCalories: number;
  averageProtein: number;
  averageFat: number;
  averageCarbs: number;
  averageSugar: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalSugar: number;
  daysInGoal: number;
  totalDays: number;
  caloriesTrend: number; // процент изменения относительно предыдущей недели
  proteinPercentage: number;
  fatPercentage: number;
  carbsPercentage: number;
  sugarPercentage: number;
  dailyData: Array<{
    day: string;
    calories: number;
    hasData: boolean;
  }>;
}

interface VitaminMineralData {
  name: string;
  shortName: string;
  current: number;
  goal: number;
  color: string;
  // Добавляем поля для совместимости с AI данными
  currentWeeklyIntake?: string;
  weeklyGoal?: string;
  percentage?: number;
  status?: string;
}

interface WeeklyVitaminMinerals {
  vitamins: VitaminMineralData[];
  minerals: VitaminMineralData[];
  vitaminScore: number;
  mineralScore: number;
  deficiencies: string[];
  recommendations: string[];
  // Добавляем поля из AI ответа
  overallVitaminScore?: number;
  overallMineralScore?: number;
  deficiencyList?: string[];
}

// Временные типы для рекомендаций
interface RecommendationsResponse {
  success: boolean;
  recommendations: {
    title: string;
    message: string;
    tips: string[];
    priority: 'high' | 'medium' | 'low';
  }[];
  analysis: {
    calorieBalance: string;
    macroBalance: string;
    overallScore: number;
  };
  nextSteps: string[];
}

// Новый интерфейс для AI рекомендаций из N8N
interface AIRecommendationsResponse {
  success: boolean;
  shortSummary: string;
  bulletPoints: string[];
  detailedAnalysis?: string;
  recommendations?: string[];
  timestamp: string;
  // Добавляем поле для витаминного дашборда
  vitaminMineralDashboard?: {
    vitamins: Array<{
      name: string;
      shortName: string;
      currentWeeklyIntake: string;
      weeklyGoal: string;
      percentage: number;
      status: string;
    }>;
    minerals: Array<{
      name: string;
      shortName: string;
      currentWeeklyIntake: string;
      weeklyGoal: string;
      percentage: number;
      status: string;
    }>;
    overallVitaminScore: number;
    overallMineralScore: number;
    deficiencyList: string[];
    recommendations: string[];
  };
}

// Компонент для отображения продукта в Recent Scans блоке (такой же как в history.tsx)
const RecentProductItem = ({ 
  item, 
  isDark, 
  t, 
  onDelete 
}: { 
  item: ProductData; 
  isDark: boolean; 
  t: (key: string) => string;
  onDelete?: () => void;
}) => {
  const proteinColor = isDark ? MACRO_COLORS.Protein.dark : MACRO_COLORS.Protein.light;
  const fatColor = isDark ? MACRO_COLORS.Fat.dark : MACRO_COLORS.Fat.light;
  const carbsColor = isDark ? MACRO_COLORS.Carbs.dark : MACRO_COLORS.Carbs.light;

  // Функция для перехода на экран продукта (копия из ProductCard)
  const handleProductPress = () => {
    // Валидируем данные перед созданием ScanHistoryItem
    const calories = item.calories ?? 0;
    const protein = item.macros?.protein ?? 0;
    const fat = item.macros?.fat ?? 0;
    const carbs = item.macros?.carbs ?? 0;
    
    // Проверяем что данные валидны
    if (calories === 0 && protein === 0 && fat === 0 && carbs === 0) {
      console.warn('Попытка навигации с невалидными данными продукта:', item);
      return; // Не переходим если данные невалидны
    }
    
    // Преобразуем данные ProductData в ScanHistoryItem для навигации
    const scanItem = {
      id: item.id,
      name: item.name || 'Неизвестный продукт',
      calories: calories,
      protein: protein,
      fat: fat,
      carbs: carbs,
      image: item.imageUrl,
      date: new Date().toLocaleTimeString(),
      timestamp: item.timestamp?.getTime() ?? Date.now(),
      scanDate: item.timestamp?.toLocaleDateString() ?? new Date().toLocaleDateString(),
      fullData: item.fullData // Добавляем полные данные, если они есть
    };
    
    // Используем единый навигационный сервис
    navigateToProductDetail(scanItem);
  };

  // Функция для удаления продукта
  const handleDelete = async () => {
    const baseMessage = t('common.deleteFromHistoryMessage');
    const message = baseMessage.replace('удалить', `удалить "${item.name}"`).replace('eliminar', `eliminar "${item.name}"`).replace('delete', `delete "${item.name}"`);
    
    Alert.alert(
      t('common.deleteProduct'),
      message,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteScanFromHistory } = await import('../../services/scanHistory');
              // Извлекаем оригинальный ID из составного ID (до первого дефиса)
              const originalId = item.id.split('-')[0];
              console.log('🗑️ Удаляем продукт из истории сканирований. Составной ID:', item.id, 'Оригинальный ID:', originalId);
              const success = await deleteScanFromHistory(originalId);
              if (success && onDelete) {
                onDelete(); // Вызываем callback для обновления списка
              }
            } catch (error) {
              console.error('Ошибка при удалении продукта:', error);
              Alert.alert(t('common.error'), t('common.failedToDeleteProduct'));
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleProductPress}>
      <View style={[styles.recentProductItem, isDark && styles.darkRecentProductItem]}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.recentProductImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200} 
          placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
          onError={(error: any) => {
            console.warn('❌ Ошибка загрузки изображения в RecentProductItem:', error);
          }}
          recyclingKey={item.id}
        />
        <View style={styles.recentProductInfoContainer}>
          <View style={styles.recentProductHeader}>
            <Text style={[styles.recentProductName, isDark && styles.darkText]} numberOfLines={1}>{item.name}</Text>
            
            {/* Кнопка удаления */}
            <TouchableOpacity 
              style={styles.recentDeleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="trash-outline" 
                size={16} 
                color={isDark ? "#888888" : "#666666"} 
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.recentCaloriesText, isDark && styles.darkText]}>{item.calories ?? 0} {t('history.calories')}</Text>
          <View style={styles.recentMacrosRowScanned}>
            <View style={styles.recentMacroDetail}>
              <View style={[styles.recentMacroCircle, { backgroundColor: proteinColor }]}>
                <Text style={styles.recentMacroLetter}>P</Text>
              </View>
              <Text style={[styles.recentMacroValue, isDark && styles.darkTextSecondary]}>{Math.round(item.macros?.protein ?? 0)}{t('common.gram')}</Text>
            </View>
            <View style={styles.recentMacroDetail}>
              <View style={[styles.recentMacroCircle, { backgroundColor: fatColor }]}>
                <Text style={styles.recentMacroLetter}>F</Text>
              </View>
              <Text style={[styles.recentMacroValue, isDark && styles.darkTextSecondary]}>{Math.round(item.macros?.fat ?? 0)}{t('common.gram')}</Text>
            </View>
            <View style={styles.recentMacroDetail}>
              <View style={[styles.recentMacroCircle, { backgroundColor: carbsColor }]}>
                <Text style={styles.recentMacroLetter}>C</Text>
              </View>
              <Text style={[styles.recentMacroValue, isDark && styles.darkTextSecondary]}>{Math.round(item.macros?.carbs ?? 0)}{t('common.gram')}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Компонент для отображения недавно добавленных продуктов (из дневника)
const RecentAddedProductItem = ({ 
  item, 
  isDark, 
  t, 
  onDelete 
}: { 
  item: ProductData; 
  isDark: boolean; 
  t: (key: string) => string;
  onDelete?: () => void;
}) => {
  const router = useRouter();
  
  const proteinColor = isDark ? MACRO_COLORS.Protein.dark : MACRO_COLORS.Protein.light;
  const fatColor = isDark ? MACRO_COLORS.Fat.dark : MACRO_COLORS.Fat.light;
  const carbsColor = isDark ? MACRO_COLORS.Carbs.dark : MACRO_COLORS.Carbs.light;

  const handleProductPress = () => {
    // Аналогично RecentProductItem, но для продуктов из дневника
    const scanItem = {
      id: item.id,
      name: item.name,
      calories: item.calories ?? 0,
      protein: item.macros?.protein ?? 0,
      fat: item.macros?.fat ?? 0,
      carbs: item.macros?.carbs ?? 0,
      sugar: 0,
      image: item.imageUrl,
      timestamp: item.timestamp?.getTime() ?? Date.now(),
      scanDate: item.timestamp?.toLocaleDateString() ?? new Date().toLocaleDateString(),
      date: item.timestamp?.toLocaleDateString() ?? new Date().toLocaleDateString(), // Добавляем поле date
      fullData: item.fullData
    };
    
    navigateToProductDetail(scanItem);
  };

  // Функция для удаления продукта из дневника питания
  const handleDeleteFromDiary = async () => {
    const baseMessage = t('common.deleteFromDiaryMessage');
    const message = baseMessage.replace('удалить', `удалить "${item.name}"`).replace('eliminar', `eliminar "${item.name}"`).replace('delete', `delete "${item.name}"`);
    
    Alert.alert(
      t('common.deleteFromDiary'),
      message,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { removeProductFromDay } = await import('../../services/dailyNutrition');
              
              console.log('🗑️ Удаляем продукт из дневника:', item.name, 'ID:', item.id);
              
              // Удаляем продукт из дневника питания
              const updatedData = await removeProductFromDay(item.id);
              
              if (updatedData && onDelete) {
                console.log('✅ Продукт успешно удален из дневника');
                onDelete(); // Обновляем список
              }
            } catch (error) {
              console.error('❌ Ошибка при удалении продукта из дневника:', error);
              Alert.alert(t('common.error'), t('common.failedToDeleteFromDiary'));
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleProductPress}>
      <View style={[styles.recentProductItem, isDark && styles.darkRecentProductItem]}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.recentProductImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200} 
          placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
          onError={(error: any) => {
            console.warn('❌ Ошибка загрузки изображения в RecentAddedProductItem:', error);
          }}
          recyclingKey={item.id}
        />
        <View style={styles.recentProductInfoContainer}>
          <View style={styles.recentProductHeader}>
            <Text style={[styles.recentProductName, isDark && styles.darkText]} numberOfLines={1}>{item.name}</Text>
            
            {/* Кнопка удаления из дневника */}
            <TouchableOpacity 
              style={styles.recentDeleteButton}
              onPress={handleDeleteFromDiary}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="trash-outline" 
                size={16} 
                color={isDark ? "#888888" : "#666666"} 
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.recentCaloriesText, isDark && styles.darkText]}>{item.calories ?? 0} {t('history.calories')}</Text>
          <View style={styles.recentMacrosRowScanned}>
            <View style={styles.recentMacroDetail}>
              <View style={[styles.recentMacroCircle, { backgroundColor: proteinColor }]}>
                <Text style={styles.recentMacroLetter}>P</Text>
              </View>
              <Text style={[styles.recentMacroValue, isDark && styles.darkTextSecondary]}>{Math.round(item.macros?.protein ?? 0)}{t('common.gram')}</Text>
            </View>
            <View style={styles.recentMacroDetail}>
              <View style={[styles.recentMacroCircle, { backgroundColor: fatColor }]}>
                <Text style={styles.recentMacroLetter}>F</Text>
              </View>
              <Text style={[styles.recentMacroValue, isDark && styles.darkTextSecondary]}>{Math.round(item.macros?.fat ?? 0)}{t('common.gram')}</Text>
            </View>
            <View style={styles.recentMacroDetail}>
              <View style={[styles.recentMacroCircle, { backgroundColor: carbsColor }]}>
                <Text style={styles.recentMacroLetter}>C</Text>
              </View>
              <Text style={[styles.recentMacroValue, isDark && styles.darkTextSecondary]}>{Math.round(item.macros?.carbs ?? 0)}{t('common.gram')}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Временная функция для запроса рекомендаций (заглушка)
// Функция для запроса AI рекомендаций из N8N
const requestAIRecommendations = async (userEmail: string, locale: string): Promise<AIRecommendationsResponse> => {
  try {
    console.log('🤖 Отправляем запрос к N8N для получения AI рекомендаций...');
    
    const response = await fetch('https://ttagent.website/webhook/get-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userEmail,
        requestedAt: new Date().toISOString(),
        locale: locale, // Добавляем текущий язык приложения
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Получены AI рекомендации:', data);

    // N8N возвращает данные как объект с полем text
    let aiData;
    try {
      // Проверяем, что данные пришли в правильном формате
      if (data && data.text) {
        // Извлекаем JSON из markdown блока
        const jsonText = data.text.replace(/```json\n/, '').replace(/\n```$/, '');
        aiData = JSON.parse(jsonText);
        console.log('✅ AI данные успешно распарсены:', aiData);
      } else if (Array.isArray(data) && data.length > 0 && data[0].text) {
        // Fallback для случая если N8N вернет массив
        const jsonText = data[0].text.replace(/```json\n/, '').replace(/\n```$/, '');
        aiData = JSON.parse(jsonText);
        console.log('✅ AI данные успешно распарсены (массив):', aiData);
      } else {
        console.error('❌ Неожиданный формат ответа от N8N:', data);
        throw new Error('Неверный формат ответа от N8N');
      }
    } catch (error) {
      console.error('❌ Ошибка парсинга AI ответа:', error);
      console.error('❌ Исходные данные:', data);
      throw new Error('Неверный формат ответа от AI');
    }

    return {
      success: true,
      shortSummary: aiData.nutritionRecommendations?.shortSummary || 'Рекомендации готовы',
      bulletPoints: aiData.nutritionRecommendations?.bulletPoints || ['Продолжайте отслеживать питание'],
      detailedAnalysis: aiData.calorieAnalysis?.assessment,
      recommendations: aiData.nutritionRecommendations,
      timestamp: new Date().toISOString(),
      vitaminMineralDashboard: aiData.vitaminMineralDashboard
    };
  } catch (error) {
    console.error('❌ Ошибка при получении AI рекомендаций:', error);
    throw error;
  }
};

const requestPersonalizedRecommendations = async (
  weeklyStats: any,
  userGoals: any,
  userProfile: any
): Promise<RecommendationsResponse> => {
  // Имитируем задержку сети
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    recommendations: [
      {
        title: 'Персональные рекомендации',
        message: 'На основе анализа ваших данных за неделю, мы подготовили персональные рекомендации для улучшения питания.',
        tips: [
          'Увеличьте потребление белка на 15%',
          'Добавьте больше овощей в рацион',
          'Контролируйте размер порций',
          'Пейте больше воды в течение дня'
        ],
        priority: 'high' as const,
      },
    ],
    analysis: {
      calorieBalance: 'Сбалансированный',
      macroBalance: 'Требует корректировки',
      overallScore: 75,
    },
    nextSteps: [
      'Продолжайте отслеживать питание',
      'Добавьте физическую активность',
      'Планируйте приемы пищи заранее'
    ],
  };
};

export default function Main01Screen() { 
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, locale } = useTranslation();
  const router = useRouter();
  
  // Состояние для плана питания из калькулятора
  const [nutritionPlan, setNutritionPlan] = useState<NutritionCalculationResult | null>(null);
  
  // Состояния для редактирования целей питания
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedGoals, setEditedGoals] = useState({
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    sugar: ''
  });
  
  // Значения по умолчанию для дневных целей (fallback если план не загружен)
  const defaultCalorieGoal = 2000;
  const defaultMaxSugar = 25;
  const defaultProteinGoal = 120;
  const defaultFatGoal = 110;
  const defaultCarbGoal = 190;
  
  // Получаем значения из плана питания или используем значения по умолчанию
  const dailyCalorieGoal = nutritionPlan?.targetCalories || defaultCalorieGoal;
  const maxSugar = nutritionPlan?.maxHiddenSugar || defaultMaxSugar;
  const proteinGoal = nutritionPlan?.dailyMacros.protein || defaultProteinGoal;
  const fatGoal = nutritionPlan?.dailyMacros.fat || defaultFatGoal;
  const carbGoal = nutritionPlan?.dailyMacros.carbs || defaultCarbGoal;
  
  // Логирование перенесено в useEffect для избежания бесконечного цикла
  
  // Состояние для хранения дневной статистики питания
  const [dailyNutritionData, setDailyNutritionData] = useState<DailyNutritionData | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Сохраняем данные о калориях за предыдущие дни
  const [historicalCalorieData, setHistoricalCalorieData] = useState<DayCalorieData[]>([]);
  
  // Значения для отображения
  const consumedCalories = dailyNutritionData?.caloriesConsumed || 0;
  const burnedCalories = 0; // В текущей версии не отслеживаем сожженные калории
  const caloriesActuallyConsumed = consumedCalories - burnedCalories;
  const caloriesLeft = dailyCalorieGoal - caloriesActuallyConsumed; 
  const circularProgressPercentage = (caloriesActuallyConsumed / dailyCalorieGoal) * 100;
  
  // Данные по скрытому сахару
  const currentSugar = dailyNutritionData?.sugar || 0;
  
  // Макронутриенты с реальными данными
  const [macronutrients, setMacronutrients] = useState<MacronutrientData[]>([
    { name: t('dashboard.protein'), current: 0, goal: proteinGoal, color: '#FF8A80', colorDark: '#FF6B6B' },
    { name: t('dashboard.fat'), current: 0, goal: fatGoal, color: '#FFCF50', colorDark: '#FFD166' },
    { name: t('dashboard.carbs'), current: 0, goal: carbGoal, color: '#80D8FF', colorDark: '#06D6A0' },
    { name: t('nutrition.hiddenSugar'), current: 0, goal: maxSugar, color: '#FF3B30', colorDark: '#FF3B30' },
  ]);
  
  // Используем реальные данные из истории сканирований
  const [recentScans, setRecentScans] = useState<ProductData[]>([]);
  const [recentAdded, setRecentAdded] = useState<ProductData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Состояние для блока Recent Scans/Added с горизонтальным скроллом
  const [currentRecentSlide, setCurrentRecentSlide] = useState(0);
  const recentScrollViewRef = useRef<ScrollView>(null);
  
  // Состояние для недельной статистики и горизонтального скролла
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [weeklyVitaminMinerals, setWeeklyVitaminMinerals] = useState<WeeklyVitaminMinerals | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  
  // Состояние для мотивирующих сообщений
  const [dailyMotivationMessage, setDailyMotivationMessage] = useState<string>('');
  
  // Состояния для системы персональных рекомендаций
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsProgress, setRecommendationsProgress] = useState(0);
  const [recommendationsProgressText, setRecommendationsProgressText] = useState('');
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<RecommendationsResponse | null>(null);
  
  // Состояния для AI рекомендаций из N8N
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationsResponse | null>(null);
  const [lastRecommendationDate, setLastRecommendationDate] = useState<string | null>(null);
  const [recommendationError, setRecommendationError] = useState<boolean>(false);
  
  // Состояние для разворачивания рекомендаций
  const [isRecommendationsExpanded, setIsRecommendationsExpanded] = useState(false);
  const [isVitaminRecommendationsExpanded, setIsVitaminRecommendationsExpanded] = useState(false);
  
  // Обработчик изменения даты
  const handleDateChange = (date: Date) => {
    console.log(`Выбрана новая дата: ${formatDateToString(date)}`);
    setCurrentDate(date);
    
    // Загружаем данные для выбранной даты и обновляем индикаторы только для нее
    loadNutritionData(date);
    
    // Обновляем список Recently Added для выбранной даты
    loadRecentAdded(date);
    
    // Больше не загружаем исторические данные при каждом переключении даты
    // Это поможет избежать проблем с перезаписью данных и исчезновением индикаторов
  };
  
  // Обработчик обновления данных при pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadNutritionData(currentDate),
      loadRecentScans(),
      loadRecentAdded()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [currentDate]);
  
  // Функции для работы с кэшем AI рекомендаций
  const saveAIRecommendationsToCache = async (recommendations: AIRecommendationsResponse, date: string) => {
    try {
      await AsyncStorage.setItem('aiRecommendations', JSON.stringify(recommendations));
      await AsyncStorage.setItem('lastRecommendationDate', date);
      console.log('💾 AI рекомендации сохранены в кэш для даты:', date);
    } catch (error) {
      console.error('❌ Ошибка сохранения AI рекомендаций:', error);
    }
  };

  const loadAIRecommendationsFromCache = async () => {
    try {
      const [cachedRecommendations, cachedDate] = await Promise.all([
        AsyncStorage.getItem('aiRecommendations'),
        AsyncStorage.getItem('lastRecommendationDate')
      ]);

      if (cachedRecommendations && cachedDate) {
        const today = new Date().toDateString();
        
        // Проверяем, что кэш актуален (сегодняшняя дата)
        if (cachedDate === today) {
          const recommendations = JSON.parse(cachedRecommendations) as AIRecommendationsResponse;
          
          // Загружаем только успешные рекомендации из кэша
          if (recommendations.success) {
            setAiRecommendations(recommendations);
            setLastRecommendationDate(cachedDate);
            setRecommendationError(false);
            console.log('📱 Загружены AI рекомендации из кэша для даты:', cachedDate);
            console.log('📊 Данные недельных рекомендаций:', {
              shortSummary: recommendations.shortSummary,
              bulletPointsCount: recommendations.bulletPoints?.length || 0,
              bulletPoints: recommendations.bulletPoints,
              hasVitaminData: !!recommendations.vitaminMineralDashboard
            });
            
            // Обновляем витаминный дашборд с кэшированными данными от AI
            if (recommendations.vitaminMineralDashboard) {
              console.log('🔄 Обновляем витаминный дашборд с кэшированными данными от AI...');
              await loadWeeklyVitaminMinerals(recommendations);
            }
            
            return true;
          } else {
            // Если в кэше ошибочные данные, очищаем их
            console.log('🗑️ В кэше ошибочные данные, очищаем');
            await AsyncStorage.removeItem('aiRecommendations');
            await AsyncStorage.removeItem('lastRecommendationDate');
          }
        } else {
          console.log('🗑️ Кэш устарел, очищаем данные');
          await AsyncStorage.removeItem('aiRecommendations');
          await AsyncStorage.removeItem('lastRecommendationDate');
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Ошибка загрузки AI рекомендаций из кэша:', error);
      return false;
    }
  };

  const canRequestRecommendations = () => {
    const today = new Date().toDateString();
    // Кнопка доступна если:
    // 1. Сегодня еще не запрашивали рекомендации
    // 2. Или была ошибка при последнем запросе
    return !lastRecommendationDate || lastRecommendationDate !== today || recommendationError;
  };

  // Загружаем сохраненные данные при старте
  useEffect(() => {
    // Загружаем сохраненные данные из AsyncStorage
    const loadSavedData = async () => {
      try {
        const savedHistoricalData = await AsyncStorage.getItem('historicalCalorieData');
        if (savedHistoricalData) {
          const parsedData = JSON.parse(savedHistoricalData) as DayCalorieData[];
          // Преобразуем строки дат в объекты Date
          const processedData = parsedData.map(item => ({
            ...item,
            date: new Date(item.date)
          }));
          console.log(`Загружены сохраненные данные: ${processedData.length} записей`);
          setHistoricalCalorieData(processedData);
        }

        // Загружаем AI рекомендации из кэша
        await loadAIRecommendationsFromCache();
      } catch (error) {
        console.error('Ошибка при загрузке сохраненных данных:', error);
      }
    };
    
    loadSavedData();
  }, []);
  
  // Обновляем цели макронутриентов при изменении плана питания
  useEffect(() => {
    // Логирование целей питания только при их изменении
    console.log('🎯 Обновлены цели питания:', {
      hasNutritionPlan: !!nutritionPlan,
      dailyCalorieGoal,
      proteinGoal,
      fatGoal,
      carbGoal,
      maxSugar,
      source: nutritionPlan ? 'ИЗ ПЛАНА' : 'ПО УМОЛЧАНИЮ'
    });
    
    setMacronutrients(prevMacros => [
      { ...prevMacros[0], goal: proteinGoal },
      { ...prevMacros[1], goal: fatGoal },
      { ...prevMacros[2], goal: carbGoal },
      { ...(prevMacros[3] || { name: t('nutrition.hiddenSugar'), current: 0, color: '#FF3B30', colorDark: '#FF3B30' }), goal: maxSugar },
    ]);
  }, [proteinGoal, fatGoal, carbGoal, maxSugar]);

  // Инициализация данных при первой загрузке экрана
  // Разделяем на два useEffect для двух разных фаз загрузки
  useEffect(() => {
    console.log('Первичная загрузка данных - фаза 1');
    
    // Загружаем план питания из калькулятора
    loadNutritionPlan();
    
    // Загружаем данные за текущий день
    loadNutritionData(currentDate);
    
    // Загружаем последние сканы
    loadRecentScans();
    
    // Загружаем последние добавленные продукты
    loadRecentAdded();
    
    // Загружаем недельную статистику
    loadWeeklyStats();
    
    // Пересчитываем данные календаря
    setCalorieData(getCalorieData());
    
    // Загружаем данные за 13 и 12 мая для быстрого отображения
    loadHistoricalData();
  }, []);
  
  // Специально отключили полную загрузку истории с задержкой, так как она перезаписывает правильные данные
  useEffect(() => {
    // Загружаем исторические данные только один раз при начальной загрузке
    // И больше не запускаем никаких таймеров, которые могут перезаписать правильные данные
    console.log('Начальная загрузка исторических данных');
    loadHistoricalData();
    
    // Не запускаем загрузку по таймеру, так как это приводит к перезаписи данных
  }, []);
  
  // Обновляем данные при возврате на экран (например, после добавления продукта)
  useFocusEffect(
    useCallback(() => {
      console.log('Экран получил фокус, обновляем данные питания...');
      
      // ИСПРАВЛЕНО: Убираем автоматическое переключение на сегодня
      // Пользователь должен иметь возможность просматривать любые даты
      // const today = new Date();
      // const isNewDay = !isSameDay(currentDate, today);
      // 
      // if (isNewDay) {
      //   console.log(`🗓️ День сменился! Было: ${formatDateToString(currentDate)}, стало: ${formatDateToString(today)}`);
      //   setCurrentDate(today);
      // }
      
      // Загружаем план питания (может обновиться после завершения онбординга)
      loadNutritionPlan();
      
      // Загружаем данные для ТЕКУЩЕЙ ВЫБРАННОЙ даты (не автоматически переключаем на сегодня)
      loadNutritionData(currentDate);
      
      // Загружаем последние сканы
      loadRecentScans();
      
      // Загружаем последние добавленные продукты для выбранной даты
      loadRecentAdded(currentDate);
      
      // Обновляем недельную статистику
      loadWeeklyStats();

      // Загружаем мотивирующее сообщение
      loadDailyMotivationMessage();
      
      return () => {};
    }, [currentDate])
  );

  // Загрузка данных витаминов и минералов при изменении недельной статистики
  useFocusEffect(
    useCallback(() => {
      if (weeklyStats) {
        loadWeeklyVitaminMinerals();
      }
    }, [weeklyStats])
  );
  
  // Функция загрузки данных о питании за выбранную дату
  const loadNutritionData = async (date: Date) => {
    try {
      console.log('🔄 === ЗАГРУЗКА ДАННЫХ ПИТАНИЯ ===');
      console.log('📅 Загружаем данные для даты:', formatDateToString(date));
      
      const dateString = formatDateToString(date);
      console.log(`Загрузка данных о питании за ${dateString}...`);
      
      const nutritionData = await getDailyNutrition(dateString);
      setDailyNutritionData(nutritionData);
      
      // Обновляем макронутриенты на основе загруженных данных
      setMacronutrients([
        { name: t('dashboard.protein'), current: nutritionData?.protein || 0, goal: proteinGoal, color: '#FF8A80', colorDark: '#FF6B6B' },
        { name: t('dashboard.fat'), current: nutritionData?.fat || 0, goal: fatGoal, color: '#FFCF50', colorDark: '#FFD166' },
        { name: t('dashboard.carbs'), current: nutritionData?.carbs || 0, goal: carbGoal, color: '#80D8FF', colorDark: '#06D6A0' },
        { name: t('nutrition.hiddenSugar'), current: nutritionData?.sugar || 0, goal: maxSugar, color: '#FF3B30', colorDark: '#FF3B30' },
      ]);
       
      console.log(`Загружены данные о питании: калории=${nutritionData?.caloriesConsumed || 0}, сахар=${nutritionData?.sugar || 0}`);
      
      // Добавляем данные в историю для отображения индикаторов в календаре
      const today = new Date();
      const isDateToday = isSameDay(date, today);
      const existingData = historicalCalorieData.find(d => 
        isSameDay(new Date(d.date), date)
      );
      
      // ВАЖНО: Никогда не добавляем данные для будущих дат!
      const isFutureDate = isDateAfterToday(date);
      if (isFutureDate) {
        console.log(`🚫 Будущая дата ${formatDateToString(date)}: не добавляем данные в календарь`);
        
        // Если существует запись для будущей даты - удаляем её
        if (existingData) {
          console.log(`🗑️ Удаляем данные для будущей даты ${formatDateToString(date)}`);
          setHistoricalCalorieData(prevData => 
            prevData.filter(d => !isSameDay(new Date(d.date), date))
          );
        }
        return; // Выходим из функции для будущих дат
      }
      
      // Для текущего дня: принудительно удаляем из истории, если нет данных
      if (isDateToday && (!nutritionData || nutritionData.caloriesConsumed <= 0)) {
        console.log(`Текущий день ${formatDateToString(date)}: нет данных, удаляем из истории`);
      
        // Если существует запись в истории за текущий день - удаляем её
        if (existingData) {
          setHistoricalCalorieData(prevData => 
            prevData.filter(d => !isSameDay(new Date(d.date), date))
          );
        }
      } 
      // Для дней с данными: добавляем их в историю
      else if (nutritionData && nutritionData.caloriesConsumed > 0) {
        // Определяем статус на основе потребления
        let status = CalorieStatus.EMPTY;
        const consumed = nutritionData.caloriesConsumed;
        const actualGoal = nutritionPlan?.targetCalories || dailyCalorieGoal;
        
        if (consumed > actualGoal * 1.05) {
          status = CalorieStatus.OVER;   // Перебор калорий (красный)
        } else if (consumed >= actualGoal * 0.95 && consumed <= actualGoal * 1.05) {
          status = CalorieStatus.NORMAL; // В пределах нормы (желтый)
        } else if (consumed > 0) {
          status = CalorieStatus.UNDER;  // Недобор калорий (зеленый)
        }
        
        // Добавляем в историю данные о потребленных калориях
        if (!existingData || existingData.consumed !== consumed) {
          console.log(`Добавляем данные в историю для ${formatDateToString(date)}: ${consumed} ккал, цель=${actualGoal}, статус=${status}`);
          setHistoricalCalorieData(prevData => {
            // Убираем старые данные за этот день, если есть
            const filteredData = prevData.filter(d => !isSameDay(new Date(d.date), date));
            return [...filteredData, {
              date: date,
              consumed: consumed,
              goal: actualGoal,
              status: status
            }];
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных о питании:', error);
    }
  };
  
  // Загрузка исторических данных о питании за последнюю неделю
  const loadHistoricalData = async () => {
    try {
      console.log('Запущена загрузка данных за последнюю неделю...');
      const today = new Date();
      
      // Сохраняем текущие данные для сегодняшнего дня перед обновлением
      const todayData = historicalCalorieData.find(d => isSameDay(new Date(d.date), today));
      
      // Создаем временный массив данных, чтобы обновить их все сразу
      let newHistoricalData: DayCalorieData[] = [...historicalCalorieData];
      let dataChanged = false;
      
      // Загружаем данные за последние 7 дней (только прошлые и сегодняшний день)
      const dates = [];
      for (let i = -7; i <= 0; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        // ВАЖНО: Загружаем данные только для прошлых дат и сегодня
        // Не загружаем данные для будущих дат!
        if (isDateBeforeOrEqualToday(date)) {
          dates.push(date);
        }
      }
      
      // Загружаем данные для всех дат параллельно
      const promises = dates.map(date => {
        const dateString = formatDateToString(date);
        return getDailyNutrition(dateString)
          .then(nutritionData => {
            if (nutritionData && nutritionData.caloriesConsumed > 0) {
              console.log(`Загружены исторические данные за ${dateString}: калории=${nutritionData.caloriesConsumed}`);
              
              // Определяем статус на основе потребления
              let status = CalorieStatus.EMPTY;
              const consumed = nutritionData.caloriesConsumed;
              if (consumed > dailyCalorieGoal * 1.05) {
                status = CalorieStatus.OVER;
              } else if (consumed >= dailyCalorieGoal * 0.95 && consumed <= dailyCalorieGoal * 1.05) {
                status = CalorieStatus.NORMAL;
              } else if (consumed > 0) {
                status = CalorieStatus.UNDER;
              }
              
              // Добавляем или обновляем данные в нашем временном массиве
              const existingIndex = newHistoricalData.findIndex(d => isSameDay(new Date(d.date), date));
              if (existingIndex !== -1) {
                // Обновляем существующие данные
                if (newHistoricalData[existingIndex].consumed !== consumed || 
                    newHistoricalData[existingIndex].status !== status) {
                  newHistoricalData[existingIndex] = {
                    date: date,
                    consumed: consumed,
                    goal: dailyCalorieGoal,
                    status: status
                  };
                  dataChanged = true;
                }
              } else {
                // Добавляем новые данные
                newHistoricalData.push({
                  date: date,
                  consumed: consumed,
                  goal: dailyCalorieGoal,
                  status: status
                });
                dataChanged = true;
              }
            } else if (isSameDay(date, today) && (!nutritionData || nutritionData.caloriesConsumed <= 0)) {
              // Удаляем запись для текущего дня без данных
              const existingIndex = newHistoricalData.findIndex(d => isSameDay(new Date(d.date), date));
              if (existingIndex !== -1) {
                newHistoricalData.splice(existingIndex, 1);
                dataChanged = true;
              }
            }
            return null;
          })
          .catch(error => {
            console.error(`Ошибка при загрузке данных за ${dateString}:`, error);
            return null;
          });
      });
      
      // Ждем завершения всех запросов
      await Promise.all(promises);
      
      // Обновляем исторические данные только если они изменились
      if (dataChanged) {
        // Если у нас были данные для сегодняшнего дня, убедимся что они не потерялись
        if (todayData && todayData.consumed > 0) {
          const todayExists = newHistoricalData.some(d => isSameDay(new Date(d.date), today));
          if (!todayExists) {
            // Если данные для сегодня пропали, вернем их обратно
            newHistoricalData.push(todayData);
            console.log('Восстановлены данные для текущего дня:', todayData);
          }
        }
        
        console.log('Обновляем все данные календаря, найдено новых записей:', newHistoricalData.length);
        setHistoricalCalorieData(newHistoricalData);
        
        // Пересчитываем данные для календаря
        setCalorieData(getCalorieData());
      }
      
      console.log('Загрузка исторических данных завершена. Исторических записей:', newHistoricalData.length);
    } catch (error) {
      console.error('Ошибка при загрузке исторических данных:', error);
    }
  };

  // Загрузка последних сканирований
  const loadRecentScans = async () => {
    try {
      console.log('Загрузка последних сканирований...');
      const recentHistory = await getRecentScans(3);
      console.log('Получено сканирований:', recentHistory.length);
      
      if (recentHistory.length > 0) {
        console.log('Последнее сканирование:', recentHistory[0].name, 'Дата:', recentHistory[0].scanDate);
      }
      
      // Преобразуем в формат ProductData для компонента ProductCard
      const formattedScans: ProductData[] = recentHistory.map((item, index) => ({
        id: `${item.id}-${item.timestamp}-${index}`, // Уникальный ключ с timestamp и индексом
        name: item.name,
        calories: item.calories,
        macros: { 
          protein: item.protein, 
          fat: item.fat, 
          carbs: item.carbs 
        },
        timestamp: new Date(item.timestamp),
        imageUrl: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
        fullData: item.fullData // Добавляем полные данные, если они есть
      }));
      
      setRecentScans(formattedScans);
      console.log('Обновлены последние сканы на главном экране');
      
      // Проактивное кэширование изображений в фоне
      const imageUrls = formattedScans
        .map(scan => scan.imageUrl)
        .filter((url): url is string => url != null && !url.includes('unsplash.com')); // Исключаем placeholder'ы
      
      if (imageUrls.length > 0) {
        console.log(`🚀 Запускаем кэширование ${imageUrls.length} изображений в фоне...`);
        // Не ждем завершения кэширования, чтобы не замедлять UI
        prefetchImages(imageUrls).catch(error => 
          console.warn('⚠️ Ошибка при проактивном кэшировании:', error)
        );
      }
    } catch (error) {
      console.error('Ошибка при загрузке последних сканирований:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Добавим помощник для сравнения дат
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  // Помощник для правильного сравнения календарных дат (без времени)
  const isDateAfterToday = (date: Date): boolean => {
    const today = new Date();
    const todayCalendar = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateCalendar = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateCalendar > todayCalendar;
  };

  const isDateBeforeOrEqualToday = (date: Date): boolean => {
    const today = new Date();
    const todayCalendar = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateCalendar = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateCalendar <= todayCalendar;
  };

  // Вспомогательная функция для определения статуса калорий
  const determineCalorieStatus = (consumed: number, goal: number): CalorieStatus => {
    if (consumed <= 0) {
      return CalorieStatus.EMPTY;
    } else if (consumed > goal * 1.05) {
      return CalorieStatus.OVER;   // Перебор калорий (красный)
    } else if (consumed >= goal * 0.95 && consumed <= goal * 1.05) {
      return CalorieStatus.NORMAL; // В пределах нормы (желтый)
    } else {
      return CalorieStatus.UNDER;  // Недобор калорий (зеленый)
    }
  };

  // Функция для получения данных о калориях без изменения состояния
  const getCalorieData = useCallback((): DayCalorieData[] => {
    console.log('** Вызов функции getCalorieData **');
    const today = new Date();
    
    // Определяем правильную цель калорий
    const actualCalorieGoal = nutritionPlan?.targetCalories || dailyCalorieGoal;
    console.log('🎯 Используем цель калорий:', actualCalorieGoal, 'из плана:', !!nutritionPlan);
    
    // ИСПРАВЛЕНО: Используем ТОЛЬКО исторические данные
    // Не смешиваем с текущими dailyNutritionData для выбранной даты
    let data: DayCalorieData[] = [...historicalCalorieData]
      .filter(item => {
        const itemDate = new Date(item.date);
        return isDateBeforeOrEqualToday(itemDate); // Оставляем только прошлые и сегодняшние данные
      })
      .map(item => ({
        ...item,
        goal: actualCalorieGoal, // Обновляем цель на правильную
        // Пересчитываем статус на основе фактического потребления и правильной цели
        status: determineCalorieStatus(item.consumed, actualCalorieGoal)
      }));
    
    console.log(`Возвращаем данные календаря: ${data.length} записей`);
    data.forEach(item => {
      const dateStr = formatDateToString(new Date(item.date));
      console.log(`- ${dateStr}: ${item.consumed}/${item.goal} ккал, статус: ${item.status}`);
    });
    
    return data;
  }, [historicalCalorieData, dailyCalorieGoal, nutritionPlan]); // Убрали dailyNutritionData из зависимостей!

  // Данные для календаря
  const [calorieData, setCalorieData] = useState<DayCalorieData[]>([]);
  
  // Важный эффект: обновляем данные календаря при изменении исторических данных
  useEffect(() => {
    // Обновляем данные календаря при изменении исторических данных
    console.log(`Обновление данных календаря: исторических данных: ${historicalCalorieData.length}`);
    const newCalorieData = getCalorieData();
    setCalorieData(newCalorieData);
    
    // Сохраняем данные в AsyncStorage для постоянства между запусками
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('historicalCalorieData', JSON.stringify(historicalCalorieData));
        console.log('Данные календаря сохранены в постоянное хранилище');
      } catch (error) {
        console.error('Ошибка сохранения данных:', error);
      }
    };
    
    // Сохраняем данные только если есть что сохранять
    if (historicalCalorieData.length > 0) {
      saveData();
    }
  }, [historicalCalorieData, nutritionPlan, getCalorieData]); // Убрали dailyNutritionData

  // НОВЫЙ ЭФФЕКТ: Обновляем исторические данные только для СЕГОДНЯШНЕГО дня
  useEffect(() => {
    const today = new Date();
    
    // Обновляем данные только если:
    // 1. Есть dailyNutritionData
    // 2. Текущая выбранная дата это сегодня (чтобы не обновлять данные при просмотре прошлых дней)
    if (dailyNutritionData && isSameDay(currentDate, today)) {
      const existingData = historicalCalorieData.find(d => 
        isSameDay(new Date(d.date), today)
      );
      
      if (!existingData || existingData.status === CalorieStatus.EMPTY) {
        // Создаем запись только для текущего дня
        let status = CalorieStatus.EMPTY;
        const consumed = dailyNutritionData.caloriesConsumed;
        const actualGoal = nutritionPlan?.targetCalories || dailyCalorieGoal;
        
        // Определяем статус
        if (consumed > actualGoal * 1.05) {
          status = CalorieStatus.OVER;   // Перебор калорий (красный)
        } else if (consumed >= actualGoal * 0.95 && consumed <= actualGoal * 1.05) {
          status = CalorieStatus.NORMAL; // В пределах нормы (желтый)
        } else if (consumed > 0) {
          status = CalorieStatus.UNDER;  // Недобор калорий (зеленый)
        }
        
        const newData = {
          date: today,
          consumed,
          goal: actualGoal,
          status
        };
        
        // Добавляем только если есть данные или статус не EMPTY
        if (status !== CalorieStatus.EMPTY) {
          console.log(`Обновляем данные за сегодня: ${consumed}/${actualGoal} ккал, статус: ${status}`);
          setHistoricalCalorieData(prevData => {
            // Убираем старые данные за этот день, если есть
            const filteredData = prevData.filter(d => !isSameDay(new Date(d.date), today));
            return [...filteredData, newData];
          });
        }
      }
    }
  }, [dailyNutritionData, currentDate, nutritionPlan, dailyCalorieGoal]);

  // Обновляем макронутриенты при изменении плана питания
  useEffect(() => {
    if (nutritionPlan) {
      console.log('🔄 Обновляем макронутриенты на основе плана питания:', {
        protein: proteinGoal,
        fat: fatGoal,
        carbs: carbGoal
      });
      
      // Обновляем макронутриенты с новыми целевыми значениями
      setMacronutrients(prevMacros => [
        { ...prevMacros[0], goal: proteinGoal },
        { ...prevMacros[1], goal: fatGoal },
        { ...prevMacros[2], goal: carbGoal },
      ]);
    }
  }, [nutritionPlan, proteinGoal, fatGoal, carbGoal]);

  // Функция для загрузки плана питания из AsyncStorage
  const loadNutritionPlan = async () => {
    try {
      console.log('🔍 Начинаем загрузку плана питания...');
      
      // Сначала проверяем кастомные цели
      const customGoals = await AsyncStorage.getItem('customNutritionGoals');
      if (customGoals) {
        const goals = JSON.parse(customGoals);
        console.log('🎯 Найдены кастомные цели:', goals);
        
        // Создаем план на основе кастомных целей
        const customPlan: NutritionCalculationResult = {
          targetCalories: goals.calories,
          maxHiddenSugar: goals.sugar,
          dailyMacros: {
            protein: goals.protein,
            fat: goals.fat,
            carbs: goals.carbs,
            percentages: { protein: 25, fat: 30, carbs: 45 }
          },
          bmr: goals.calories * 0.8, // Примерная оценка
          tdee: goals.calories,
          weeklyTargets: {
            calories: goals.calories * 7,
            protein: goals.protein * 7,
            fat: goals.fat * 7,
            carbs: goals.carbs * 7,
            hiddenSugar: goals.sugar * 7
          },
          expectedWeightChange: -0.5,
          appliedAdjustments: {
            diet: 1.0,
            stress: 1.0,
            mealFrequency: 1.0,
            foodPreferences: 1.0,
            total: 1.0
          }
        };
        
        setNutritionPlan(customPlan);
        console.log('✅ Установлены кастомные цели питания');
        return;
      }
      
      const savedPlan = await AsyncStorage.getItem('nutritionPlan');
      console.log('📦 Сырые данные из AsyncStorage:', savedPlan);
      
      if (savedPlan) {
        const plan = JSON.parse(savedPlan) as NutritionCalculationResult;
        console.log('✅ План успешно распарсен:', plan);
        setNutritionPlan(plan);
        console.log('📊 Загружен план питания:', {
          calories: plan.targetCalories,
          protein: plan.dailyMacros.protein,
          fat: plan.dailyMacros.fat,
          carbs: plan.dailyMacros.carbs,
          sugar: plan.maxHiddenSugar
        });
      } else {
        console.log('⚠️ План питания не найден в AsyncStorage');
        console.log('🔍 Проверяем другие ключи в AsyncStorage...');
        
        // Проверяем, есть ли другие данные
        const userProfile = await AsyncStorage.getItem('userProfile');
        const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
        
        console.log('👤 userProfile в AsyncStorage:', userProfile ? 'ЕСТЬ' : 'НЕТ');
        console.log('✅ hasCompletedOnboarding:', hasCompleted ? 'ЕСТЬ' : 'НЕТ');
        
        if (userProfile && !savedPlan) {
          console.log('🧪 ТЕСТ: Попробуем рассчитать план из сохранённого профиля...');
          try {
            const profile = JSON.parse(userProfile);
            console.log('👤 Загруженный профиль:', profile);
            
            // Пробуем рассчитать план прямо здесь для теста
            if (profile.weight && profile.height && profile.birthday && profile.gender) {
              const { calculateCompleteNutrition } = await import('../../utils/nutritionCalculator');
              const testPlan = calculateCompleteNutrition({
                ...profile,
                currentWeight: profile.weight
              });
              console.log('🧮 ТЕСТ: Рассчитанный план:', testPlan);
              
              if (testPlan) {
                setNutritionPlan(testPlan);
                console.log('🔄 ТЕСТ: Устанавливаем рассчитанный план вместо пустого');
              }
            }
          } catch (testError) {
            console.error('❌ ТЕСТ: Ошибка при тестовом расчёте:', testError);
          }
        } else if (!userProfile && !hasCompleted) {
          // Создаём тестовый план для демонстрации работы интерфейса
          console.log('🎯 СОЗДАЁМ ТЕСТОВЫЙ ПЛАН для демонстрации...');
          const testPlan: NutritionCalculationResult = {
            targetCalories: 1918,
            dailyMacros: {
              protein: 119,
              fat: 64,
              carbs: 217,
              percentages: { protein: 25, fat: 30, carbs: 45 }
            },
            maxHiddenSugar: 48,
            bmr: 1598,
            tdee: 1918,
            weeklyTargets: {
              calories: 13426,
              protein: 833,
              fat: 448,
              carbs: 1519,
              hiddenSugar: 336
            },
            expectedWeightChange: -0.5,
            appliedAdjustments: {
              diet: 1.0,
              stress: 0.95,
              mealFrequency: 1.0,
              foodPreferences: 1.0,
              total: 0.95
            }
          };
          
          setNutritionPlan(testPlan);
          console.log('🎯 ТЕСТОВЫЙ ПЛАН установлен:', testPlan);
        }
        
        console.log('⚠️ Используем значения по умолчанию');
      }
    } catch (error) {
      console.error('❌ Ошибка при загрузке плана питания:', error);
    }
  };

  // Функция загрузки недельной статистики
  const loadWeeklyStats = async () => {
    try {
      const today = new Date();
      const weekDates = [];
      
      // Получаем даты за последние 7 дней
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        weekDates.push(date);
      }
      
      // Загружаем данные за каждый день недели
      const weeklyData = await Promise.all(
        weekDates.map(async (date) => {
          const dateString = formatDateToString(date);
          try {
            const nutritionData = await getDailyNutrition(dateString);
            return {
              date,
              calories: nutritionData?.caloriesConsumed || 0,
              protein: nutritionData?.protein || 0,
              fat: nutritionData?.fat || 0,
              carbs: nutritionData?.carbs || 0,
              sugar: nutritionData?.sugar || 0,
            };
          } catch (error) {
            console.error(`Ошибка загрузки данных за ${dateString}:`, error);
            return {
              date,
              calories: 0,
              protein: 0,
              fat: 0,
              carbs: 0,
              sugar: 0,
            };
          }
        })
      );
      
      // Вычисляем статистику
      const daysWithData = weeklyData.filter(day => day.calories > 0);
      const totalDays = daysWithData.length;
      
      if (totalDays === 0) {
        setWeeklyStats(null);
        return;
      }
      
      // Считаем общее недельное количество (не среднее)
      const totalCalories = daysWithData.reduce((sum, day) => sum + day.calories, 0);
      const totalProtein = Math.round(daysWithData.reduce((sum, day) => sum + day.protein, 0));
      const totalFat = Math.round(daysWithData.reduce((sum, day) => sum + day.fat, 0));
      const totalCarbs = Math.round(daysWithData.reduce((sum, day) => sum + day.carbs, 0));
      const totalSugar = Math.round(daysWithData.reduce((sum, day) => sum + day.sugar, 0));
      
      // Средние значения для расчетов процентов
      const averageCalories = Math.round(totalCalories / totalDays);
      const averageProtein = Math.round(totalProtein / totalDays);
      const averageFat = Math.round(totalFat / totalDays);
      const averageCarbs = Math.round(totalCarbs / totalDays);
      const averageSugar = Math.round(totalSugar / totalDays);
      
      // Подсчитываем дни в цели (в пределах ±5% от целевых значений)
      const daysInGoal = daysWithData.filter(day => {
        const calorieGoalMet = day.calories >= dailyCalorieGoal * 0.95 && day.calories <= dailyCalorieGoal * 1.05;
        return calorieGoalMet;
      }).length;
      
      // Вычисляем проценты достижения целей
      const proteinPercentage = Math.round((averageProtein / proteinGoal) * 100);
      const fatPercentage = Math.round((averageFat / fatGoal) * 100);
      const carbsPercentage = Math.round((averageCarbs / carbGoal) * 100);
      const sugarPercentage = Math.round((averageSugar / maxSugar) * 100);
      
      // Простой расчет тренда (можно улучшить)
      const caloriesTrend = averageCalories > dailyCalorieGoal ? 
        Math.round(((averageCalories - dailyCalorieGoal) / dailyCalorieGoal) * 100) : 
        Math.round(((averageCalories - dailyCalorieGoal) / dailyCalorieGoal) * 100);
      
      // Подготавливаем данные для мини-графика
      const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const dailyData = weeklyData.map((dayData, index) => ({
        day: dayNames[index],
        calories: dayData.calories,
        hasData: dayData.calories > 0,
      }));

      const stats: WeeklyStats = {
        averageCalories,
        averageProtein,
        averageFat,
        averageCarbs,
        averageSugar,
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
        totalSugar,
        daysInGoal,
        totalDays,
        caloriesTrend,
        proteinPercentage,
        fatPercentage,
        carbsPercentage,
        sugarPercentage,
        dailyData,
      };
      
      setWeeklyStats(stats);
      console.log('Загружена недельная статистика:', stats);
      
    } catch (error) {
      console.error('Ошибка при загрузке недельной статистики:', error);
      setWeeklyStats(null);
    }
  };

  // Загрузка данных витаминов и минералов
  const loadWeeklyVitaminMinerals = async (aiData?: any) => {
    try {
      console.log('📊 Загрузка данных витаминов и минералов...');
      
      // Проверяем, есть ли данные от AI (переданные напрямую или из состояния)
      const vitaminData = aiData?.vitaminMineralDashboard || aiRecommendations?.vitaminMineralDashboard;
      
      console.log('🔍 Проверка данных витаминов:', {
        hasAiData: !!aiData,
        hasVitaminData: !!vitaminData,
        hasAiRecommendations: !!aiRecommendations,
        vitaminDataKeys: vitaminData ? Object.keys(vitaminData) : 'нет данных'
      });
      
      if (vitaminData) {
        console.log('🤖 Используем реальные данные от AI для витаминного дашборда');
        console.log('📊 Данные витаминов от AI:', {
          vitaminsCount: vitaminData.vitamins?.length || 0,
          mineralsCount: vitaminData.minerals?.length || 0,
          overallVitaminScore: vitaminData.overallVitaminScore,
          overallMineralScore: vitaminData.overallMineralScore
        });
        
        // Преобразуем данные от AI в нужный формат
        const vitamins: VitaminMineralData[] = vitaminData.vitamins.map((vitamin: any) => ({
          name: vitamin.name,
          shortName: vitamin.shortName,
          current: vitamin.percentage,
          goal: 100, // Цель всегда 100%
          color: '#4CAF50', // Единый зеленый цвет для всех витаминов
          currentWeeklyIntake: vitamin.currentWeeklyIntake,
          weeklyGoal: vitamin.weeklyGoal,
          percentage: vitamin.percentage,
          status: vitamin.status
        }));

        const minerals: VitaminMineralData[] = vitaminData.minerals.map((mineral: any) => ({
          name: mineral.name,
          shortName: mineral.shortName,
          current: mineral.percentage,
          goal: 100, // Цель всегда 100%
          color: '#607D8B', // Единый стальной цвет для всех минералов
          currentWeeklyIntake: mineral.currentWeeklyIntake,
          weeklyGoal: mineral.weeklyGoal,
          percentage: mineral.percentage,
          status: mineral.status
        }));

        const vitaminMineralData: WeeklyVitaminMinerals = {
          vitamins,
          minerals,
          vitaminScore: vitaminData.overallVitaminScore,
          mineralScore: vitaminData.overallMineralScore,
          deficiencies: vitaminData.deficiencyList || [],
          recommendations: vitaminData.recommendations || [],
          overallVitaminScore: vitaminData.overallVitaminScore,
          overallMineralScore: vitaminData.overallMineralScore,
          deficiencyList: vitaminData.deficiencyList
        };

        setWeeklyVitaminMinerals(vitaminMineralData);
        console.log('✅ Реальные данные витаминов и минералов от AI загружены:', vitaminMineralData);
        return;
      }

      // Если нет данных от AI - устанавливаем null (состояние "нет данных")
      console.log('📊 Нет данных от AI - показываем состояние "нет данных"');
      setWeeklyVitaminMinerals(null);
      
    } catch (error) {
      console.error('❌ Ошибка при загрузке данных витаминов и минералов:', error);
      setWeeklyVitaminMinerals(null);
    }
  };

  // Функции для редактирования целей питания
  const handleStartEditingGoals = () => {
    setEditedGoals({
      calories: String(dailyCalorieGoal),
      protein: String(proteinGoal),
      fat: String(fatGoal),
      carbs: String(carbGoal),
      sugar: String(maxSugar)
    });
    setIsEditingGoals(true);
  };

  const handleSaveEditingGoals = async () => {
    try {
      // Валидация введенных данных
      const calories = parseFloat(editedGoals.calories) || defaultCalorieGoal;
      const protein = parseFloat(editedGoals.protein) || defaultProteinGoal;
      const fat = parseFloat(editedGoals.fat) || defaultFatGoal;
      const carbs = parseFloat(editedGoals.carbs) || defaultCarbGoal;
      const sugar = parseFloat(editedGoals.sugar) || defaultMaxSugar;

      // Проверка на разумные пределы
      if (calories < 800 || calories > 4000) {
        Alert.alert('Ошибка', 'Калории должны быть от 800 до 4000');
        return;
      }

      // Создаем обновленный план питания
      const updatedPlan: NutritionCalculationResult = {
        ...nutritionPlan,
        targetCalories: calories,
        maxHiddenSugar: sugar,
        dailyMacros: {
          ...nutritionPlan?.dailyMacros,
          protein,
          fat,
          carbs,
          percentages: nutritionPlan?.dailyMacros?.percentages || { protein: 25, fat: 30, carbs: 45 }
        }
      } as NutritionCalculationResult;
      
      setNutritionPlan(updatedPlan);
      
      // Сохраняем обновленные цели в AsyncStorage
      await AsyncStorage.setItem('customNutritionGoals', JSON.stringify({
        calories,
        protein,
        fat,
        carbs,
        sugar,
        isCustom: true,
        updatedAt: new Date().toISOString()
      }));
      
      // Обновляем макронутриенты
      setMacronutrients([
        { name: t('dashboard.protein'), current: macronutrients[0].current, goal: protein, color: '#FF8A80', colorDark: '#FF6B6B' },
        { name: t('dashboard.fat'), current: macronutrients[1].current, goal: fat, color: '#FFCF50', colorDark: '#FFD166' },
        { name: t('dashboard.carbs'), current: macronutrients[2].current, goal: carbs, color: '#80D8FF', colorDark: '#06D6A0' },
        { name: t('nutrition.hiddenSugar'), current: macronutrients[3]?.current || 0, goal: sugar, color: '#FF3B30', colorDark: '#FF3B30' },
      ]);
      
      console.log('Цели питания обновлены:', { calories, protein, fat, carbs, sugar });
      setIsEditingGoals(false);
    } catch (error) {
      console.error('Ошибка при сохранении целей:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    }
  };

  const handleCancelEditingGoals = () => {
    setIsEditingGoals(false);
    setEditedGoals({
      calories: dailyCalorieGoal.toString(),
      protein: proteinGoal.toString(),
      fat: fatGoal.toString(),
      carbs: carbGoal.toString(),
      sugar: maxSugar.toString()
    });
  };

  // Навигация к экрану ручного добавления продукта
  const handleAddManualProduct = () => {
    router.push('/add-manual-product' as any);
  };

  // Обработчик скролла для переключения между слайдами
  const handleScroll = (event: any) => {
    const slideSize = screenWidth - 32; // учитываем padding
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentSlide(currentIndex);
  };

  // Функция для программного переключения слайдов
  const scrollToSlide = (index: number) => {
    const slideSize = screenWidth - 32;
    scrollViewRef.current?.scrollTo({
      x: index * slideSize,
      animated: true,
    });
    setCurrentSlide(index);
  };

  // Обработчик скролла для Recent блока
  const handleRecentScroll = (event: any) => {
    const slideSize = screenWidth - 32; // учитываем padding
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentRecentSlide(currentIndex);
  };

  // Функция для программного переключения Recent слайдов
  const scrollToRecentSlide = (index: number) => {
    const slideSize = screenWidth - 32;
    recentScrollViewRef.current?.scrollTo({
      x: index * slideSize,
      animated: true,
    });
    setCurrentRecentSlide(index);
  };

  // Функция для получения заголовка Recent блока
  const getRecentSectionTitle = () => {
    return currentRecentSlide === 0 ? t('dashboard.recentAdded') : t('dashboard.recentScans');
  };

  // Функция для обработки нажатия на View All в Recent блоке
  const handleRecentViewAll = () => {
    if (currentRecentSlide === 0) {
      // Переход к истории добавленных (с параметром tab=dashboard)
      router.push('/history?tab=dashboard');
    } else {
      // Переход к истории сканирований
      router.push('/history');
    }
  };

  // Функция для генерации рекомендаций на основе текущих данных
  const getRecommendationText = () => {
    if (!dailyNutritionData) {
      return "Добавьте продукты, чтобы получить персональные рекомендации";
    }

    const recommendations = [];
    
    // Анализ белков
    const proteinProgress = (dailyNutritionData.protein / proteinGoal) * 100;
    if (proteinProgress < 50) {
      recommendations.push("Добавьте больше белка: яйца, рыбу или курицу");
    }
    
    // Анализ жиров
    const fatProgress = (dailyNutritionData.fat / fatGoal) * 100;
    if (fatProgress < 50) {
      recommendations.push("Включите полезные жиры: орехи, авокадо, оливковое масло");
    }
    
    // Анализ углеводов
    const carbProgress = (dailyNutritionData.carbs / carbGoal) * 100;
    if (carbProgress < 50) {
      recommendations.push("Добавьте сложные углеводы: овсянку, гречку, овощи");
    }
    
    // Анализ сахара
    const sugarProgress = (dailyNutritionData.sugar / maxSugar) * 100;
    if (sugarProgress > 80) {
      recommendations.push("Ограничьте сладкое и обработанные продукты");
    }
    
    // Общие рекомендации
    if (recommendations.length === 0) {
      const generalTips = [
        "Пейте больше воды в течение дня",
        "Добавьте больше овощей и фруктов",
        "Не забывайте про витамин D и омега-3",
        "Включите в рацион зелень и ягоды",
        "Попробуйте новые полезные рецепты"
      ];
      return generalTips[Math.floor(Math.random() * generalTips.length)];
    }
    
    return recommendations[0];
  };

  // Функции для работы с разворачиванием рекомендаций
  const truncateText = (text: string, maxLines: number = 5): string => {
    const words = text.split(' ');
    // Для мобильного экрана: примерно 4-5 слов на строку
    const wordsPerLine = 4;
    const maxWords = maxLines * wordsPerLine;
    
    if (words.length <= maxWords) {
      return text;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const truncateBulletPoints = (bulletPoints: string[], maxPoints: number = 2): string[] => {
    if (bulletPoints.length <= maxPoints) {
      return bulletPoints;
    }
    return bulletPoints.slice(0, maxPoints);
  };

  const toggleRecommendationsExpansion = () => {
    setIsRecommendationsExpanded(!isRecommendationsExpanded);
  };

  const truncateVitaminText = (text: string, maxLines: number = 2): string => {
    const words = text.split(' ');
    // Для витаминного блока: 2 строки, примерно 4 слова на строку
    const wordsPerLine = 4;
    const maxWords = maxLines * wordsPerLine;
    
    if (words.length <= maxWords) {
      return text;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const toggleVitaminRecommendationsExpansion = () => {
    setIsVitaminRecommendationsExpanded(!isVitaminRecommendationsExpanded);
  };

  // Функция для загрузки мотивирующего сообщения
  const loadDailyMotivationMessage = async () => {
    try {
      console.log('📝 Загрузка мотивирующего сообщения...');
      
      // Используем import'ированные функции
      const yesterdayCalories = await getYesterdayCalories();
      const isFirstTime = await isFirstTimeUser();
      
      console.log('📊 Данные для мотивирующего сообщения:', {
        isFirstTime,
        yesterdayCalories,
        calorieGoal: dailyCalorieGoal
      });
      
      const message = await getDailyMotivationMessage(isFirstTime, yesterdayCalories, dailyCalorieGoal, t);
      console.log('✅ Сгенерировано мотивирующее сообщение:', message);
      
      setDailyMotivationMessage(message);
    } catch (error) {
      console.error('❌ Ошибка при загрузке мотивирующего сообщения:', error);
      // Устанавливаем сообщение по умолчанию в случае ошибки
      setDailyMotivationMessage(t('dashboard.motivationMessages.firstTime') || 'Отличный день для здорового питания! Давайте отслеживать прогресс и достигать целей! 🎯');
    }
  };

  // Загрузка мотивирующего сообщения при изменении цели калорий или при обновлении
  useEffect(() => {
    loadDailyMotivationMessage();
  }, [dailyCalorieGoal]); // Пересчитываем при изменении цели калорий

  // Функция для запроса персональных рекомендаций
  const handleRequestRecommendations = async () => {
    if (isLoadingRecommendations) return;
    
    setIsLoadingRecommendations(true);
    setRecommendationsProgress(0);
    setAiRecommendations(null);
    setRecommendationError(false); // Сбрасываем ошибку при новом запросе
    
    try {
      // Получаем email пользователя из профиля или генерируем уникальный
      const userProfile = await AsyncStorage.getItem('userProfile');
      const parsedProfile = userProfile ? JSON.parse(userProfile) : {};
      
      // Используем email из профиля или получаем уникальный ID пользователя
      let userEmail = parsedProfile.email;
      if (!userEmail) {
        // Импортируем getUserId и используем его для получения уникального email
        const { getUserId } = await import('../../services/userService');
        userEmail = await getUserId();
        
        // Сохраняем email в профиле для будущих использований
        const updatedProfile = { ...parsedProfile, email: userEmail };
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        console.log('💾 Email сохранен в профиле пользователя:', userEmail);
      }
      
      console.log('👤 Запрашиваем рекомендации для пользователя:', userEmail);
      
      // Сразу отправляем запрос к N8N параллельно с прогресс-баром
      const aiRecommendationsPromise = requestAIRecommendations(userEmail, locale);
      
      // Минимальное время показа прогресса - 10 секунд
      const minProgressTime = 10000;
      const stepDuration = 500; // 0.5 секунды на шаг
      let aiRecommendationsResult = null;
      let requestCompleted = false;
      
      // Отслеживаем завершение запроса
      aiRecommendationsPromise.then(result => {
        aiRecommendationsResult = result;
        requestCompleted = true;
      }).catch(() => {
        requestCompleted = true; // Даже при ошибке считаем запрос завершенным
      });
      
      // Этап 1: Анализ данных (0-30%)
      setRecommendationsProgressText(t('dashboard.analyzingData'));
      for (let i = 0; i <= 30; i += 6) {
        setRecommendationsProgress(i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
      
      // Этап 2: Обработка нутриентов (30-60%)
      setRecommendationsProgressText(t('dashboard.processingNutrition'));
      for (let i = 30; i <= 60; i += 6) {
        setRecommendationsProgress(i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
      
      // Этап 3: Генерация рекомендаций (60-90%)
      setRecommendationsProgressText(t('dashboard.generatingRecommendations'));
      for (let i = 60; i <= 90; i += 6) {
        setRecommendationsProgress(i);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        // Если запрос завершился и прошло минимальное время, ускоряем
        if (requestCompleted && i >= 80) {
          break;
        }
      }
      
      // Ждем завершения запроса к N8N (если еще не завершился)
      if (!requestCompleted) {
        aiRecommendationsResult = await aiRecommendationsPromise;
      }
      
      // Проверяем, что результат получен
      if (!aiRecommendationsResult) {
        throw new Error('Не удалось получить результат от сервера');
      }
      
      // Этап 4: Финализация (90-100%)
      setRecommendationsProgressText(t('dashboard.almostReady'));
      for (let i = 90; i <= 100; i += 5) {
        setRecommendationsProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200)); // Быстро в конце
      }
      
      // Сохраняем результат и кэшируем только при успешном получении
      const today = new Date().toDateString();
      setAiRecommendations(aiRecommendationsResult);
      
      // Сохраняем дату и кэшируем только успешные результаты
      if (aiRecommendationsResult.success) {
        setLastRecommendationDate(today);
        await saveAIRecommendationsToCache(aiRecommendationsResult, today);
        
        // Обновляем витаминный дашборд с новыми данными от AI
        console.log('🔄 Обновляем витаминный дашборд с данными от AI...');
        await loadWeeklyVitaminMinerals(aiRecommendationsResult);
      }
      
      setRecommendationError(false); // Сбрасываем флаг ошибки при успешном получении
      console.log('✅ AI рекомендации успешно получены и сохранены');
      
    } catch (error) {
      console.error('❌ Ошибка при получении AI рекомендаций:', error);
      
      // Устанавливаем флаг ошибки, чтобы кнопка стала доступна для повторного запроса
      setRecommendationError(true);
      
      // В случае ошибки показываем fallback
      const fallbackRecommendations: AIRecommendationsResponse = {
        success: false,
        shortSummary: 'Не удалось получить персональные рекомендации. Проверьте подключение к интернету и попробуйте позже.',
        bulletPoints: [
          'Проверьте интернет-соединение',
          'Попробуйте перезапустить приложение',
          'Повторите попытку через несколько минут'
        ],
        timestamp: new Date().toISOString(),
      };
      
      setAiRecommendations(fallbackRecommendations);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };





  // Загрузка последних добавленных продуктов
  const loadRecentAdded = async (date?: Date) => {
    try {
      const targetDate = date || currentDate;
      console.log('Загрузка последних добавленных продуктов...');
      
      // Получаем данные питания за выбранную дату
      const { formatDateToString } = await import('../../services/dailyNutrition');
      const selectedDateStr = formatDateToString(targetDate);
      const { getDailyNutrition } = await import('../../services/dailyNutrition');
      const dayData = await getDailyNutrition(selectedDateStr);
      
      if (!dayData || dayData.addedProducts.length === 0) {
        console.log('Нет продуктов за выбранную дату:', selectedDateStr);
        setRecentAdded([]);
        return;
      }
      
      // Сортируем продукты по времени добавления (от новых к старым)
      const sortedProducts = [...dayData.addedProducts].sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp - a.timestamp;
        }
        // Если нет timestamp, ставим в конец
        if (a.timestamp && !b.timestamp) return -1;
        if (!a.timestamp && b.timestamp) return 1;
        return 0;
      });
      
      // Берем последние 3 добавленных продукта за выбранную дату
      const recentAddedHistory = sortedProducts.slice(0, 3);
      console.log('Получено добавленных продуктов за', selectedDateStr, ':', recentAddedHistory.length);
      
      if (recentAddedHistory.length > 0) {
        console.log('Последний добавленный продукт:', recentAddedHistory[0].name, 'Timestamp:', recentAddedHistory[0].timestamp);
      }
      
      // Преобразуем в формат ProductData для компонента ProductCard
      const formattedAdded: ProductData[] = recentAddedHistory.map((item: any, index: number) => ({
        id: `${item.productId}-${item.timestamp || Date.now()}-${index}`, // Уникальный ключ с timestamp и индексом
        name: item.name,
        calories: item.calories,
        macros: { 
          protein: item.protein, 
          fat: item.fat, 
          carbs: item.carbs 
        },
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        imageUrl: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
        fullData: item.fullData // Добавляем полные данные, если они есть
      }));
      
      setRecentAdded(formattedAdded);
      console.log('Обновлены последние добавленные продукты на главном экране для даты:', selectedDateStr);
      
    } catch (error) {
      console.error('Ошибка при загрузке последних добавленных продуктов:', error);
      setRecentAdded([]);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <ScrollView 
        style={[styles.scrollViewContainer, isDark && styles.darkContainer]}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D6EFD']}
            tintColor={isDark ? '#FFFFFF' : '#0D6EFD'}
          />
        }
      >
        {/* Заголовок и иконки диеты и настроек теперь в самом верху */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>{t('dashboard.title')}</Text>
          <View style={styles.headerButtons}>

            
            <TouchableOpacity 
              style={[styles.headerIconButton, { marginRight: 12 }]}
              onPress={() => router.push('/(tabs)/diets')}
            >
              <Ionicons name="nutrition-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            <Link href="/settings" asChild> 
              <TouchableOpacity style={styles.headerIconButton}>
                <Ionicons name="settings-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        
        {/* Календарь с выбором дат - теперь ниже заголовка */}
        <CalorieAwareDatePicker
          calorieData={calorieData}
          onDateSelected={handleDateChange}
          dailyCalorieGoal={dailyCalorieGoal}
        />

        {/* Приветственная карточка для новых пользователей */}
        <WelcomeCard
          userCalories={dailyCalorieGoal}
          userProtein={proteinGoal}
          userFat={fatGoal}
          userCarbs={carbGoal}
        />

        {/* Горизонтальный скролл Dashboard */}
        <View style={styles.dashboardContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.dashboardScrollView}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {/* Первый слайд - обычный Dashboard */}
            <View style={[styles.dashboardSlide, { width: screenWidth - 32 }]}>
              <View style={[
                styles.calorieCard, 
                isDark && styles.darkCard, 
                isDark && styles.darkCardShadow,
                isEditingGoals && styles.editingContainer,
                isEditingGoals && isDark && styles.darkEditingContainer
              ]}>
          <View style={styles.calorieCardHeader}>
            <TouchableOpacity 
              onPress={navigateToHistoryDashboard}
              activeOpacity={0.7}
              style={styles.calorieStatusHeader}
              disabled={isEditingGoals}
            >
              <Text style={[styles.calorieSummaryText, isDark && styles.darkText]}>
                {isEditingGoals ? t('dashboard.editingGoals') : 
                  `${t('nutrition.goal')}: ${consumedCalories}/${dailyCalorieGoal} ${t('nutrition.kcal')} (${Math.round(circularProgressPercentage) || 0}%)`
                }
              </Text>
            </TouchableOpacity>
            
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity
                style={[styles.editButton, isDark && styles.darkEditButton]}
                onPress={isEditingGoals ? handleSaveEditingGoals : handleStartEditingGoals}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isEditingGoals ? "checkmark" : "pencil"} 
                  size={16} 
                  color={isDark ? "#888888" : "#666666"} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {isEditingGoals ? (
            // Режим редактирования целей
            <View style={styles.editingGoalsContainer}>
              <View style={[styles.goalEditRow, isDark && styles.darkGoalEditRow]}>
                <Text style={[styles.goalEditLabel, isDark && styles.darkText]}>
                  {t('nutrition.calories')}:
                </Text>
                <TextInput
                  style={[styles.goalEditInput, isDark && styles.darkInput]}
                  value={editedGoals.calories}
                  onChangeText={(text) => setEditedGoals(prev => ({ ...prev, calories: text }))}
                  keyboardType="numeric"
                  placeholder="2000"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <Text style={[styles.goalEditUnit, isDark && styles.darkText]}>
                  {t('nutrition.kcal')}
                </Text>
              </View>
              
              <View style={[styles.goalEditRow, isDark && styles.darkGoalEditRow]}>
                <Text style={[styles.goalEditLabel, isDark && styles.darkText]}>
                  {t('dashboard.protein')}:
                </Text>
                <TextInput
                  style={[styles.goalEditInput, isDark && styles.darkInput]}
                  value={editedGoals.protein}
                  onChangeText={(text) => setEditedGoals(prev => ({ ...prev, protein: text }))}
                  keyboardType="numeric"
                  placeholder="120"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <Text style={[styles.goalEditUnit, isDark && styles.darkText]}>{t('common.gram')}</Text>
              </View>
              
              <View style={[styles.goalEditRow, isDark && styles.darkGoalEditRow]}>
                <Text style={[styles.goalEditLabel, isDark && styles.darkText]}>
                  {t('dashboard.fat')}:
                </Text>
                <TextInput
                  style={[styles.goalEditInput, isDark && styles.darkInput]}
                  value={editedGoals.fat}
                  onChangeText={(text) => setEditedGoals(prev => ({ ...prev, fat: text }))}
                  keyboardType="numeric"
                  placeholder="110"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <Text style={[styles.goalEditUnit, isDark && styles.darkText]}>{t('common.gram')}</Text>
              </View>
              
              <View style={[styles.goalEditRow, isDark && styles.darkGoalEditRow]}>
                <Text style={[styles.goalEditLabel, isDark && styles.darkText]}>
                  {t('dashboard.carbs')}:
                </Text>
                <TextInput
                  style={[styles.goalEditInput, isDark && styles.darkInput]}
                  value={editedGoals.carbs}
                  onChangeText={(text) => setEditedGoals(prev => ({ ...prev, carbs: text }))}
                  keyboardType="numeric"
                  placeholder="190"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <Text style={[styles.goalEditUnit, isDark && styles.darkText]}>{t('common.gram')}</Text>
              </View>
              
              <View style={[styles.goalEditRow, isDark && styles.darkGoalEditRow]}>
                <Text style={[styles.goalEditLabel, isDark && styles.darkText]}>
                  {t('nutrition.hiddenSugar')}:
                </Text>
                <TextInput
                  style={[styles.goalEditInput, isDark && styles.darkInput]}
                  value={editedGoals.sugar}
                  onChangeText={(text) => setEditedGoals(prev => ({ ...prev, sugar: text }))}
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
                <Text style={[styles.goalEditUnit, isDark && styles.darkText]}>{t('common.gram')}</Text>
              </View>
            </View>
          ) : (
            // Обычный режим отображения
            <>
              <TouchableOpacity 
                onPress={navigateToHistoryDashboard}
                activeOpacity={0.7}
                style={styles.summaryContainer}
              >
                <View style={styles.circularProgressContainer}>
                  <CircularProgress
                    size={135} /* Увеличили размер с 110 до 135 */
                    strokeWidth={12} /* Увеличили толщину круга */
                    progressPercentage={circularProgressPercentage}
                    caloriesLeft={caloriesLeft}
                    burnedCalories={burnedCalories}
                    progressColorLight={isDark? '#06D6A0' : '#4CAF50'}
                    progressColorDark={isDark? '#06D6A0' : '#4CAF50'}
                  />
                </View>

                <View style={styles.macronutrientsContainer}>
                  {[
                    { 
                      name: t('dashboard.protein'), 
                      current: dailyNutritionData?.protein || 0, 
                      goal: proteinGoal, 
                      color: '#FF8A80', 
                      colorDark: '#FF6B6B' 
                    },
                    { 
                      name: t('dashboard.fat'), 
                      current: dailyNutritionData?.fat || 0, 
                      goal: fatGoal, 
                      color: '#FFCF50', 
                      colorDark: '#FFD166' 
                    },
                    { 
                      name: t('dashboard.carbs'), 
                      current: dailyNutritionData?.carbs || 0, 
                      goal: carbGoal, 
                      color: '#80D8FF', 
                      colorDark: '#06D6A0' 
                    },
                    { 
                      name: t('nutrition.hiddenSugar'), 
                      current: dailyNutritionData?.sugar || 0, 
                      goal: maxSugar, 
                      color: '#FF3B30', 
                      colorDark: '#FF3B30' 
                    },
                  ].map((macro) => {
                    const progress = (macro.current / macro.goal) * 100;
                    const macroBarColor = isDark ? macro.colorDark : macro.color;
                    return (
                      <View key={macro.name} style={styles.macroItem}>
                        <View style={styles.macroHeader}>
                          <Text style={[styles.macroName, isDark && styles.darkText]}>{macro.name}</Text>
                          <Text style={[styles.macroValues, isDark && styles.darkTextSecondary]}>
                            {macro.current}/{macro.goal}г
                          </Text>
                        </View>
                        <View style={[styles.linearProgressBar, isDark && styles.darkLinearProgressBar]}>
                          <View 
                            style={[
                              styles.linearProgressFill, 
                              { 
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: macroBarColor 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>
              
              {/* Блок с мотивирующими сообщениями на сегодня */}
              <TouchableOpacity 
                onPress={navigateToHistoryDashboard}
                activeOpacity={0.7}
                style={styles.activityContainer}
              >
                <View style={[
                  styles.recommendationContainer,
                  isDark && { 
                    backgroundColor: 'rgba(0, 122, 255, 0.15)',
                    borderLeftColor: '#0A84FF'
                  },
                  { marginTop: 0 }
                ]}>
                  {/* Заголовок внутри блока */}
                  <View style={[styles.sugarBarContainer, { marginBottom: 12 }]}>
                    <Text style={[styles.sugarTitle, isDark && styles.darkText]}>
                      💡 {t('dashboard.dailyRecommendations')}
                    </Text>
                  </View>
                  <Text style={[
                    styles.recommendationText, 
                    isDark && { color: '#E5E5E7' }
                  ]}>
                    {dailyMotivationMessage || t('dashboard.loadingMotivationMessage')}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
              </View>
            </View>

            {/* Второй слайд - недельная статистика */}
            <View style={[styles.dashboardSlide, { width: screenWidth - 32 }]}>
              <View style={[
                styles.calorieCard,
                isDark && styles.darkCard,
                isDark && styles.darkCardShadow
              ]}>
                <View style={styles.calorieCardHeader}>
                  <TouchableOpacity 
                    onPress={navigateToHistoryDashboard}
                    activeOpacity={0.7}
                    style={styles.calorieStatusHeader}
                    disabled={false}
                  >
                    <Text style={[styles.calorieSummaryText, isDark && styles.darkText]}>
                      {weeklyStats ? 
                        t('dashboard.weeklyStatsDetailed', {
                          consumed: weeklyStats.totalCalories,
                          goal: dailyCalorieGoal * 7,
                          percentage: Math.round((weeklyStats.totalCalories / (dailyCalorieGoal * 7)) * 100)
                        }) :
                        t('dashboard.weeklyStats')
                      }
                    </Text>
                  </TouchableOpacity>
                </View>

                {weeklyStats ? (
                  <>
                    {/* Верхняя часть: точно как в оригинальном Dashboard */}
                    <TouchableOpacity 
                      onPress={navigateToHistoryDashboard}
                      activeOpacity={0.7}
                      style={styles.summaryContainer}
                    >
                      <View style={styles.circularProgressContainer}>
                        <CircularProgress
                          size={135}
                          strokeWidth={12}
                          progressPercentage={(weeklyStats.totalCalories / (dailyCalorieGoal * 7)) * 100}
                          caloriesLeft={weeklyStats.totalCalories}
                          burnedCalories={0}
                          isWeeklyView={true}
                          progressColorLight={isDark? '#06D6A0' : '#4CAF50'}
                          progressColorDark={isDark? '#06D6A0' : '#4CAF50'}
                        />
                      </View>

                      <View style={styles.macronutrientsContainer}>
                        {[
                          { 
                            name: t('dashboard.protein'), 
                            current: weeklyStats.totalProtein, 
                            goal: proteinGoal * 7, 
                            color: '#FF8A80', 
                            colorDark: '#FF6B6B' 
                          },
                          { 
                            name: t('dashboard.fat'), 
                            current: weeklyStats.totalFat, 
                            goal: fatGoal * 7, 
                            color: '#FFCF50', 
                            colorDark: '#FFD166' 
                          },
                          { 
                            name: t('dashboard.carbs'), 
                            current: weeklyStats.totalCarbs, 
                            goal: carbGoal * 7, 
                            color: '#80D8FF', 
                            colorDark: '#06D6A0' 
                          },
                          { 
                            name: t('nutrition.hiddenSugar'), 
                            current: weeklyStats.totalSugar, 
                            goal: maxSugar * 7, 
                            color: '#FF3B30', 
                            colorDark: '#FF3B30' 
                          },
                        ].map((macro) => {
                          const progress = (macro.current / macro.goal) * 100;
                          const macroBarColor = isDark ? macro.colorDark : macro.color;
                          return (
                            <View key={macro.name} style={styles.macroItem}>
                              <View style={styles.macroHeader}>
                                <Text style={[styles.macroName, isDark && styles.darkText]}>{macro.name}</Text>
                                <Text style={[styles.macroValues, isDark && styles.darkTextSecondary]}>
                                  {macro.current}/{macro.goal}г
                                </Text>
                              </View>
                              <View style={[styles.linearProgressBar, isDark && styles.darkLinearProgressBar]}>
                                <View 
                                  style={[
                                    styles.linearProgressFill, 
                                    { 
                                      width: `${Math.min(progress, 100)}%`,
                                      backgroundColor: macroBarColor 
                                    }
                                  ]} 
                                />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </TouchableOpacity>
                    
                    {/* Блок с персональными рекомендациями */}
                    <View style={styles.activityContainer}>
                      
                      {!isLoadingRecommendations && !aiRecommendations && canRequestRecommendations() && (
                        <TouchableOpacity 
                          style={[
                            styles.recommendationsButton,
                            recommendationError && styles.recommendationsRetryButton
                          ]}
                          onPress={handleRequestRecommendations}
                          activeOpacity={0.8}
                        >
                          <Ionicons 
                            name={recommendationError ? "refresh-outline" : "analytics-outline"} 
                            size={18} 
                            color="#FFFFFF" 
                          />
                          <Text style={styles.recommendationsButtonText}>
                            {recommendationError ? t('dashboard.retryRequest') : t('dashboard.getPersonalizedRecommendations')}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {isLoadingRecommendations && (
                        <View style={{ width: '100%', marginTop: 16 }}>
                          <View style={[
                            styles.recommendationsProgressBar,
                            isDark && styles.darkRecommendationsProgressBar
                          ]}>
                            <View 
                              style={[
                                styles.recommendationsProgressFill,
                                { width: `${recommendationsProgress}%` }
                              ]} 
                            />
                          </View>
                          <Text style={[
                            styles.recommendationsProgressText,
                            isDark && styles.darkRecommendationsProgressText
                          ]}>
                            {recommendationsProgressText}
                          </Text>
                        </View>
                      )}
                      
                                            {aiRecommendations && aiRecommendations.success && (
                        <View style={[
                          styles.recommendationContainer,
                          isDark && { 
                            backgroundColor: 'rgba(0, 122, 255, 0.15)',
                            borderLeftColor: '#0A84FF'
                          },
                          { marginTop: 0 }
                        ]}>
                          {/* Заголовок с иконкой внутри блока */}
                          <View style={[styles.sugarBarContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
                            <Text style={[styles.sugarTitle, isDark && styles.darkText]}>
                              💡 {t('dashboard.personalizedRecommendations')}
                            </Text>
                            <TouchableOpacity
                              style={[styles.helpButton, isDark && styles.darkHelpButton]}
                              onPress={() => {
                                Alert.alert(
                                  t('dashboard.personalizedRecommendationsInfo'),
                                  t('dashboard.personalizedRecommendationsDescription'),
                                  [{ text: t('common.done'), style: 'default' }]
                                );
                              }}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Ionicons 
                                name="help-circle-outline" 
                                size={20} 
                                color={isDark ? "#888888" : "#666666"} 
                              />
                            </TouchableOpacity>
                          </View>
                          <Text style={[
                            styles.recommendationText, 
                            isDark && { color: '#E5E5E7' }
                          ]}>
                            {isRecommendationsExpanded ? aiRecommendations.shortSummary : truncateText(aiRecommendations.shortSummary)}
                          </Text>
                          {isRecommendationsExpanded && (
                            <View style={{ marginTop: 12 }}>
                              {aiRecommendations.bulletPoints.length > 0 ? (
                                aiRecommendations.bulletPoints.map((point, index) => (
                                  <Text key={index} style={[
                                    styles.recommendationText,
                                    isDark && { color: '#E5E5E7' },
                                    { marginTop: 6, fontSize: 14 }
                                  ]}>
                                    • {point}
                                  </Text>
                                ))
                              ) : (
                                <Text style={[
                                  styles.recommendationText,
                                  isDark && { color: '#E5E5E7' },
                                  { marginTop: 6, fontSize: 14 }
                                ]}>
                                  • {t('goalTracking.dataProcessing')}
                                </Text>
                              )}
                            </View>
                          )}
                          {(aiRecommendations.shortSummary.split(' ').length > 20 || aiRecommendations.bulletPoints.length > 0) && (
                            <TouchableOpacity
                              onPress={toggleRecommendationsExpansion}
                              style={{ marginTop: 12, alignSelf: 'flex-start' }}
                            >
                              <Text style={[
                                styles.recommendationText,
                                { color: '#0D6EFD', fontWeight: '600', fontSize: 14 }
                              ]}>
                                {isRecommendationsExpanded ? t('dashboard.showLess') : t('dashboard.readMore')}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      {aiRecommendations && !aiRecommendations.success && (
                        <View style={[
                          styles.recommendationContainer,
                          isDark && { 
                            backgroundColor: 'rgba(255, 152, 0, 0.15)',
                            borderLeftColor: '#FF9500'
                          },
                          !isDark && { 
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                            borderLeftColor: '#FF9500'
                          },
                          { marginTop: 0 }
                        ]}>
                          {/* Заголовок с иконкой внутри блока */}
                          <View style={[styles.sugarBarContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
                            <Text style={[styles.sugarTitle, isDark && styles.darkText]}>
                              💡 {t('dashboard.personalizedRecommendations')}
                            </Text>
                            <TouchableOpacity
                              style={[styles.helpButton, isDark && styles.darkHelpButton]}
                              onPress={() => {
                                Alert.alert(
                                  t('dashboard.personalizedRecommendationsInfo'),
                                  t('dashboard.personalizedRecommendationsDescription'),
                                  [{ text: t('common.done'), style: 'default' }]
                                );
                              }}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Ionicons 
                                name="help-circle-outline" 
                                size={20} 
                                color={isDark ? "#888888" : "#666666"} 
                              />
                            </TouchableOpacity>
                          </View>
                          <Text style={[
                            styles.recommendationText,
                            isDark && { color: '#E5E5E7' },
                            { fontWeight: '600', marginBottom: 8 }
                          ]}>
                            ⚠️ {t('dashboard.recommendationsError')}
                          </Text>
                          <Text style={[
                            styles.recommendationText,
                            isDark && { color: '#E5E5E7' }
                          ]}>
                            {isRecommendationsExpanded ? aiRecommendations.shortSummary : truncateText(aiRecommendations.shortSummary)}
                          </Text>
                          {isRecommendationsExpanded && (
                            <View style={{ marginTop: 12 }}>
                              {aiRecommendations.bulletPoints.length > 0 ? (
                                aiRecommendations.bulletPoints.map((point, index) => (
                                  <Text key={index} style={[
                                    styles.recommendationText,
                                    isDark && { color: '#E5E5E7' },
                                    { marginTop: 6, fontSize: 14 }
                                  ]}>
                                    • {point}
                                  </Text>
                                ))
                              ) : (
                                <Text style={[
                                  styles.recommendationText,
                                  isDark && { color: '#E5E5E7' },
                                  { marginTop: 6, fontSize: 14 }
                                ]}>
                                  • {t('goalTracking.dataProcessing')}
                                </Text>
                              )}
                            </View>
                          )}
                          {(aiRecommendations.shortSummary.split(' ').length > 20 || aiRecommendations.bulletPoints.length > 0) && (
                            <TouchableOpacity
                              onPress={toggleRecommendationsExpansion}
                              style={{ marginTop: 12, alignSelf: 'flex-start' }}
                            >
                              <Text style={[
                                styles.recommendationText,
                                { color: '#FF9500', fontWeight: '600', fontSize: 14 }
                              ]}>
                                {isRecommendationsExpanded ? t('dashboard.showLess') : t('dashboard.readMore')}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}


                    </View>
                  </>
                ) : (
                  <>
                    {/* Показываем цели на неделю при отсутствии данных */}
                    <TouchableOpacity 
                      onPress={navigateToHistoryDashboard}
                      activeOpacity={0.7}
                      style={styles.summaryContainer}
                    >
                      <View style={styles.circularProgressContainer}>
                        <CircularProgress
                          size={135}
                          strokeWidth={12}
                          progressPercentage={0}
                          caloriesLeft={dailyCalorieGoal * 7}
                          burnedCalories={0}
                          isWeeklyView={true}
                          progressColorLight={isDark? '#06D6A0' : '#4CAF50'}
                          progressColorDark={isDark? '#06D6A0' : '#4CAF50'}
                        />
                      </View>

                      <View style={styles.macronutrientsContainer}>
                        {[
                          { 
                            name: t('dashboard.protein'), 
                            current: 0, 
                            goal: proteinGoal * 7, 
                            color: '#FF8A80', 
                            colorDark: '#FF6B6B' 
                          },
                          { 
                            name: t('dashboard.fat'), 
                            current: 0, 
                            goal: fatGoal * 7, 
                            color: '#FFCF50', 
                            colorDark: '#FFD166' 
                          },
                          { 
                            name: t('dashboard.carbs'), 
                            current: 0, 
                            goal: carbGoal * 7, 
                            color: '#80D8FF', 
                            colorDark: '#06D6A0' 
                          },
                          { 
                            name: t('nutrition.hiddenSugar'), 
                            current: 0, 
                            goal: maxSugar * 7, 
                            color: '#FF3B30', 
                            colorDark: '#FF3B30' 
                          },
                        ].map((macro) => {
                          const progress = 0;
                          const macroBarColor = isDark ? macro.colorDark : macro.color;
                          return (
                            <View key={macro.name} style={styles.macroItem}>
                              <View style={styles.macroHeader}>
                                <Text style={[styles.macroName, isDark && styles.darkText]}>{macro.name}</Text>
                                <Text style={[styles.macroValues, isDark && styles.darkTextSecondary]}>
                                  {macro.current}/{macro.goal}г
                                </Text>
                              </View>
                              <View style={[styles.linearProgressBar, isDark && styles.darkLinearProgressBar]}>
                                <View 
                                  style={[
                                    styles.linearProgressFill, 
                                    { 
                                      width: `${Math.min(progress, 100)}%`,
                                      backgroundColor: macroBarColor 
                                    }
                                  ]} 
                                />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </TouchableOpacity>
                    
                    {/* Блок с кнопкой Get Recommendations */}
                    <View style={styles.activityContainer}>
                      {!isLoadingRecommendations && !aiRecommendations && canRequestRecommendations() && (
                        <TouchableOpacity 
                          style={[
                            styles.recommendationsButton,
                            recommendationError && styles.recommendationsRetryButton
                          ]}
                          onPress={handleRequestRecommendations}
                          activeOpacity={0.8}
                        >
                          <Ionicons 
                            name={recommendationError ? "refresh-outline" : "analytics-outline"} 
                            size={18} 
                            color="#FFFFFF" 
                          />
                          <Text style={styles.recommendationsButtonText}>
                            {recommendationError ? t('dashboard.retryRequest') : t('dashboard.getPersonalizedRecommendations')}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {isLoadingRecommendations && (
                        <View style={{ width: '100%', marginTop: 16 }}>
                          <View style={[
                            styles.recommendationsProgressBar,
                            isDark && styles.darkRecommendationsProgressBar
                          ]}>
                            <View 
                              style={[
                                styles.recommendationsProgressFill,
                                { width: `${recommendationsProgress}%` }
                              ]} 
                            />
                          </View>
                          <Text style={[
                            styles.recommendationsProgressText,
                            isDark && styles.darkRecommendationsProgressText
                          ]}>
                            {recommendationsProgressText}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Третий слайд - витамины и минералы */}
            <View style={[styles.dashboardSlide, { width: screenWidth - 32 }]}>
              <View style={[
                styles.calorieCard,
                isDark && styles.darkCard,
                isDark && styles.darkCardShadow
              ]}>
                <View style={styles.calorieCardHeader}>
                  <TouchableOpacity 
                    onPress={navigateToHistoryDashboard}
                    activeOpacity={0.7}
                    style={styles.calorieStatusHeader}
                    disabled={false}
                  >
                    <Text style={[styles.calorieSummaryText, isDark && styles.darkText]}>
                      {t('dashboard.vitaminsAndMineralsWeekly')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {weeklyVitaminMinerals ? (
                  <>
                    {/* Основной контент - круги с легендами */}
                    <View style={styles.vitaminMineralMainContainer}>
                      {/* Левая часть - Витамины */}
                      <View style={styles.vitaminMineralSection}>
                        <VitaminMineralCircle
                          data={weeklyVitaminMinerals.vitamins}
                          title={t('product.vitamins')}
                          totalScore={weeklyVitaminMinerals.vitaminScore}
                          size={110}
                        />
                        
                        {/* Легенда витаминов */}
                        <View style={styles.compactLegendContainer}>
                          {weeklyVitaminMinerals.vitamins.map((vitamin, index) => (
                            <View key={vitamin.name} style={styles.compactLegendItem}>
                              <View style={[styles.legendColorDot, { backgroundColor: vitamin.color }]} />
                              <Text style={[styles.compactLegendText, isDark && styles.darkText]}>
                                {vitamin.shortName} {Math.round((vitamin.current / vitamin.goal) * 100)}%
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Правая часть - Минералы */}
                      <View style={styles.vitaminMineralSection}>
                        <VitaminMineralCircle
                          data={weeklyVitaminMinerals.minerals}
                          title={t('product.minerals')}
                          totalScore={weeklyVitaminMinerals.mineralScore}
                          size={110}
                        />
                        
                        {/* Легенда минералов */}
                        <View style={styles.compactLegendContainer}>
                          {weeklyVitaminMinerals.minerals.map((mineral, index) => (
                            <View key={mineral.name} style={styles.compactLegendItem}>
                              <View style={[styles.legendColorDot, { backgroundColor: mineral.color }]} />
                              <Text style={[styles.compactLegendText, isDark && styles.darkText]}>
                                {mineral.shortName} {Math.round((mineral.current / mineral.goal) * 100)}%
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Дефициты и рекомендации - компактно */}
                    {weeklyVitaminMinerals.deficiencies.length > 0 && (
                      <View style={[
                        styles.recommendationContainer,
                        isDark && { 
                          backgroundColor: 'rgba(255, 152, 0, 0.15)',
                          borderLeftColor: '#FF9800'
                        },
                        { marginTop: 0 }
                      ]}>
                        <Text style={[styles.compactDeficiencyTitle, isDark && styles.darkText]}>
                          ⚠️ {t('dashboard.deficiency')}: {weeklyVitaminMinerals.deficiencies.join(', ')}
                        </Text>
                        <Text style={[
                          styles.compactRecommendationText, 
                          isDark && { color: '#E5E5E7' }
                        ]}>
                          {isVitaminRecommendationsExpanded 
                            ? weeklyVitaminMinerals.recommendations.join(' ')
                            : truncateVitaminText(weeklyVitaminMinerals.recommendations.join(' '))
                          }
                        </Text>
                        {weeklyVitaminMinerals.recommendations.join(' ').split(' ').length > 8 && (
                          <TouchableOpacity
                            onPress={toggleVitaminRecommendationsExpansion}
                            style={{ marginTop: 8, alignSelf: 'flex-start' }}
                          >
                            <Text style={[
                              styles.compactRecommendationText,
                              { color: '#0D6EFD', fontWeight: '600', fontSize: 14 }
                            ]}>
                              {isVitaminRecommendationsExpanded ? t('dashboard.showLess') : t('dashboard.readMore')}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {/* Состояние "нет данных" - показываем круги с вопросами */}
                    <View style={styles.vitaminMineralMainContainer}>
                      {/* Левая часть - Витамины с плейсхолдером */}
                      <View style={styles.vitaminMineralSection}>
                        <VitaminMineralCircle
                          data={[]}
                          title={t('product.vitamins')}
                          totalScore={0}
                          size={110}
                          showPlaceholder={true}
                        />
                        
                        {/* Легенда витаминов с вопросами */}
                        <View style={styles.compactLegendContainer}>
                          {['C', 'D', 'B12', 'B9', 'A', 'E'].map((shortName, index) => (
                            <View key={shortName} style={styles.compactLegendItem}>
                              <View style={[styles.legendColorDot, { backgroundColor: '#4CAF50' }]} />
                              <Text style={[styles.compactLegendText, isDark && styles.darkText]}>
                                {shortName} ?
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Правая часть - Минералы с плейсхолдером */}
                      <View style={styles.vitaminMineralSection}>
                        <VitaminMineralCircle
                          data={[]}
                          title={t('product.minerals')}
                          totalScore={0}
                          size={110}
                          showPlaceholder={true}
                        />
                        
                        {/* Легенда минералов с вопросами */}
                        <View style={styles.compactLegendContainer}>
                          {['Ca', 'Fe', 'Mg', 'Zn', 'K', 'Na'].map((shortName, index) => (
                            <View key={shortName} style={styles.compactLegendItem}>
                              <View style={[styles.legendColorDot, { backgroundColor: '#607D8B' }]} />
                              <Text style={[styles.compactLegendText, isDark && styles.darkText]}>
                                {shortName} ?
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Кнопка Get Recommendations */}
                    <View style={{ alignItems: 'center', paddingTop: 0 }}>
                      {!isLoadingRecommendations && (
                        <TouchableOpacity
                          style={[
                            styles.recommendationsButton,
                            !canRequestRecommendations() && styles.recommendationsDisabled
                          ]}
                          onPress={handleRequestRecommendations}
                          disabled={isLoadingRecommendations || !canRequestRecommendations()}
                        >
                          <Text style={styles.recommendationsButtonText}>
                            {t('dashboard.getPersonalizedRecommendations')}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {isLoadingRecommendations && (
                        <View style={{ width: '100%', marginTop: 16 }}>
                          <View style={[
                            styles.recommendationsProgressBar,
                            isDark && styles.darkRecommendationsProgressBar
                          ]}>
                            <View 
                              style={[
                                styles.recommendationsProgressFill,
                                { width: `${recommendationsProgress}%` }
                              ]} 
                            />
                          </View>
                          <Text style={[
                            styles.recommendationsProgressText,
                            isDark && styles.darkRecommendationsProgressText
                          ]}>
                            {recommendationsProgressText}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Индикаторы слайдов */}
          <View style={styles.slideIndicatorContainer}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slideIndicator,
                  currentSlide === index && styles.slideIndicatorActive,
                  isDark && currentSlide !== index && { backgroundColor: '#3A3A3C' }
                ]}
                onPress={() => scrollToSlide(index)}
              />
            ))}
          </View>
        </View>
        
        {/* Recent Scans/Added с горизонтальным скроллом */}
        <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderTitle, isDark && styles.darkText]}>
              {getRecentSectionTitle()}
            </Text>
            <TouchableOpacity onPress={handleRecentViewAll}>
              <Text style={[styles.viewAllText, isDark && styles.darkTextSecondary]}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
        </View>
        
          <ScrollView
            ref={recentScrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleRecentScroll}
            scrollEventThrottle={16}
            style={styles.recentScrollView}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {/* Страница 1 - Recently Added */}
            <View style={[styles.recentSlide, { width: screenWidth - 32 }]}>
              {recentAdded.length > 0 ? (
                <View style={styles.productCardsContainer}>
                  {recentAdded.map(product => (
                    <RecentAddedProductItem 
                      key={product.id} 
                      item={product} 
                      isDark={isDark}
                      t={t}
                      onDelete={() => {
                        loadRecentScans();
                        loadRecentAdded();
                        // Обновляем данные питания после удаления из дневника
                        loadNutritionData(currentDate);
                      }}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="restaurant-outline" size={48} color={isDark ? "#666" : "#CCC"} />
                  <Text style={[styles.emptyStateText, isDark && styles.darkTextSecondary]}>
                    {t('dashboard.noAddedProducts')}
                  </Text>
                  <Link href="/add-manual-product" asChild> 
                    <TouchableOpacity style={styles.scanButton}>
                      <Text style={styles.scanButtonText}>{t('dashboard.addProduct')}</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}
            </View>

            {/* Страница 2 - Recent Scans */}
            <View style={[styles.recentSlide, { width: screenWidth - 32 }]}>
        {recentScans.length > 0 ? (
          <View style={styles.productCardsContainer}>
            {recentScans.map(product => (
                    <RecentProductItem 
                key={product.id} 
                      item={product} 
                      isDark={isDark}
                      t={t}
                      onDelete={() => {
                        loadRecentScans();
                        loadRecentAdded();
                      }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="camera-outline" size={48} color={isDark ? "#666" : "#CCC"} />
            <Text style={[styles.emptyStateText, isDark && styles.darkTextSecondary]}>
              {t('dashboard.noScannedProducts')}
            </Text>
            <Link href="/scan" asChild> 
              <TouchableOpacity style={styles.scanButton}>
                <Text style={styles.scanButtonText}>{t('common.scanProduct')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
            </View>
          </ScrollView>

          {/* Индикаторы страниц для Recent блока */}
          <View style={styles.recentIndicatorContainer}>
            {[0, 1].map((index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.recentIndicator,
                  currentRecentSlide === index && styles.recentIndicatorActive,
                  isDark && currentRecentSlide !== index && { backgroundColor: '#3A3A3C' }
                ]}
                onPress={() => scrollToRecentSlide(index)}
              />
            ))}
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderTitle, isDark && styles.darkText]}>
              {t('dashboard.quickAccess')}
            </Text>
          </View>
          
          <View style={styles.quickAccessGrid}>
            {/* How Calculations Work */}
            <TouchableOpacity 
              style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]}
              onPress={() => router.push('/calculation-science')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                <Ionicons name="flask-outline" size={24} color="#34C759" />
              </View>
              <Text style={[styles.quickAccessTitle, isDark && styles.darkText]}>
                {t('dashboard.calculationsWork')}
              </Text>
              <Text style={[styles.quickAccessDescription, isDark && styles.darkTextSecondary]}>
                {t('dashboard.calculationsWorkDesc')}
              </Text>
            </TouchableOpacity>

            {/* User Profile */}
            <TouchableOpacity 
              style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]}
              onPress={() => router.push('/user-profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: 'rgba(13, 110, 253, 0.15)' }]}>
                <Ionicons name="person-outline" size={24} color="#0D6EFD" />
              </View>
              <Text style={[styles.quickAccessTitle, isDark && styles.darkText]}>
                {t('dashboard.userProfile')}
              </Text>
              <Text style={[styles.quickAccessDescription, isDark && styles.darkTextSecondary]}>
                {t('dashboard.userProfileDesc')}
              </Text>
            </TouchableOpacity>

            {/* Adjust Plan */}
            <TouchableOpacity 
              style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]}
              onPress={() => router.push('/goal-tracking/plan-settings')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                <Ionicons name="settings-outline" size={24} color="#FF9500" />
              </View>
              <Text style={[styles.quickAccessTitle, isDark && styles.darkText]}>
                {t('dashboard.adjustPlan')}
              </Text>
              <Text style={[styles.quickAccessDescription, isDark && styles.darkTextSecondary]}>
                {t('dashboard.adjustPlanDesc')}
              </Text>
            </TouchableOpacity>

            {/* Detailed Statistics */}
            <TouchableOpacity 
              style={[styles.quickAccessCard, isDark && styles.darkQuickAccessCard]}
              onPress={() => {
                Alert.alert(
                  t('dashboard.comingSoon'),
                  t('dashboard.comingSoonDescription')
                );
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                <Ionicons name="bar-chart-outline" size={24} color="#FF3B30" />
              </View>
              <Text style={[styles.quickAccessTitle, isDark && styles.darkText]}>
                {t('dashboard.detailedStats')}
              </Text>
              <Text style={[styles.quickAccessDescription, isDark && styles.darkTextSecondary]}>
                {t('dashboard.detailedStatsDesc')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

