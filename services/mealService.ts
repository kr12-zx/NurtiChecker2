import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanHistoryItem } from './scanHistory';

export interface MealData {
  userId: string;
  dish: string;
  grams: number;
  kcal: number;
  prot: number;
  fat: number;
  carb: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
  glycemicIndex?: number;
  saturatedFat?: number;
  vitamins?: string[];
  minerals?: string[];
  healthBenefits?: string[];
  healthConcerns?: string[];
  overallHealthScore?: number;
  recommendedIntakeDescr?: string;
  packageInfo?: string;
  targetLanguage?: string;
  originalResult?: any;
  isSafeForUser?: boolean;
  allergenId?: number;
  allergenName?: string;
  messageAllergen?: string;
  recommendedIntakeMaxFrequency?: string;
  eaten_at?: string;
  eaten_day?: string;
  imageUrl?: string;
  ingredients?: string;
  description?: string;
  portionDetails?: {
    portionSize: 'small' | 'regular' | 'large';
    quantity: number;
    quantityEaten: 'all' | 'three_quarters' | 'half' | 'third' | 'quarter' | 'tenth' | 'sip';
    addons: {
      sauce: number;
      sugar: number;
      oil: number;
      cream: number;
      cheese: number;
      nuts: number;
    };
    totalMultiplier: number;
    baseGrams: number;
    preparationMethod: 'raw' | 'boiled' | 'fried' | 'grilled' | 'baked';
  };
}

const WEBHOOK_URL = 'https://ttagent.website/webhook/add-meal';

