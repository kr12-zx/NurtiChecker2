import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';

interface UserProfile {
  // Базовые данные
  birthday?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  height?: number;
  weight?: number;
  primaryGoal?: 'lose-weight' | 'maintain-weight' | 'gain-muscle' | 'improve-health' | 'track-nutrition';
  goalWeight?: number;
  weightLossRate?: number;
  
  // Активность
  activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  exerciseIntent?: boolean;
  
  // Питание
  dietPreference?: 'standard' | 'vegetarian' | 'vegan' | 'low-carb' | 'keto' | 'paleo' | 'mediterranean';
  mealFrequency?: '2-meals' | '3-meals' | '4-meals' | '5-meals' | '6-meals' | 'intermittent';
  nutritionFocus?: 'calories-only' | 'balanced' | 'high-protein' | 'low-carb' | 'plant-based';
  foodPreferences?: 'taste' | 'health' | 'convenience' | 'price' | 'tradition';
  foodVariety?: 'often' | 'sometimes' | 'rarely' | 'never';
  mealFeelings?: 'energized' | 'satisfied' | 'tired' | 'bloated' | 'still-hungry';
  intermittentFasting?: boolean;
  showCalorieTutorial?: boolean;
  useFlexibleCalories?: boolean;
  weightLossPlan?: 'steady' | 'moderate' | 'aggressive';
  
  // Психология
  confidenceLevel?: number;
  stressResponse?: 'emotional-eating' | 'loss-of-appetite' | 'exercise' | 'sleep' | 'socializing' | 'mindfulness' | 'avoidance' | 'creative';
  adaptability?: 'embrace-quickly' | 'adapt-time' | 'struggle-try' | 'find-overwhelming';
  challengesView?: 'growth-opportunity' | 'try-learn' | 'avoid-failure' | 'too-difficult';
  setbacksResponse?: 'bounce-back' | 'recover-effort' | 'hard-back' | 'struggle-recover';
  temptationResponse?: 'easily-resist' | 'usually-control' | 'try-resist' | 'often-give-in';
  decisionMaking?: 'fully-trust' | 'confident-doubt' | 'often-unsure' | 'second-guess';
  difficultSituationsHandling?: 'handle-well' | 'cope-most' | 'struggle-stuck' | 'hard-manage';
  
  // Препятствия
  mainObstacle?: 'emotional-eating' | 'time-constraints' | 'social-situations' | 'lack-of-motivation' | 'plateaus' | 'cravings' | 'self-control' | 'other';
  challenges?: string[];
  eatingHabitsAssessment?: 'excellent' | 'good' | 'improving' | 'need-work' | 'poor';
  
  // Медицинские
  medicationUse?: 'not-using' | 'appetite-reducer' | 'fat-absorption' | 'supplements' | 'interested';
}

