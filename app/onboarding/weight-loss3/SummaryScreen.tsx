import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { UnitSettings, UserProfile } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { summary, usePalette } from './unifiedStyles';

interface SummaryScreenProps {
  onComplete: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  unitSettings: UnitSettings;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ 
  onComplete, 
  onBack, 
  userProfile,
  unitSettings
}) => {
  const { t } = useTranslation();
  const palette = usePalette();

  // Получаем возраст из даты рождения
  const getAge = () => {
    if (!userProfile.birthday) return '';

    const today = new Date();
    const birthDate = new Date(userProfile.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Форматирование для отображения
  const formatWeight = (weight?: number) => {
    if (!weight) return '';
    return unitSettings.weight === 'kg' ? 
      `${weight} ${t('onboarding.heightWeight.units.kg')}` : 
      `${Math.round(weight * 2.20462)} ${t('onboarding.heightWeight.units.lb')}`;
  };

  const formatHeight = (height?: number) => {
    if (!height) return '';
    if (unitSettings.height === 'cm') {
      return `${height} см`;
    } else {
      const totalInches = height / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
  };

  // Получаем текстовые описания для выбранных значений
  const getGenderText = () => {
    switch(userProfile.gender) {
      case 'male': return t('onboarding.summary.genders.male');
      case 'female': return t('onboarding.summary.genders.female');
      case 'non-binary': return t('onboarding.summary.genders.nonBinary');
      case 'prefer-not-to-say': return t('onboarding.summary.genders.preferNotToSay');
      default: return t('onboarding.summary.labels.notSpecified');
    }
  };
  
  const getGoalText = () => {
    switch(userProfile.primaryGoal) {
      case 'lose-weight': return t('onboarding.summary.goals.loseWeight');
      case 'maintain-weight': return t('onboarding.summary.goals.maintainWeight');
      case 'gain-muscle': return t('onboarding.summary.goals.gainMuscle');
      case 'improve-health': return t('onboarding.summary.goals.improveHealth');
      case 'track-nutrition': return t('onboarding.summary.goals.trackNutrition');
      default: return '';
    }
  };

  const getActivityLevelText = () => {
    switch(userProfile.activityLevel) {
      case 'sedentary': return t('onboarding.summary.activityLevels.sedentary');
      case 'lightly-active': return t('onboarding.summary.activityLevels.lightlyActive');
      case 'moderately-active': return t('onboarding.summary.activityLevels.moderatelyActive');
      case 'very-active': return t('onboarding.summary.activityLevels.veryActive');
      case 'extremely-active': return t('onboarding.summary.activityLevels.extremelyActive');
      default: return '';
    }
  };

  const getDietPreferenceText = () => {
    switch(userProfile.dietPreference) {
      case 'standard': return t('onboarding.summary.dietTypes.standard');
      case 'vegetarian': return t('onboarding.summary.dietTypes.vegetarian');
      case 'vegan': return t('onboarding.summary.dietTypes.vegan');
      case 'low-carb': return t('onboarding.summary.dietTypes.lowCarb');
      case 'keto': return t('onboarding.summary.dietTypes.keto');
      case 'paleo': return t('onboarding.summary.dietTypes.paleo');
      case 'mediterranean': return t('onboarding.summary.dietTypes.mediterranean');
      default: return '';
    }
  };

  const getMealFrequencyText = () => {
    switch(userProfile.mealFrequency) {
      case '2-meals': return t('onboarding.summary.mealFrequencies.twoMeals');
      case '3-meals': return t('onboarding.summary.mealFrequencies.threeMeals');
      case '4-meals': return t('onboarding.summary.mealFrequencies.fourMeals');
      case '5-meals': return t('onboarding.summary.mealFrequencies.fiveMeals');
      case '6-meals': return t('onboarding.summary.mealFrequencies.sixMeals');
      case 'intermittent': return t('onboarding.summary.mealFrequencies.intermittent');
      default: return '';
    }
  };

  const getChallengesText = () => {
    if (!userProfile.challenges || userProfile.challenges.length === 0) {
      return t('onboarding.summary.labels.notSpecified');
    }
    
    const challengeMap: Record<string, string> = {
      'emotional-eating': t('onboarding.challenges.options.emotionalEating'),
      'lack-of-time': t('onboarding.challenges.options.timeConstraints'),
      'social-pressure': t('onboarding.challenges.options.socialPressure'),
      'cravings': t('onboarding.challenges.options.cravings'),
      'night-eating': t('onboarding.challenges.options.nightEating'),
      'lack-of-motivation': t('onboarding.challenges.options.lackOfMotivation'),
      'stress': t('onboarding.challenges.options.stress'),
      'lack-of-knowledge': t('onboarding.challenges.options.lackOfKnowledge')
    };
    
    return userProfile.challenges.map(c => challengeMap[c] || c).join(', ');
  };

  const getStressResponseText = () => {
    switch(userProfile.stressResponse) {
      case 'emotional-eating': return t('onboarding.summary.stressResponses.emotionalEating');
      case 'physical-activity': return t('onboarding.summary.stressResponses.exercise');
      case 'mindfulness': return t('onboarding.summary.stressResponses.mindfulness');
      case 'avoidance': return t('onboarding.summary.stressResponses.avoidance');
      case 'social-support': return t('onboarding.summary.stressResponses.socializing');
      case 'creative-outlet': return t('onboarding.summary.stressResponses.creative');
      default: return t('onboarding.summary.labels.notSpecified');
    }
  };

  const getChallengesViewText = () => {
    switch(userProfile.challengesView) {
      case 'growth-opportunity': return t('onboarding.summary.challengesViews.growthOpportunity');
      case 'try-learn': return t('onboarding.summary.challengesViews.tryLearn');
      case 'avoid-failure': return t('onboarding.summary.challengesViews.avoidFailure');
      case 'too-difficult': return t('onboarding.summary.challengesViews.tooDifficult');
      default: return t('onboarding.summary.labels.notSpecified');
    }
  };

  const getDecisionMakingText = () => {
    switch(userProfile.decisionMaking) {
      case 'fully-trust': return t('onboarding.summary.decisionMaking.fullyTrust');
      case 'confident-doubt': return t('onboarding.summary.decisionMaking.confidentDoubt');
      case 'often-unsure': return t('onboarding.summary.decisionMaking.oftenUnsure');
      case 'second-guess': return t('onboarding.summary.decisionMaking.secondGuess');
      default: return t('onboarding.summary.labels.notSpecified');
    }
  };

  const getTemptationResponseText = () => {
    switch(userProfile.temptationResponse) {
      case 'easily-resist': return t('onboarding.summary.temptationResponses.easilyResist');
      case 'usually-control': return t('onboarding.summary.temptationResponses.usuallyControl');
      case 'try-resist': return t('onboarding.summary.temptationResponses.tryResist');
      case 'often-give-in': return t('onboarding.summary.temptationResponses.oftenGiveIn');
      default: return t('onboarding.summary.labels.notSpecified');
    }
  };

  const getSetbacksResponseText = () => {
    switch(userProfile.setbacksResponse) {
      case 'bounce-back': return t('onboarding.summary.setbacksResponses.bounceBack');
      case 'recover-effort': return t('onboarding.summary.setbacksResponses.recoverEffort');
      case 'hard-back': return t('onboarding.summary.setbacksResponses.hardBack');
      case 'struggle-recover': return t('onboarding.summary.setbacksResponses.struggleRecover');
      default: return t('onboarding.summary.labels.notSpecified');
    }
  };

  // Рассчитываем показатели питания
  const calculateNutrition = () => {
    if (!userProfile.weight || !userProfile.height || !userProfile.gender || !userProfile.activityLevel) {
      return null;
    }

    // Базовый метаболический уровень (BMR) по формуле Миффлина-Сан Жеора (более точная)
    let bmr: number;
    const age = getAge() || 30; // Используем 30 лет по умолчанию, если возраст не известен
    
    if (userProfile.gender === 'male') {
      bmr = 10 * (userProfile.weight || 70) + 6.25 * (userProfile.height || 170) - 5 * age + 5;
    } else {
      bmr = 10 * (userProfile.weight || 70) + 6.25 * (userProfile.height || 170) - 5 * age - 161;
    }

    // Коэффициент активности (актуальные значения)
    let activityFactor = 1.2; // sedentary
    switch (userProfile.activityLevel) {
      case 'lightly-active': activityFactor = 1.375; break;
      case 'moderately-active': activityFactor = 1.55; break;
      case 'very-active': activityFactor = 1.725; break;
      case 'extremely-active': activityFactor = 1.9; break;
    }

    // Общий дневной расход энергии (TDEE)
    const tdee = bmr * activityFactor;

    // Безопасные минимальные калории
    const minCalories = userProfile.gender === 'male' ? 1500 : 1200;

    // Целевое количество калорий
    let calorieTarget = tdee;
    if (userProfile.primaryGoal === 'lose-weight') {
      // Безопасный дефицит калорий для похудения (исправленная формула)
      const weightLossRate = userProfile.weightLossRate || 0.5; // кг/неделю
      // Используем правильную формула: ~7000 ккал = 1 кг жира (не 7700)
      const dailyDeficit = (weightLossRate * 7000) / 7; // делим на 7 дней
      calorieTarget = Math.max(tdee - dailyDeficit, minCalories);
    } else if (userProfile.primaryGoal === 'gain-muscle') {
      // Умеренный профицит калорий для набора мышечной массы
      calorieTarget = tdee + 200; // Консервативный подход: +200 ккал
    }

    calorieTarget = Math.round(calorieTarget);

    // Распределение макронутриентов (обновленные рекомендации)
    let proteinTarget, fatTarget, carbTarget;

    // Белок: актуальные рекомендации на основе исследований 2023-2024
    if (userProfile.primaryGoal === 'gain-muscle') {
      // 1.6-2.2г на кг веса для набора мышечной массы
      proteinTarget = (userProfile.weight || 70) * 1.8;
    } else if (userProfile.primaryGoal === 'lose-weight') {
      // 1.2-1.6г на кг при снижении веса для сохранения мышечной массы
      proteinTarget = (userProfile.weight || 70) * 1.4;
    } else {
      // 0.8-1.2г на кг для поддержания веса
      proteinTarget = (userProfile.weight || 70) * 1.0;
    }

    // Жиры: 20-35% от общего количества калорий (средний показатель 25%)
    fatTarget = Math.round((calorieTarget * 0.25) / 9); // 9 ккал на 1г жиров

    // Углеводы: оставшиеся калории после белков и жиров
    const proteinCalories = proteinTarget * 4; // 4 ккал на 1г белка
    const fatCalories = fatTarget * 9;
    const remainingCalories = calorieTarget - proteinCalories - fatCalories;
    carbTarget = Math.round(remainingCalories / 4); // 4 ккал на 1г углеводов

    // Проверяем и корректируем минимальные значения
    proteinTarget = Math.max(proteinTarget, 50); // минимум 50г белка
    fatTarget = Math.max(fatTarget, 30); // минимум 30г жиров  
    carbTarget = Math.max(carbTarget, 50); // минимум 50г углеводов

    return {
      calorieTarget: Math.round(calorieTarget),
      proteinTarget: Math.round(proteinTarget),
      fatTarget: Math.round(fatTarget),
      carbTarget: Math.round(carbTarget),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };
  };

  const nutritionInfo = calculateNutrition();

  // Создаем ref для ScrollView, чтобы передать его в OnboardingLayout
  const scrollViewRef = React.useRef<ScrollView>(null);

  return (
    <OnboardingLayout
      title={t('onboarding.summary.title')}
      subtitle={t('onboarding.summary.subtitle')}
      onContinue={onComplete}
      onBack={onBack}
      continueText={t('onboarding.summary.complete')}
      scrollRef={scrollViewRef}
    >
      {/* Основные данные */}
      <View style={[summary!.section, { backgroundColor: palette.surface }]}>
        <Text style={[summary!.sectionTitle, { color: palette.text.primary }]}>{t('onboarding.summary.basicInfo')}</Text>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.age')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>
            {getAge() ? `${getAge()} ${t('onboarding.summary.labels.years')}` : t('onboarding.summary.labels.notSpecified')}
          </Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.gender')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getGenderText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.height')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>
            {formatHeight(userProfile.height)}
          </Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.currentWeight')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>
            {formatWeight(userProfile.weight)}
          </Text>
        </View>
        {userProfile.primaryGoal === 'lose-weight' && userProfile.goalWeight && (
          <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
            <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.targetWeight')}</Text>
            <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>
              {formatWeight(userProfile.goalWeight)}
            </Text>
          </View>
        )}
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.primaryGoal')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getGoalText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.activityLevel')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getActivityLevelText()}</Text>
        </View>
      </View>

      {/* Предпочтения */}
      <View style={[summary!.section, { backgroundColor: palette.surface }]}>
        <Text style={[summary!.sectionTitle, { color: palette.text.primary }]}>{t('onboarding.summary.preferences')}</Text>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.dietType')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getDietPreferenceText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.mealSchedule')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getMealFrequencyText()}</Text>
        </View>
      </View>

      {/* Психологический профиль */}
      <View style={[summary!.section, { backgroundColor: palette.surface }]}>
        <Text style={[summary!.sectionTitle, { color: palette.text.primary }]}>{t('onboarding.summary.psychologicalProfile')}</Text>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.challenges')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getChallengesText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.stressResponse')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getStressResponseText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.confidenceLevel')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>
            {userProfile.confidenceLevel ? `${userProfile.confidenceLevel} ${t('onboarding.outOf5')}` : t('onboarding.summary.labels.notSpecified')}
          </Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.challengesView')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getChallengesViewText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.decisionMaking')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getDecisionMakingText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.temptationResponse')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getTemptationResponseText()}</Text>
        </View>
        <View style={[summary!.summaryItem, { borderBottomColor: palette.border.inactive }]}>
          <Text style={[summary!.summaryLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.setbacksResponse')}</Text>
          <Text style={[summary!.summaryValue, { color: palette.text.primary }]}>{getSetbacksResponseText()}</Text>
        </View>
      </View>

      {/* Рекомендации по питанию */}
      {nutritionInfo && (
        <View style={[summary!.section, { backgroundColor: palette.surface }]}>
          <Text style={[summary!.sectionTitle, { color: palette.text.primary }]}>{t('onboarding.summary.nutritionRecommendations')}</Text>
          <View style={summary!.nutritionContainer}>
            <View style={summary!.calorieContainer}>
              <Text style={[summary!.calorieValue, { color: palette.primary }]}>{nutritionInfo.calorieTarget}</Text>
              <Text style={[summary!.calorieLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.kcalPerDay')}</Text>
            </View>
            <View style={summary!.macrosContainer}>
              <View style={summary!.macroItem}>
                <View style={[summary!.macroIndicator, { backgroundColor: 'rgba(255, 107, 107, 0.85)' }]} />
                <Text style={[summary!.macroValue, { color: palette.text.primary }]}>{nutritionInfo.proteinTarget}г</Text>
                <Text style={[summary!.macroLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.proteins')}</Text>
              </View>
              <View style={summary!.macroItem}>
                <View style={[summary!.macroIndicator, { backgroundColor: 'rgba(255, 209, 102, 0.85)' }]} />
                <Text style={[summary!.macroValue, { color: palette.text.primary }]}>{nutritionInfo.fatTarget}г</Text>
                <Text style={[summary!.macroLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.fats')}</Text>
              </View>
              <View style={summary!.macroItem}>
                <View style={[summary!.macroIndicator, { backgroundColor: 'rgba(6, 214, 160, 0.85)' }]} />
                <Text style={[summary!.macroValue, { color: palette.text.primary }]}>{nutritionInfo.carbTarget}г</Text>
                <Text style={[summary!.macroLabel, { color: palette.text.secondary }]}>{t('onboarding.summary.labels.carbs')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default SummaryScreen;
