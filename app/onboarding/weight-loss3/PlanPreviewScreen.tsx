import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { UserProfile } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { planPreview, usePalette } from './unifiedStyles';

interface PlanPreviewScreenProps {
  onContinue: () => void;
  onBack: () => void;
  onStartTrial: () => void;
  userProfile: Partial<UserProfile>;
}

const PlanPreviewScreen: React.FC<PlanPreviewScreenProps> = ({
  onContinue,
  onBack,
  onStartTrial,
  userProfile
}) => {
  const palette = usePalette();
  const { t } = useTranslation();

  // Рассчитываем показатели пользователя
  const calculateNutrition = () => {
    if (!userProfile.weight || !userProfile.height || !userProfile.gender) {
      return {
        calorieTarget: 1800,
        proteinTarget: 120,
        fatTarget: 60,
        carbTarget: 180
      };
    }

    const age = 30; // Примерный возраст
    let bmr: number;
    
    if (userProfile.gender === 'male') {
      bmr = 10 * (userProfile.weight || 70) + 6.25 * (userProfile.height || 170) - 5 * age + 5;
    } else {
      bmr = 10 * (userProfile.weight || 70) + 6.25 * (userProfile.height || 170) - 5 * age - 161;
    }

    // Активность
    let activityFactor = 1.375; // lightly-active по умолчанию
    switch (userProfile.activityLevel) {
      case 'sedentary': activityFactor = 1.2; break;
      case 'moderately-active': activityFactor = 1.55; break;
      case 'very-active': activityFactor = 1.725; break;
      case 'extremely-active': activityFactor = 1.9; break;
    }

    const tdee = bmr * activityFactor;
    const minCalories = userProfile.gender === 'male' ? 1500 : 1200;
    
    let calorieTarget = tdee;
    if (userProfile.primaryGoal === 'lose-weight') {
      const weightLossRate = userProfile.weightLossRate || 0.5;
      const dailyDeficit = (weightLossRate * 7000) / 7;
      calorieTarget = Math.max(tdee - dailyDeficit, minCalories);
    }

    calorieTarget = Math.round(calorieTarget);

    // Макронутриенты
    const proteinTarget = Math.round((userProfile.weight || 70) * 1.4);
    const fatTarget = Math.round((calorieTarget * 0.25) / 9);
    const carbTarget = Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4);

    return {
      calorieTarget,
      proteinTarget: Math.max(proteinTarget, 50),
      fatTarget: Math.max(fatTarget, 30),
      carbTarget: Math.max(carbTarget, 50)
    };
  };

  const nutrition = calculateNutrition();
  
  const getDietPreferenceText = () => {
    switch(userProfile.dietPreference) {
      case 'vegetarian': return 'Вегетарианская';
      case 'vegan': return 'Веганская';
      case 'low-carb': return 'Низкоуглеводная';
      case 'keto': return 'Кетогенная';
      case 'paleo': return 'Палео';
      case 'mediterranean': return 'Средиземноморская';
      default: return 'Сбалансированная';
    }
  };

  const getWeightLossPace = () => {
    const rate = userProfile.weightLossRate || 0.5;
    if (rate <= 0.5) return 'Постепенное снижение (0.5 кг/неделю)';
    if (rate <= 0.75) return 'Умеренное снижение (0.75 кг/неделю)';
    return 'Интенсивное снижение (1 кг/неделю)';
  };

  const getPersonalizedTips = () => {
    const tips = [];
    
    if (userProfile.stressResponse === 'emotional-eating') {
      tips.push('Техники осознанного питания для контроля эмоционального переедания');
    }
    
    if (userProfile.challenges?.includes('lack-of-time')) {
      tips.push('Быстрые рецепты для занятых людей (приготовление за 15 минут)');
    }
    
    if (userProfile.intermittentFasting) {
      tips.push('Персональное окно интервального голодания с учетом вашего образа жизни');
    }
    
    if (userProfile.confidenceLevel && userProfile.confidenceLevel < 3) {
      tips.push('Стратегии повышения мотивации и уверенности в достижении цели');
    }

    // Добавляем базовые советы, если специальных нет
    if (tips.length === 0) {
      tips.push('Персонализированные рекомендации по питанию');
      tips.push('Стратегии поддержания мотивации');
    }

    return tips;
  };

  const personalizedTips = getPersonalizedTips();

  return (
    <OnboardingLayout
      title={t('onboarding.planPreview.title')}
      subtitle={t('onboarding.planPreview.subtitle')}
      onContinue={() => {}}
      onBack={onBack}
      continueText=""
      hideBackButton={true}
    >
      {/* Серый крестик в левом верхнем углу */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}
        onPress={onContinue}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="close" 
          size={20} 
          color="rgba(0, 0, 0, 0.6)" 
        />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 100 }}>
        {/* Калории и макронутриенты */}
        <View style={[planPreview.section, { backgroundColor: palette.surface }]}>
          <View style={planPreview.sectionHeader}>
            <Ionicons name="nutrition-outline" size={24} color={palette.primary} />
            <Text style={[planPreview.sectionTitle, { color: palette.text.primary }]}>
              Ваш дневной план питания
            </Text>
          </View>
          
          <View style={planPreview.nutritionContainer}>
            <View style={planPreview.calorieCard}>
              <Text style={[planPreview.calorieValue, { color: palette.primary }]}>
                {nutrition.calorieTarget}
              </Text>
              <Text style={[planPreview.calorieLabel, { color: palette.text.secondary }]}>
                ккал/день
              </Text>
            </View>
            
            <View style={planPreview.macrosRow}>
              <View style={planPreview.macroItem}>
                <View style={[planPreview.macroIndicator, { backgroundColor: 'rgba(255, 107, 107, 0.85)' }]} />
                <Text style={[planPreview.macroValue, { color: palette.text.primary }]}>
                  {nutrition.proteinTarget}г
                </Text>
                <Text style={[planPreview.macroLabel, { color: palette.text.secondary }]}>
                  Белки
                </Text>
              </View>
              
              <View style={planPreview.macroItem}>
                <View style={[planPreview.macroIndicator, { backgroundColor: 'rgba(255, 209, 102, 0.85)' }]} />
                <Text style={[planPreview.macroValue, { color: palette.text.primary }]}>
                  {nutrition.fatTarget}г
                </Text>
                <Text style={[planPreview.macroLabel, { color: palette.text.secondary }]}>
                  Жиры
                </Text>
              </View>
              
              <View style={planPreview.macroItem}>
                <View style={[planPreview.macroIndicator, { backgroundColor: 'rgba(6, 214, 160, 0.85)' }]} />
                <Text style={[planPreview.macroValue, { color: palette.text.primary }]}>
                  {nutrition.carbTarget}г
                </Text>
                <Text style={[planPreview.macroLabel, { color: palette.text.secondary }]}>
                  Углеводы
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Персональные рекомендации */}
        <View style={[planPreview.section, { backgroundColor: palette.surface }]}>
          <View style={planPreview.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={palette.primary} />
            <Text style={[planPreview.sectionTitle, { color: palette.text.primary }]}>
              Персональные рекомендации
            </Text>
          </View>
          
          <View style={planPreview.recommendationItem}>
            <Text style={[planPreview.recommendationLabel, { color: palette.text.secondary }]}>
              Тип питания:
            </Text>
            <Text style={[planPreview.recommendationValue, { color: palette.text.primary }]}>
              {getDietPreferenceText()}
            </Text>
          </View>
          
          <View style={planPreview.recommendationItem}>
            <Text style={[planPreview.recommendationLabel, { color: palette.text.secondary }]}>
              Темп снижения веса:
            </Text>
            <Text style={[planPreview.recommendationValue, { color: palette.text.primary }]}>
              {getWeightLossPace()}
            </Text>
          </View>
          
          <View style={planPreview.recommendationItem}>
            <Text style={[planPreview.recommendationLabel, { color: palette.text.secondary }]}>
              Режим питания:
            </Text>
            <Text style={[planPreview.recommendationValue, { color: palette.text.primary }]}>
              {userProfile.mealFrequency === '3-meals' ? '3 приема пищи' : 
               userProfile.mealFrequency === '4-meals' ? '4 приема пищи' :
               userProfile.mealFrequency === 'intermittent' ? 'Интервальное голодание' : '3 приема пищи'}
            </Text>
          </View>
        </View>

        {/* Индивидуальные советы */}
        <View style={[planPreview.section, { backgroundColor: palette.surface }]}>
          <View style={planPreview.sectionHeader}>
            <Ionicons name="bulb-outline" size={24} color={palette.primary} />
            <Text style={[planPreview.sectionTitle, { color: palette.text.primary }]}>
              Ваши индивидуальные советы
            </Text>
          </View>
          
          {personalizedTips.map((tip, index) => (
            <View key={index} style={planPreview.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={palette.success} />
              <Text style={[planPreview.tipText, { color: palette.text.primary }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {/* Предложение пробного периода */}
        <View style={[planPreview.trialSection, { backgroundColor: palette.primary }]}>
          <Text style={planPreview.trialTitle}>
            🎁 Специальное предложение
          </Text>
          <Text style={planPreview.trialSubtitle}>
            Попробуйте полную версию бесплатно 3 дня
          </Text>
          <Text style={planPreview.trialDescription}>
            • Полный доступ ко всем функциям{'\n'}
            • Детальные планы питания{'\n'}
            • Персональные рецепты{'\n'}
            • Отслеживание прогресса{'\n'}
            • Отмена в любой момент
          </Text>
          
          <TouchableOpacity 
            style={planPreview.trialButton}
            onPress={onStartTrial}
            activeOpacity={0.8}
          >
            <Text style={planPreview.trialButtonText}>
              Начать бесплатный пробный период
            </Text>
          </TouchableOpacity>
          
          <Text style={planPreview.trialNote}>
            Через 3 дня подписка продлится автоматически.{'\n'}
            Отмените в любой момент в настройках.
          </Text>
        </View>

        {/* Нижний отступ для фиксированной кнопки */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Фиксированная кнопка внизу экрана */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: palette.white,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 34, // Отступ для Home Indicator
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: palette.primary,
            borderRadius: 25,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={{
            color: palette.white,
            fontSize: 18,
            fontWeight: '700',
          }}>
            Получить полный доступ
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
};

export default PlanPreviewScreen; 