import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { forceUpdatePushToken } from '../../../services/pushNotifications';
import { initializeUser } from '../../../services/userService';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette, useProgramStyles, useTypographyStyles } from './unifiedStyles';

interface WelcomeScreenProps {
  onContinue: () => void;
  onBack?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue, onBack }) => {
  // Используем хуки для получения динамических стилей в зависимости от текущей темы
  const palette = usePalette();
  const programStyles = useProgramStyles();
  const typography = useTypographyStyles();
  const { t } = useTranslation();

  // Отправляем webhook при открытии Welcome экрана
  // Это особенно важно после очистки данных
  useEffect(() => {
    const registerUserOnWelcome = async () => {
      try {
        console.log('🎉 Welcome экран открыт, регистрируем пользователя...');
        
        // Инициализируем пользователя (создаём новый ID если нужно)
        await initializeUser();
        
        // Принудительно обновляем push токен (если доступен)
        // Это гарантирует отправку webhook с актуальным userId
        setTimeout(async () => {
          try {
            await forceUpdatePushToken();
            console.log('✅ Push токен обновлен с Welcome экрана');
          } catch (error) {
            console.log('⚠️ Push токен не обновлен (возможно, недоступен):', error);
          }
        }, 1000); // Небольшая задержка для инициализации
        
      } catch (error) {
        console.error('❌ Ошибка регистрации пользователя на Welcome экране:', error);
      }
    };

    registerUserOnWelcome();
  }, []);

  return (
    <OnboardingLayout
      title={t('onboarding.welcome.title')}
      subtitle={t('onboarding.welcome.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
      hideBackButton={true}
    >
      <View style={programStyles.container}>
        <Text style={[typography.optionTitle, programStyles.title]}>{t('onboarding.welcome.program')}</Text>
              
        <View style={programStyles.steps}>
          <View style={programStyles.step}>
            <View style={programStyles.iconContainer}>
              <Ionicons name="scale-outline" size={36} color={palette.primary} />
            </View>
            <Text style={programStyles.stepText}>
              {t('onboarding.welcome.steps.weightGoal')}
            </Text>
          </View>
          
          <View style={programStyles.step}>
            <View style={programStyles.iconContainer}>
              <Ionicons name="calculator-outline" size={36} color={palette.primary} />
            </View>
            <Text style={programStyles.stepText}>
              {t('onboarding.welcome.steps.calories')}
            </Text>
          </View>
          
          <View style={programStyles.step}>
            <View style={programStyles.iconContainer}>
              <Ionicons name="calendar-outline" size={36} color={palette.primary} />
            </View>
            <Text style={programStyles.stepText}>
              {t('onboarding.welcome.steps.mealSchedule')}
            </Text>
          </View>
          
          <View style={programStyles.step}>
            <View style={programStyles.iconContainer}>
              <Ionicons name="nutrition-outline" size={36} color={palette.primary} />
            </View>
            <Text style={programStyles.stepText}>
              {t('onboarding.welcome.steps.nutrition')}
            </Text>
          </View>
          
          <View style={programStyles.step}>
            <View style={programStyles.iconContainer}>
              <Ionicons name="fitness-outline" size={36} color={palette.primary} />
            </View>
            <Text style={programStyles.stepText}>
              {t('onboarding.welcome.steps.exercise')}
            </Text>
          </View>
          
          <View style={programStyles.step}>
            <View style={programStyles.iconContainer}>
              <Ionicons name="analytics-outline" size={36} color={palette.primary} />
            </View>
            <Text style={programStyles.stepText}>
              {t('onboarding.welcome.steps.progress')}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Локальные стили больше не используются - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default WelcomeScreen;
