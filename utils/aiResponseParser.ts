// Утилита для парсинга AI ответа и преобразования в структурированный формат

interface ParsedAIRecommendations {
  nutritionRecommendations: {
    shortSummary: string;
    bulletPoints: string[];
  };
  weeklyFocus: {
    mainGoal: string;
    specificFoods: string[];
    avoidOrReduce: string[];
  };
  progressNotes: {
    weightProgress: string;
    nutritionQuality: string;
    challengeEvolution: string;
    encouragement: string;
  };
  nextWeekTargets: {
    calorieTarget: string;
    macroFocus: string;
    behavioralGoal: string;
    activitySuggestion: string;
  };
}

export const parseAIResponse = (aiResponse: any): ParsedAIRecommendations | null => {
  try {
    console.log('🔍 Начинаем парсинг AI ответа:', typeof aiResponse, Array.isArray(aiResponse));
    
    // Если это массив - берем первый элемент
    if (Array.isArray(aiResponse) && aiResponse.length > 0) {
      console.log('📦 Обрабатываем массив, берем первый элемент');
      return parseAIResponse(aiResponse[0]);
    }
    
    // Если это объект с полем "text" - извлекаем text
    if (aiResponse && typeof aiResponse === 'object' && aiResponse.text) {
      console.log('📝 Найдено поле text, извлекаем...');
      return parseAIResponse(aiResponse.text);
    }
    
    // Если это строка с markdown кодом - извлекаем JSON
    if (typeof aiResponse === 'string') {
      let cleanJson = aiResponse;
      
      // Убираем markdown код-блоки
      if (aiResponse.includes('```json') || aiResponse.includes('```')) {
        console.log('🧹 Очищаем markdown код-блоки...');
        cleanJson = aiResponse
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();
      }
      
      // Пытаемся распарсить JSON
      try {
        const parsed = JSON.parse(cleanJson);
        console.log('✅ JSON успешно распарсен');
        return parseAIResponse(parsed); // Рекурсивно проверяем структуру
      } catch (jsonError) {
        console.warn('⚠️ Не удалось распарсить JSON, пытаемся извлечь данные из текста');
        return parseTextResponse(aiResponse);
      }
    }
    
    // Если это уже структурированный ответ - проверяем поля
    if (aiResponse && typeof aiResponse === 'object') {
      if (
        aiResponse.nutritionRecommendations &&
        aiResponse.weeklyFocus &&
        aiResponse.progressNotes &&
        aiResponse.nextWeekTargets
      ) {
        console.log('✅ Структурированный ответ валиден');
        return aiResponse as ParsedAIRecommendations;
      } else {
        console.warn('⚠️ Неполная структура объекта:', Object.keys(aiResponse));
      }
    }

    console.warn('⚠️ Неподдерживаемый формат AI ответа');
    return null;
  } catch (error) {
    console.error('❌ Ошибка при парсинге AI ответа:', error);
    return null;
  }
};

