import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import PortionSizeModal, { PortionData } from '../../components/PortionSizeModal';
import { useTranslation } from '../../i18n/i18n';
import { addProductToDay } from '../../services/dailyNutrition';
import { getScanById } from '../../services/scanHistory';
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
    fullData: fullDataString 
  } = params;
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false); // Состояние загрузки при добавлении продукта

  // Обработчик подтверждения выбора размера порции и добавок
  const handlePortionConfirm = async (portionData: PortionData) => {
    try {
      setIsAdding(true);
      
      // Получаем актуальные данные о продукте из истории сканирований
      const productData = await getScanById(id as string);
      
      if (!productData) {
        console.error('Не удалось найти продукт');
        Alert.alert('Ошибка', 'Не удалось найти продукт');
        setIsAdding(false);
        setModalVisible(false);
        return;
      }
      
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
        case 'half':
          quantityMultiplier = 0.5;
          break;
        case 'quarter':
          quantityMultiplier = 0.25;
          break;
      }
      
      // Общий коэффициент (порция * количество * кол-во единиц)
      const totalMultiplier = portionMultiplier * quantityMultiplier * portionData.quantity;
      
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
      }
      
      // Добавляем продукт в дневную статистику
      await addProductToDay(productWithAddons, totalMultiplier);
      
      // Показываем уведомление об успешном добавлении
      Alert.alert(
        t('common.success'), 
        t('common.foodAddedToJournal', { foodName: productName }),
        [
          {
            text: 'OK',
            onPress: () => {
              // Переход на дашборд после добавления продукта
              router.push('/(tabs)/main01');
            }
          }
        ]
      );
      
      // Закрываем модальное окно
      setModalVisible(false);
    } catch (error) {
      console.error('Ошибка при добавлении продукта:', error);
      Alert.alert('Ошибка', 'Не удалось добавить продукт в дневник');
    } finally {
      setIsAdding(false);
    }
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

  let parsedAnalysisData: any = null; 
  try {
    if (fullDataString) {
      // Используем безопасное декодирование
      const rawFullData = safeDecodeURIComponent(fullDataString as string);
      try {
        const tempParsedFullData = JSON.parse(rawFullData);
        if (tempParsedFullData && tempParsedFullData.foodData) {
          parsedAnalysisData = tempParsedFullData.foodData;
        }
      } catch (parseError) {
        console.error('Ошибка при парсинге JSON после декодирования:', parseError);
      }
    }
    if (!parsedAnalysisData && analysisDataString) {
      parsedAnalysisData = JSON.parse(analysisDataString as string);
    }
  } catch (error) {
    console.error('Error parsing analysis data:', error);
  }

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRealData = useRealData === 'true';

  const [nutrients, setNutrients] = useState(() => {
    if (isRealData && parsedAnalysisData) {
        const currentAllergens = Array.isArray(parsedAnalysisData.allergens) 
            ? parsedAnalysisData.allergens 
            : [];
        const currentVitamins = (parsedAnalysisData.nutritionInfo && Array.isArray(parsedAnalysisData.nutritionInfo.vitamins)) 
            ? parsedAnalysisData.nutritionInfo.vitamins 
            : [];
        
        if (!Array.isArray(parsedAnalysisData.allergens) && parsedAnalysisData.allergens) {
            console.warn('[ProductDetailScreen] parsedAnalysisData.allergens was truthy but not an array:', parsedAnalysisData.allergens);
        }
        if (parsedAnalysisData.nutritionInfo && !Array.isArray(parsedAnalysisData.nutritionInfo.vitamins) && parsedAnalysisData.nutritionInfo.vitamins) {
            console.warn('[ProductDetailScreen] parsedAnalysisData.nutritionInfo.vitamins was truthy but not an array:', parsedAnalysisData.nutritionInfo.vitamins);
        }

        // Обработка ингредиентов - поддержка как нового (массив объектов), так и старого (строка) формата
        let processedIngredients = '';
        if (parsedAnalysisData.ingredients) {
            if (Array.isArray(parsedAnalysisData.ingredients)) {
                // Новый формат: массив объектов {name: string}
                processedIngredients = parsedAnalysisData.ingredients
                    .map((item: any) => item && typeof item === 'object' && item.name ? item.name : item)
                    .filter(Boolean)
                    .join(', ');
            } else if (typeof parsedAnalysisData.ingredients === 'string') {
                // Старый формат: строка
                processedIngredients = parsedAnalysisData.ingredients;
            }
        }
        
        return {
            carbs: (parsedAnalysisData.nutritionInfo && parsedAnalysisData.nutritionInfo.carbs) || parseInt(carbsParam as string) || 0,
            fat: (parsedAnalysisData.nutritionInfo && parsedAnalysisData.nutritionInfo.fat) || parseInt(fatParam as string) || 0,
            protein: (parsedAnalysisData.nutritionInfo && parsedAnalysisData.nutritionInfo.protein) || parseInt(proteinParam as string) || 0,
            fiber: (parsedAnalysisData.nutritionInfo && parsedAnalysisData.nutritionInfo.fiber) || 0,
            sugar: (parsedAnalysisData.nutritionInfo && parsedAnalysisData.nutritionInfo.sugars) || 0, 
            calcium: (parsedAnalysisData.nutritionInfo && parsedAnalysisData.nutritionInfo.calcium) || 0,
            vitamins: currentVitamins,
            ingredients: processedIngredients,
            allergens: currentAllergens,
        };
    } else if (isRealData) { // parsedAnalysisData is falsy
        return {
            carbs: parseInt(carbsParam as string) || 0,
            fat: parseInt(fatParam as string) || 0,
            protein: parseInt(proteinParam as string) || 0,
            fiber: 0, sugar: 0, calcium: 0, vitamins: [], ingredients: '', allergens: []
        };
    } else { // not isRealData
        return MOCK_NUTRIENTS;
    }
  });

  const [isAllergic, setIsAllergic] = useState(false);

  useEffect(() => {
    // Отладочное логирование для аллергенов
    console.log('Данные аллергенов:', {
      userContextIsSafe: parsedAnalysisData?.userContext?.isSafeForUser,
      allergenAnalysisIsSafe: parsedAnalysisData?.allergenAnalysis?.isSafeForUser,
      userContextWarnings: parsedAnalysisData?.userContext?.allergenWarnings,
      allergenAnalysisWarnings: parsedAnalysisData?.allergenAnalysis?.userAllergenWarnings,
      detectedAllergens: parsedAnalysisData?.allergenAnalysis?.detectedAllergens,
    });

    // Проверяем аллерген по данным из API или по локальным данным, если API данных нет
    if (parsedAnalysisData?.userContext?.isSafeForUser === false || parsedAnalysisData?.allergenAnalysis?.isSafeForUser === false) {
      // Если API явно указывает, что продукт небезопасен
      console.log('Продукт отмечен как небезопасный (isSafeForUser: false)');  
      setIsAllergic(true);
    } else if (
      // Проверяем предупреждения в userContext (новый формат)
      (parsedAnalysisData?.userContext?.allergenWarnings && 
       Array.isArray(parsedAnalysisData.userContext.allergenWarnings) && 
       parsedAnalysisData.userContext.allergenWarnings.length > 0) ||
      // Проверяем предупреждения в allergenAnalysis (старый формат)
      (parsedAnalysisData?.allergenAnalysis?.userAllergenWarnings && 
       Array.isArray(parsedAnalysisData.allergenAnalysis.userAllergenWarnings) && 
       parsedAnalysisData.allergenAnalysis.userAllergenWarnings.length > 0)
    ) {
      // Если есть предупреждения об аллергенах
      console.log('Найдены предупреждения об аллергенах:', 
        parsedAnalysisData?.userContext?.allergenWarnings || 
        parsedAnalysisData?.allergenAnalysis?.userAllergenWarnings
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

  const displayCalories = parsedAnalysisData?.nutritionInfo?.calories ?? calories;
  // Use nutrients state for display as it reflects the single source of truth after initialization
  const displayProtein = nutrients.protein;
  const displayFat = nutrients.fat;
  const displayCarbs = nutrients.carbs;

  return (
    <>
      <Stack.Screen
        options={{
          title: productName as string,
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
          {parsedAnalysisData ? (
            // Display based on parsedAnalysisData (from n8n or direct scan)
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
              
              <Text 
                style={[styles.foodName, isDark && { color: '#FFF' }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {parsedAnalysisData.foodName || productName}
              </Text>
              
              <View style={[styles.portionContainer, isDark && styles.darkPortionContainer]}>
                <Text style={[styles.portionText, isDark && styles.darkText]}>
                  {parsedAnalysisData?.portionDescription || 
                   (parsedAnalysisData?.portionInfo?.description ? 
                     `${parsedAnalysisData.portionInfo.description} ${parsedAnalysisData?.portionInfo?.estimatedWeight ? 
                       `(${parsedAnalysisData.portionInfo.estimatedWeight} ${parsedAnalysisData.portionInfo.measurementUnit || t('nutrition.gram')})` : 
                       `(100 ${t('nutrition.gram')})`}` :
                     `${t('nutrition.portion')} (100 ${t('nutrition.gram')})`
                   )
                  }
                </Text>
              </View>
              
              {/* Компонент предупреждения об аллергенах на основе данных из API */}
              {((parsedAnalysisData?.userContext?.allergenWarnings && parsedAnalysisData.userContext.allergenWarnings.length > 0) || 
                (parsedAnalysisData?.allergenAnalysis?.userAllergenWarnings && parsedAnalysisData.allergenAnalysis.userAllergenWarnings.length > 0)) ? (
                <View style={[styles.allergenWarningContainer, isDark && styles.darkAllergenWarningContainer, {marginTop: 18}]}>
                  <View style={styles.allergenWarningHeader}>
                    <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.allergenWarningTitle}>{t('allergens.warningTitle')}</Text>
                  </View>
                  {/* Проверяем оба возможных места хранения предупреждений */}
                  {parsedAnalysisData?.userContext?.allergenWarnings && parsedAnalysisData.userContext.allergenWarnings.map((warning: {message?: string, allergenName?: string, allergenId?: string}, index: number) => (
                    <Text key={`ctx-${index}`} style={styles.allergenWarningText}>
                      • {warning.message || `${t('allergens.contains')} ${warning.allergenName || warning.allergenId}`}
                    </Text>
                  ))}
                  {parsedAnalysisData?.allergenAnalysis?.userAllergenWarnings && parsedAnalysisData.allergenAnalysis.userAllergenWarnings.map((warning: {message?: string, allergenName?: string, allergenId?: string}, index: number) => (
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

              <View style={[styles.nutrientCard, isDark && styles.darkCard,{marginTop: 18}]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="nutrition-outline" size={22} color={isDark ? '#FFFFFF' : '#FF9500'} />
                  <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                    {t('nutrition.nutritionalValue')}
                  </Text>
                </View>
                
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.calories')}:</Text>
                <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                  {displayCalories} {t('nutrition.kcal')}
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.protein')}:</Text>
                <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                  {displayProtein} {t('nutrition.gram')}
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.fats')}:</Text>
                <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                  {displayFat} {t('nutrition.gram')}
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.carbs')}:</Text>
                <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                  {displayCarbs} {t('nutrition.gram')}
                </Text>
              </View>
              {/* Все нутриенты отображаем в унифицированном виде */}
              {nutrients.sugar > 0 && (
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.sugars')}:</Text>
                  <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                    {Math.round(nutrients.sugar)} {t('nutrition.gram')}
                  </Text>
                </View>
              )}
              {nutrients.fiber > 0 && (
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.fiber')}:</Text>
                  <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                    {Math.round(nutrients.fiber)} {t('nutrition.gram')}
                  </Text>
                </View>
              )}
              {parsedAnalysisData?.nutritionInfo?.saturatedFat > 0 && (
                <View style={[styles.nutritionItem, isDark && styles.darkNutritionItem]}>
                  <Text style={[styles.nutritionLabel, isDark && styles.darkText]}>{t('nutrition.saturatedFat')}:</Text>
                  <Text style={[styles.nutritionValue, isDark && styles.darkText]}>
                    {Math.round(parsedAnalysisData.nutritionInfo.saturatedFat)} {t('nutrition.gram')}
                  </Text>
                </View>
              )}
              
              {/* Дисклеймер о стандартной порции */}
              <Text style={[styles.disclaimerText, isDark && styles.darkTextSecondary]}>
                {t('nutrition.disclaimerPortionStandard')}
              </Text>
              </View>
              
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
              {parsedAnalysisData?.allergenAnalysis?.detectedAllergens && 
               parsedAnalysisData.allergenAnalysis.detectedAllergens.length > 0 && (
                <View style={[styles.generalAllergenInfoContainer, isDark && styles.darkGeneralAllergenInfoContainer, {marginTop: 18}]}>
                  <View style={styles.generalAllergenInfoHeader}>
                    <Ionicons name="information-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.generalAllergenInfoTitle}>{t('allergens.generalInfoTitle') || 'Allergen Information'}</Text>
                  </View>
                  <Text style={styles.generalAllergenInfoText}>
                    {t('allergens.generalInfoMessage') || 'This product contains the following allergens:'}
                  </Text>
                  <View style={styles.allergensListContainer}>
                    {parsedAnalysisData.allergenAnalysis.detectedAllergens
                      .filter((allergen: any) => 
                        // Фильтруем, показываем только аллергены, которые не вызвали предупреждения для пользователя
                        !parsedAnalysisData?.userContext?.allergenWarnings?.some(
                          (warning: any) => warning.allergenId === allergen.allergenId
                        )
                      )
                      .map((allergen: any, index: number) => (
                        <Text key={index} style={styles.generalAllergenInfoText}>
                          • {allergen.name} {allergen.sourceIngredient ? 
                            `(${t('allergens.foundIn') || 'found in'} ${allergen.sourceIngredient})` : ''}
                        </Text>
                      ))}
                  </View>
                </View>
              )}
              
              {/* особенности продукта - Компонент с информацией о возможных проблемах со здоровьем */}
              {((parsedAnalysisData?.analysis?.healthConcerns && 
                parsedAnalysisData.analysis.healthConcerns.length > 0) || 
                (parsedAnalysisData?.analysis?.healthBenefits && 
                parsedAnalysisData.analysis.healthBenefits.length > 0)) && (
                <View style={[styles.nutrientCard, isDark && styles.darkCard, {marginTop: 18}]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="information-circle-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                    <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                      {t('product.productFeatures')}
                    </Text>
                  </View>
                  <View style={styles.allergensListContainer}>
                    {parsedAnalysisData?.analysis?.healthConcerns?.map((concern: string, index: number) => {
                      console.log(`Health Concern ${index}:`, concern);
                      return (
                        <View key={`concern-${index}`} style={styles.featureItem}>
                          <Ionicons name="alert-outline" size={16} color={isDark ? '#FF6B6B' : '#FF4040'} style={{marginRight: 6}} />
                          <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                            {concern}
                          </Text>
                        </View>
                      );
                    })}
                    
                    {parsedAnalysisData?.analysis?.healthBenefits?.map((benefit: string, index: number) => {
                      console.log(`Health Benefit ${index}:`, benefit);
                      return (
                        <View key={`benefit-${index}`} style={styles.featureItem}>
                          <Ionicons name="checkmark-circle-outline" size={16} color={isDark ? '#06D6A0' : '#00A36C'} style={{marginRight: 6}} />
                          <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                            {benefit}
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
                          {nutrients.vitamins.map((vitamin: string, index: number) => (
                              <View key={index} style={styles.vitaminBadge}>
                                  <Text style={[styles.vitaminBadgeText, isDark && styles.darkVitaminText]}>{vitamin}</Text>
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
                        {nutrients.allergens.map((allergen: string, index: number) => (
                          <View 
                            key={index} 
                            style={[
                              styles.allergenItem, 
                              USER_ALLERGENS.includes(allergen) && styles.dangerAllergen
                            ]}
                          >     
                            <Ionicons 
                              name={USER_ALLERGENS.includes(allergen) ? "warning-outline" : "information-circle-outline"} 
                              size={14} 
                              color={USER_ALLERGENS.includes(allergen) ? "#F44336" : "#FF9800"} 
                              style={{marginRight: 4}} 
                            />
                            <Text 
                              style={[
                                styles.allergenName, 
                                USER_ALLERGENS.includes(allergen) && styles.dangerAllergenText
                              ]}
                            >
                              {allergen}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
              )}

              {/* Восстановленная Оценка и Рекомендации */}
              {parsedAnalysisData?.analysis?.overallHealthScore && (
                  <View style={styles.scoreContainer}>
                      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                          {t('nutrition.overallHealthScore')}:{' '}
                          <Text style={styles.calorieValue}> 
                              {parsedAnalysisData.analysis.overallHealthScore}/100
                          </Text>
                      </Text>
                  </View>
              )}
              
              {parsedAnalysisData.recommendedIntake && (
                <View style={[styles.nutrientCard, isDark && styles.darkCard, {marginTop: 18}]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="information-circle-outline" size={22} color={isDark ? '#FFFFFF' : '#333333'} />
                    <Text style={[styles.sectionTitle, isDark && styles.darkText, styles.sectionTitleWithIcon]}>
                      {t('nutrition.recommendations')}
                    </Text>
                  </View>
                  <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary]}>
                    {parsedAnalysisData.recommendedIntake.description}
                  </Text>
                  {parsedAnalysisData.recommendedIntake.maxFrequency && (
                    <Text style={[styles.ingredientsText, isDark && styles.darkTextSecondary, {marginTop: 8}]}>
                      <Text style={{fontWeight: '500'}}>{t('nutrition.frequency')}:</Text> {parsedAnalysisData.recommendedIntake.maxFrequency}
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
                {productName}
              </Text>
              
              <View style={styles.portionContainer}>
                <Text style={styles.portionText}>{t('product.portion')}</Text>
              </View>
              <View style={styles.nutrientCard}>
                <View style={styles.calorieSection}>
                  <Text style={styles.calorieTitle}>{t('product.calories')}</Text>
                  <Text style={styles.calorieValue}>{displayCalories}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t('product.protein')}</Text>
                  <Text style={styles.nutritionValue}>{displayProtein}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t('product.fat')}</Text>
                  <Text style={styles.nutritionValue}>{displayFat}</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t('product.carbs')}</Text>
                  <Text style={styles.nutritionValue}>{displayCarbs}</Text>
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
                  <Text style={styles.allergenWarningNote}>
                    {t('allergens.notSafeMessage')}
                  </Text>
                </View>
              )}
              
              <View style={styles.infoCard}>
                <Text style={styles.ingredientsText}>{t('product.ingredients')}</Text>
                <View style={styles.vitaminsList}>
                  {nutrients.vitamins && nutrients.vitamins.map((vitamin: string, index: number) => (
                    <View key={index} style={styles.vitaminItem}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                      <Text style={[styles.vitaminName, isDark && styles.darkText]}>{vitamin}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.allergensListContainer}>
                  {nutrients.allergens && nutrients.allergens.map((allergen: string, index: number) => (
                    <View key={index} style={styles.allergenItem}>
                      <Ionicons 
                        name={USER_ALLERGENS.includes(allergen) ? "alert-circle-outline" : "information-circle-outline"} 
                        size={16} 
                        color={USER_ALLERGENS.includes(allergen) ? "#FF6B6B" : "#999999"} 
                      />
                      <Text style={[styles.allergenName, isDark && styles.darkText]}>{allergen}</Text>
                    </View>
                  ))}
                </View>
              </View>
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
        productName={productName as string}
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
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 48,
    justifyContent: 'center',
  },
  darkConfirmButton: {
    backgroundColor: '#0A84FF',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    width: '100%',
    height: 48,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  darkCancelButton: {
    borderWidth: 1,
    borderColor: '#0A84FF',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  darkCancelButtonText: {
    color: '#0A84FF',
  },
});