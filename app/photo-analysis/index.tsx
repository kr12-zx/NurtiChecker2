import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as Localization from 'expo-localization';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';
// Используем реальный Firebase для загрузки изображений
import { uploadImage } from '../../app/firebase/storage';
import NutrientBadge from '../../components/NutrientBadge';
import { navigateToProductDetail } from '../../services/navigationService';
import { saveScanToHistory } from '../../services/scanHistory';
import { getUserId } from '../../services/userService';
import { getTimezoneInfo } from '../../utils/timezoneUtils';

type PhotoAnalysisParams = {
  imageUri: string;
};

// Интерфейс для результатов анализа
interface AnalysisData {
  foodName: string;
  portionInfo: {
    description: string;
    estimatedWeight: number;
    measurementUnit: string;
  };
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    sugars: number;
    fat: number;
    saturatedFat: number;
    fiber: number;
    sodium: number;
    glycemicIndex: number | null;
    vitamins: string[];
    minerals: string[];
  };
  analysis: {
    healthBenefits: string[];
    healthConcerns: string[];
    overallHealthScore: number;
  };
  recommendedIntake: {
    description: string;
    maxFrequency: string;
  };
}

// Компонент для отображения прогресс-бара и сообщения о загрузке
const LoadingOverlay = () => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  
  useEffect(() => {
    // Анимация прогресс-бара в течение примерно 60 секунд
    Animated.timing(progressAnim, {
      toValue: 0.95, // Не делаем 100%, чтобы показать, что процесс ещё идёт
      duration: 60000, // 60 секунд
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    // Используем Modal, который точно перекроет весь экран
    <Modal
      transparent={true}
      visible={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.loadingCard, isDark && {backgroundColor: '#2A2A2A'}]}>
          <ActivityIndicator size="large" color={isDark ? "#0A84FF" : "#007AFF"} style={styles.loadingIndicator} />
          <Text style={[styles.loadingText, isDark && {color: '#FFF'}]}>
            {t('photoAnalysis.processingMessage') || 'Пожалуйста, подождите, анализируем вашу еду...'}
          </Text>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressWidth }
              ]} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function PhotoAnalysisScreen() {
  const { imageUri } = useLocalSearchParams<PhotoAnalysisParams>();
  const { t, locale } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  
  // Состояния для редактирования пищевой ценности
  const [isEditing, setIsEditing] = useState(false);
  const [editedNutrition, setEditedNutrition] = useState({
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    sugars: '',
    fiber: '',
    saturatedFat: ''
  });
  
  // Если imageUri не определен, перенаправляем назад на экран сканирования
  if (!imageUri) {
    router.replace('/scan');
    return null;
  }

  const handleTakeAnotherPhoto = () => {
    router.back();
  };

  // Функция для начала редактирования
  const handleStartEditing = () => {
    if (analysisData?.nutritionInfo) {
      setEditedNutrition({
        calories: String(analysisData.nutritionInfo.calories || 0),
        protein: String(analysisData.nutritionInfo.protein || 0),
        fat: String(analysisData.nutritionInfo.fat || 0),
        carbs: String(analysisData.nutritionInfo.carbs || 0),
        sugars: String(analysisData.nutritionInfo.sugars || 0),
        fiber: String(analysisData.nutritionInfo.fiber || 0),
        saturatedFat: String(analysisData.nutritionInfo.saturatedFat || 0)
      });
      setIsEditing(true);
    }
  };

  // Функция для сохранения изменений
  const handleSaveEditing = async () => {
    try {
      // Валидация введенных данных
      const calories = parseFloat(editedNutrition.calories) || 0;
      const protein = parseFloat(editedNutrition.protein) || 0;
      const fat = parseFloat(editedNutrition.fat) || 0;
      const carbs = parseFloat(editedNutrition.carbs) || 0;
      const sugars = parseFloat(editedNutrition.sugars) || 0;
      const fiber = parseFloat(editedNutrition.fiber) || 0;
      const saturatedFat = parseFloat(editedNutrition.saturatedFat) || 0;

      // Проверка на разумные пределы
      if (calories < 0 || calories > 2000) {
        Alert.alert('Ошибка', 'Калории должны быть от 0 до 2000');
        return;
      }

      // Обновляем данные анализа
      if (analysisData) {
        const updatedAnalysisData = {
          ...analysisData,
          nutritionInfo: {
            ...analysisData.nutritionInfo,
            calories,
            protein,
            fat,
            carbs,
            sugars,
            fiber,
            saturatedFat
          }
        };
        
        setAnalysisData(updatedAnalysisData);
        
        // Сохраняем обновленные данные в AsyncStorage
        const storageKey = `@nutrichecker:edited_nutrition_${Date.now()}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedAnalysisData));
        
        console.log('Пищевая ценность обновлена и сохранена');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    }
  };

  // Функция для отмены редактирования
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedNutrition({
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
      sugars: '',
      fiber: '',
      saturatedFat: ''
    });
  };

  const handleAnalyze = async () => {
    try {
      setIsLoading(true);
      
      // 1. Загружаем изображение в Firebase Storage
      const storagePath = 'food_analysis';
      console.log('Начало загрузки изображения в Firebase:', imageUri);
      
      const downloadURL = await uploadImage(imageUri, storagePath);
      
      if (!downloadURL) {
        throw new Error('Не удалось загрузить изображение');
      }
      
      console.log('Изображение успешно загружено:', downloadURL);
      
      // 2. Формируем данные о пользователе (в будущем можно брать из профиля/настроек)
      const userProfile = {
        age: 30,
        gender: 'not_specified',
        weight: 70,
        height: 170,
        activityLevel: 2,
        dietGoal: 'maintenance'
      };
      
      // 3. Загружаем выбранные аллергены из AsyncStorage
      // Объявляем тип для деталей аллергенов
      interface AllergenDetail {
        id: string;
        englishName: string;
      }
      
      const loadAllergenData = async () => {
        const KEYS = {
          USER_SETTINGS: '@nutrichecker:user_settings',
          CUSTOM_ALLERGENS: '@nutrichecker:custom_allergens'
        };
        
        try {
          // Загружаем пользовательские аллергены
          const customAllergensJSON = await AsyncStorage.getItem(KEYS.CUSTOM_ALLERGENS);
          const customAllergens = customAllergensJSON ? JSON.parse(customAllergensJSON) : [];
          
          // Загружаем выбранные аллергены из настроек пользователя
          const userSettingsJSON = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
          let selectedAllergenIds: string[] = [];
          let allergenDetails: {id: string, englishName: string}[] = [];
          
          if (userSettingsJSON) {
            const userSettings = JSON.parse(userSettingsJSON);
            if (userSettings.selectedAllergenIds && Array.isArray(userSettings.selectedAllergenIds)) {
              selectedAllergenIds = userSettings.selectedAllergenIds;
              
              // Загружаем все аллергены (стандартные + пользовательские)
              // для получения английских названий выбранных аллергенов
              const allAllergens = [];
              
              // Создаем базовый список аллергенов
              const baseAllergens = [
                { id: 'milk', englishName: 'Milk' },
                { id: 'eggs', englishName: 'Eggs' },
                { id: 'peanuts', englishName: 'Peanuts' },
                { id: 'nuts', englishName: 'Tree Nuts' },
                { id: 'fish', englishName: 'Fish' },
                { id: 'shellfish', englishName: 'Shellfish' },
                { id: 'wheat', englishName: 'Wheat' },
                { id: 'soy', englishName: 'Soy' },
                { id: 'sesame', englishName: 'Sesame' },
                { id: 'gluten', englishName: 'Gluten' },
                { id: 'crustaceans', englishName: 'Crustaceans' },
                { id: 'celery', englishName: 'Celery' },
                { id: 'mustard', englishName: 'Mustard' },
                { id: 'lupin', englishName: 'Lupin' },
                { id: 'lactose', englishName: 'Lactose' },
                { id: 'fructose', englishName: 'Fructose' },
                { id: 'histamine', englishName: 'Histamine' },
                { id: 'sulfites', englishName: 'Sulfites' },
                { id: 'nitrates', englishName: 'Nitrates' },
                { id: 'msg', englishName: 'MSG' },
                { id: 'carrageenan', englishName: 'Carrageenan' }
              ];
              
              // Создаём карту базовых аллергенов по ID
              const allergenMap = new Map(baseAllergens.map(a => [a.id, a]));
              
              // Добавляем пользовательские аллергены в карту
              customAllergens.forEach((a: { id: string; name: string; englishName?: string }) => {
                allergenMap.set(a.id, { id: a.id, englishName: a.englishName || a.name });
              });
              
              // Фильтруем только выбранные аллергены
              selectedAllergenIds.forEach(id => {
                if (allergenMap.has(id)) {
                  const allergenInfo = allergenMap.get(id);
                  if (allergenInfo) {
                    allergenDetails.push(allergenInfo);
                  }
                } else {
                  // Если не нашли информацию об аллергене, используем только ID
                  allergenDetails.push({ id, englishName: id });
                }
              });
            }
          }
          
          console.log('Загружены аллергены:', { 
            selectedAllergenIds, 
            allergenDetails,
            customAllergensCount: customAllergens.length 
          });
          
          console.log('Отладка кастомных аллергенов:', {
            customAllergens: customAllergens,
            selectedAllergenIds: selectedAllergenIds
          });
          
          return { selectedAllergenIds, customAllergens, allergenDetails };
        } catch (error) {
          console.error('Ошибка при загрузке данных об аллергенах:', error);
          // В случае ошибки возвращаем пустые данные
          return { selectedAllergenIds: [], customAllergens: [], allergenDetails: [] };
        }
      };

      const allergenData = await loadAllergenData();
      
      // 4. Подготовка данных для отправки
      const encodedUserProfile = encodeURIComponent(JSON.stringify(userProfile));
      
      // Изменяем формат передачи всех аллергенов - теперь только имена через запятую
      
      // Собираем названия кастомных аллергенов
      let customAllergensNames = [];
      if (allergenData.customAllergens && Array.isArray(allergenData.customAllergens)) {
        // Исправляем логику: фильтруем кастомные аллергены по selectedAllergenIds, а не по selected поле
        customAllergensNames = allergenData.customAllergens
          .filter(allergen => allergenData.selectedAllergenIds.includes(allergen.id))
          .map(allergen => allergen.name || allergen.englishName)
          .filter(Boolean);
      }
      
      console.log('Отладка фильтрации кастомных аллергенов:', {
        доступныеКастомныеАллергены: allergenData.customAllergens.map((a: any) => ({ id: a.id, name: a.name })),
        выбранныеID: allergenData.selectedAllergenIds,
        результатФильтрации: customAllergensNames
      });
      
      // Собираем названия стандартных аллергенов
      let standardAllergensNames: string[] = [];
      if (allergenData.allergenDetails && Array.isArray(allergenData.allergenDetails)) {
        standardAllergensNames = allergenData.allergenDetails
          .filter(allergen => allergenData.selectedAllergenIds.includes(allergen.id))
          .map(allergen => allergen.englishName || '') // Используем только englishName, т.к. поле name может отсутствовать
          .filter(Boolean);
      }
      
      // Объединяем все аллергены в один список и удаляем дубликаты
      // Создаем Set для исключения дубликатов
      const uniqueAllergenNames = new Set<string>();
      
      // Добавляем все непустые аллергены
      [...standardAllergensNames, ...customAllergensNames]
        .filter(name => name && name.trim() !== '')
        .forEach(name => uniqueAllergenNames.add(name.trim()));
      
      // Преобразуем Set в массив и соединяем его в строку
      const uniqueAllergensArray = Array.from(uniqueAllergenNames);
      const selectedAllergenIds = uniqueAllergensArray.join(',');
      console.log('Список всех аллергенов (без дубликатов):', selectedAllergenIds);
      
      // Для обратной совместимости сохраняем и кастомные аллергены отдельно
      const cleanedCustomAllergens = customAllergensNames.filter(name => name && name.trim() !== '');
      const simplifiedCustomAllergens = cleanedCustomAllergens.join(',');
      console.log('Список кастомных аллергенов:', simplifiedCustomAllergens);
      
      // Создаем строку с данными о выбранных аллергенах в формате JSON для обратной совместимости
      const allergenDetailsJson = encodeURIComponent(JSON.stringify(allergenData.allergenDetails || []));
      
      // 5. Формируем URL для n8n вебхука
      const n8nWebhookUrl = 'https://ttagent.website/webhook/445b7e5d-d5af-4d06-9096-155ed9b1c4bb1';
      
      // Получаем реальный системный язык напрямую, а не через useTranslation
      const systemLanguage = Localization.locale.split('-')[0]; // Например 'es' из 'es-419'
      console.log('Системный язык устройства:', systemLanguage);
      
      // Получаем ID пользователя
      const userId = await getUserId();
      console.log('ID пользователя для webhook:', userId);
      
      // Получаем информацию о часовом поясе
      const timezoneInfo = getTimezoneInfo();
      console.log('🕒 Adding timezone info to product analysis webhook:', timezoneInfo);
      
      // Формируем URL с корректным кодированием параметров
      const urlParams = new URLSearchParams();
      urlParams.append('imageUrl', downloadURL);
      urlParams.append('language', systemLanguage);
      urlParams.append('userId', userId);
      urlParams.append('userProfile', JSON.stringify(userProfile));
      urlParams.append('selectedAllergenIds', selectedAllergenIds);
      urlParams.append('customAllergens', simplifiedCustomAllergens);
      urlParams.append('allergenDetails', JSON.stringify(allergenData.allergenDetails || []));
      // Добавляем timezone информацию
      urlParams.append('timezone', timezoneInfo.timezone);
      urlParams.append('timezoneOffset', timezoneInfo.timezoneOffset.toString());
      
      const queryParams = '?' + urlParams.toString();
      
      console.log('Отправка запроса в n8n:', `${n8nWebhookUrl}${queryParams}`);
      
      // 5. Отправляем запрос в n8n с retry только для сетевых ошибок
      let response;
      let retryCount = 0;
      const maxRetries = 3; // Уменьшаем количество попыток
      
      while (retryCount < maxRetries) {
        try {
          // Создаем AbortController для правильной реализации timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 минуты timeout
          
          const fetchOptions = {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          };
          
          // Добавляем дополнительный параметр для предотвращения кэширования
          const timestamp = Date.now();
          const nonCachedUrl = `${n8nWebhookUrl}${queryParams}${queryParams.includes('?') ? '&' : '?'}_t=${timestamp}`;
          
          console.log(`Попытка ${retryCount + 1}: отправка запроса в n8n`);
          
          response = await fetch(nonCachedUrl, fetchOptions);
          
          // Очищаем timeout при успешном получении ответа
          clearTimeout(timeoutId);
          
          // Если получили ответ (даже с ошибкой) - НЕ повторяем
          // Retry только если вообще не смогли подключиться
          break;
          
        } catch (error) {
          console.log(`Попытка ${retryCount + 1} - сетевая ошибка:`, error);
          retryCount++;
          
          // Если это последняя попытка - выбрасываем ошибку
          if (retryCount >= maxRetries) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Сетевая ошибка после ${maxRetries} попыток: ${errorMessage}`);
          }
          
          // Ждем перед следующей попыткой (только для сетевых ошибок)
          const delayTime = 2000 * retryCount; // 2, 4 секунды
          console.log(`Ожидание ${delayTime/1000} секунд перед следующей попыткой`);
          await new Promise(resolve => setTimeout(resolve, delayTime));
        }
      }
      
      // Проверяем статус ответа (но НЕ повторяем при ошибках статуса)
      if (!response || !response.ok) {
        throw new Error(`Ошибка сервера: ${response ? response.status : 'Нет ответа'}`);
      }
      
      // 6. Обрабатываем результат
      const analysisResult = await response.json();
      
      console.log('Получен ответ от n8n:', analysisResult);
      
      setIsLoading(false);
      
      // 7. Проверяем наличие ошибки в ответе
      if (analysisResult.error) {
        Alert.alert(
          t('common.error'),
          t('photoAnalysis.generalAnalysisError'),
          [{ text: 'OK' }]
        );
        return;
      }
      
      // 8. Отображаем результаты пользователю
      const { foodData } = analysisResult;
      
      // Проверка на случай, когда продукт неизвестен или имеет ошибку
      if (foodData && foodData.error) {
        Alert.alert(
          t('common.error'),
          t('photoAnalysis.nonFoodError'),
          [{ 
            text: t('photoAnalysis.takeAnother'), 
            onPress: () => router.replace('/scan')
          }]
        );
        return;
      }
      
      // Проверка на отсутствие важных данных для отображения
      if (!foodData || !foodData.nutritionInfo) {
        Alert.alert(
          t('common.error'),
          t('photoAnalysis.analysisError'),
          [{ 
            text: t('photoAnalysis.takeAnother'), 
            onPress: () => router.replace('/scan')
          }]
        );
        return;
      }
      
      // Проверка на случай, когда имя продукта 'Неизвестный продукт'
      if (foodData.foodName === 'Неизвестный продукт' || foodData.foodName === 'Unknown product') {
        Alert.alert(
          t('common.error'),
          t('photoAnalysis.nonFoodError'),
          [{ 
            text: t('photoAnalysis.takeAnother'), 
            onPress: () => router.replace('/scan')
          }]
        );
        return;
      }
      
      // 9. Сохраняем результаты в историю сканирований
      try {
        // Сохраняем полные данные анализа в JSON формате
        const fullAnalysisData = JSON.stringify(analysisResult);
        
        // Строгая валидация данных перед сохранением
        const isValidScanData = (data: any): boolean => {
          // Проверяем основные поля
          if (!data || !data.foodName || !data.nutritionInfo) {
            console.log('Валидация: пропущены основные поля данных');
            return false;
          }
          
          // Проверяем что название продукта не является заглушкой
          const invalidNames = [
            'неизвестный продукт', 
            'unknown product', 
            'не определено',
            'not defined',
            'error',
            'ошибка'
          ];
          
          if (invalidNames.some(name => 
            data.foodName.toLowerCase().includes(name.toLowerCase())
          )) {
            console.log('Валидация: обнаружено некорректное название продукта:', data.foodName);
            return false;
          }
          
          // Проверяем что есть хотя бы минимальные данные о питании
          const nutrition = data.nutritionInfo;
          const hasValidNutrition = (
            (nutrition.calories && nutrition.calories > 0) ||
            (nutrition.protein && nutrition.protein > 0) ||
            (nutrition.fat && nutrition.fat > 0) ||
            (nutrition.carbs && nutrition.carbs > 0)
          );
          
          if (!hasValidNutrition) {
            console.log('Валидация: отсутствуют значимые данные о питании');
            return false;
          }
          
          // Проверяем разумные пределы калорий (от 1 до 2000 на 100г)
          if (nutrition.calories && (nutrition.calories < 1 || nutrition.calories > 2000)) {
            console.log('Валидация: нереалистичные калории:', nutrition.calories);
            return false;
          }
          
          console.log('Валидация: данные продукта прошли проверку качества');
          return true;
        };
        
        // Валидируем данные
        if (!isValidScanData(foodData)) {
          console.log('Сканирование не сохранено: данные не прошли валидацию качества');
          // Показываем результаты на экране без сохранения в историю
          if (foodData && foodData.foodName) {
            setAnalysisData(foodData);
            return; // Выходим из try блока, не выбрасывая ошибку
          } else {
            throw new Error('Данные продукта не прошли валидацию');
          }
        }
        
        // Создаем запись в истории сканирований и получаем полный объект ScanHistoryItem
        const savedScan = await saveScanToHistory({
          name: foodData.foodName,
          calories: foodData.nutritionInfo.calories,
          protein: foodData.nutritionInfo.protein,
          fat: foodData.nutritionInfo.fat,
          carbs: foodData.nutritionInfo.carbs,
          image: downloadURL, // URL изображения в Firebase Storage
          fullData: fullAnalysisData // Сохраняем полный ответ от n8n
        });
        console.log('Результаты анализа сохранены в истории, ID:', savedScan.id);
        
        // Используем единый подход к навигации через функцию navigateToProductDetail
        navigateToProductDetail(savedScan);
      } catch (saveError) {
        console.log('Обработка результата сканирования:', saveError instanceof Error ? saveError.message : saveError);
        // В случае ошибки валидации показываем специальное сообщение
        if (saveError instanceof Error && saveError.message.includes('валидацию')) {
          Alert.alert(
            'Неполные данные',
            'Не удалось получить достаточно информации о продукте для сохранения. Попробуйте сделать более четкое фото еды.',
            [{ text: 'OK', onPress: () => router.replace('/scan') }]
          );
        } else if (foodData && foodData.foodName) {
          // Показываем результаты на текущем экране без сохранения
          console.log('Показываем результаты без сохранения в историю');
          setAnalysisData(foodData);
        } else {
          // Если данных вообще нет, показываем ошибку
          console.error('Критическая ошибка при обработке данных:', saveError);
          Alert.alert(
            t('common.error'),
            t('photoAnalysis.criticalError'),
            [{ text: 'OK' }]
          );
        }
      }
      
    } catch (error) {
      setIsLoading(false);
      
      Alert.alert(
        t('common.error'),
        t('photoAnalysis.generalAnalysisError'),
        [{ text: 'OK' }]
      );
      
      console.error('Ошибка анализа:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#F8F9FA' }}>
      <Stack.Screen options={{ title: t('photoAnalysis.title') }} />
      
      {/* Отображаем прогресс-бар во время загрузки, размещаем вне ScrollView */}
      {isLoading && <LoadingOverlay />}
      
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>

      {analysisData ? (
          // Отображаем результаты анализа
          <View style={styles.resultsContainer}>
            {/* Добавляем фотографию в верхней части */}
            <View style={styles.resultImageContainer}>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.resultImage} 
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
                onError={(error) => {
                  console.warn('❌ Ошибка загрузки изображения в результатах анализа:', error);
                }}
              />
            </View>
            
            <Text style={[styles.foodName, isDark && { color: '#FFF' }]}>
              {analysisData.foodName}
            </Text>
            
            <View style={styles.portionContainer}>
              <Text style={[styles.portionDescription, isDark && { color: '#CCC' }]}>
                {analysisData.portionInfo?.description || t('nutrition.portionNotDetermined')} 
                {analysisData.portionInfo?.estimatedWeight && analysisData.portionInfo?.measurementUnit ? 
                  `(${analysisData.portionInfo.estimatedWeight} ${analysisData.portionInfo.measurementUnit})` : 
                  `(100 ${t('nutrition.gram')})`
                }
              </Text>
            </View>
            
            <View style={[styles.nutritionContainer, isEditing && styles.editingContainer]}>
              <View style={styles.nutritionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>
                {t('nutrition.nutritionFacts')}:
              </Text>
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.editButton, isDark && styles.darkEditButton]}
                    onPress={isEditing ? handleSaveEditing : handleStartEditing}
                  >
                    <Ionicons 
                      name={isEditing ? "checkmark" : "pencil"} 
                      size={20} 
                      color={isEditing ? "#28a745" : "#007AFF"} 
                    />
                  </TouchableOpacity>
                  {isEditing && (
                    <TouchableOpacity
                      style={[styles.editButton, isDark && styles.darkEditButton, { marginLeft: 8 }]}
                      onPress={handleCancelEditing}
                    >
                      <Ionicons name="close" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Калории */}
              <View style={styles.nutritionRow}>
                <Text style={[styles.nutritionLabel, isDark && { color: '#CCC' }]}>- {t('nutrition.calories')}:</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.nutritionInput, isDark && styles.darkInput]}
                    value={editedNutrition.calories}
                    onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, calories: text }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                  />
                ) : (
                  <Text style={[styles.nutritionValue, isDark && { color: '#FFF' }]}>
                    {analysisData.nutritionInfo?.calories || 0} {t('nutrition.kcal')}
                  </Text>
                )}
              </View>

              {/* Белки */}
              <View style={styles.nutritionRow}>
                <Text style={[styles.nutritionLabel, isDark && { color: '#CCC' }]}>- {t('nutrition.protein')}:</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.nutritionInput, isDark && styles.darkInput]}
                    value={editedNutrition.protein}
                    onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, protein: text }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                  />
                ) : (
                  <Text style={[styles.nutritionValue, isDark && { color: '#FFF' }]}>
                    {analysisData.nutritionInfo?.protein || 0} {t('nutrition.gram')}
                  </Text>
                )}
              </View>

              {/* Жиры */}
              <View style={styles.nutritionRow}>
                <Text style={[styles.nutritionLabel, isDark && { color: '#CCC' }]}>- {t('nutrition.fats')}:</Text>
                {isEditing ? (
                  <View style={styles.fatInputContainer}>
                    <TextInput
                      style={[styles.nutritionInput, styles.fatInput, isDark && styles.darkInput]}
                      value={editedNutrition.fat}
                      onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, fat: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                    <Text style={[styles.fatSeparator, isDark && { color: '#CCC' }]}> ({t('nutrition.saturatedFat')}: </Text>
                    <TextInput
                      style={[styles.nutritionInput, styles.saturatedFatInput, isDark && styles.darkInput]}
                      value={editedNutrition.saturatedFat}
                      onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, saturatedFat: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                    <Text style={[styles.fatSeparator, isDark && { color: '#CCC' }]}> {t('nutrition.gram')})</Text>
                  </View>
                ) : (
                <Text style={[styles.nutritionValue, isDark && { color: '#FFF' }]}>
                  {analysisData.nutritionInfo?.fat || 0} {t('nutrition.gram')} ({t('nutrition.saturatedFat')}: {analysisData.nutritionInfo?.saturatedFat || 0} {t('nutrition.gram')})
                </Text>
                )}
              </View>

              {/* Углеводы */}
              <View style={styles.nutritionRow}>
                <Text style={[styles.nutritionLabel, isDark && { color: '#CCC' }]}>- {t('nutrition.carbs')}:</Text>
                {isEditing ? (
                  <View style={styles.carbInputContainer}>
                    <TextInput
                      style={[styles.nutritionInput, styles.carbInput, isDark && styles.darkInput]}
                      value={editedNutrition.carbs}
                      onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, carbs: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                    <Text style={[styles.carbSeparator, isDark && { color: '#CCC' }]}> ({t('nutrition.sugars')}: </Text>
                    <TextInput
                      style={[styles.nutritionInput, styles.sugarInput, isDark && styles.darkInput]}
                      value={editedNutrition.sugars}
                      onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, sugars: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                    <Text style={[styles.carbSeparator, isDark && { color: '#CCC' }]}> {t('nutrition.gram')})</Text>
                  </View>
                ) : (
                <Text style={[styles.nutritionValue, isDark && { color: '#FFF' }]}>
                  {analysisData.nutritionInfo?.carbs || 0} {t('nutrition.gram')} ({t('nutrition.sugars')}: {analysisData.nutritionInfo?.sugars || 0} {t('nutrition.gram')})
                </Text>
                )}
              </View>

              {/* Клетчатка */}
              <View style={styles.nutritionRow}>
                <Text style={[styles.nutritionLabel, isDark && { color: '#CCC' }]}>- {t('nutrition.fiber')}:</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.nutritionInput, isDark && styles.darkInput]}
                    value={editedNutrition.fiber}
                    onChangeText={(text) => setEditedNutrition(prev => ({ ...prev, fiber: text }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                  />
                ) : (
                  <Text style={[styles.nutritionValue, isDark && { color: '#FFF' }]}>
                    {analysisData.nutritionInfo?.fiber || 0} {t('nutrition.gram')}
                  </Text>
                )}
              </View>
              
              {/* Отображение витаминов */}
              {analysisData.nutritionInfo.vitamins && analysisData.nutritionInfo.vitamins.length > 0 && (
                <View style={styles.vitaminsContainer}>
                  <Text style={[styles.sectionSubtitle, isDark && { color: '#FFF' }]}>{t('product.vitamins')}:</Text>
                  <View style={styles.badgesContainer}>
                    {analysisData.nutritionInfo.vitamins.map((vitamin, index) => (
                      <NutrientBadge
                        key={`vitamin-${index}`}
                        name={vitamin}
                        type="vitamin"
                      />
                    ))}
                  </View>
                </View>
              )}
              
              {/* Отображение минералов */}
              {analysisData.nutritionInfo.minerals && analysisData.nutritionInfo.minerals.length > 0 && (
                <View style={styles.mineralsContainer}>
                  <Text style={[styles.sectionSubtitle, isDark && { color: '#FFF' }]}>{t('product.minerals')}:</Text>
                  <View style={styles.badgesContainer}>
                    {analysisData.nutritionInfo.minerals.map((mineral, index) => (
                      <NutrientBadge
                        key={`mineral-${index}`}
                        name={mineral}
                        type="mineral"
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>
                {t('nutrition.overallHealthScore')}: {analysisData.analysis?.overallHealthScore || t('nutrition.notDetermined')}/100
              </Text>
            </View>
            
            {analysisData.recommendedIntake && (
              <View style={styles.recommendationsContainer}>
                <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>
                  {t('nutrition.recommendations')}:
                </Text>
                <Text style={[styles.recommendationsText, isDark && { color: '#CCC' }]}>
                  {analysisData.recommendedIntake.description || t('nutrition.recommendationsNotDetermined')}
                </Text>
                {analysisData.recommendedIntake.maxFrequency && (
                  <Text style={[styles.frequencyText, isDark && { color: '#CCC' }]}>
                    <Text style={{fontWeight: 'bold'}}>{t('nutrition.frequency')}:</Text> {analysisData.recommendedIntake.maxFrequency}
                  </Text>
                )}
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.fullWidthButton]}
              onPress={handleTakeAnotherPhoto}
            >
              <Ionicons name="camera-outline" size={24} color="#FFF" />
              <Text style={styles.buttonText}>{t('photoAnalysis.takeAnotherPhoto')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Отображаем экран с фото и кнопками
          <>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.image} 
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
                onError={(error) => {
                  console.warn('❌ Ошибка загрузки изображения в анализе фото:', error);
                }}
              />
            </View>
            
            <View style={[styles.tipsContainer, isDark && styles.darkTipsContainer]}>
              <Text style={[styles.tipsTitle, isDark && { color: '#FFF' }]}>
                {t('photoAnalysis.tipsTitle')}
              </Text>

              <View style={styles.tipsList}>
                <Text style={[styles.tipItem, isDark && { color: '#FFFFFF' }]}>
                  • {t('photoAnalysis.tip1')}
                </Text>
                <Text style={[styles.tipItem, isDark && { color: '#FFFFFF' }]}>
                  • {t('photoAnalysis.tip2')}
                </Text>
                <Text style={[styles.tipItem, isDark && { color: '#FFFFFF' }]}>
                  • {t('photoAnalysis.tip3')}
                </Text>
                <Text style={[styles.tipItem, isDark && { color: '#FFFFFF' }]}>
                  • {t('photoAnalysis.tip4')}
                </Text>
              </View>
            </View>

          </>
        )}
      </ScrollView>
      
      {/* Фиксированные кнопки внизу экрана */}
      {!analysisData && (
        <View style={styles.fixedButtonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleTakeAnotherPhoto}
            disabled={isLoading}
          >
            <Ionicons name="camera-outline" size={24} color="#FFF" />
            <Text style={styles.buttonText}>{t('photoAnalysis.takeAnother')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.primaryButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleAnalyze}
            disabled={isLoading}
          >
            <Ionicons name="nutrition-outline" size={24} color="#FFF" />
            <Text style={styles.buttonText}>{t('photoAnalysis.analyze')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  // Стиль для модального оверлея
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Стили для изображения в результатах анализа
  resultImageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  darkTipsContainer: {
    backgroundColor: '#2A2A2A', // Темный фон для лучшего контраста в темной теме
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212529',
  },

  tipsList: {
    width: '100%',
    marginTop: 6,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#495057',
    marginBottom: 6,
    paddingLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  fixedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C757D',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: '#0D6EFD',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  // Стили для отображения результатов анализа
  resultsContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    alignSelf: 'center',
    textAlign: 'center',
  },
  portionContainer: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
  },
  portionDescription: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
  },
  nutritionContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    flex: 1,
    textAlign: 'right',
  },
  vitaminsContainer: {
    marginTop: 15,
  },
  mineralsContainer: {
    marginTop: 15,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  scoreContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  recommendationsContainer: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  recommendationsText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
  },
  frequencyText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginTop: 8,
  },
  fullWidthButton: {
    marginHorizontal: 0,
    marginTop: 16,
  },
  editingContainer: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F8F9FA',
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    marginLeft: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 60,
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#FFF',
  },
  fatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fatInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 40,
  },
  saturatedFatInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 40,
  },
  fatSeparator: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  carbInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carbInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 40,
  },
  sugarInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    backgroundColor: '#FFF',
    fontSize: 16,
    textAlign: 'right',
    minWidth: 40,
  },
  carbSeparator: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  darkEditButton: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
});