interface UnitSettings {
  weight: 'kg' | 'lbs';
  height: 'cm' | 'ft';
  system: 'metric' | 'imperial';
}

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unitSettings, setUnitSettings] = useState<UnitSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileData, unitsData] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('unitSettings')
      ]);
      
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      
      if (unitsData) {
        setUnitSettings(JSON.parse(unitsData));
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(t('userProfile.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthday?: string): number => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatWeight = (weight?: number): string => {
    if (!weight || !unitSettings) return '-';
    if (unitSettings.weight === 'lbs') {
      return `${Math.round(weight * 2.20462)} lbs`;
    }
    return `${weight} kg`;
  };

  const formatHeight = (height?: number): string => {
    if (!height || !unitSettings) return '-';
    if (unitSettings.height === 'ft') {
      const totalInches = height / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${height} cm`;
  };

  // Функция для конвертации значений с дефисами в camelCase для переводов
  const convertValueForTranslation = (value: string): string => {
    // Конвертируем дефисы в camelCase
    return value.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  const translateValue = (value: string, section: string): string => {
    // Сначала пробуем перевести значение как есть
    let translation = t(`userProfile.values.${section}.${value}`, { defaultValue: null });
    if (translation) return translation;
    
    // Если не нашли, пробуем конвертированное значение
    const convertedValue = convertValueForTranslation(value);
    translation = t(`userProfile.values.${section}.${convertedValue}`, { defaultValue: value });
    return translation;
  };

  const getTranslatedValue = (category: string, value?: string | boolean | number): string => {
    if (value === undefined || value === null) return '-';
    
    if (typeof value === 'boolean') {
      return value ? t('userProfile.sections.activity.yes') : t('userProfile.sections.activity.no');
    }
    
    if (typeof value === 'number') {
      if (category === 'confidenceLevel') {
        return `${value}/5`;
      }
      return value.toString();
    }
    
    // Используем новую функцию translateValue
    return translateValue(value, category);
  };

  const renderSection = (title: string, items: Array<{ label: string; value: any; category?: string }>) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{title}</Text>
      <View style={[styles.sectionContent, isDark && styles.darkCard]}>
        {items.map((item, index) => (
          <View key={index} style={[styles.dataRow, index < items.length - 1 && styles.dataRowBorder]}>
            <Text style={[styles.dataLabel, isDark && styles.darkTextSecondary]}>{item.label}</Text>
            <Text style={[styles.dataValue, isDark && styles.darkText]}>
              {item.category ? getTranslatedValue(item.category, item.value) : item.value || '-'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderChallengesList = (challenges?: string[]) => {
    if (!challenges || challenges.length === 0) return '-';
    
    return challenges.map(challenge => translateValue(challenge, 'challenges')).join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('userProfile.title')}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.loadingText, isDark && styles.darkTextSecondary]}>
            {t('settings.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !userProfile) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('userProfile.title')}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, isDark && styles.darkTextSecondary]}>
            {error || t('userProfile.noData')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('userProfile.title')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, isDark && styles.darkTextSecondary]}>
          {t('userProfile.subtitle')}
        </Text>

        {/* Основная информация */}
        {renderSection(t('userProfile.sections.basicInfo.title'), [
          { 
            label: t('userProfile.sections.basicInfo.age'), 
            value: `${calculateAge(userProfile.birthday)} ${t('userProfile.sections.basicInfo.years')}` 
          },
          { 
            label: t('userProfile.sections.basicInfo.gender'), 
            value: userProfile.gender, 
            category: 'genders' 
          },
          { 
            label: t('userProfile.sections.basicInfo.height'), 
            value: formatHeight(userProfile.height) 
          },
          { 
            label: t('userProfile.sections.basicInfo.currentWeight'), 
            value: formatWeight(userProfile.weight) 
          },
          { 
            label: t('userProfile.sections.basicInfo.targetWeight'), 
            value: formatWeight(userProfile.goalWeight) 
          },
          { 
            label: t('userProfile.sections.basicInfo.weightLossRate'), 
            value: userProfile.weightLossRate ? `${userProfile.weightLossRate} kg ${t('userProfile.sections.basicInfo.perWeek')}` : '-' 
          },
          { 
            label: t('userProfile.sections.basicInfo.primaryGoal'), 
            value: userProfile.primaryGoal, 
            category: 'goals' 
          },
          { 
            label: t('userProfile.sections.basicInfo.units'), 
            value: unitSettings?.system === 'metric' ? t('settings.metric') : t('settings.imperial') 
          }
        ])}

        {/* Активность и упражнения */}
        {renderSection(t('userProfile.sections.activity.title'), [
          { 
            label: t('userProfile.sections.activity.activityLevel'), 
            value: userProfile.activityLevel, 
            category: 'activityLevels' 
          },
          { 
            label: t('userProfile.sections.activity.exerciseIntent'), 
            value: userProfile.exerciseIntent 
          }
        ])}

        {/* Питание и диета */}
        {renderSection(t('userProfile.sections.nutrition.title'), [
          { 
            label: t('userProfile.sections.nutrition.dietPreference'), 
            value: userProfile.dietPreference, 
            category: 'dietTypes' 
          },
          { 
            label: t('userProfile.sections.nutrition.mealFrequency'), 
            value: userProfile.mealFrequency, 
            category: 'mealFrequencies' 
          },
          { 
            label: t('userProfile.sections.nutrition.nutritionFocus'), 
            value: userProfile.nutritionFocus, 
            category: 'nutritionFocus' 
          },
          { 
            label: t('userProfile.sections.nutrition.foodPreferences'), 
            value: userProfile.foodPreferences, 
            category: 'foodPreferences' 
          },
          { 
            label: t('userProfile.sections.nutrition.foodVariety'), 
            value: userProfile.foodVariety, 
            category: 'foodVariety' 
          },
          { 
            label: t('userProfile.sections.nutrition.mealFeelings'), 
            value: userProfile.mealFeelings, 
            category: 'mealFeelings' 
          },
          { 
            label: t('userProfile.sections.nutrition.intermittentFasting'), 
            value: userProfile.intermittentFasting 
          },
          { 
            label: t('userProfile.sections.nutrition.showCalorieTutorial'), 
            value: userProfile.showCalorieTutorial 
          },
          { 
            label: t('userProfile.sections.nutrition.useFlexibleCalories'), 
            value: userProfile.useFlexibleCalories 
          },
          { 
            label: t('userProfile.sections.nutrition.weightLossPlan'), 
            value: userProfile.weightLossPlan, 
            category: 'weightLossPlans' 
          }
        ])}

        {/* Психологический профиль */}
        {renderSection(t('userProfile.sections.psychology.title'), [
          { 
            label: t('userProfile.sections.psychology.confidenceLevel'), 
            value: userProfile.confidenceLevel, 
            category: 'confidenceLevel' 
          },
          { 
            label: t('userProfile.sections.psychology.stressResponse'), 
            value: userProfile.stressResponse, 
            category: 'stressResponses' 
          },
          { 
            label: t('userProfile.sections.psychology.adaptability'), 
            value: userProfile.adaptability, 
            category: 'adaptability' 
          },
          { 
            label: t('userProfile.sections.psychology.challengesView'), 
            value: userProfile.challengesView, 
            category: 'challengesView' 
          },
          { 
            label: t('userProfile.sections.psychology.setbacksResponse'), 
            value: userProfile.setbacksResponse, 
            category: 'setbacksResponse' 
          },
          { 
            label: t('userProfile.sections.psychology.temptationResponse'), 
            value: userProfile.temptationResponse, 
            category: 'temptationResponse' 
          },
          { 
            label: t('userProfile.sections.psychology.decisionMaking'), 
            value: userProfile.decisionMaking, 
            category: 'decisionMaking' 
          },
          { 
            label: t('userProfile.sections.psychology.difficultSituations'), 
            value: userProfile.difficultSituationsHandling, 
            category: 'difficultSituations' 
          }
        ])}

        {/* Вызовы и препятствия */}
        {renderSection(t('userProfile.sections.challenges.title'), [
          { 
            label: t('userProfile.sections.challenges.mainObstacle'), 
            value: userProfile.mainObstacle, 
            category: 'mainObstacles' 
          },
          { 
            label: t('userProfile.sections.challenges.challenges'), 
            value: renderChallengesList(userProfile.challenges) 
          },
          { 
            label: t('userProfile.sections.challenges.eatingHabitsAssessment'), 
            value: userProfile.eatingHabitsAssessment, 
            category: 'eatingHabitsAssessment' 
          }
        ])}

        {/* Медицинская информация */}
        {renderSection(t('userProfile.sections.medical.title'), [
          { 
            label: t('userProfile.sections.medical.medicationUse'), 
            value: userProfile.medicationUse, 
            category: 'medicationUse' 
          }
        ])}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  darkTextSecondary: {
    color: '#888888',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  dataRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 8,
  },
  dataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    marginRight: 16,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#000000',
    flex: 1,
    textAlign: 'right' as const,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center' as const,
  },
}; 