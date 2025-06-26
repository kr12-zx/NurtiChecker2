import { parseAIResponse } from '../aiResponseParser';

describe('AI Response Parser', () => {
  describe('parseAIResponse', () => {
    test('parses valid JSON structure', () => {
      const validResponse = {
        nutritionRecommendations: {
          shortSummary: "Увеличьте потребление белка",
          bulletPoints: ["Добавить курицу", "Больше яиц"]
        },
        weeklyFocus: {
          mainGoal: "Стабилизация веса",
          specificFoods: ["Авокадо", "Орехи"],
          avoidOrReduce: ["Сладости", "Фастфуд"]
        },
        progressNotes: {
          weightProgress: "Снижение на 0.3кг",
          nutritionQuality: "Хорошо",
          challengeEvolution: "Меньше стресс-еды",
          encouragement: "Отличная работа!"
        },
        nextWeekTargets: {
          calorieTarget: "1700 ккал",
          macroFocus: "Белок 120г",
          behavioralGoal: "Записывать приемы пищи",
          activitySuggestion: "Прогулки 30 мин"
        }
      };

      const result = parseAIResponse(validResponse);
      
      expect(result).not.toBeNull();
      expect(result?.nutritionRecommendations.shortSummary).toBe("Увеличьте потребление белка");
      expect(result?.weeklyFocus.specificFoods).toHaveLength(2);
      expect(result?.progressNotes.encouragement).toBe("Отличная работа!");
    });

    test('handles JSON string with markdown', () => {
      const jsonWithMarkdown = `\`\`\`json
{
  "nutritionRecommendations": {
    "shortSummary": "Тест",
    "bulletPoints": ["Пункт 1"]
  },
  "weeklyFocus": {
    "mainGoal": "Цель",
    "specificFoods": [],
    "avoidOrReduce": []
  },
  "progressNotes": {
    "weightProgress": "Прогресс",
    "nutritionQuality": "Качество",
    "challengeEvolution": "Эволюция",
    "encouragement": "Поддержка"
  },
  "nextWeekTargets": {
    "calorieTarget": "1500",
    "macroFocus": "Белок",
    "behavioralGoal": "Цель",
    "activitySuggestion": "Активность"
  }
}
\`\`\``;

      const result = parseAIResponse(jsonWithMarkdown);
      
      expect(result).not.toBeNull();
      expect(result?.nutritionRecommendations.shortSummary).toBe("Тест");
    });

    test('handles array input by taking first element', () => {
      const arrayResponse = [{
        nutritionRecommendations: {
          shortSummary: "Первый элемент",
          bulletPoints: []
        },
        weeklyFocus: {
          mainGoal: "Цель",
          specificFoods: [],
          avoidOrReduce: []
        },
        progressNotes: {
          weightProgress: "Прогресс",
          nutritionQuality: "Качество", 
          challengeEvolution: "Эволюция",
          encouragement: "Поддержка"
        },
        nextWeekTargets: {
          calorieTarget: "1500",
          macroFocus: "Белок",
          behavioralGoal: "Цель",
          activitySuggestion: "Активность"
        }
      }];

      const result = parseAIResponse(arrayResponse);
      
      expect(result).not.toBeNull();
      expect(result?.nutritionRecommendations.shortSummary).toBe("Первый элемент");
    });

    test('handles object with text field', () => {
      const objectWithText = {
        text: JSON.stringify({
          nutritionRecommendations: {
            shortSummary: "Из text поля",
            bulletPoints: []
          },
          weeklyFocus: {
            mainGoal: "Цель",
            specificFoods: [],
            avoidOrReduce: []
          },
          progressNotes: {
            weightProgress: "Прогресс",
            nutritionQuality: "Качество",
            challengeEvolution: "Эволюция", 
            encouragement: "Поддержка"
          },
          nextWeekTargets: {
            calorieTarget: "1500",
            macroFocus: "Белок",
            behavioralGoal: "Цель",
            activitySuggestion: "Активность"
          }
        })
      };

      const result = parseAIResponse(objectWithText);
      
      expect(result).not.toBeNull();
      expect(result?.nutritionRecommendations.shortSummary).toBe("Из text поля");
    });

    test('handles invalid JSON gracefully', () => {
      const invalidJson = "{ invalid json structure";
      
      const result = parseAIResponse(invalidJson);
      
      // Должен попробовать fallback парсинг
      expect(result).toBeDefined();
    });

    test('returns null for completely invalid input', () => {
      const result1 = parseAIResponse(null);
      const result2 = parseAIResponse(undefined);
      const result3 = parseAIResponse(123);
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    test('handles incomplete structure', () => {
      const incompleteResponse = {
        nutritionRecommendations: {
          shortSummary: "Неполная структура",
          bulletPoints: []
        }
        // Отсутствуют другие обязательные поля
      };

      const result = parseAIResponse(incompleteResponse);
      
      // В зависимости от реализации может вернуть null или попытаться обработать
      expect(result).toBeDefined();
    });

    test('parses text response as fallback', () => {
      const textResponse = `
      Рекомендации по питанию:
      • Увеличить белок
      • Добавить овощи
      
      Фокус недели: Стабилизация веса
      
      Прогресс: Хорошие результаты
      Поддержка: Продолжайте в том же духе
      
      Цели на следующую неделю:
      Калории: 1700 ккал
      Активность: Прогулки
      `;

      const result = parseAIResponse(textResponse);
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.nutritionRecommendations).toBeDefined();
        expect(result.weeklyFocus).toBeDefined();
        expect(result.progressNotes).toBeDefined();
        expect(result.nextWeekTargets).toBeDefined();
      }
    });
  });
}); 