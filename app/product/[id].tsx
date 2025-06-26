import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import PortionSizeModal, { PortionData } from '../../components/PortionSizeModal';
import i18n, { useTranslation } from '../../i18n/i18n';
import { addProductToDay } from '../../services/dailyNutrition';
import { updateScanById } from '../../services/scanHistory';
import { getTempData } from '../../services/tempStore';

// Mock nutrient data for cases when real data is not available
const MOCK_NUTRIENTS = {
  carbs: 5,
  fat: 3,
  protein: 18, 
  fiber: 2,
  sugar: 1,
  calcium: 120,
  vitamins: ['Vitamin D', 'Vitamin B12'],
  ingredients: 'Milk, Live Active Cultures, Salt, Enzymes',
  allergens: ['Milk'],
};

// Mock allergen list from user preferences
const USER_ALLERGENS = ['Milk', 'Soy', 'Nuts', 'Gluten'];

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  
  // 🔍 ДЕБАГ: Проверяем все параметры которые приходят
  console.log('🔍 ВСЕ ПАРАМЕТРЫ:', JSON.stringify(params, null, 2));
  console.log('🚀 ДЕБАГ fromDashboard:', params.fromDashboard);
  console.log('🚀 ДЕБАГ servingMultiplier:', params.servingMultiplier);
  console.log('🚀 ДЕБАГ actualCalories:', params.actualCalories);
  
  const { 
    id, 
    productName, 
    calories, 
    protein: proteinParam, 
    fat: fatParam,       
    carbs: carbsParam,     
    imgKey, 
    date, 
    scanDate, 
    useRealData, 
    analysisData: analysisDataString, 
    originalData, 
    fullData: fullDataString,
    // Параметры для продуктов из дашборда (фактически съеденные значения)
    fromDashboard,
    actualCalories,
    actualProtein,
    actualFat,
    actualCarbs,
    actualSugar,
    actualFiber,
    actualSaturatedFat,
    servingMultiplier
  } = params;
  
  // 🔍 ДЕБАГ: Проверяем каждый параметр на тип
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      console.log(`🔍 НАЙДЕН ОБЪЕКТ В ПАРАМЕТРАХ: ${key} =`, value);
    }
  });
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // Состояние загрузки при добавлении продукта

  // Состояния для редактирования продукта
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editedProductData, setEditedProductData] = useState({
    name: '',
    weight: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    sugars: '',
    fiber: '',
    saturatedFat: '',
    calcium: '',
    vitamins: '',
    ingredients: '',
    allergens: ''
  });
  
  // Базовые значения для пересчёта (всегда для 100г)
  const [baseProductData, setBaseProductData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugars: 0,
    fiber: 0,
    saturatedFat: 0
  });
  
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [shouldAutoEdit, setShouldAutoEdit] = useState(false);
  
  // Состояние для управления данными анализа
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Состояние для нутриентов (используется в getDisplay функциях)
  const [nutrients, setNutrients] = useState({
    protein: Number(proteinParam) || 0,
    fat: Number(fatParam) || 0,
    carbs: Number(carbsParam) || 0,
    sugar: 0,
    fiber: 0,
    calcium: 0,
    vitamins: [] as string[], // Всегда только строки
    ingredients: '',
    allergens: [] as string[], // Всегда только строки
  });

  // Инициализация данных анализа
  useEffect(() => {
    let parsedData: any = null; 
    try {
      if (fullDataString) {
        // Используем безопасное декодирование
        const rawFullData = safeDecodeURIComponent(fullDataString as string);
        try {
          const tempParsedFullData = JSON.parse(rawFullData);
          if (tempParsedFullData && tempParsedFullData.foodData) {
            parsedData = tempParsedFullData.foodData;
          }
        } catch (parseError) {
          console.error('Ошибка при парсинге JSON после декодирования:', parseError);
        }
      }
      if (!parsedData && analysisDataString) {
        parsedData = JSON.parse(analysisDataString as string);
      }
    } catch (error) {
      console.error('Error parsing analysis data:', error);
    }
    
    // ДЕБАГ: Логируем все данные что приходят
    console.log('🔍 ДЕБАГ: productName тип и значение:', typeof productName, productName);
    console.log('🔍 ДЕБАГ: parsedData:', parsedData);
    
    if (parsedData) {
      setAnalysisData({ ...parsedData }); // Создаем копию для безопасного изменения
      console.log('📊 Инициализированы данные анализа:', parsedData);
      
      // Обновляем nutrients данными из analysisData
      if (parsedData.nutritionInfo) {
        // Безопасно обрабатываем массивы витаминов и аллергенов
        const safeVitamins = (parsedData.nutritionInfo.vitamins || []).map((vitamin: any) => 
          typeof vitamin === 'string' ? vitamin : vitamin?.name || vitamin?.title || 'Unknown vitamin'
        );
        const safeAllergens = (parsedData.allergens || []).map((allergen: any) => 
          typeof allergen === 'string' ? allergen : allergen?.name || allergen?.title || 'Unknown allergen'
        );
        
        // Безопасно обрабатываем ingredients (может быть массивом объектов)
        let safeIngredients = '';
        if (parsedData.ingredients) {
          if (typeof parsedData.ingredients === 'string') {
            safeIngredients = parsedData.ingredients;
          } else if (Array.isArray(parsedData.ingredients)) {
            safeIngredients = parsedData.ingredients.map((ingredient: any) => 
              typeof ingredient === 'string' ? ingredient : ingredient?.name || ingredient?.title || 'Unknown ingredient'
            ).join(', ');
          }
        }

        setNutrients({
          protein: parsedData.nutritionInfo.protein || 0,
          fat: parsedData.nutritionInfo.fat || 0,
          carbs: parsedData.nutritionInfo.carbs || 0,
          sugar: parsedData.nutritionInfo.sugars || 0, // Важно: sugars из API → sugar в состоянии
          fiber: parsedData.nutritionInfo.fiber || 0,
          calcium: parsedData.nutritionInfo.calcium || 0,
          vitamins: safeVitamins,
          ingredients: safeIngredients,
          allergens: safeAllergens,
        });
        console.log('🍯 Обновлены nutrients:', {
          protein: parsedData.nutritionInfo.protein,
          fat: parsedData.nutritionInfo.fat,
          carbs: parsedData.nutritionInfo.carbs,
          sugar: parsedData.nutritionInfo.sugars,
          fiber: parsedData.nutritionInfo.fiber,
          calcium: parsedData.nutritionInfo.calcium,
          vitamins: parsedData.nutritionInfo.vitamins,
          ingredients: parsedData.ingredients,
          allergens: parsedData.allergens,
        });
      }
    }
  }, [fullDataString, analysisDataString]);

  // Обработчик подтверждения выбора размера порции и добавок
  const handlePortionConfirm = async (portionData: PortionData) => {
    try {
      setIsAdding(true);
      
      // Автоматически сохраняем изменения если продукт в режиме редактирования
      if (isEditingProduct) {
        console.log('💾 Автоматически сохраняем изменения перед добавлением продукта');
        await handleSaveEditingProduct();
      }
      
      // Получаем актуальные данные о продукте из текущего состояния (с учетом редактирования)
      const productData = {
        id: id as string,
        name: getDisplayName(),
        calories: Number(getDisplayCalories()) || 0,
        protein: Number(getDisplayProtein()) || 0,
        fat: Number(getDisplayFat()) || 0,
        carbs: Number(getDisplayCarbs()) || 0,
        sugar: Number(getDisplaySugar()) || 0,
        // Дополнительные поля для совместимости
        timestamp: Date.now(),
        date: new Date().toLocaleTimeString(),
        scanDate: new Date().toLocaleDateString(),
      };
      
      console.log('📦 Используем актуальные данные продукта для добавления:', productData);
      console.log('🍯 Отладка сахара при добавлении продукта:', {
        getDisplaySugar: getDisplaySugar(),
        productDataSugar: productData.sugar,
        nutrientsSugar: nutrients.sugar,
        analysisDataSugars: analysisData?.nutritionInfo?.sugars,
        isEditingProduct: isEditingProduct,
        editedSugars: isEditingProduct ? editedProductData.sugars : 'не в режиме редактирования'
      });
      
      // Коэффициент порции в зависимости от выбранного размера
      let portionMultiplier = 1.0;
      switch (portionData.portionSize) {
        case 'small':
          portionMultiplier = 0.7;
          break;
        case 'regular':
          portionMultiplier = 1.0;
          break;
        case 'large':
          portionMultiplier = 1.5;
          break;
      }
      
      // Коэффициент количества в зависимости от выбранного количества
      let quantityMultiplier = 1.0;
      switch (portionData.quantityEaten) {
        case 'all':
          quantityMultiplier = 1.0;
          break;
        case 'three_quarters':
          quantityMultiplier = 0.75;
          break;
        case 'half':
          quantityMultiplier = 0.5;
          break;
        case 'third':
          quantityMultiplier = 0.33;
          break;
        case 'quarter':
          quantityMultiplier = 0.25;
          break;
        case 'tenth':
          quantityMultiplier = 0.1;
          break;
        case 'sip':
          quantityMultiplier = 0.05;
          break;
        default:
          quantityMultiplier = 1.0;
          break;
      }
      
      // Общий коэффициент (порция * количество * кол-во единиц)
      const totalMultiplier = portionMultiplier * quantityMultiplier * portionData.quantity;
      
      console.log('📏 Расчет коэффициента порции:', {
        portionSize: portionData.portionSize,
        portionMultiplier,
        quantityEaten: portionData.quantityEaten,
        quantityMultiplier,
        quantity: portionData.quantity,
        totalMultiplier
      });
      
      // Дополнительные калории и нутриенты от добавок
      
      // Соус (30 ккал, 1г белка, 1г жира, 3г углеводов за порцию)
      const sauceCalories = portionData.addons.sauce * 30;
      const sauceProtein = portionData.addons.sauce * 1;
      const sauceFat = portionData.addons.sauce * 1;
      const sauceCarbs = portionData.addons.sauce * 3;
      
      // Сахар (12 ккал, 0г белка, 0г жира, 3г углеводов, 3г сахара за порцию)
      const sugarCalories = portionData.addons.sugar * 12;
      const sugarProtein = 0;
      const sugarFat = 0;
      const sugarCarbs = portionData.addons.sugar * 3;
      const hiddenSugar = portionData.addons.sugar * 3;
      
      // Масло (45 ккал, 0г белка, 5г жира, 0г углеводов за порцию)
      const oilCalories = portionData.addons.oil * 45;
      const oilProtein = 0;
      const oilFat = portionData.addons.oil * 5;
      const oilCarbs = 0;
      
      // Общее количество дополнительных нутриентов
      const totalAddonCalories = sauceCalories + sugarCalories + oilCalories;
      const totalAddonProtein = sauceProtein + sugarProtein + oilProtein;
      const totalAddonFat = sauceFat + sugarFat + oilFat;
      const totalAddonCarbs = sauceCarbs + sugarCarbs + oilCarbs;
      
      console.log('🍯 Добавки к продукту:', {
        sauce: portionData.addons.sauce,
        sugar: portionData.addons.sugar,
        oil: portionData.addons.oil,
        totalAddonCalories,
        totalAddonProtein,
        totalAddonFat,
        totalAddonCarbs,
        hiddenSugar
      });
      
      // Добавляем продукт с учетом добавок
      let productWithAddons = { ...productData };
      
      // Добавляем пищевую ценность добавок к продукту
      if (totalAddonCalories > 0) {
        // Обновляем калории
        const currentCalories = typeof productData.calories === 'string' ? parseInt(productData.calories) : productData.calories;
        productWithAddons.calories = currentCalories + totalAddonCalories;
        
        // Обновляем белки
        if (productData.protein !== undefined) {
          const currentProtein = typeof productData.protein === 'string' ? parseFloat(productData.protein) : productData.protein;
          productWithAddons.protein = currentProtein + totalAddonProtein;
        }
        
        // Обновляем жиры
        if (productData.fat !== undefined) {
          const currentFat = typeof productData.fat === 'string' ? parseFloat(productData.fat) : productData.fat;
          productWithAddons.fat = currentFat + totalAddonFat;
        }
        
        // Обновляем углеводы
        if (productData.carbs !== undefined) {
          const currentCarbs = typeof productData.carbs === 'string' ? parseFloat(productData.carbs) : productData.carbs;
          productWithAddons.carbs = currentCarbs + totalAddonCarbs;
        }
        
        // Добавляем скрытый сахар
        if (hiddenSugar > 0) {
          // Если есть поле sugar, обновляем его
          if (productData.sugar !== undefined) {
            const currentSugar = typeof productData.sugar === 'string' ? parseFloat(productData.sugar) : productData.sugar;
            productWithAddons.sugar = currentSugar + hiddenSugar;
          } else {
            // Иначе создаем новое поле
            productWithAddons.sugar = hiddenSugar;
          }
        }
        
        console.log('📊 Продукт с добавками:', productWithAddons);
      }
      
      // Добавляем недостающие поля для совместимости с ScanHistoryItem
      const scanHistoryItem = {
        ...productWithAddons,
        // Добавляем обязательные поля для ScanHistoryItem
        brand: analysisData?.brand || undefined,
        image: imageUrl || undefined,
        fullData: analysisData ? JSON.stringify(analysisData) : undefined
      };
      
      console.log('📋 Полный объект для добавления в дневник:', scanHistoryItem);
      
      // Добавляем продукт в дневную статистику
      await addProductToDay(scanHistoryItem, totalMultiplier);
      
      // Переход на дашборд после добавления продукта (без уведомления)
      console.log('✅ Продукт успешно добавлен в дневник:', productData.name);
      router.push('/(tabs)/main01');
      
      // Закрываем модальное окно
      setModalVisible(false);
    } catch (error) {
      console.error('Ошибка при добавлении продукта:', error);
      Alert.alert('Ошибка', 'Не удалось добавить продукт в дневник');
    } finally {
      setIsAdding(false);
    }
  };

  // Функции для объединенного редактирования продукта
  const handleStartEditingProduct = () => {
    // Получаем текущие значения из всех источников
    const currentName = analysisData?.foodName || productName || '';
    const currentWeight = String(analysisData?.portionInfo?.estimatedWeight || analysisData?.estimatedWeight || 100);
    const currentCalories = analysisData?.nutritionInfo?.calories ?? calories;
    const currentProtein = nutrients.protein;
    const currentFat = nutrients.fat;
    const currentCarbs = nutrients.carbs;
    const currentSugar = nutrients.sugar;
    const currentFiber = nutrients.fiber;
    const currentSaturatedFat = analysisData?.nutritionInfo?.saturatedFat || 0;

    // ИСПРАВЛЕНИЕ: Данные от N8N уже приходят для конкретной порции (estimatedWeight)
    // Пересчитываем к базе 100г для корректного пересчета
    const weightNum = parseFloat(currentWeight);
    const baseMultiplier = 100 / weightNum; // Коэффициент для пересчета к 100г
    
    console.log('🔍 Данные для редактирования:', {
      currentWeight: weightNum,
      currentCalories,
      currentProtein,
      currentCarbs,
      currentSugar,
      baseMultiplier,
      calculatedCarbsPer100g: Math.round((Number(currentCarbs || 0)) * baseMultiplier * 10) / 10,
      calculatedSugarPer100g: Math.round((Number(currentSugar || 0)) * baseMultiplier * 10) / 10
    });
    
    // Сохраняем базовые значения для пересчёта (всегда для 100г)
    setBaseProductData({
      name: String(currentName),
      calories: Math.round((Number(currentCalories || 0)) * baseMultiplier),
      protein: Math.round((Number(currentProtein || 0)) * baseMultiplier * 10) / 10,
      fat: Math.round((Number(currentFat || 0)) * baseMultiplier * 10) / 10,
      carbs: Math.round((Number(currentCarbs || 0)) * baseMultiplier * 10) / 10,
      sugars: Math.round((Number(currentSugar || 0)) * baseMultiplier * 10) / 10,
      fiber: Math.round((Number(currentFiber || 0)) * baseMultiplier * 10) / 10,
      saturatedFat: Math.round((Number(currentSaturatedFat || 0)) * baseMultiplier * 10) / 10
    });

    setEditedProductData({
      name: String(currentName),
      weight: String(currentWeight),
      calories: String(currentCalories || 0),
      protein: String(currentProtein || 0),
      fat: String(currentFat || 0),
      carbs: String(currentCarbs || 0),
      sugars: String(currentSugar || 0),
      fiber: String(currentFiber || 0),
      saturatedFat: String(currentSaturatedFat || 0),
      calcium: String(nutrients.calcium || 0),
      vitamins: Array.isArray(nutrients.vitamins) ? nutrients.vitamins.join(', ') : '',
      ingredients: nutrients.ingredients || '',
      allergens: Array.isArray(nutrients.allergens) ? nutrients.allergens.join(', ') : ''
    });
    setIsEditingProduct(true);
    console.log('🔄 Начинаем объединенное редактирование продукта');
  };

  const handleSaveEditingProduct = async () => {
    // Валидация
    if (!editedProductData.name.trim()) {
      Alert.alert(t('common.error'), 'Название продукта не может быть пустым');
      return;
    }

    try {
      // Сохраняем изменения в состояние данных анализа
      if (analysisData) {
        setAnalysisData((prev: any) => ({
          ...prev,
          foodName: editedProductData.name,
          estimatedWeight: Number(editedProductData.weight) || 100,
          portionInfo: {
            ...prev.portionInfo,
            estimatedWeight: Number(editedProductData.weight) || 100
          },
          nutritionInfo: {
            ...prev.nutritionInfo,
            calories: Number(editedProductData.calories) || 0,
            protein: Number(editedProductData.protein) || 0,
            fat: Number(editedProductData.fat) || 0,
            carbs: Number(editedProductData.carbs) || 0,
            sugars: Number(editedProductData.sugars) || 0,
            fiber: Number(editedProductData.fiber) || 0,
            saturatedFat: Number(editedProductData.saturatedFat) || 0
          }
        }));
      }

      // Обновляем nutrients
      setNutrients(prev => ({
        ...prev,
        protein: Number(editedProductData.protein) || 0,
        fat: Number(editedProductData.fat) || 0,
        carbs: Number(editedProductData.carbs) || 0,
        sugar: Number(editedProductData.sugars) || 0,
        fiber: Number(editedProductData.fiber) || 0,
        calcium: Number(editedProductData.calcium) || 0,
        vitamins: editedProductData.vitamins ? editedProductData.vitamins.split(',').map((vitamin: string) => vitamin.trim()).filter(Boolean) : [],
        ingredients: editedProductData.ingredients,
        allergens: editedProductData.allergens ? editedProductData.allergens.split(',').map((allergen: string) => allergen.trim()).filter(Boolean) : [],
      }));

      // Обновляем базовые данные для будущих пересчетов
      setBaseProductData(prev => ({
        ...prev,
        name: editedProductData.name,
        calories: Number(editedProductData.calories) || 0,
        protein: Number(editedProductData.protein) || 0,
        fat: Number(editedProductData.fat) || 0,
        carbs: Number(editedProductData.carbs) || 0,
        sugars: Number(editedProductData.sugars) || 0,
        fiber: Number(editedProductData.fiber) || 0,
        saturatedFat: Number(editedProductData.saturatedFat) || 0
      }));

      // Сохраняем в AsyncStorage (история сканирований)
      if (id) {
        // Создаем обновленные fullData с новыми значениями
        const updatedFullData = analysisData ? JSON.stringify({
          foodData: {
            ...analysisData,
            foodName: editedProductData.name,
            estimatedWeight: Number(editedProductData.weight) || 100,
            portionInfo: {
              ...analysisData.portionInfo,
              estimatedWeight: Number(editedProductData.weight) || 100
            },
            nutritionInfo: {
              ...analysisData.nutritionInfo,
              calories: Number(editedProductData.calories) || 0,
              protein: Number(editedProductData.protein) || 0,
              fat: Number(editedProductData.fat) || 0,
              carbs: Number(editedProductData.carbs) || 0,
              sugars: Number(editedProductData.sugars) || 0,
              fiber: Number(editedProductData.fiber) || 0,
              saturatedFat: Number(editedProductData.saturatedFat) || 0
            }
          }
        }) : undefined;

        // Обновляем запись в истории сканирований
        await updateScanById(id as string, {
          name: editedProductData.name,
          calories: Number(editedProductData.calories) || 0,
          protein: Number(editedProductData.protein) || 0,
          fat: Number(editedProductData.fat) || 0,
          carbs: Number(editedProductData.carbs) || 0,
          sugar: Number(editedProductData.sugars) || 0,
          fullData: updatedFullData
        });

        console.log('💾 Данные сохранены в AsyncStorage для ID:', id);
      }

      setIsEditingProduct(false);
      console.log('✅ Сохраняем изменения продукта:', editedProductData);
      
      // Alert.alert('Успех', 'Изменения сохранены'); // Убираем уведомление
      console.log('✅ Изменения сохранены успешно');
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    }
  };

  // Сохранение без уведомления (для кнопки галочки)
  const handleSaveEditingProductSilent = async () => {
    // Валидация (тихая - без уведомлений)
    if (!editedProductData.name.trim()) {
      console.log('❌ Тихая валидация: название продукта пустое');
      return;
    }

    try {
      // Сохраняем изменения в состояние данных анализа
      if (analysisData) {
        setAnalysisData((prev: any) => ({
          ...prev,
          foodName: editedProductData.name,
          estimatedWeight: Number(editedProductData.weight) || 100,
          portionInfo: {
            ...prev.portionInfo,
            estimatedWeight: Number(editedProductData.weight) || 100
          },
          nutritionInfo: {
            ...prev.nutritionInfo,
            calories: Number(editedProductData.calories) || 0,
            protein: Number(editedProductData.protein) || 0,
            fat: Number(editedProductData.fat) || 0,
            carbs: Number(editedProductData.carbs) || 0,
            sugars: Number(editedProductData.sugars) || 0,
            fiber: Number(editedProductData.fiber) || 0,
            saturatedFat: Number(editedProductData.saturatedFat) || 0
          }
        }));
      }

      // Обновляем nutrients
      setNutrients(prev => ({
        ...prev,
        protein: Number(editedProductData.protein) || 0,
        fat: Number(editedProductData.fat) || 0,
        carbs: Number(editedProductData.carbs) || 0,
        sugar: Number(editedProductData.sugars) || 0,
        fiber: Number(editedProductData.fiber) || 0,
        calcium: Number(editedProductData.calcium) || 0,
        vitamins: editedProductData.vitamins ? editedProductData.vitamins.split(',').map((vitamin: string) => vitamin.trim()).filter(Boolean) : [],
        ingredients: editedProductData.ingredients,
        allergens: editedProductData.allergens ? editedProductData.allergens.split(',').map((allergen: string) => allergen.trim()).filter(Boolean) : [],
      }));

      // Обновляем базовые данные для будущих пересчетов
      setBaseProductData(prev => ({
        ...prev,
        name: editedProductData.name,
        calories: Number(editedProductData.calories) || 0,
        protein: Number(editedProductData.protein) || 0,
        fat: Number(editedProductData.fat) || 0,
        carbs: Number(editedProductData.carbs) || 0,
        sugars: Number(editedProductData.sugars) || 0,
        fiber: Number(editedProductData.fiber) || 0,
        saturatedFat: Number(editedProductData.saturatedFat) || 0
      }));

      // Сохраняем в AsyncStorage (история сканирований)
      if (id) {
        // Создаем обновленные fullData с новыми значениями
        const updatedFullData = analysisData ? JSON.stringify({
          foodData: {
            ...analysisData,
            foodName: editedProductData.name,
            estimatedWeight: Number(editedProductData.weight) || 100,
            portionInfo: {
              ...analysisData.portionInfo,
              estimatedWeight: Number(editedProductData.weight) || 100
            },
            nutritionInfo: {
              ...analysisData.nutritionInfo,
              calories: Number(editedProductData.calories) || 0,
              protein: Number(editedProductData.protein) || 0,
              fat: Number(editedProductData.fat) || 0,
              carbs: Number(editedProductData.carbs) || 0,
              sugars: Number(editedProductData.sugars) || 0,
              fiber: Number(editedProductData.fiber) || 0,
              saturatedFat: Number(editedProductData.saturatedFat) || 0
            }
          }
        }) : undefined;

        // Обновляем запись в истории сканирований
        await updateScanById(id as string, {
          name: editedProductData.name,
          calories: Number(editedProductData.calories) || 0,
          protein: Number(editedProductData.protein) || 0,
          fat: Number(editedProductData.fat) || 0,
          carbs: Number(editedProductData.carbs) || 0,
          sugar: Number(editedProductData.sugars) || 0,
          fullData: updatedFullData
        });

        console.log('💾 Данные автоматически сохранены в AsyncStorage для ID:', id);
      }

      setIsEditingProduct(false);
      console.log('✅ Автоматически сохраняем изменения продукта (без уведомления):', editedProductData);
      
      // НЕ показываем Alert для автоматического сохранения
    } catch (error) {
      console.error('Ошибка при автоматическом сохранении:', error);
      // НЕ показываем Alert даже при ошибке для тихого сохранения
    }
  };

  const handleCancelEditingProduct = () => {
    setIsEditingProduct(false);
    // Не сбрасываем editedProductData, чтобы сохранить текущие значения
    console.log('❌ Отменяем редактирование продукта');
  };

  const handleAIAnalyzeProduct = async () => {
    if (!editedProductData.name.trim()) {
      Alert.alert(t('common.error'), 'Введите название продукта для AI анализа');
      return;
    }

    setIsAIAnalyzing(true);
    try {
      console.log('🤖 Отправляем на AI анализ:', editedProductData.name);
      
      // Получаем userId и язык
      const { getUserId } = await import('../../services/userService');
      const userId = await getUserId();
      const currentLanguage = i18n.locale || 'en';
      
      // Подготавливаем данные для webhook
      const requestData = {
        productName: editedProductData.name.trim(),
        userId: userId,
        portionSize: 'regular', // Стандартная порция
        language: currentLanguage
      };

      console.log('Отправляем запрос к AI:', requestData);

      // URL webhook для анализа продуктов по названию
      const webhookUrl = 'https://ttagent.website/webhook/a1b2c3d4-e5f6-7890-abcd-ef12345678901';
      
      // Формируем URL с параметрами для GET запроса
      const urlParams = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          urlParams.append(key, String(value));
        }
      });
      
      const fullUrl = `${webhookUrl}?${urlParams.toString()}`;
      console.log(`Отправляем запрос к: ${webhookUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Получен ответ от AI:', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Ошибка парсинга ответа: ${parseError}`);
      }

      // Проверяем структуру ответа
      if (data && data.foodData) {
        const foodData = data.foodData;
        
        // ОБНОВЛЯЕМ СОСТОЯНИЕ analysisData НОВЫМИ ДАННЫМИ ОТ AI
        setAnalysisData({
          ...foodData,
          // Обновляем структуру для совместимости
          nutritionInfo: {
            ...foodData.nutritionInfo,
            estimatedWeight: foodData.estimatedWeight || 100
          }
        });

        // Обновляем поля с данными от AI
        setEditedProductData(prev => ({
          ...prev,
          name: foodData.foodName || prev.name,
          weight: String(foodData.estimatedWeight || 100),
          calories: String(foodData.nutritionInfo?.calories || 0),
          protein: String(foodData.nutritionInfo?.protein || 0),
          fat: String(foodData.nutritionInfo?.fat || 0),
          carbs: String(foodData.nutritionInfo?.carbs || 0),
          sugars: String(foodData.nutritionInfo?.sugars || 0),
          fiber: String(foodData.nutritionInfo?.fiber || 0),
          saturatedFat: String(foodData.nutritionInfo?.saturatedFat || 0)
        }));

        // Обновляем базовые данные для пересчета (приводим к 100г)
        const estimatedWeight = foodData.estimatedWeight || 100;
        const baseMultiplier = 100 / estimatedWeight;
        
        setBaseProductData({
          name: foodData.foodName || editedProductData.name,
          calories: Math.round((foodData.nutritionInfo?.calories || 0) * baseMultiplier),
          protein: Math.round((foodData.nutritionInfo?.protein || 0) * baseMultiplier * 10) / 10,
          fat: Math.round((foodData.nutritionInfo?.fat || 0) * baseMultiplier * 10) / 10,
          carbs: Math.round((foodData.nutritionInfo?.carbs || 0) * baseMultiplier * 10) / 10,
          sugars: Math.round((foodData.nutritionInfo?.sugars || 0) * baseMultiplier * 10) / 10,
          fiber: Math.round((foodData.nutritionInfo?.fiber || 0) * baseMultiplier * 10) / 10,
          saturatedFat: Math.round((foodData.nutritionInfo?.saturatedFat || 0) * baseMultiplier * 10) / 10
        });

        // Обновляем nutrients напрямую для немедленного отображения
        const currentAllergens = Array.isArray(foodData.allergens) 
          ? foodData.allergens 
          : [];
        const currentVitamins = (foodData.nutritionInfo && Array.isArray(foodData.nutritionInfo.vitamins)) 
          ? foodData.nutritionInfo.vitamins 
          : [];
        
        // Обработка ингредиентов - поддержка как нового (массив объектов), так и старого (строка) формата
        let processedIngredients = '';
        if (foodData.ingredients) {
          if (Array.isArray(foodData.ingredients)) {
            // Новый формат: массив объектов {name: string}
            processedIngredients = foodData.ingredients
              .map((item: any) => item && typeof item === 'object' && item.name ? item.name : item)
              .filter(Boolean)
              .join(', ');
          } else if (typeof foodData.ingredients === 'string') {
            // Старый формат: строка
            processedIngredients = foodData.ingredients;
          }
        }
        
        setNutrients({
          carbs: foodData.nutritionInfo?.carbs || 0,
          fat: foodData.nutritionInfo?.fat || 0,
          protein: foodData.nutritionInfo?.protein || 0,
          fiber: foodData.nutritionInfo?.fiber || 0,
          sugar: foodData.nutritionInfo?.sugars || 0,
          calcium: foodData.nutritionInfo?.calcium || 0,
          vitamins: currentVitamins,
          ingredients: processedIngredients,
          allergens: currentAllergens,
        });

        console.log('✅ AI анализ завершен, данные обновлены');
        console.log('🔄 Новый вес от AI:', foodData.estimatedWeight);
        console.log('🔄 Новые нутриенты от AI:', {
          calories: foodData.nutritionInfo?.calories,
          protein: foodData.nutritionInfo?.protein,
          fat: foodData.nutritionInfo?.fat,
          carbs: foodData.nutritionInfo?.carbs
        });
        console.log('🔄 Новые ингредиенты от AI:', processedIngredients);
        console.log('🔄 Новые витамины от AI:', currentVitamins);
        // Alert.alert('Успех', 'AI анализ завершен, данные обновлены'); // Убираем уведомление
        console.log('✅ AI анализ завершен, данные обновлены');
        
      } else if (data && data.error) {
        throw new Error(data.error.message || data.error.details || 'Ошибка AI анализа');
      } else {
        throw new Error('Неожиданный формат ответа от сервера');
      }
      
    } catch (error) {
      console.error('Ошибка AI анализа:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      Alert.alert(t('common.error'), `Ошибка AI анализа: ${errorMessage}`);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleWeightChange = (newWeight: string) => {
    // Не пересчитываем если вес пустой или некорректный
    if (!newWeight || newWeight.trim() === '') {
      setEditedProductData(prev => ({
        ...prev,
        weight: newWeight
      }));
      return;
    }

    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setEditedProductData(prev => ({
        ...prev,
        weight: newWeight
      }));
      return;
    }

    const baseWeight = 100; // Базовый вес для пересчета
    const multiplier = weightNum / baseWeight;

    // Пересчитываем все нутриенты от базовых значений
    setEditedProductData(prev => ({
      ...prev,
      weight: newWeight,
      calories: String(Math.round(baseProductData.calories * multiplier)),
      protein: String(Math.round(baseProductData.protein * multiplier * 10) / 10),
      fat: String(Math.round(baseProductData.fat * multiplier * 10) / 10),
      carbs: String(Math.round(baseProductData.carbs * multiplier * 10) / 10),
      sugars: String(Math.round(baseProductData.sugars * multiplier * 10) / 10),
      fiber: String(Math.round(baseProductData.fiber * multiplier * 10) / 10),
      saturatedFat: String(Math.round(baseProductData.saturatedFat * multiplier * 10) / 10)
    }));

    console.log('⚖️ Пересчитываем нутриенты для веса:', newWeight, 'г от базовых значений');
  };

  const imageUrl = imgKey ? getTempData(imgKey as string) : '';

  /**
   * Безопасное декодирование URI-компонента с защитой от ошибок
   * @param encodedString - закодированная строка
   * @returns декодированная строка или исходная строка в случае ошибки
   */
  const safeDecodeURIComponent = (encodedString: string): string => {
    try {
      return decodeURIComponent(encodedString);
    } catch (error) {
      console.warn('Ошибка при декодировании URI компонента, возвращаем исходную строку');
      return encodedString;
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRealData = useRealData === 'true';

  const [isAllergic, setIsAllergic] = useState(false);

  useEffect(() => {
    // Отладочное логирование для аллергенов
    console.log('Данные аллергенов:', {
      userContextIsSafe: analysisData?.userContext?.isSafeForUser,
      allergenAnalysisIsSafe: analysisData?.allergenAnalysis?.isSafeForUser,
      userContextWarnings: analysisData?.userContext?.allergenWarnings,
      allergenAnalysisWarnings: analysisData?.allergenAnalysis?.userAllergenWarnings,
      detectedAllergens: analysisData?.allergenAnalysis?.detectedAllergens,
    });

    // Проверяем аллерген по данным из API или по локальным данным, если API данных нет
    if (analysisData?.userContext?.isSafeForUser === false || analysisData?.allergenAnalysis?.isSafeForUser === false) {
      // Если API явно указывает, что продукт небезопасен
      console.log('Продукт отмечен как небезопасный (isSafeForUser: false)');  
      setIsAllergic(true);
    } else if (
      // Проверяем предупреждения в userContext (новый формат)
      (analysisData?.userContext?.allergenWarnings && 
       Array.isArray(analysisData.userContext.allergenWarnings) && 
       analysisData.userContext.allergenWarnings.length > 0) ||
      // Проверяем предупреждения в allergenAnalysis (старый формат)
      (analysisData?.allergenAnalysis?.userAllergenWarnings && 
       Array.isArray(analysisData.allergenAnalysis.userAllergenWarnings) && 
       analysisData.allergenAnalysis.userAllergenWarnings.length > 0)
    ) {
      // Если есть предупреждения об аллергенах
      console.log('Найдены предупреждения об аллергенах:', 
        analysisData?.userContext?.allergenWarnings || 
        analysisData?.allergenAnalysis?.userAllergenWarnings
      );
      setIsAllergic(true);
    } else if (nutrients && nutrients.allergens && Array.isArray(nutrients.allergens)) {
      // Проверяем по локальному списку аллергенов (устаревший метод)
      const hasAllergen = nutrients.allergens.some((allergen: string) => 
        USER_ALLERGENS.includes(allergen)
      );
      console.log('Проверка по локальным аллергенам:', { hasAllergen, allergens: nutrients.allergens });
      setIsAllergic(hasAllergen);
    } else {
      console.log('Нет данных об аллергенах, продукт считается безопасным');
      setIsAllergic(false);
    }
  }, [nutrients]);

  // Автоматический вход в режим редактирования после AI анализа
  useEffect(() => {
    if (analysisData && !isEditingProduct && !shouldAutoEdit) {
      setShouldAutoEdit(true);
      handleStartEditingProduct();
      console.log('🚀 Автоматически входим в режим редактирования после AI анализа');
    }
  }, [analysisData]);

  // Функции для получения актуальных значений для отображения
  const getDisplayCalories = () => {
    if (isEditingProduct) {
      return editedProductData.calories;
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualCalories) {
      return Math.round(Number(actualCalories));
    }
    // В режиме просмотра показываем значения из analysisData
    const value = analysisData?.nutritionInfo?.calories ?? calories;
    console.log('🔍 getDisplayCalories:', { 
      isEditingProduct, 
      fromDashboard, 
      actualCalories,
      analysisDataCalories: analysisData?.nutritionInfo?.calories, 
      fallbackCalories: calories, 
      finalValue: fromDashboard && actualCalories ? Math.round(Number(actualCalories)) : value 
    });
    return value;
  };

  const getDisplayProtein = () => {
    if (isEditingProduct) {
      return editedProductData.protein;
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualProtein) {
      return Number(actualProtein).toFixed(1);
    }
    // В режиме просмотра показываем значения из analysisData
    const value = analysisData?.nutritionInfo?.protein ?? nutrients.protein;
    console.log('🔍 getDisplayProtein:', { 
      isEditingProduct, 
      fromDashboard, 
      actualProtein,
      analysisDataProtein: analysisData?.nutritionInfo?.protein, 
      nutrientsProtein: nutrients.protein, 
      finalValue: fromDashboard && actualProtein ? Number(actualProtein).toFixed(1) : value 
    });
    return value;
  };

  const getDisplayFat = () => {
    if (isEditingProduct) {
      return editedProductData.fat;
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualFat) {
      return Number(actualFat).toFixed(1);
    }
    // В режиме просмотра показываем значения из analysisData
    const value = analysisData?.nutritionInfo?.fat ?? nutrients.fat;
    console.log('🔍 getDisplayFat:', { 
      isEditingProduct, 
      fromDashboard, 
      actualFat,
      analysisDataFat: analysisData?.nutritionInfo?.fat, 
      nutrientsFat: nutrients.fat, 
      finalValue: fromDashboard && actualFat ? Number(actualFat).toFixed(1) : value 
    });
    return value;
  };

  const getDisplayCarbs = () => {
    if (isEditingProduct) {
      return editedProductData.carbs;
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualCarbs) {
      return Number(actualCarbs).toFixed(1);
    }
    // В режиме просмотра показываем значения из analysisData
    const value = analysisData?.nutritionInfo?.carbs ?? nutrients.carbs;
    console.log('🔍 getDisplayCarbs:', { 
      isEditingProduct, 
      fromDashboard, 
      actualCarbs,
      analysisDataCarbs: analysisData?.nutritionInfo?.carbs, 
      nutrientsCarbs: nutrients.carbs, 
      finalValue: fromDashboard && actualCarbs ? Number(actualCarbs).toFixed(1) : value 
    });
    return value;
  };

  const getDisplaySugar = () => {
    if (isEditingProduct) {
      return editedProductData.sugars || '0';
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualSugar) {
      return Math.round(Number(actualSugar));
    }
    
    const result = Math.round(analysisData?.nutritionInfo?.sugars ?? nutrients.sugar);
    
    console.log('🍯 getDisplaySugar отладка:', {
      isEditingProduct,
      fromDashboard,
      actualSugar,
      editedSugars: editedProductData.sugars,
      analysisDataSugars: analysisData?.nutritionInfo?.sugars,
      nutrientsSugar: nutrients.sugar,
      finalResult: fromDashboard && actualSugar ? Math.round(Number(actualSugar)) : result
    });
    
    return result;
  };

  const getDisplayFiber = () => {
    if (isEditingProduct) {
      return editedProductData.fiber || '0';
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualFiber) {
      return Math.round(Number(actualFiber));
    }
    // В режиме просмотра показываем значения из analysisData
    return Math.round(analysisData?.nutritionInfo?.fiber ?? nutrients.fiber);
  };

  const getDisplaySaturatedFat = () => {
    if (isEditingProduct) {
      return editedProductData.saturatedFat || '0';
    }
    // Если это продукт из дашборда, показываем фактически съеденные значения
    if (fromDashboard && actualSaturatedFat) {
      return Number(actualSaturatedFat).toFixed(1);
    }
    // В режиме просмотра показываем значения из analysisData
    return Math.round(analysisData?.nutritionInfo?.saturatedFat ?? 0);
  };

  // Функция для получения отображаемого названия
  const getDisplayName = () => {
    if (isEditingProduct) {
      return editedProductData.name;
    }
    // Безопасно обрабатываем foodName если это объект
    const foodName = analysisData?.foodName;
    if (typeof foodName === 'string') {
      return foodName;
    } else if (foodName && typeof foodName === 'object') {
      return foodName.name || foodName.title || foodName.value || '';
    }
    return productName || '';
  };

  const getDisplayWeight = () => {
    if (isEditingProduct) {
      return editedProductData.weight;
    }
    // Если это продукт из дашборда, вычисляем фактически съеденный вес
    if (fromDashboard && servingMultiplier) {
      const baseWeight = analysisData?.portionInfo?.estimatedWeight || 100;
      const actualWeight = Math.round(baseWeight * Number(servingMultiplier));
      console.log('🔍 getDisplayWeight от дашборда:', { 
        fromDashboard, 
        servingMultiplier, 
        baseWeight, 
        actualWeight 
      });
      return String(actualWeight);
    }
    return String(analysisData?.portionInfo?.estimatedWeight || analysisData?.estimatedWeight || 100);
  };

  const getDisplayPortionDescription = () => {
    // Если это продукт из дашборда, показываем фактически съеденную порцию
    if (fromDashboard && servingMultiplier) {
      const baseWeight = analysisData?.portionInfo?.estimatedWeight || 100;
      const actualWeight = Math.round(baseWeight * Number(servingMultiplier));
      const baseDescription = analysisData?.portionInfo?.description || t('nutrition.portion');
      
      // Если фактический вес отличается от базового, показываем что это измененная порция
      if (Math.abs(actualWeight - baseWeight) > 1) {
        return `${t('nutrition.eatenPortion')} (${actualWeight} ${t('nutrition.gram')})`;
      } else {
        return `${baseDescription} (${actualWeight} ${t('nutrition.gram')})`;
      }
    }
    
    // Оригинальная логика для обычных продуктов
    return analysisData?.portionDescription || 
           (analysisData?.portionInfo?.description ? 
             `${analysisData.portionInfo.description} ${analysisData?.portionInfo?.estimatedWeight ? 
               `(${analysisData.portionInfo.estimatedWeight} ${analysisData.portionInfo.measurementUnit || t('nutrition.gram')})` : 
               `(100 ${t('nutrition.gram')})`}` :
             `${t('nutrition.portion')} (100 ${t('nutrition.gram')})`
           );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: typeof productName === 'string' ? productName : (productName as any)?.name || 'Product',
          headerLeft: () => (
            <TouchableOpacity 
              style={[styles.headerButton, { marginLeft: 8 }]}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={26} color={isDark ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={26} color={isDark ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.mainContainer, isDark && styles.darkContainer]}>
        {/* Фиксированная кнопка назад поверх экрана */}
        <TouchableOpacity 
          style={[styles.backButtonFixed, isDark && styles.backButtonFixedDark]}
          onPress={() => router.back()}
        >
          <View style={[styles.backButtonInner, isDark && styles.backButtonInnerDark]}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
          </View>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {analysisData ? (
            // Display based on analysisData (from n8n or direct scan)
            <View style={styles.analysisContainer}>
              <View style={styles.resultImageContainer}>
                {imageUrl ? (
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.resultImage} 
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.placeholderImage, isDark && styles.darkPlaceholder]}>
                    <Ionicons name="image-outline" size={60} color={isDark ? "#333" : "#DDD"} />
                  </View>
                )}
              </View>
              
              {/* Объединенный блок редактирования продукта */}
              <View style={[
                styles.nutrientCard, 
                isDark && styles.darkCard,
                isEditingProduct && styles.unifiedProductCardEditing
              ]}>
                {/* Иконка редактирования или кнопки управления */}
                {isEditingProduct ? (
                  <View style={styles.editControlButtons}>
                    <TouchableOpacity
                      style={[styles.editButton, isDark && styles.darkEditButton]}
                      onPress={handleSaveEditingProductSilent}
                    >
                      <Ionicons name="checkmark" size={16} color={isDark ? "#888888" : "#666666"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editButton, isDark && styles.darkEditButton]}
                      onPress={handleAIAnalyzeProduct}
                      disabled={isAIAnalyzing}
                    >
                      {isAIAnalyzing ? (
                        <ActivityIndicator size="small" color={isDark ? "#888888" : "#666666"} />
                      ) : (
                        <Ionicons name="sparkles" size={16} color={isDark ? "#888888" : "#666666"} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editButton, isDark && styles.darkEditButton]}
                      onPress={handleCancelEditingProduct}
                    >
                      <Ionicons name="close" size={16} color={isDark ? "#888888" : "#666666"} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.editControlButtons}
                    onPress={handleStartEditingProduct}
                  >
                    <View style={[styles.editButton, isDark && styles.darkEditButton]}>
                      <Ionicons name="pencil" size={16} color={isDark ? "#888888" : "#666666"} />
                    </View>
                  </TouchableOpacity>
                )}

                {/* Название продукта */}
                <View style={styles.productNameSection}>
                  {isEditingProduct ? (
                    <TextInput
                      style={[styles.nameInput, isDark && styles.darkInput]}
                      value={editedProductData.name}
                      onChangeText={(text) => setEditedProductData(prev => ({ ...prev, name: text }))}
                      placeholder="Название продукта"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                  ) : (
                    <Text 
                      style={[styles.foodName, isDark && { color: '#FFF' }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {getDisplayName()}
                    </Text>
                  )}
                </View>

                {/* Описание порции */}
                <View style={[styles.portionContainer, isDark && styles.darkPortionContainer]}>
                  <Text style={[styles.portionText, isDark && styles.darkText]}>
                    {getDisplayPortionDescription()}
                  </Text>
                </View>

                {/* Поле веса */}
                <View style={styles.weightContainer}>
                  <Text style={[styles.weightLabel, isDark && styles.darkText]}>
                    {t('nutrition.estimatedWeight')}:
                  </Text>
                  {isEditingProduct ? (
                    <View style={styles.weightInputContainer}>
                      <TextInput
                        style={[styles.weightInput, isDark && styles.darkInput]}
                        value={editedProductData.weight}
                        onChangeText={handleWeightChange}
                        keyboardType="numeric"
                        placeholder="100"
                        placeholderTextColor={isDark ? '#666' : '#999'}
                      />
                      <Text style={[styles.weightUnit, isDark && styles.darkText]}>{t('nutrition.gram')}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.weightValue, isDark && styles.darkText]}>
                      {getDisplayWeight()} {t('nutrition.gram')}
                    </Text>
                  )}
                </View>

                {/* Заголовок пищевой ценности */}
                <View style={styles.cardHeader}>
                  <Ionicons name="nutrition-outline" size={22} color={isDark ? '#FFFFFF' : '#FF9500'} />
                  <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                    {t('nutrition.nutritionalValue')}
                  </Text>
                </View>

                {/* Нутриенты с возможностью редактирования */}
                {/* Калории */}
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.calories')}:</Text>
                  {isEditingProduct ? (
                    <TextInput
                      style={[styles.nutritionInput, isDark && styles.darkInput]}
                      value={editedProductData.calories}
                      onChangeText={(text) => setEditedProductData(prev => ({ ...prev, calories: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                  ) : (
                    <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                      {getDisplayCalories()} {t('nutrition.kcal')}
                    </Text>
                  )}
                </View>

                {/* Белки */}
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.protein')}:</Text>
                  {isEditingProduct ? (
                    <TextInput
                      style={[styles.nutritionInput, isDark && styles.darkInput]}
                      value={editedProductData.protein}
                      onChangeText={(text) => setEditedProductData(prev => ({ ...prev, protein: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                  ) : (
                    <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                      {getDisplayProtein()} {t('nutrition.gram')}
                    </Text>
                  )}
                </View>

                {/* Жиры */}
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.fats')}:</Text>
                  {isEditingProduct ? (
                    <TextInput
                      style={[styles.nutritionInput, isDark && styles.darkInput]}
                      value={editedProductData.fat}
                      onChangeText={(text) => setEditedProductData(prev => ({ ...prev, fat: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                  ) : (
                    <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                      {getDisplayFat()} {t('nutrition.gram')}
                    </Text>
                  )}
                </View>

                {/* Углеводы */}
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.carbs')}:</Text>
                  {isEditingProduct ? (
                    <TextInput
                      style={[styles.nutritionInput, isDark && styles.darkInput]}
                      value={editedProductData.carbs}
                      onChangeText={(text) => setEditedProductData(prev => ({ ...prev, carbs: text }))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={isDark ? '#666' : '#999'}
                    />
                  ) : (
                    <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                      {getDisplayCarbs()} {t('nutrition.gram')}
                    </Text>
                  )}
                </View>

                {/* Сахара */}
                {(nutrients.sugar > 0 || isEditingProduct) && (
                  <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                    <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.sugars')}:</Text>
                    {isEditingProduct ? (
                      <TextInput
                        style={[styles.nutritionInput, isDark && styles.darkInput]}
                        value={editedProductData.sugars}
                        onChangeText={(text) => setEditedProductData(prev => ({ ...prev, sugars: text }))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={isDark ? '#666' : '#999'}
                      />
                    ) : (
                      <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                        {getDisplaySugar()} {t('nutrition.gram')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Клетчатка */}
                {(nutrients.fiber > 0 || isEditingProduct) && (
                  <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                    <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.fiber')}:</Text>
                    {isEditingProduct ? (
                      <TextInput
                        style={[styles.nutritionInput, isDark && styles.darkInput]}
                        value={editedProductData.fiber}
                        onChangeText={(text) => setEditedProductData(prev => ({ ...prev, fiber: text }))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={isDark ? '#666' : '#999'}
                      />
                    ) : (
                      <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                        {getDisplayFiber()} {t('nutrition.gram')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Насыщенные жиры */}
                {(analysisData?.nutritionInfo?.saturatedFat > 0 || isEditingProduct) && (
                  <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                    <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.saturatedFat')}:</Text>
                    {isEditingProduct ? (
                      <TextInput
                        style={[styles.nutritionInput, isDark && styles.darkInput]}
                        value={editedProductData.saturatedFat}
                        onChangeText={(text) => setEditedProductData(prev => ({ ...prev, saturatedFat: text }))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={isDark ? '#666' : '#999'}
                      />
                    ) : (
                      <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                        {getDisplaySaturatedFat()} {t('nutrition.gram')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Дисклеймер о стандартной порции */}
                <Text style={[styles.disclaimerText, isDark && styles.darkTextSecondary]}>
                  {t('nutrition.disclaimerPortionStandard')}
                </Text>
              </View>
              
              {/* Компонент предупреждения об аллергенах на основе данных из API */}
              {((analysisData?.userContext?.allergenWarnings && analysisData.userContext.allergenWarnings.length > 0) || 
                (analysisData?.allergenAnalysis?.userAllergenWarnings && analysisData.allergenAnalysis.userAllergenWarnings.length > 0)) ? (
                <View style={[styles.allergenWarningContainer, isDark && styles.darkAllergenWarningContainer, {marginTop: 18}]}>
                  <View style={styles.allergenWarningHeader}>
                    <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.allergenWarningTitle}>{t('allergens.warningTitle')}</Text>
                  </View>
                  {/* Проверяем оба возможных места хранения предупреждений */}
                  {analysisData?.userContext?.allergenWarnings && analysisData.userContext.allergenWarnings.map((warning: {message?: string, allergenName?: string, allergenId?: string}, index: number) => (
                    <Text key={`ctx-${index}`} style={styles.allergenWarningText}>
                      • {warning.message || `${t('allergens.contains')} ${warning.allergenName || warning.allergenId}`}
                    </Text>
                  ))}
                  {analysisData?.allergenAnalysis?.userAllergenWarnings && analysisData.allergenAnalysis.userAllergenWarnings.map((warning: {message?: string, allergenName?: string, allergenId?: string}, index: number) => (
                    <Text key={`analysis-${index}`} style={styles.allergenWarningText}>
                      • {warning.message || `${t('allergens.contains')} ${warning.allergenName || warning.allergenId}`}
                    </Text>
                  ))}
                  <Text style={styles.allergenWarningNote}>
                    {t('allergens.notSafeMessage')}
                  </Text>
                </View>
              ) : isAllergic && (
                <View style={[styles.allergenWarningContainer, isDark && styles.darkAllergenWarningContainer]}>
                  <View style={styles.allergenWarningHeader}>
                    <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.allergenWarningTitle}>{t('allergens.warningTitle')}</Text>
                  </View>
                  <Text style={styles.allergenWarningText}>
                    {t('allergens.contains')}: {nutrients.allergens.filter((a: string) => USER_ALLERGENS.includes(a)).join(', ')}
                  </Text>
                </View>
              )}

              {/* Ингредиенты в современном дизайне */}
              {nutrients.ingredients && (
                  <View style={[styles.nutrientCard, isDark && styles.darkCard,{marginTop: 18}]}>
                      <View style={styles.cardHeader}>
                          <Ionicons name="list-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                          <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                              {t('product.ingredients')}
                          </Text>
                      </View>
                      <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                          {nutrients.ingredients}
                      </Text>
                  </View>
              )}
              
              {/* Компонент с общей информацией об аллергенах */}
              {analysisData?.allergenAnalysis?.detectedAllergens && 
               analysisData.allergenAnalysis.detectedAllergens.length > 0 && (
                <View style={[styles.generalAllergenInfoContainer, isDark && styles.darkGeneralAllergenInfoContainer, {marginTop: 18}]}>
                  <View style={styles.generalAllergenInfoHeader}>
                    <Ionicons name="information-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.generalAllergenInfoTitle}>{t('allergens.generalInfoTitle') || 'Allergen Information'}</Text>
                  </View>
                  <Text style={styles.generalAllergenInfoText}>
                    {t('allergens.generalInfoMessage') || 'This product contains the following allergens:'}
                  </Text>
                  <View style={styles.allergensListContainer}>
                    {analysisData.allergenAnalysis.detectedAllergens
                      .filter((allergen: any) => 
                        // Фильтруем, показываем только аллергены, которые не вызвали предупреждения для пользователя
                        !analysisData?.userContext?.allergenWarnings?.some(
                          (warning: any) => warning.allergenId === allergen.allergenId
                        )
                      )
                      .map((allergen: any, index: number) => {
                        const allergenName = typeof allergen.name === 'string' ? allergen.name : 
                          (allergen.name?.name || allergen.name?.title || 'Unknown allergen');
                        const sourceIngredient = typeof allergen.sourceIngredient === 'string' ? allergen.sourceIngredient :
                          (allergen.sourceIngredient?.name || allergen.sourceIngredient?.title || '');
                        return (
                          <Text key={index} style={styles.generalAllergenInfoText}>
                            • {allergenName} {sourceIngredient ? 
                              `(${t('allergens.foundIn') || 'found in'} ${sourceIngredient})` : ''}
                          </Text>
                        );
                      })}
                  </View>
                </View>
              )}
              
              {/* особенности продукта - Компонент с информацией о возможных проблемах со здоровьем */}
              {((analysisData?.analysis?.healthConcerns && 
                analysisData.analysis.healthConcerns.length > 0) || 
                (analysisData?.analysis?.healthBenefits && 
                analysisData.analysis.healthBenefits.length > 0)) && (
                <View style={[styles.nutrientCard, isDark && styles.darkCard, {marginTop: 18}]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="information-circle-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                    <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                      {t('product.productFeatures')}
                    </Text>
                  </View>
                  <View style={styles.allergensListContainer}>
                    {analysisData?.analysis?.healthConcerns?.map((concern: any, index: number) => {
                      console.log(`Health Concern ${index}:`, concern);
                      return (
                        <View key={`concern-${index}`} style={styles.featureItem}>
                          <Ionicons name="alert-outline" size={16} color={isDark ? '#FF6B6B' : '#FF4040'} style={{marginRight: 6}} />
                          <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                            {typeof concern === 'string' ? concern : concern?.name || concern?.description || 'Unknown concern'}
                          </Text>
                        </View>
                      );
                    })}
                    
                    {analysisData?.analysis?.healthBenefits?.map((benefit: any, index: number) => {
                      console.log(`Health Benefit ${index}:`, benefit);
                      return (
                        <View key={`benefit-${index}`} style={styles.featureItem}>
                          <Ionicons name="checkmark-circle-outline" size={16} color={isDark ? '#06D6A0' : '#00A36C'} style={{marginRight: 6}} />
                          <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                            {typeof benefit === 'string' ? benefit : benefit?.name || benefit?.description || 'Unknown benefit'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
              

              {/* Витамины в современном минималистичном дизайне */}
              {nutrients.vitamins && nutrients.vitamins.length > 0 && (
                  <View style={[styles.nutrientCard, isDark && styles.darkCard,{marginTop: 18}]}>
                      <View style={styles.cardHeader}>
                          <Ionicons name="medical-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                          <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                              {t('product.vitamins')}
                          </Text>
                      </View>
                      <View style={styles.vitaminContainer}>
                          {nutrients.vitamins.map((vitamin: any, index: number) => (
                              <View key={index} style={styles.vitaminBadge}>
                                  <Text style={[styles.vitaminBadgeText, isDark && styles.darkVitaminText]}>
                                    {typeof vitamin === 'string' ? vitamin : vitamin?.name || vitamin?.title || 'Unknown vitamin'}
                                  </Text>
                              </View>
                          ))}
                      </View>
                  </View>
              )}
              
              {nutrients.allergens && nutrients.allergens.length > 0 && !isAllergic && (
                   <View style={[styles.nutrientCard, isDark && styles.darkCard]}>
                      <View style={styles.cardHeader}>
                          <Ionicons name="alert-circle-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                          <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>{t('allergens.title')}</Text>
                      </View>
                      <View style={styles.allergensListContainer}>
                        {nutrients.allergens.map((allergen: any, index: number) => {
                          const allergenName = typeof allergen === 'string' ? allergen : allergen?.name || allergen?.title || 'Unknown allergen';
                          return (
                            <View 
                              key={index} 
                              style={[
                                styles.allergenItem, 
                                USER_ALLERGENS.includes(allergenName) && styles.dangerAllergen
                              ]}
                            >     
                              <Ionicons 
                                name={USER_ALLERGENS.includes(allergenName) ? "warning-outline" : "information-circle-outline"} 
                                size={14} 
                                color={USER_ALLERGENS.includes(allergenName) ? "#F44336" : "#FF9800"} 
                                style={{marginRight: 4}} 
                              />
                              <Text 
                                style={[
                                  styles.allergenName, 
                                  USER_ALLERGENS.includes(allergenName) && styles.dangerAllergenText
                                ]}
                              >
                                {allergenName}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
              )}

              {/* Восстановленная Оценка и Рекомендации */}
              {analysisData?.analysis?.overallHealthScore && (
                  <View style={styles.scoreContainer}>
                      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                          {t('nutrition.overallHealthScore')}:{' '}
                          <Text style={styles.calorieValue}> 
                              {analysisData.analysis.overallHealthScore}/100
                          </Text>
                      </Text>
                  </View>
              )}
              
              {analysisData.recommendedIntake && (
                <View style={[styles.nutrientCard, isDark && styles.darkCard, {marginTop: 18}]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="information-circle-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                    <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                      {t('nutrition.recommendations')}
                    </Text>
                  </View>
                  <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                    {analysisData.recommendedIntake.description}
                  </Text>
                  {analysisData.recommendedIntake.maxFrequency && (
                    <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary, {marginTop: 8}]}>
                      <Text style={{fontWeight: '500'}}>{t('nutrition.frequency')}:</Text> {analysisData.recommendedIntake.maxFrequency}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            // Fallback display (similar to original, using MOCK_NUTRIENTS or params if !isRealData)
            <View style={styles.analysisContainer}>
              <View style={styles.imageContainer}>
                {imageUrl ? (
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.productImage} 
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.placeholderImage, isDark && styles.darkPlaceholder]}>
                    <Ionicons name="image-outline" size={60} color={isDark ? "#333" : "#DDD"} />
                  </View>
                )}
              </View>
              
              <Text 
                style={styles.foodName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {typeof productName === 'string' ? productName : (productName as any)?.name || (productName as any)?.title || 'Unknown product'}
              </Text>
              
              <View style={styles.portionContainer}>
                <Text style={[styles.portionText, isDark && styles.darkText]}>
                  {getDisplayPortionDescription()}
                </Text>
              </View>
              <View style={styles.nutrientCard}>
                <View style={styles.calorieSection}>
                  <Text style={styles.calorieTitle}>{t('product.calories')}</Text>
                  <Text style={styles.calorieValue}>{getDisplayCalories()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t('product.protein')}</Text>
                  <Text style={styles.nutritionValue}>{getDisplayProtein()}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t('product.fat')}</Text>
                  <Text style={styles.nutritionValue}>{getDisplayFat()}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t('product.carbs')}</Text>
                  <Text style={styles.nutritionValue}>{getDisplayCarbs()}</Text>
                </View>
              </View>
              {isAllergic && (
                <View style={[styles.allergenWarningContainer, isDark && styles.darkAllergenWarningContainer]}>
                  <View style={styles.allergenWarningHeader}>
                    <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.allergenWarningTitle}>{t('allergens.warningTitle')}</Text>
                  </View>
                  <Text style={styles.allergenWarningText}>
                    {t('allergens.contains')}: {nutrients.allergens.filter((a: string) => USER_ALLERGENS.includes(a)).join(', ')}
                  </Text>
                </View>
              )}
              
              {/* БЕЗОПАСНЫЙ FALLBACK РЕНДЕР - только если нет современного дизайна */}
              {!analysisData && (
                <View style={styles.infoCard}>
                  <Text style={styles.ingredientsText}>{t('product.ingredients') || 'Ingredients'}</Text>
                  
                  {/* Безопасный рендер витаминов */}
                  {nutrients.vitamins && Array.isArray(nutrients.vitamins) && nutrients.vitamins.length > 0 && (
                    <View style={styles.vitaminsList}>
                      {nutrients.vitamins.map((vitamin: any, index: number) => {
                        // Двойная защита от объектов
                        let vitaminText = 'Unknown vitamin';
                        if (typeof vitamin === 'string') {
                          vitaminText = vitamin;
                        } else if (vitamin && typeof vitamin === 'object') {
                          vitaminText = vitamin.name || vitamin.title || vitamin.value || 'Unknown vitamin';
                        }
                        
                        return (
                          <View key={`fallback-vitamin-${index}`} style={styles.vitaminItem}>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                            <Text style={[styles.vitaminName, isDark && styles.darkText]}>
                              {String(vitaminText)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                  
                  {/* Безопасный рендер аллергенов */}
                  {nutrients.allergens && Array.isArray(nutrients.allergens) && nutrients.allergens.length > 0 && (
                    <View style={styles.allergensListContainer}>
                      {nutrients.allergens.map((allergen: any, index: number) => {
                        // Двойная защита от объектов
                        let allergenText = 'Unknown allergen';
                        if (typeof allergen === 'string') {
                          allergenText = allergen;
                        } else if (allergen && typeof allergen === 'object') {
                          allergenText = allergen.name || allergen.title || allergen.value || 'Unknown allergen';
                        }
                        
                        const allergenName = String(allergenText);
                        return (
                          <View key={`fallback-allergen-${index}`} style={styles.allergenItem}>
                            <Ionicons 
                              name={USER_ALLERGENS.includes(allergenName) ? "alert-circle-outline" : "information-circle-outline"} 
                              size={16} 
                              color={USER_ALLERGENS.includes(allergenName) ? "#FF6B6B" : "#999999"} 
                            />
                            <Text style={[styles.allergenName, isDark && styles.darkText]}>
                              {allergenName}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
              {(scanDate || date) && (
                <View style={[styles.scanInfoContainerBottom, isDark && styles.darkScanInfoContainer]}>
                  <Text style={[styles.scanDateText, isDark && styles.darkText]}>
                    {scanDate && date ? `${scanDate} • ${date}` : scanDate || date}
                  </Text>
                </View>
              )}
            </View>
          )}
            
          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={[styles.fixedButtonContainer, isDark && styles.darkFixedButtonContainer]}>
          <TouchableOpacity 
            style={styles.photoButton}
            onPress={() => router.push('/scan')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name="camera-outline" size={22} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>{t('tabs.scan')}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setModalVisible(true); // Show modal
            }}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Ionicons name="add-outline" size={22} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={{color: '#FFFFFF', fontSize: 16, fontWeight: '600'}}>{t('product.add')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* u0418u0441u043fu0440u0430u043du0438u044f u043fu043eu0440u044fu0434u043eu043a u043eu0431u044au044fu0432u043bu0435u043du0438u044f u0444u0443u043du043au0446u0438u0438 u0438 u0434u043eu0431u0430u0432u043bu044fu044u043eu0434u043eu043a u0438u043cu043fu043eu0440u0442 u043au043eu043cu043fu043eu043du0435u043du0442u0430 */}
      <PortionSizeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handlePortionConfirm}
        productName={typeof productName === 'string' ? productName : (productName as any)?.name || 'Product'}
      />
     {/* Функция для добавления продукта в дневную статистику */}
    </>
  );
  

}

const styles = StyleSheet.create({
    // Основные стили контейнеров
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA', 
  },
  darkContainer: {
    backgroundColor: '#121212', 
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40, 
  },
  safeTopArea: {
    height: 50,
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 54,
    zIndex: 20,
  },
  backButtonFixed: {
    position: 'absolute',
    left: 20,
    top: 60,
    zIndex: 100,
  },
  backButtonFixedDark: {
    // Dark mode styles if needed
  },
  backButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  backButtonInnerDark: {
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
  },
  bottomPadding: {
    height: 80, 
  },
  imageContainer: {
    width: '100%',
    height: 250, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
  },
  darkPlaceholder: {
    backgroundColor: '#2C2C2E',
  },
  analysisContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 56,
  },
  resultImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#e0e0e0', 
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
    letterSpacing: -0.5,
    paddingHorizontal: 10,
  },
  portionContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  darkPortionContainer: {
    backgroundColor: '#333333', // Темный фон для темной темы
  },
  portionText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  // Новый стиль для карточек с нутриентами
  nutrientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Убрали elevation полностью
    borderWidth: 1, // Добавили тонкую рамку вместо тени
    borderColor: '#d8d8d8', // Сделали рамку темнее для лучшей видимости
  },
  darkCard: {
    backgroundColor: 'transparent', // Убрали фон для минимализма
    borderColor: '#4a4a4c', // Сделали рамку заметнее для темной темы
  },
  darkText: {
    color: '#FFFFFF', 
  },
  darkTextSecondary: {
    color: '#AEAEB2', 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Уменьшили с 14 до 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  sectionTitleWithIcon: {
    marginLeft: 8,
    marginBottom: 0,
  },
  calorieSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieTitle: {
    fontSize: 16,
    color: '#555555',
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4, // Уменьшили с 8 до 4
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 6, // Уменьшили с 10 до 6
  },
  darkNutritionItem: {
    borderBottomColor: '#2A2A2A',
  },
  nutritionLabel: {
    fontSize: 15, // Уменьшили с 16 до 15
    color: '#555',
  },
  nutritionValue: {
    fontSize: 15, // Уменьшили с 16 до 15
    fontWeight: '600',
    color: '#333',
    marginLeft: 8, // Добавили отступ слева
  },
  // Стили для витаминов
  vitaminContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8, // Уменьшили с 12 до 8
    justifyContent: 'flex-start', // Выравнивание по левому краю для единообразия
  },
  vitaminBadge: {
    backgroundColor: 'transparent', // Убрали фон для минимализма
    borderRadius: 16, // Уменьшили радиус
    paddingVertical: 5, // Уменьшили отступы
    paddingHorizontal: 10, // Уменьшили отступы
    margin: 4, // Уменьшили маржин
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent', // Убрали тень
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Убрали элевацию
    minWidth: 40, // Уменьшили минимальную ширину
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  vitaminBadgeText: {
    color: '#2E7D32',
    fontSize: 14, // Уменьшили с 16 до 14
    fontWeight: '500', // Уменьшили вес шрифта
    textAlign: 'center',
  },
  darkVitaminText: {
    color: '#81C784',
  },
  // Стили для аллергенов
  allergensList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Убрали фон
    borderRadius: 16, // Уменьшили радиус
    paddingVertical: 5, // Уменьшили отступы
    paddingHorizontal: 10, // Уменьшили отступы
    margin: 4,
    shadowColor: 'transparent', // Убрали тень
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Убрали элевацию
    borderWidth: 1, // Добавили рамку вместо фона
    borderColor: '#FFCC80', // Цвет рамки для аллергенов
  },
  allergenName: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerAllergen: {
    backgroundColor: '#FFEBEE',
  },
  dangerAllergenText: {
    color: '#F44336',
  },
  // Стили для предупреждений
  allergenWarningContainer: {
    marginTop: 0,
    backgroundColor: '#FFF3F3', // Светло-красный фон
    borderWidth: 1,
    borderColor: '#FF6B6B', // Красная рамка
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 0,
  },
  darkAllergenWarningContainer: {
    backgroundColor: '#3B1F1F', // Темный красноватый фон для темной темы
    borderColor: '#8B3A3A', // Темно-красная рамка
  },
  allergenWarningHeader: {
    backgroundColor: '#D32F2F', 
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenWarningTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  allergenWarningText: {
    color: '#D32F2F',
    fontSize: 15,
    lineHeight: 20,
    marginHorizontal: 12,
    marginTop: 8,
  },
  allergenWarningNote: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
    marginHorizontal: 12,
    marginVertical: 10,
  },
  // Стили для общей информации об аллергенах (желтый блок)
  generalAllergenInfoContainer: {
    backgroundColor: '#FFF8E1', // Светло-желтый фон
    borderWidth: 1,
    borderColor: '#F5B041', // Желтая/оранжевая рамка
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 0,
    marginTop: 18,
  },
  darkGeneralAllergenInfoContainer: {
    backgroundColor: '#332A1A', // Темный желтоватый фон для темной темы
    borderColor: '#8B6E23', // Темно-желтая рамка
  },
  generalAllergenInfoHeader: {
    backgroundColor: '#F5B041', // Оранжево-желтая шапка
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  generalAllergenInfoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  generalAllergenInfoText: {
    color: '#AA6D10', // Коричнево-оранжевый текст
    fontSize: 15,
    lineHeight: 20,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  allergensListContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 2,
  },
  // Стили для ингредиентов
  ingredientsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    fontWeight: '400',
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#777777',
    marginTop: 12,
    marginBottom: 8,
    fontStyle: 'italic',
    paddingHorizontal: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  vitaminsList: {
    marginTop: 8,
  },
  vitaminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  vitaminName: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333333',
  },
  noAllergens: {
    fontSize: 14,
    color: '#777777',
    fontStyle: 'italic',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16, 
    paddingBottom: 26, 
    backgroundColor: 'rgba(248, 248, 248, 0.95)', 
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  darkFixedButtonContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)', 
    borderTopColor: '#3A3A3C',
    paddingBottom: 26, 
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d', 
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 8, 
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff', 
    paddingVertical: 14,
    borderRadius: 8,
    marginLeft: 8, 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    padding: 8
  },
  vitaminCard: {
    marginTop: 16,
  },
  scoreContainer: {
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingBottom: 16, 
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 8,
  },
  recommendationFrequency: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  scanInfoContainerBottom: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop:16,
  },
  darkScanInfoContainer: {
    borderTopColor: '#3A3A3C',
  },
  scanDateText: {
    fontSize: 13,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  darkModalView: {
    backgroundColor: '#1C1C1E',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    width: '100%',
    textAlign: 'center',
    color: '#000',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    color: '#333',
    width: '100%',
  },
  optionsList: {
    width: '100%',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginBottom: 6,
  },
  darkOptionItem: {
    backgroundColor: '#1C1C1E',
    borderColor: '#333333',
  },
  selectedOptionItem: {
    borderColor: '#007AFF',
  },
  darkSelectedOption: {
    backgroundColor: '#0A84FF', 
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '400',
  },
  darkRadioButton: {
    borderColor: '#444444',
    backgroundColor: '#2C2C2E',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  darkSelectedOptionItem: {
    borderColor: '#0A84FF',
  },
  confirmButton: {
    backgroundColor: '#34C759', // Зеленая кнопка подтверждения
  },
  aiButton: {
    backgroundColor: '#FF9500', // Оранжевая AI кнопка  
  },
  cancelButton: {
    backgroundColor: '#FF3B30', // Красная кнопка отмены
  },
  productNameSection: {
    marginBottom: 12,
    paddingTop: 14, // Отступ сверху чтобы не накладывалось на кнопки
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  darkInput: {
    color: '#FFFFFF',
    borderBottomColor: '#444444',
    backgroundColor: 'transparent',
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 10,
    paddingVertical: 8,
  },
  weightLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    fontSize: 16,
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  weightUnit: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 4,
  },
  weightValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  nutritionInput: {
    fontSize: 16,
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 60,
    textAlign: 'right',
  },
  
  // Стили для объединенного блока редактирования
  unifiedProductCardEditing: {
    borderWidth: 2, // Толстая рамка как на главном экране
    borderColor: '#007AFF',
  },
  editControlButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Кнопки справа
    alignItems: 'center',
    marginBottom: 8,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  editButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    marginLeft: 8,
  },
  darkEditButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
});