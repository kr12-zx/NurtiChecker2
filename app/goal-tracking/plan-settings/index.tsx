import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import { getGoalSettings, GoalProgress, saveGoalSettings } from '../../../services/goalTrackingService';
import { styles } from './styles';

export default function PlanSettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [settings, setSettings] = useState<Partial<GoalProgress>>({
    startWeight: 85,
    targetWeight: 75,
    weeklyTarget: 0.5,
  });

  const [startWeightText, setStartWeightText] = useState('85');
  const [targetWeightText, setTargetWeightText] = useState('75');
  const [weeklyTargetText, setWeeklyTargetText] = useState('0.5');

  const [isSaving, setIsSaving] = useState(false);

  // Загружаем настройки при открытии экрана
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const savedSettings = await getGoalSettings();
      if (savedSettings) {
        setSettings(savedSettings);
        setStartWeightText(savedSettings.startWeight?.toString() || '85');
        setTargetWeightText(savedSettings.targetWeight?.toString() || '75');
        setWeeklyTargetText(savedSettings.weeklyTarget?.toString() || '0.5');
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    // Валидация
    const startWeight = parseFloat(startWeightText);
    const targetWeight = parseFloat(targetWeightText);
    const weeklyTarget = parseFloat(weeklyTargetText);

    if (isNaN(startWeight) || startWeight < 30 || startWeight > 300) {
      Alert.alert(t('planSettings.alerts.error'), t('planSettings.alerts.invalidStartWeight'));
      return;
    }

    if (isNaN(targetWeight) || targetWeight < 30 || targetWeight > 300) {
      Alert.alert(t('planSettings.alerts.error'), t('planSettings.alerts.invalidTargetWeight'));
      return;
    }

    if (isNaN(weeklyTarget) || weeklyTarget < 0.1 || weeklyTarget > 2) {
      Alert.alert(t('planSettings.alerts.error'), t('planSettings.alerts.invalidWeeklyTarget'));
      return;
    }

    if (Math.abs(startWeight - targetWeight) < 0.5) {
      Alert.alert(t('planSettings.alerts.error'), t('planSettings.alerts.weightDifferenceTooSmall'));
      return;
    }

    setIsSaving(true);

    try {
      const updatedSettings: Partial<GoalProgress> = {
        ...settings,
        startWeight,
        targetWeight,
        weeklyTarget,
        weeksToGoal: Math.ceil(Math.abs(targetWeight - startWeight) / weeklyTarget),
      };

      await saveGoalSettings(updatedSettings);
      
      Alert.alert(
        t('planSettings.alerts.savedTitle'), 
        t('planSettings.alerts.savedMessage'),
        [
          {
            text: t('planSettings.alerts.ok'),
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      Alert.alert(t('planSettings.alerts.error'), t('planSettings.alerts.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      t('planSettings.alerts.resetTitle'),
      t('planSettings.alerts.resetMessage'),
      [
        { text: t('planSettings.alerts.cancel'), style: 'cancel' },
        {
          text: t('planSettings.alerts.reset'),
          style: 'destructive',
          onPress: () => {
            // Здесь будет логика сброса
            Alert.alert(t('planSettings.alerts.resetFeatureTitle'), t('planSettings.alerts.resetFeatureMessage'));
          }
        }
      ]
    );
  };

  const isWeightLossGoal = parseFloat(startWeightText) > parseFloat(targetWeightText);
  const estimatedWeeks = Math.abs(parseFloat(targetWeightText) - parseFloat(startWeightText)) / parseFloat(weeklyTargetText);

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <View style={[styles.container, isDark && styles.darkContainer]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.darkText]}>{t('planSettings.title')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
        {/* Основные параметры */}
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDark && styles.darkText]}>{t('planSettings.mainParameters')}</Text>
          
          {/* Начальный вес */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>{t('planSettings.startWeight')}</Text>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <TextInput
                style={[styles.weightInput, isDark && styles.darkWeightInput]}
                value={startWeightText}
                onChangeText={setStartWeightText}
                keyboardType="decimal-pad"
                placeholder="85.0"
                placeholderTextColor={isDark ? "#666" : "#999"}
              />
              <Text style={[styles.inputUnit, isDark && styles.darkTextSecondary]}>{t('planSettings.kg')}</Text>
            </View>
          </View>

          {/* Целевой вес */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>{t('planSettings.targetWeight')}</Text>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <TextInput
                style={[styles.weightInput, isDark && styles.darkWeightInput]}
                value={targetWeightText}
                onChangeText={setTargetWeightText}
                keyboardType="decimal-pad"
                placeholder="75.0"
                placeholderTextColor={isDark ? "#666" : "#999"}
              />
              <Text style={[styles.inputUnit, isDark && styles.darkTextSecondary]}>{t('planSettings.kg')}</Text>
            </View>
          </View>

          {/* Скорость изменения */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, isDark && styles.darkText]}>
              {isWeightLossGoal ? t('planSettings.weightLossSpeed') : t('planSettings.weightGainSpeed')}
            </Text>
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <TextInput
                style={[styles.weightInput, isDark && styles.darkWeightInput]}
                value={weeklyTargetText}
                onChangeText={setWeeklyTargetText}
                keyboardType="decimal-pad"
                placeholder="0.5"
                placeholderTextColor={isDark ? "#666" : "#999"}
              />
              <Text style={[styles.inputUnit, isDark && styles.darkTextSecondary]}>{t('planSettings.kgPerWeek')}</Text>
            </View>
            <Text style={[styles.inputHint, isDark && styles.darkTextSecondary]}>
              {t('planSettings.recommendation')}
            </Text>
          </View>
        </View>

        {/* Прогноз */}
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDark && styles.darkText]}>{t('planSettings.forecast')}</Text>
          
          <View style={styles.forecastContainer}>
            <View style={styles.forecastItem}>
              <Text style={[styles.forecastLabel, isDark && styles.darkForecastLabel]}>{t('planSettings.goalType')}</Text>
              <Text style={[styles.forecastValue, isDark && styles.darkText]}>
                {isWeightLossGoal ? t('planSettings.weightLoss') : t('planSettings.weightGain')}
              </Text>
            </View>
            
            <View style={styles.forecastItem}>
              <Text style={[styles.forecastLabel, isDark && styles.darkForecastLabel]}>{t('planSettings.weightChange')}</Text>
              <Text style={[styles.forecastValue, isDark && styles.darkText]}>
                {Math.abs(parseFloat(targetWeightText) - parseFloat(startWeightText)).toFixed(1)} {t('planSettings.kg')}
              </Text>
            </View>
            
            <View style={styles.forecastItem}>
              <Text style={[styles.forecastLabel, isDark && styles.darkForecastLabel]}>{t('planSettings.estimatedTime')}</Text>
              <Text style={[styles.forecastValue, isDark && styles.darkText]}>
                {isFinite(estimatedWeeks) ? `${Math.ceil(estimatedWeeks)} ${t('planSettings.weeks')}` : t('planSettings.notDetermined')}
              </Text>
            </View>
          </View>
        </View>

        {/* Действия */}
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDark && styles.darkText]}>{t('planSettings.actions')}</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.resetButton, isDark && styles.darkResetButton]}
            onPress={handleReset}
          >
            <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.resetButtonText]}>
              {t('planSettings.resetProgress')}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

        {/* Кнопка сохранения */}
        <View style={[styles.bottomContainer, isDark && styles.darkBottomContainer]}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              isDark && styles.darkSaveButton,
              isSaving && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Text style={[styles.saveButtonText, isDark && styles.darkSaveButtonText]}>
                {t('planSettings.saving')}
              </Text>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
                <Text style={[styles.saveButtonText, isDark && styles.darkSaveButtonText]}>
                  {t('planSettings.saveChanges')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
} 