// Парсинг текстового ответа (fallback) - НЕ используем захардкоженные данные
const parseTextResponse = (text: string): ParsedAIRecommendations | null => {
  try {
    console.log('🔍 Парсим текстовый ответ:', text.substring(0, 200) + '...');
    
    // Создаем базовую структуру из текста
    const lines = text.split('\n').filter(line => line.trim());
    
    // Ищем основные секции
    let summary = '';
    const bulletPoints: string[] = [];
    let mainGoal = '';
    let encouragement = '';
    const specificFoods: string[] = [];
    const avoidOrReduce: string[] = [];
    let weightProgress = '';
    let nutritionQuality = '';
    let challengeEvolution = '';
    let calorieTarget = '';
    let macroFocus = '';
    let behavioralGoal = '';
    let activitySuggestion = '';

    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      const lower = trimmed.toLowerCase();
      
      // Определяем текущую секцию
      if (lower.includes('рекомендации') && lower.includes('питан')) {
        currentSection = 'nutrition';
        continue;
      }
      if (lower.includes('фокус') || lower.includes('цель')) {
        currentSection = 'focus';
        continue;
      }
      if (lower.includes('прогресс') || lower.includes('анализ')) {
        currentSection = 'progress';
        continue;
      }
      if (lower.includes('следующ') && lower.includes('неделю')) {
        currentSection = 'targets';
        continue;
      }
      
      // Ищем маркированные списки
      if (trimmed.match(/^[•\-\*]\s/)) {
        const content = trimmed.replace(/^[•\-\*]\s/, '');
        
        if (currentSection === 'nutrition') {
          bulletPoints.push(content);
        } else if (currentSection === 'focus') {
          // Определяем добавить или исключить
          if (lower.includes('добав') || lower.includes('включ') || 
              content.includes('асадо') || content.includes('бифе') || 
              content.includes('авокадо') || content.includes('palta') ||
              content.includes('киноа') || content.includes('чечевица')) {
            specificFoods.push(content);
          } else if (lower.includes('исключ') || lower.includes('избег') || 
                     lower.includes('огранич') || content.includes('facturas') ||
                     content.includes('сладост') || content.includes('сахар')) {
            avoidOrReduce.push(content);
          }
        }
      }
      
      // Ищем конкретные данные
      if (lower.includes('вес') && (lower.includes('увелич') || lower.includes('уменьш') || lower.includes('изменен'))) {
        weightProgress = trimmed;
      }
      
      if (lower.includes('калор') && (lower.includes('ккал') || lower.includes('дефицит'))) {
        calorieTarget = trimmed;
      }
      
      if (lower.includes('белок') && (lower.includes('грам') || lower.includes('порци'))) {
        macroFocus = trimmed;
      }
      
      if (lower.includes('записыва') && lower.includes('приём')) {
        behavioralGoal = trimmed;
      }
      
      if (lower.includes('прогулк') || lower.includes('активност')) {
        activitySuggestion = trimmed;
      }
      
      if (lower.includes('мотивац') || lower.includes('поддержк') || trimmed.includes('💪') || 
          lower.includes('продолжайте') || lower.includes('главный актив')) {
        encouragement = trimmed;
      }
      
      if (lower.includes('клетчатк') || lower.includes('качеств') && lower.includes('питан')) {
        nutritionQuality = trimmed;
      }
      
      if (lower.includes('триггер') || lower.includes('проблем') || lower.includes('вызов')) {
        challengeEvolution = trimmed;
      }
      
      // Если нет summary, берем первую содержательную строку
      if (!summary && trimmed.length > 30 && !trimmed.match(/^[•\-\*]/) && 
          !lower.includes('рекомендаци') && !lower.includes('анализ')) {
        summary = trimmed;
      }
      
      // Ищем главную цель
      if ((lower.includes('стабилизац') || lower.includes('сосредоточ')) && 
          trimmed.length > 20 && !mainGoal) {
        mainGoal = trimmed;
      }
    }

    // Возвращаем только реальные данные, без fallback - локализация обрабатывается в компонентах
    return {
      nutritionRecommendations: {
        shortSummary: summary || '',
        bulletPoints: bulletPoints.length > 0 ? bulletPoints : []
      },
      weeklyFocus: {
        mainGoal: mainGoal || '',
        specificFoods: specificFoods.length > 0 ? specificFoods : [],
        avoidOrReduce: avoidOrReduce.length > 0 ? avoidOrReduce : []
      },
      progressNotes: {
        weightProgress: weightProgress || '',
        nutritionQuality: nutritionQuality || '',
        challengeEvolution: challengeEvolution || '',
        encouragement: encouragement || ''
      },
      nextWeekTargets: {
        calorieTarget: calorieTarget || '',
        macroFocus: macroFocus || '',
        behavioralGoal: behavioralGoal || '',
        activitySuggestion: activitySuggestion || ''
      }
    };
  } catch (error) {
    console.error('❌ Ошибка при парсинге текстового ответа:', error);
    return null;
  }
};

// Функция для получения рекомендаций из AsyncStorage с парсингом
export const getStructuredRecommendations = async (): Promise<ParsedAIRecommendations | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const stored = await AsyncStorage.getItem('ai_recommendations');
    
    if (!stored) {
      console.log('ℹ️ Рекомендации не найдены в AsyncStorage');
      return null;
    }

    const parsed = parseAIResponse(stored);
    if (parsed) {
      console.log('✅ Рекомендации успешно структурированы');
      return parsed;
    }

    console.warn('⚠️ Не удалось структурировать рекомендации');
    return null;
  } catch (error) {
    console.error('❌ Ошибка при получении структурированных рекомендаций:', error);
    return null;
  }
};

// Функция для сохранения структурированных рекомендаций
export const saveStructuredRecommendations = async (recommendations: ParsedAIRecommendations): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('ai_recommendations', JSON.stringify(recommendations));
    await AsyncStorage.setItem('ai_recommendations_timestamp', new Date().toISOString());
    console.log('✅ Структурированные рекомендации сохранены');
  } catch (error) {
    console.error('❌ Ошибка при сохранении структурированных рекомендаций:', error);
    throw error;
  }
}; 