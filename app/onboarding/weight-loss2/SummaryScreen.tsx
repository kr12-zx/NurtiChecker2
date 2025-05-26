import React from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';
import {
  UserProfile,
  UnitSettings,
  Gender,
  ActivityLevel,
  DietPreference,
  MealFrequency,
  Challenge,
} from '../../types/onboarding';

interface SummaryScreenProps {
  onComplete: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  unitSettings: UnitSettings;
}

// Helper for displaying labels
const genderLabels: Record<Gender, string> = {
  male: 'Мужской',
  female: 'Женский',
  'non-binary': 'Небинарный',
  'prefer-not-to-say': 'Предпочитаю не говорить',
};

const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: 'Сидячий образ жизни',
  'lightly-active': 'Низкая активность',
  'moderately-active': 'Умеренная активность',
  'very-active': 'Высокая активность',
  'extremely-active': 'Экстремально высокая активность',
};

const dietPreferenceLabels: Record<DietPreference, string> = {
  standard: 'Стандартная',
  vegetarian: 'Вегетарианская',
  vegan: 'Веганская',
  'low-carb': 'Низкоуглеводная',
  keto: 'Кето',
  paleo: 'Палео',
  mediterranean: 'Средиземноморская',
};

const mealFrequencyLabels: Record<MealFrequency, string> = {
  '2-meals': '2 раза в день',
  '3-meals': '3 раза в день',
  '4-meals': '4 раза в день',
  '5-meals': '5 раз в день',
  '6-meals': '6 раз в день',
  intermittent: 'Интервальное голодание',
};

const challengeLabels: Record<Challenge, string> = {
  'emotional-eating': 'Эмоциональное питание',
  'busy-schedule': 'Напряженный график',
  'lack-of-motivation': 'Недостаток мотивации',
  'social-situations': 'Социальные ситуации',
  'food-cravings': 'Тяга к продуктам',
  'night-eating': 'Ночные приемы пищи',
  stress: 'Стресс',
  'lack-of-knowledge': 'Недостаток знаний',
  'lack-of-time': 'Нехватка времени',
  'social-pressure': 'Социальное давление',
  cravings: 'Сильные желания',
};

const stressResponseLabels: Record<string, string> = {
  eat_more: 'Заедаю стресс',
  eat_less: 'Теряю аппетит',
  no_change: 'Не влияет на аппетит',
  exercise: 'Занимаюсь спортом',
  other: 'Другое',
};

const SummaryScreen: React.FC<SummaryScreenProps> = ({
  onComplete,
  onBack,
  userProfile,
  unitSettings,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const renderItem = (label: string, value?: string | number | string[]) => {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      return null;
    }
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>{label}:</Text>
        <Text style={[styles.summaryValue, { color: themeColors.textPrimary }]}>{String(displayValue)}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Сводка ваших данных
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary, textAlign: 'center' }]}>
              Пожалуйста, проверьте введенную информацию перед завершением.
            </Text>
          </View>

          <View style={styles.summarySection}>
            {renderItem('Дата рождения', userProfile.birthday)}
            {renderItem('Пол', userProfile.gender ? genderLabels[userProfile.gender] : undefined)}
            {renderItem(
              'Рост',
              userProfile.height ? `${userProfile.height} ${unitSettings.height === 'cm' ? 'см' : 'фут/дюйм'}` : undefined
            )}
            {renderItem(
              'Текущий вес',
              userProfile.currentWeight ? `${userProfile.currentWeight} ${unitSettings.weight}` : undefined
            )}
            {renderItem(
              'Целевой вес',
              userProfile.goalWeight ? `${userProfile.goalWeight} ${unitSettings.weight}` : undefined
            )}
            {renderItem(
              'Темп похудения',
              userProfile.weightLossRate ? `${userProfile.weightLossRate} ${unitSettings.weight}/нед.` : undefined
            )}
            {renderItem('Уровень активности', userProfile.activityLevel ? activityLevelLabels[userProfile.activityLevel] : undefined)}
            {renderItem('Предпочтения в питании', userProfile.dietPreference ? dietPreferenceLabels[userProfile.dietPreference] : undefined)}
            {renderItem('Частота приемов пищи', userProfile.mealFrequency ? mealFrequencyLabels[userProfile.mealFrequency] : undefined)}
            {renderItem(
              'Основные трудности',
              userProfile.challenges && userProfile.challenges.length > 0
                ? userProfile.challenges.map(c => challengeLabels[c])
                : undefined
            )}
            {renderItem('Реакция на стресс', userProfile.stressResponse ? stressResponseLabels[userProfile.stressResponse] : undefined)}
            {renderItem('Уверенность в цели (1-5)', userProfile.confidenceLevel)}
            {renderItem('Система единиц', unitSettings.system === 'metric' ? 'Метрическая' : 'Имперская')}
          </View>
        </View>
      </ScrollView>

      <View style={[sharedOnboardingStyles.navButtonContainer, { paddingBottom: 16 }]}>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            sharedOnboardingStyles.navButtonSecondary,
            { backgroundColor: themeColors.navButtonSecondaryBackground, borderColor: themeColors.navButtonSecondaryBorder, marginRight: 8 }
          ]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={[sharedOnboardingStyles.navButtonText, { color: themeColors.navButtonSecondaryText }]}>
            Назад
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            { 
              backgroundColor: themeColors.navButtonPrimaryBackground,
              borderColor: themeColors.navButtonPrimaryBackground
            }
          ]}
          onPress={onComplete}
          activeOpacity={0.7}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: themeColors.navButtonPrimaryText }
            ]}>
            Завершить
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summarySection: {
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    // backgroundColor: themeColors.cardBackground, // Consider adding card-like background if needed
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    // borderBottomColor: themeColors.separator, // Set dynamically
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
  },
});

// Need to set borderBottomColor dynamically for summaryItem based on theme
// This can be done by passing themeColors to StyleSheet.create or inline
// For simplicity, I'll adjust it inline or you can add to shared styles later

export default SummaryScreen;
