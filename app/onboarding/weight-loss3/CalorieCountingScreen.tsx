import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { options, tutorials, typography, usePalette } from './unifiedStyles';

interface CalorieCountingScreenProps {
  onContinue: () => void;
  onBack: () => void;
  showTutorial: boolean;
  onShowTutorialChange: (show: boolean) => void;
}

const CalorieCountingScreen: React.FC<CalorieCountingScreenProps> = ({ 
  onContinue, 
  onBack,
  showTutorial,
  onShowTutorialChange
}) => {
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Используем локальный state для синхронизации с UI
  const [localShowTutorial, setLocalShowTutorial] = useState<boolean>(showTutorial);
  
  // Обновляем локальный стейт при изменении пропсов
  useEffect(() => {
    setLocalShowTutorial(showTutorial);
  }, [showTutorial]);

  // Создаем ссылку на ScrollView для программного управления прокруткой
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Выбираем вариант ответа
  const handleAnswerSelect = (choice: boolean) => {
    console.log('Выбрано показать туториал:', choice);
    
    // Обновляем сначала локальный стейт для мгновенного UI-отклика
    setLocalShowTutorial(choice);
    
    // Затем обновляем значение в родительском компоненте
    onShowTutorialChange(choice);
    
    // Если выбрано "Да, покажите мне!", прокручиваем страницу вниз, чтобы показать туториал
    if (choice) {
      // Небольшая задержка, чтобы дать время на рендеринг контента
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 300, animated: true });
        }
      }, 300);
    }
  };

  return (
    <OnboardingLayout
      title={t('onboarding.caloriesCounting.title')}
      subtitle={t('onboarding.caloriesCounting.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
      scrollRef={scrollViewRef}
    >
      <View style={{marginTop: 24, marginBottom: 16}}>
        <TouchableOpacity 
          style={[
            options.optionContainer, 
            localShowTutorial ? options.selectedOption : options.unselectedOption
          ]} 
          onPress={() => handleAnswerSelect(true)}
          activeOpacity={0.7}
        >
          <View style={options.optionIconContainer}>
            <Ionicons
              name="thumbs-up-outline"
              size={24}
              color={localShowTutorial ? palette.primary : palette.text.secondary}
            />
          </View>
          
          <View style={options.optionTextContainer}>
            <Text style={typography.optionTitle}>
              {t('onboarding.caloriesCounting.options.yes')}
            </Text>
          </View>
          
          <View style={[
            options.checkIconContainer,
            localShowTutorial ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
          ]}>
            {localShowTutorial && (
              <Ionicons name="checkmark" size={16} color={palette.text.white} />
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            options.optionContainer, 
            localShowTutorial === false ? options.selectedOption : options.unselectedOption
          ]} 
          onPress={() => handleAnswerSelect(false)}
          activeOpacity={0.7}
        >
          <View style={options.optionIconContainer}>
            <Ionicons
              name="close-outline"
              size={24}
              color={localShowTutorial === false ? palette.primary : palette.text.secondary}
            />
          </View>
          
          <View style={options.optionTextContainer}>
            <Text style={typography.optionTitle}>
              {t('onboarding.caloriesCounting.options.no')}
            </Text>
          </View>
          
          <View style={[
            options.checkIconContainer,
            localShowTutorial === false ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
          ]}>
            {localShowTutorial === false && (
              <Ionicons name="checkmark" size={16} color={palette.text.white} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      {localShowTutorial && (
        <View style={tutorials.container}>
          <Text style={tutorials.title}>
            {t('onboarding.caloriesCounting.tutorial.title')}
          </Text>
          
          <View style={tutorials.item}>
            <View style={tutorials.iconContainer}>
              <Text style={tutorials.iconText}>1</Text>
            </View>
            <Text style={tutorials.text}>
              {t('onboarding.caloriesCounting.tutorial.step1')}
            </Text>
          </View>
          
          <View style={tutorials.item}>
            <View style={tutorials.iconContainer}>
              <Text style={tutorials.iconText}>2</Text>
            </View>
            <Text style={tutorials.text}>
              {t('onboarding.caloriesCounting.tutorial.step2')}
            </Text>
          </View>
          
          <View style={tutorials.item}>
            <View style={tutorials.iconContainer}>
              <Text style={tutorials.iconText}>3</Text>
            </View>
            <Text style={tutorials.text}>
              {t('onboarding.caloriesCounting.tutorial.step3')}
            </Text>
          </View>
          
          <View style={tutorials.item}>
            <View style={tutorials.iconContainer}>
              <Text style={tutorials.iconText}>4</Text>
            </View>
            <Text style={tutorials.text}>
              {t('onboarding.caloriesCounting.tutorial.step4')}
            </Text>
          </View>
          
          <View style={tutorials.tip}>
            <Ionicons name="bulb-outline" size={24} color={palette.primary} style={tutorials.tipIcon} />
            <Text style={tutorials.tipText}>
              {t('onboarding.caloriesCounting.tutorial.tip')}
            </Text>
          </View>
        </View>
      )}
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default CalorieCountingScreen;
