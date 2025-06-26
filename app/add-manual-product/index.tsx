import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';

// Импорт стилей
const styles = require('./index.styles').styles;

interface ProductFormData {
  name: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  sugar: string;
  fiber: string;
  portionSize: 'small' | 'regular' | 'large';
}

interface AIProductResponse {
  id: string;
  timestamp: string;
  foodData: {
    foodName: string;
    ingredients: Array<{ name: string }>;
    portionDescription: string;
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
    targetLanguage: string;
    allergenAnalysis: {
      isSafeForUser: boolean;
      detectedAllergens: any[];
      userAllergenWarnings: any[];
    };
  };
  userContext: {
    language: string;
    allergenWarnings: any;
    isSafeForUser: boolean;
  };
  personalizedRecommendations: any;
  metadata: {
    apiVersion: string;
    source: string;
    entryType?: string;
    portionSize?: string;
    multiplier?: number;
  };
  error?: {
    message: string;
    details: string;
  };
}

export default function AddManualProductScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    sugar: '',
    fiber: '',
    portionSize: 'regular',
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Initialize form data from parameters
  useEffect(() => {
    if (params.productName && typeof params.productName === 'string') {
      setFormData(prev => ({
        ...prev,
        name: params.productName as string
      }));
    }
  }, [params.productName]);

  // Обновление полей формы
  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Получение данных от ИИ
  const handleGetAIData = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('addManualProduct.enterProductName'));
      return;
    }

    setIsLoadingAI(true);
    try {
      // Получаем userId из AsyncStorage
      const { getUserId } = await import('../../services/userService');
      const userId = await getUserId();
      
      // Получаем язык из настроек i18n
      const currentLanguage = i18n.locale || 'en';
      
      // Подготавливаем данные для отправки в N8N workflow
      // Теперь отправляем только необходимые параметры - AI сам проанализирует продукт
      const requestData = {
        productName: formData.name.trim(),
        userId: userId,
        portionSize: formData.portionSize,
        language: currentLanguage
      };

      console.log('Отправляем запрос к AI:', requestData);

      // Используем рабочий webhook URL
      const webhookUrl = 'https://ttagent.website/webhook/a1b2c3d4-e5f6-7890-abcd-ef12345678901';
      
      // Формируем URL с параметрами для GET запроса
      const urlParams = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // URLSearchParams автоматически кодирует значения
          urlParams.append(key, String(value));
        }
      });
      
      const fullUrl = `${webhookUrl}?${urlParams.toString()}`;
      console.log(`Отправляем запрос к: ${webhookUrl}`);
      console.log(`Параметры:`, Object.fromEntries(urlParams));
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Получаем текст ответа для диагностики
      const responseText = await response.text();
      console.log('Получен текст ответа:', responseText);
      console.log('Длина ответа:', responseText.length);
      console.log('Content-Type:', response.headers.get('content-type'));

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Успешно распарсен JSON:', data);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        console.log('Первые 500 символов ответа:', responseText.substring(0, 500));
        const errorMessage = parseError instanceof Error ? parseError.message : 'Неизвестная ошибка парсинга';
        throw new Error(`Ошибка парсинга ответа сервера: ${errorMessage}`);
      }

      // Проверяем структуру ответа согласно workflow
      if (data && data.foodData) {
        const foodData = data.foodData;
        
        // Создаем полный объект продукта для детального просмотра
        const productData = {
          name: foodData.foodName || formData.name,
          calories: foodData.nutritionInfo?.calories || 0,
          protein: foodData.nutritionInfo?.protein || 0,
          fat: foodData.nutritionInfo?.fat || 0,
          carbs: foodData.nutritionInfo?.carbs || 0,
          sugar: foodData.nutritionInfo?.sugars || 0,
          fiber: foodData.nutritionInfo?.fiber || 0,
          saturatedFat: foodData.nutritionInfo?.saturatedFat || 0,
          sodium: foodData.nutritionInfo?.sodium || 0,
          // Используем изображение из ответа AI или undefined для заглушки
          image: foodData.imageUrl && foodData.imageUrl.startsWith('http') ? foodData.imageUrl : undefined,
          fullData: JSON.stringify({
            foodData: {
              ...foodData,
              // Добавляем информацию о размере порции
              portionSize: formData.portionSize,
              portionMultiplier: formData.portionSize === 'small' ? 0.7 : 
                                formData.portionSize === 'large' ? 1.5 : 1.0
            },
            metadata: data.metadata
          })
        };

        // Сначала сохраняем продукт в историю сканирований
        const { saveScanToHistory } = await import('../../services/scanHistory');
        const savedProduct = await saveScanToHistory(productData);
        
        // Переходим к экрану детального просмотра продукта
        router.push({
          pathname: '/product/[id]' as any,
          params: {
            id: savedProduct.id,
            productName: productData.name,
            calories: productData.calories.toString(),
            protein: productData.protein.toString(),
            fat: productData.fat.toString(),
            carbs: productData.carbs.toString(),
            fullData: productData.fullData,
            useRealData: 'true', // Указываем, что используем реальные данные от AI
            fromManualEntry: 'true'
          }
        });
      } else if (data && data.error) {
        throw new Error(data.error.message || data.error.details || 'Ошибка AI анализа');
      } else {
        throw new Error('Неожиданный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка получения данных от ИИ:', error);
      Alert.alert(
        t('common.error'),
        t('addManualProduct.aiDataError')
      );
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Добавление продукта в дневник
  const handleAddProduct = async () => {
    // Валидация
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('addManualProduct.enterProductName'));
      return;
    }

    const calories = parseFloat(formData.calories) || 0;
    const protein = parseFloat(formData.protein) || 0;
    const fat = parseFloat(formData.fat) || 0;
    const carbs = parseFloat(formData.carbs) || 0;

    if (calories <= 0) {
      Alert.alert(t('common.error'), t('addManualProduct.caloriesMustBePositive'));
      return;
    }

    setIsAddingProduct(true);
    try {
      // Импортируем сервисы
      const { saveScanToHistory } = await import('../../services/scanHistory');
      const { addProductToDay } = await import('../../services/dailyNutrition');

      // Создаем объект продукта как при сканировании
      const manualProductData = {
        name: formData.name.trim(),
        calories: calories,
        protein: protein,
        fat: fat,
        carbs: carbs,
        sugar: parseFloat(formData.sugar) || 0,
        image: undefined, // Не сохраняем невалидные URL для ручного добавления
        fullData: JSON.stringify({
          foodData: {
            name: formData.name.trim(),
            nutritionInfo: {
              calories: calories,
              protein: protein,
              fat: fat,
              carbs: carbs,
              sugar: parseFloat(formData.sugar) || 0,
              fiber: parseFloat(formData.fiber) || 0,
            },
            portionDescription: `Ручное добавление - ${formData.portionSize}`,
            analysis: {
              overallHealthScore: 50,
              healthBenefits: [],
              healthConcerns: [],
            },
            ingredients: [],
          }
        }),
      };

      // Сохраняем в историю сканирований
      const savedProduct = await saveScanToHistory(manualProductData);

      // Рассчитываем коэффициент размера порции
      let portionMultiplier = 1.0;
      switch (formData.portionSize) {
        case 'small': portionMultiplier = 0.7; break;
        case 'regular': portionMultiplier = 1.0; break;
        case 'large': portionMultiplier = 1.5; break;
      }

      // Добавляем в дневную статистику
      await addProductToDay(savedProduct, portionMultiplier, undefined, {
        portionSize: formData.portionSize,
        quantity: 1,
        quantityEaten: 'all', // Фиксированное значение
        addons: {
          sauce: 0,
          sugar: 0,
          oil: 0,
          cream: 0,
          cheese: 0,
          nuts: 0,
        },
        totalMultiplier: portionMultiplier,
        baseGrams: 100,
        preparationMethod: 'raw',
      });

      Alert.alert(
        t('common.success'),
        t('addManualProduct.productAdded', { productName: formData.name }),
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
      Alert.alert(t('common.error'), t('addManualProduct.failedToAddProduct'));
    } finally {
      setIsAddingProduct(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <KeyboardAvoidingView 
        style={[styles.container, isDark && styles.darkContainer]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Заголовок */}
        <View style={[styles.header, isDark && styles.darkHeader]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? "#FFFFFF" : "#000000"} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>
            {t('addManualProduct.title')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Контент с прокруткой */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Название продукта */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              {t('addManualProduct.productNameRequired')}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder={t('addManualProduct.productNamePlaceholder')}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
              <TouchableOpacity
                style={[
                  styles.aiButton,
                  isDark && styles.darkAiButton,
                  isLoadingAI && styles.aiButtonDisabled
                ]}
                onPress={handleGetAIData}
                disabled={isLoadingAI}
              >
                {isLoadingAI ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={styles.aiButtonText}>{t('addManualProduct.getAIData')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Нутриенты на порцию */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              {t('addManualProduct.nutrientsPerPortion')}
            </Text>
            
            <View style={styles.nutrientGrid}>
              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, isDark && styles.darkText]}>
                  {t('addManualProduct.caloriesRequired')}
                </Text>
                <TextInput
                  style={[styles.nutrientInput, isDark && styles.darkNutrientInput]}
                  value={formData.calories}
                  onChangeText={(text) => updateField('calories', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, isDark && styles.darkText]}>
                  {t('addManualProduct.protein')}
                </Text>
                <TextInput
                  style={[styles.nutrientInput, isDark && styles.darkNutrientInput]}
                  value={formData.protein}
                  onChangeText={(text) => updateField('protein', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, isDark && styles.darkText]}>
                  {t('addManualProduct.fat')}
                </Text>
                <TextInput
                  style={[styles.nutrientInput, isDark && styles.darkNutrientInput]}
                  value={formData.fat}
                  onChangeText={(text) => updateField('fat', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, isDark && styles.darkText]}>
                  {t('addManualProduct.carbs')}
                </Text>
                <TextInput
                  style={[styles.nutrientInput, isDark && styles.darkNutrientInput]}
                  value={formData.carbs}
                  onChangeText={(text) => updateField('carbs', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, isDark && styles.darkText]}>
                  {t('addManualProduct.sugar')}
                </Text>
                <TextInput
                  style={[styles.nutrientInput, isDark && styles.darkNutrientInput]}
                  value={formData.sugar}
                  onChangeText={(text) => updateField('sugar', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>

              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, isDark && styles.darkText]}>
                  {t('addManualProduct.fiber')}
                </Text>
                <TextInput
                  style={[styles.nutrientInput, isDark && styles.darkNutrientInput]}
                  value={formData.fiber}
                  onChangeText={(text) => updateField('fiber', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                />
              </View>
            </View>
          </View>

          {/* Размер порции */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              {t('addManualProduct.portionSize')}
            </Text>
            <View style={styles.optionsRow}>
              {[
                { key: 'small', label: t('addManualProduct.portionSmall') },
                { key: 'regular', label: t('addManualProduct.portionRegular') },
                { key: 'large', label: t('addManualProduct.portionLarge') },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    isDark && styles.darkOptionButton,
                    formData.portionSize === option.key && styles.optionButtonActive,
                    formData.portionSize === option.key && isDark && styles.darkOptionButtonActive,
                  ]}
                  onPress={() => updateField('portionSize', option.key as any)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    isDark && styles.darkOptionButtonText,
                    formData.portionSize === option.key && styles.optionButtonTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Закрепленная кнопка внизу */}
        <View style={[styles.bottomButtonContainer, isDark && styles.darkBottomButtonContainer]}>
          <TouchableOpacity
            style={[
              styles.addButton,
              isDark && styles.darkAddButton,
              isAddingProduct && styles.addButtonDisabled
            ]}
            onPress={handleAddProduct}
            disabled={isAddingProduct}
          >
            {isAddingProduct ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>
                  {t('addManualProduct.addToJournal')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 