export class MealService {
  /**
   * Send meal data to dashboard webhook
   */
  static async addMealToDashboard(mealData: MealData): Promise<boolean> {
    try {
      console.log('🔍 MealService: Начинаем отправку данных в webhook...');
      
      // Get user ID from storage
      let userId = await AsyncStorage.getItem('nutrichecker_user_id');
      console.log('🔍 MealService: Получен userId из AsyncStorage:', userId);
      
      // Также проверим альтернативный ключ (на случай если где-то используется другой)
      if (!userId) {
        userId = await AsyncStorage.getItem('userId');
        console.log('🔍 MealService: Проверили альтернативный ключ userId:', userId);
      }
      
      // Fallback для симулятора/тестирования
      if (!userId) {
        console.warn('⚠️ MealService: No user ID found, using fallback for testing');
        userId = `test_${Date.now()}@nutrichecker.top`;
      }

      console.log('✅ MealService: Итоговый userId для отправки:', userId);

      // Prepare meal data with current timestamp if not provided
      const currentTime = new Date().toISOString();
      const dataToSend = {
        ...mealData,
        userId,
        eaten_at: mealData.eaten_at || currentTime,
        eaten_day: mealData.eaten_day || currentTime.split('T')[0],
        targetLanguage: mealData.targetLanguage || 'en',
        overallHealthScore: mealData.overallHealthScore || 50,
        isSafeForUser: mealData.isSafeForUser !== false,
        recommendedIntakeMaxFrequency: mealData.recommendedIntakeMaxFrequency || 'daily'
      };

      console.log('📤 MealService: Sending meal data to dashboard:', {
        dish: dataToSend.dish,
        kcal: dataToSend.kcal,
        userId: dataToSend.userId
      });

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ MealService: Failed to send meal data:', response.status, errorText);
        return false;
      }

      // Проверяем есть ли контент в ответе
      const responseText = await response.text();
      console.log('📥 MealService: Raw response:', responseText);
      
      if (!responseText) {
        console.log('✅ MealService: Webhook responded with empty body (success)');
        return true;
      }

      try {
        const result = JSON.parse(responseText);
        console.log('✅ MealService: Meal data sent successfully:', result);
        return true;
      } catch (parseError) {
        console.warn('⚠️ MealService: Response is not JSON, but request was successful:', responseText);
        return true; // Считаем успешным если статус 200, даже если ответ не JSON
      }

    } catch (error) {
      console.error('❌ MealService: Error sending meal data to dashboard:', error);
      return false;
    }
  }

  /**
   * Convert scan result to meal data format with detailed portion information
   */
  static convertScanToMealDataWithPortionDetails(
    scanResult: ScanHistoryItem, 
    portionData: {
      portionSize: 'small' | 'regular' | 'large';
      quantity: number;
      quantityEaten: 'all' | 'three_quarters' | 'half' | 'third' | 'quarter' | 'tenth' | 'sip';
      addons: {
        sauce: number;
        sugar: number;
        oil: number;
        cream: number;
        cheese: number;
        nuts: number;
      };
      totalMultiplier: number;
      baseGrams: number;
      preparationMethod: 'raw' | 'boiled' | 'fried' | 'grilled' | 'baked';
    }
  ): MealData {
    console.log('🔍 Converting scan result with portion details:', scanResult.name);
    
    let nutritionData: any = {};
    let analysisData: any = {};
    
    // Парсим fullData если есть
    if (scanResult.fullData) {
      try {
        const fullData = JSON.parse(scanResult.fullData);
        console.log('📊 Parsed fullData:', fullData.foodData?.nutritionInfo);
        
        if (fullData.foodData?.nutritionInfo) {
          nutritionData = fullData.foodData.nutritionInfo;
        }
        
        if (fullData.foodData?.analysis) {
          analysisData = fullData.foodData.analysis;
        }
      } catch (error) {
        console.error('❌ Error parsing fullData:', error);
      }
    }
    
    // Extract ingredients and description from fullData
    let ingredients = '';
    let description = '';
    let recommendedIntakeDescr = '';
    
    if (scanResult.fullData) {
      try {
        const fullData = JSON.parse(scanResult.fullData);
        
        // Extract ingredients
        if (fullData.foodData?.ingredients && Array.isArray(fullData.foodData.ingredients)) {
          ingredients = fullData.foodData.ingredients.map((ing: any) => ing.name || ing).join(', ');
        }
        
        // Extract description
        if (fullData.foodData?.portionDescription) {
          description = fullData.foodData.portionDescription;
        } else if (fullData.foodData?.recommendedIntake?.description) {
          description = fullData.foodData.recommendedIntake.description;
        }
        
        // Extract recommended intake description
        if (fullData.foodData?.recommendedIntake?.description) {
          recommendedIntakeDescr = fullData.foodData.recommendedIntake.description;
        }
      } catch (error) {
        console.error('❌ Error extracting ingredients/description:', error);
      }
    }
    
    // Используем данные из fullData как приоритетные, fallback на scanResult
    const mealData: MealData = {
      userId: '', // Будет заполнено в addMealToDashboard
      dish: scanResult.name,
      grams: Math.round(portionData.baseGrams * portionData.totalMultiplier),
      kcal: Math.round((nutritionData.calories || scanResult.calories) * portionData.totalMultiplier),
      prot: Math.round((nutritionData.protein || scanResult.protein) * portionData.totalMultiplier * 10) / 10,
      fat: Math.round((nutritionData.fat || scanResult.fat) * portionData.totalMultiplier * 10) / 10,
      carb: Math.round((nutritionData.carbs || scanResult.carbs) * portionData.totalMultiplier * 10) / 10,
      sugar: Math.round((nutritionData.sugars || 0) * portionData.totalMultiplier * 10) / 10,
      fiber: nutritionData.fiber ? Math.round(nutritionData.fiber * portionData.totalMultiplier * 10) / 10 : undefined,
      sodium: nutritionData.sodium ? Math.round(nutritionData.sodium * portionData.totalMultiplier * 1000) / 1000 : undefined,
      glycemicIndex: nutritionData.glycemicIndex,
      saturatedFat: nutritionData.saturatedFat ? Math.round(nutritionData.saturatedFat * portionData.totalMultiplier * 10) / 10 : undefined,
      vitamins: nutritionData.vitamins || [],
      minerals: nutritionData.minerals || [],
      healthBenefits: analysisData.healthBenefits || [],
      healthConcerns: analysisData.healthConcerns || [],
      overallHealthScore: analysisData.overallHealthScore,
      recommendedIntakeDescr: recommendedIntakeDescr,
      packageInfo: '',
      targetLanguage: 'ru',
      originalResult: {
        ...scanResult,
        // Пересчитываем данные с учетом фактически съеденной порции
        calories: Math.round((nutritionData.calories || scanResult.calories) * portionData.totalMultiplier),
        protein: Math.round((nutritionData.protein || scanResult.protein) * portionData.totalMultiplier * 10) / 10,
        fat: Math.round((nutritionData.fat || scanResult.fat) * portionData.totalMultiplier * 10) / 10,
        carbs: Math.round((nutritionData.carbs || scanResult.carbs) * portionData.totalMultiplier * 10) / 10,
        fullData: scanResult.fullData ? JSON.parse(scanResult.fullData) : undefined
      },
      isSafeForUser: true,
      recommendedIntakeMaxFrequency: 'daily',
      imageUrl: scanResult.image,
      ingredients: ingredients,
      description: description,
      eaten_at: '',
      eaten_day: '',
      portionDetails: portionData
    };
    
    // Round totalMultiplier to avoid floating point precision issues
    if (mealData.portionDetails) {
      mealData.portionDetails.totalMultiplier = Math.round(portionData.totalMultiplier * 1000) / 1000;
    }
    
    console.log('✅ Converted meal data with portion details:', {
      dish: mealData.dish,
      kcal: mealData.kcal,
      grams: mealData.grams,
      portionSize: portionData.portionSize,
      quantityEaten: portionData.quantityEaten,
      addons: portionData.addons
    });
    
    return mealData;
  }

  /**
   * Convert scan result to meal data format
   */
  static convertScanToMealData(scanResult: ScanHistoryItem, servingMultiplier: number = 1): MealData {
    console.log('🔍 Converting scan result to meal data:', scanResult.name);
    
    let nutritionData: any = {};
    let analysisData: any = {};
    
    // Парсим fullData если есть
    if (scanResult.fullData) {
      try {
        const fullData = JSON.parse(scanResult.fullData);
        console.log('📊 Parsed fullData:', fullData.foodData?.nutritionInfo);
        
        if (fullData.foodData?.nutritionInfo) {
          nutritionData = fullData.foodData.nutritionInfo;
        }
        
        if (fullData.foodData?.analysis) {
          analysisData = fullData.foodData.analysis;
        }
      } catch (error) {
        console.error('❌ Error parsing fullData:', error);
      }
    }
    
    // Extract ingredients and description from fullData
    let ingredients = '';
    let description = '';
    let recommendedIntakeDescr = '';
    
    if (scanResult.fullData) {
      try {
        const fullData = JSON.parse(scanResult.fullData);
        
        // Extract ingredients
        if (fullData.foodData?.ingredients && Array.isArray(fullData.foodData.ingredients)) {
          ingredients = fullData.foodData.ingredients.map((ing: any) => ing.name || ing).join(', ');
        }
        
        // Extract description
        if (fullData.foodData?.portionDescription) {
          description = fullData.foodData.portionDescription;
        } else if (fullData.foodData?.recommendedIntake?.description) {
          description = fullData.foodData.recommendedIntake.description;
        }
        
        // Extract recommended intake description
        if (fullData.foodData?.recommendedIntake?.description) {
          recommendedIntakeDescr = fullData.foodData.recommendedIntake.description;
        }
      } catch (error) {
        console.error('❌ Error extracting ingredients/description:', error);
      }
    }
    
    // Используем данные из fullData как приоритетные, fallback на scanResult
    const mealData: MealData = {
      userId: '', // Будет заполнено в addMealToDashboard
      dish: scanResult.name,
      grams: Math.round(100 * servingMultiplier),
      kcal: Math.round((nutritionData.calories || scanResult.calories) * servingMultiplier),
      prot: Math.round((nutritionData.protein || scanResult.protein) * servingMultiplier * 10) / 10,
      fat: Math.round((nutritionData.fat || scanResult.fat) * servingMultiplier * 10) / 10,
      carb: Math.round((nutritionData.carbs || scanResult.carbs) * servingMultiplier * 10) / 10,
      sugar: Math.round((nutritionData.sugars || 0) * servingMultiplier * 10) / 10,
      fiber: nutritionData.fiber ? Math.round(nutritionData.fiber * servingMultiplier * 10) / 10 : undefined,
      sodium: nutritionData.sodium ? Math.round(nutritionData.sodium * servingMultiplier * 1000) / 1000 : undefined,
      glycemicIndex: nutritionData.glycemicIndex,
      saturatedFat: nutritionData.saturatedFat ? Math.round(nutritionData.saturatedFat * servingMultiplier * 10) / 10 : undefined,
      vitamins: nutritionData.vitamins || [],
      minerals: nutritionData.minerals || [],
      healthBenefits: analysisData.healthBenefits || [],
      healthConcerns: analysisData.healthConcerns || [],
      overallHealthScore: analysisData.overallHealthScore,
      recommendedIntakeDescr: recommendedIntakeDescr,
      packageInfo: '',
      targetLanguage: 'ru',
      originalResult: {
        ...scanResult,
        // Пересчитываем данные с учетом фактически съеденной порции
        calories: Math.round((nutritionData.calories || scanResult.calories) * servingMultiplier),
        protein: Math.round((nutritionData.protein || scanResult.protein) * servingMultiplier * 10) / 10,
        fat: Math.round((nutritionData.fat || scanResult.fat) * servingMultiplier * 10) / 10,
        carbs: Math.round((nutritionData.carbs || scanResult.carbs) * servingMultiplier * 10) / 10,
        fullData: scanResult.fullData ? JSON.parse(scanResult.fullData) : undefined // Парсим в объект
      },
      isSafeForUser: true,
      recommendedIntakeMaxFrequency: 'daily',
      imageUrl: scanResult.image,
      ingredients: ingredients,
      description: description,
      eaten_at: '',
      eaten_day: '',
      portionDetails: {
        portionSize: 'regular',
        quantity: 1,
        quantityEaten: 'all',
        addons: {
          sauce: 0,
          sugar: 0,
          oil: 0,
          cream: 0,
          cheese: 0,
          nuts: 0,
        },
        totalMultiplier: 1,
        baseGrams: Math.round(100 * servingMultiplier),
        preparationMethod: 'raw',
      },
    };
    
    console.log('✅ Converted meal data:', {
      dish: mealData.dish,
      kcal: mealData.kcal,
      prot: mealData.prot,
      fat: mealData.fat,
      carb: mealData.carb,
      sugar: mealData.sugar
    });
    
    return mealData;
  }

  /**
   * Add meal from manual input (dashboard)
   */
  static async addManualMeal(
    dish: string,
    grams: number,
    kcal: number,
    prot: number = 0,
    fat: number = 0,
    carb: number = 0,
    additionalData: Partial<MealData> = {}
  ): Promise<boolean> {
    const mealData: MealData = {
      userId: '', // Will be filled by addMealToDashboard
      dish,
      grams,
      kcal,
      prot,
      fat,
      carb,
      ...additionalData
    };

    return await this.addMealToDashboard(mealData);
  }
} 