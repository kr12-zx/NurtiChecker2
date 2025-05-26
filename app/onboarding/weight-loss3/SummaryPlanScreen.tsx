import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import { UserProfile } from '../../types/onboarding';
import ButtonFooter from './components/ButtonFooter';
import { containers, palette, summaryPlanStyles, typography } from './unifiedStyles';

interface SummaryPlanScreenProps {
  onContinue: () => void;
  onBack: () => void;
  onClose?: () => void;
  userProfile: Partial<UserProfile>;
}

const SummaryPlanScreen: React.FC<SummaryPlanScreenProps> = ({ 
  onContinue, 
  onBack,
  onClose,
  userProfile
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [planReady, setPlanReady] = React.useState(false);
  const [planFilePath, setPlanFilePath] = React.useState<string | null>(null);
  
  // Генерируем план при монтировании компонента
  React.useEffect(() => {
    generatePlan();
  }, []);
  
  // Функция генерации плана в формате HTML или текстового файла
  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      
      // Структура плана
      const planContent = generatePlanContent();
      
      // Создаем имя файла
      const fileName = `nutriplan_${new Date().toISOString().split('T')[0]}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Записываем план в файл
      await FileSystem.writeAsStringAsync(filePath, planContent);
      
      // Сохраняем ссылку на план в AsyncStorage для дальнейшего использования
      await AsyncStorage.setItem('latestNutriPlan', filePath);
      
      setPlanFilePath(filePath);
      setPlanReady(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('Ошибка при генерации плана:', error);
      setIsGenerating(false);
    }
  };
  
  // Функция для определения темпа снижения веса
  const getWeightLossPace = () => {
    if (!userProfile.weightLossPlan) return 'умеренный';
    
    switch (userProfile.weightLossPlan) {
      case 'steady':
        return 'постепенный (0.5 кг в неделю)';
      case 'moderate':
        return 'умеренный (0.75 кг в неделю)';
      case 'aggressive':
        return 'интенсивный (1 кг в неделю)';
      default:
        return 'умеренный';
    }
  };
  
  // Функция генерации содержимого плана на основе данных пользователя
  const generatePlanContent = () => {
    // Рассчитываем возраст
    const birthDate = userProfile.birthday ? new Date(userProfile.birthday) : new Date();
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Рассчитываем ИМТ
    const heightInMeters = (userProfile.height || 170) / 100;
    const bmi = (userProfile.weight || 70) / (heightInMeters * heightInMeters);
    
    // Получаем название активности
    const getActivityName = () => {
      const activityLevel = userProfile.activityLevel || 'moderately-active';
      switch (activityLevel) {
        case 'sedentary': return 'Малоподвижный образ жизни';
        case 'lightly-active': return 'Легкая активность';
        case 'moderately-active': return 'Умеренная активность';
        case 'very-active': return 'Активный образ жизни';
        case 'extremely-active': return 'Очень активный образ жизни';
        default: return 'Умеренная активность';
      }
    };
    
    // Примерное время достижения цели
    const calculateGoalTime = () => {
      if (!userProfile.weight || !userProfile.goalWeight) return 'не определено';
      
      const weightToLose = userProfile.weight - userProfile.goalWeight;
      if (weightToLose <= 0) return 'поддержание веса';
      
      let weeklyRate = 0.5; // по умолчанию 0.5 кг в неделю
      
      if (userProfile.weightLossPlan === 'moderate') {
        weeklyRate = 0.75;
      } else if (userProfile.weightLossPlan === 'aggressive') {
        weeklyRate = 1.0;
      }
      
      const weeksNeeded = Math.ceil(weightToLose / weeklyRate);
      const months = Math.floor(weeksNeeded / 4);
      const remainingWeeks = weeksNeeded % 4;
      
      if (months === 0) {
        return `около ${weeksNeeded} недель`;
      } else if (remainingWeeks === 0) {
        return `около ${months} месяцев`;
      } else {
        return `около ${months} месяцев и ${remainingWeeks} недель`;
      }
    };
    
    return `ИНДИВИДУАЛЬНЫЙ ПЛАН ПИТАНИЯ И ТРЕНИРОВОК
===========================================
Дата создания: ${new Date().toLocaleDateString('ru-RU')}

ПЕРСОНАЛЬНАЯ ИНФОРМАЦИЯ
----------------------
Имя: Не указано
Пол: ${userProfile.gender === 'male' ? 'Мужской' : 'Женский'}
Возраст: ${age} лет
Рост: ${userProfile.height} см
Текущий вес: ${userProfile.weight} кг
Целевой вес: ${userProfile.goalWeight || userProfile.weight} кг
Индекс массы тела (ИМТ): ${bmi.toFixed(1)}
Уровень активности: ${getActivityName()}

ЦЕЛИ И ПРЕДПОЧТЕНИЯ
-------------------
Основная цель: ${userProfile.primaryGoal || 'Снижение веса'}
Темп снижения веса: ${getWeightLossPace()}
Приблизительное время достижения цели: ${calculateGoalTime()}
Предпочтения в питании: ${userProfile.dietPreference || 'Смешанный рацион'}
Частота приемов пищи: ${userProfile.mealFrequency || '3 раза в день'}
Использование интервального голодания: ${userProfile.intermittentFasting ? 'Да' : 'Нет'}

ПЛАН ПИТАНИЯ
------------
Целевое количество калорий: ${userProfile.calorieTarget || 'Будет рассчитано в приложении'} ккал/день
Рекомендуемое количество белка: ${Math.round((userProfile.weight || 70) * 1.6)} - ${Math.round((userProfile.weight || 70) * 2)} г/день
Рекомендуемое количество воды: ${Math.round((userProfile.weight || 70) * 30)} мл/день

Распределение макронутриентов:
- Белки: 30% (обеспечивают насыщение и сохранение мышечной массы)
- Жиры: 30% (важны для гормонального баланса)
- Углеводы: 40% (основной источник энергии)

${userProfile.dietPreference === 'vegetarian' ? 
`Рекомендуемые источники белка для вегетарианцев:
- Тофу и темпе
- Бобовые (чечевица, нут, фасоль)
- Киноа
- Орехи и семена
- Молочные продукты (если включены в рацион)` : 
`Рекомендуемые источники белка:
- Куриная грудка
- Индейка
- Рыба
- Яйца
- Творог
- Греческий йогурт`}

РЕКОМЕНДАЦИИ ПО ТРЕНИРОВКАМ
---------------------------
${userProfile.exerciseIntent ? 
`Основываясь на вашем уровне активности и целях, рекомендуется:
- Кардиотренировки: 3-4 раза в неделю по 30-45 минут
- Силовые тренировки: 2-3 раза в неделю
- Растяжка: каждый день по 10-15 минут

Начните с умеренных нагрузок и постепенно увеличивайте интенсивность.` : 
`Даже без интенсивных тренировок, для поддержания здоровья рекомендуется:
- Ежедневная ходьба: не менее 7000-10000 шагов
- Легкая растяжка: 10-15 минут в день
- Постепенное увеличение физической активности в повседневной жизни`}

ПСИХОЛОГИЧЕСКИЕ РЕКОМЕНДАЦИИ
---------------------------
${userProfile.confidenceLevel && userProfile.confidenceLevel < 3 ? 
`Для повышения уверенности в достижении цели рекомендуется:
- Ставить небольшие, достижимые цели
- Отмечать и праздновать даже небольшие успехи
- Вести дневник питания и активности
- Найти единомышленников или обратиться к специалисту для поддержки` : 
`Для поддержания мотивации рекомендуется:
- Ставить конкретные цели на неделю/месяц
- Отслеживать прогресс в приложении
- Использовать нематериальные награды за достижения
- Помнить о преимуществах здорового образа жизни`}

Наиболее эффективные стратегии для вашего психологического профиля:
${userProfile.stressResponse === 'emotional_eating' ? 
`- Изучите техники осознанного питания
- Найдите альтернативные способы справляться со стрессом
- Планируйте питание заранее, чтобы избежать импульсивных решений` : 
`- Поддерживайте регулярный режим питания
- Найдите здоровые способы расслабления
- Используйте технику глубокого дыхания в моменты стресса`}

СЛЕДУЮЩИЕ ШАГИ
-------------
1. Используйте приложение NutriChecker для сканирования продуктов и отслеживания калорий
2. Отслеживайте свой прогресс в разделе "Отчеты"
3. Настройте напоминания для регулярного приема пищи
4. Регулярно обновляйте свой вес в приложении для корректировки плана

Ваш план будет автоматически корректироваться на основе ваших данных и прогресса.

===========================================
Создано в приложении NutriChecker | ${new Date().getFullYear()}
`;
  };
  
  // Функция для отправки плана
  const sharePlan = async () => {
    if (!planFilePath) return;
    
    try {
      // Сначала читаем содержимое файла
      const fileContent = await FileSystem.readAsStringAsync(planFilePath);
      
      // Используем нативный Share API
      const shareOptions = {
        title: 'Поделиться планом питания',
        message: fileContent, // Передаем содержимое файла как текст
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Ошибка при отправке плана:', error);
    }
  };
  
  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      {/* Кнопка закрытия в левом верхнем углу */}
      {onClose && (
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 60, // Отступ от верха с учетом SafeArea
            left: 20,
            zIndex: 100,
            padding: 8,
          }}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="close-outline" 
            size={24} 
            color="#666666" // Серый цвет без круга
          />
        </TouchableOpacity>
      )}
      
      <View style={containers.rootContainer}>
        {/* Основной контент */}
        <View style={containers.contentContainer}>
          <ScrollView 
            style={containers.scrollView}
            contentContainerStyle={containers.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={typography.screenTitle}>
              {t('onboarding.summaryPlan.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.summaryPlan.subtitle')}
            </Text>
            
            <View style={summaryPlanStyles.planStatusContainer}>
              {isGenerating ? (
                <>
                  <ActivityIndicator size="large" color={palette.primary} style={{ marginBottom: 16 }} />
                  <Text style={summaryPlanStyles.statusText}>{t('onboarding.summaryPlan.generating')}</Text>
                </>
              ) : planReady ? (
                <>
                  <Text style={summaryPlanStyles.statusText}>{t('onboarding.summaryPlan.planReady')}</Text>
                </>
              ) : (
                <>
                  <Text style={summaryPlanStyles.statusText}>{t('onboarding.summaryPlan.planError')}</Text>
                </>
              )}
            </View>
            
            {planReady && (
              <View style={summaryPlanStyles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={summaryPlanStyles.actionButton} 
                  onPress={sharePlan}
                  activeOpacity={0.7}
                >
                  <Text style={summaryPlanStyles.actionButtonText}>{t('onboarding.summaryPlan.share')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[summaryPlanStyles.actionButton, { backgroundColor: "#5C8BEF" }]}
                  onPress={generatePlan}
                  activeOpacity={0.7}
                >
                  <Text style={summaryPlanStyles.actionButtonText}>{t('onboarding.summaryPlan.regenerate')}</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={summaryPlanStyles.infoContainer}>
              <Text style={summaryPlanStyles.infoTitle}>{t('onboarding.summaryPlan.whatsIncluded')}</Text>
              
              <View style={summaryPlanStyles.infoItem}>
                <Text style={summaryPlanStyles.infoBullet}>•</Text>
                <Text style={summaryPlanStyles.infoText}>{t('onboarding.summaryPlan.features.nutrition')}</Text>
              </View>
              
              <View style={summaryPlanStyles.infoItem}>
                <Text style={summaryPlanStyles.infoBullet}>•</Text>
                <Text style={summaryPlanStyles.infoText}>{t('onboarding.summaryPlan.features.workouts')}</Text>
              </View>
              
              <View style={summaryPlanStyles.infoItem}>
                <Text style={summaryPlanStyles.infoBullet}>•</Text>
                <Text style={summaryPlanStyles.infoText}>{t('onboarding.summaryPlan.features.calories')}</Text>
              </View>
              
              <View style={summaryPlanStyles.infoItem}>
                <Text style={summaryPlanStyles.infoBullet}>•</Text>
                <Text style={summaryPlanStyles.infoText}>{t('onboarding.summaryPlan.features.motivation')}</Text>
              </View>
            </View>
            
            <View style={summaryPlanStyles.nextStepContainer}>
              <Text style={summaryPlanStyles.nextStepTitle}>{t('onboarding.summaryPlan.whatsNext')}</Text>
              <Text style={summaryPlanStyles.nextStepText}>
                {t('onboarding.summaryPlan.nextStepsDescription')}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue} 
          continueText={t('onboarding.start')}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default SummaryPlanScreen;
