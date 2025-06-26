import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { UserProfile } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette } from './unifiedStyles';

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

  // Динамические стили для этого экрана
  const sectionStyle = {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

  const sectionHeaderStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  };

  const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginLeft: 12,
  };

  const nutritionContainerStyle = {
    alignItems: 'center' as const,
  };

  const calorieCardStyle = {
    alignItems: 'center' as const,
    marginBottom: 20,
  };

  const calorieValueStyle = {
    fontSize: 48,
    fontWeight: '700' as const,
    color: palette.primary,
  };

  const calorieLabelStyle = {
    fontSize: 16,
    color: palette.text.secondary,
    marginTop: 4,
  };

  const macrosRowStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    width: '100%' as const,
  };

  const macroItemStyle = {
    alignItems: 'center' as const,
    flex: 1,
  };

  const macroIndicatorStyle = {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  };

  const macroValueStyle = {
    fontSize: 16,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 4,
  };

  const macroLabelStyle = {
    fontSize: 14,
    color: palette.text.secondary,
  };

  const recommendationItemStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  };

  const recommendationLabelStyle = {
    fontSize: 14,
    color: palette.text.secondary,
    flex: 1,
  };

  const recommendationValueStyle = {
    fontSize: 14,
    fontWeight: '500' as const,
    color: palette.text.primary,
    flex: 2,
    textAlign: 'right' as const,
  };

  const tipItemStyle = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  };

  const tipTextStyle = {
    fontSize: 14,
    color: palette.text.primary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  };

  const trialSectionStyle = {
    backgroundColor: palette.primary,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center' as const,
  };

  const trialTitleStyle = {
    fontSize: 20,
    fontWeight: '700' as const,
    color: palette.white,
    textAlign: 'center' as const,
    marginBottom: 8,
  };

  const trialSubtitleStyle = {
    fontSize: 16,
    fontWeight: '600' as const,
    color: palette.white,
    textAlign: 'center' as const,
    marginBottom: 16,
  };

  const trialDescriptionStyle = {
    fontSize: 14,
    color: palette.white,
    textAlign: 'left' as const,
    lineHeight: 20,
    marginBottom: 20,
  };

  const trialButtonStyle = {
    backgroundColor: palette.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: '100%' as const,
    alignItems: 'center' as const,
  };

  const trialButtonTextStyle = {
    color: palette.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  };

  const trialNoteStyle = {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center' as const,
    lineHeight: 16,
  };

  const fixedButtonContainerStyle = {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: palette.border.secondary,
  };

  const fixedButtonStyle = {
    backgroundColor: palette.primary,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center' as const,
  };

  const fixedButtonTextStyle = {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700' as const,
  };

  const closeButtonStyle = {
    position: 'absolute' as const,
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 100,
    borderWidth: 1,
    borderColor: palette.border.secondary,
  };

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
        style={closeButtonStyle}
        onPress={onContinue}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="close" 
          size={20} 
          color={palette.text.secondary} 
        />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 100 }}>
        {/* Калории и макронутриенты */}
        <View style={[sectionStyle, { backgroundColor: palette.surface }]}>
          <View style={sectionHeaderStyle}>
            <Ionicons name="nutrition-outline" size={24} color={palette.primary} />
            <Text style={sectionTitleStyle}>
              Ваш дневной план питания
            </Text>
          </View>
          
          <View style={nutritionContainerStyle}>
            <View style={calorieCardStyle}>
              <Text style={calorieValueStyle}>
                {nutrition.calorieTarget}
              </Text>
              <Text style={calorieLabelStyle}>
                ккал/день
              </Text>
            </View>
            
            <View style={macrosRowStyle}>
              <View style={macroItemStyle}>
                <View style={[macroIndicatorStyle, { backgroundColor: 'rgba(255, 107, 107, 0.85)' }]} />
                <Text style={macroValueStyle}>
                  {nutrition.proteinTarget} г
                </Text>
                <Text style={macroLabelStyle}>
                  Белки
                </Text>
              </View>
              
              <View style={macroItemStyle}>
                <View style={[macroIndicatorStyle, { backgroundColor: 'rgba(255, 209, 102, 0.85)' }]} />
                <Text style={macroValueStyle}>
                  {nutrition.fatTarget} г
                </Text>
                <Text style={macroLabelStyle}>
                  Жиры
                </Text>
              </View>
              
              <View style={macroItemStyle}>
                <View style={[macroIndicatorStyle, { backgroundColor: 'rgba(6, 214, 160, 0.85)' }]} />
                <Text style={macroValueStyle}>
                  {nutrition.carbTarget} г
                </Text>
                <Text style={macroLabelStyle}>
                  Углеводы
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Персональные рекомендации */}
        <View style={[sectionStyle, { backgroundColor: palette.surface }]}>
          <View style={sectionHeaderStyle}>
            <Ionicons name="person-outline" size={24} color={palette.primary} />
            <Text style={sectionTitleStyle}>
              Персональные рекомендации
            </Text>
          </View>
          
          <View style={recommendationItemStyle}>
            <Text style={recommendationLabelStyle}>
              Тип питания:
            </Text>
            <Text style={recommendationValueStyle}>
              {getDietPreferenceText()}
            </Text>
          </View>
          
          <View style={recommendationItemStyle}>
            <Text style={recommendationLabelStyle}>
              Темп снижения веса:
            </Text>
            <Text style={recommendationValueStyle}>
              {getWeightLossPace()}
            </Text>
          </View>
          
          <View style={recommendationItemStyle}>
            <Text style={recommendationLabelStyle}>
              Режим питания:
            </Text>
            <Text style={recommendationValueStyle}>
              {userProfile.mealFrequency === '3-meals' ? '3 приема пищи' : 
               userProfile.mealFrequency === '4-meals' ? '4 приема пищи' :
               userProfile.mealFrequency === 'intermittent' ? 'Интервальное голодание' : '3 приема пищи'}
            </Text>
          </View>
        </View>

        {/* Индивидуальные советы */}
        <View style={[sectionStyle, { backgroundColor: palette.surface }]}>
          <View style={sectionHeaderStyle}>
            <Ionicons name="bulb-outline" size={24} color={palette.primary} />
            <Text style={sectionTitleStyle}>
              Ваши индивидуальные советы
            </Text>
          </View>
          
          {personalizedTips.map((tip, index) => (
            <View key={index} style={tipItemStyle}>
              <Ionicons name="checkmark-circle" size={20} color={palette.success} />
              <Text style={tipTextStyle}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {/* Предложение пробного периода */}
        <View style={trialSectionStyle}>
          <Text style={trialTitleStyle}>
            🎁 Специальное предложение
          </Text>
          <Text style={trialSubtitleStyle}>
            Попробуйте полную версию бесплатно 3 дня
          </Text>
          <Text style={trialDescriptionStyle}>
            • Полный доступ ко всем функциям{'\n'}
            • Детальные планы питания{'\n'}
            • Персональные рецепты{'\n'}
            • Отслеживание прогресса{'\n'}
            • Отмена в любой момент
          </Text>
          
          <TouchableOpacity 
            style={trialButtonStyle}
            onPress={onStartTrial}
            activeOpacity={0.8}
          >
            <Text style={trialButtonTextStyle}>
              Начать бесплатный пробный период
            </Text>
          </TouchableOpacity>
          
          <Text style={trialNoteStyle}>
            Через 3 дня подписка продлится автоматически.{'\n'}
            Отмените в любой момент в настройках.
          </Text>
        </View>

        {/* Нижний отступ для фиксированной кнопки */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Фиксированная кнопка внизу экрана */}
      <View style={fixedButtonContainerStyle}>
        <TouchableOpacity
          style={fixedButtonStyle}
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text style={fixedButtonTextStyle}>
            Получить полный доступ
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
};

export default PlanPreviewScreen; 