import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { useCardStyles, useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

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
  // Получаем динамические стили
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  const cardStyles = useCardStyles();
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
            <Text style={[typography.optionTitle, { color: palette.text.primary }]}>
              {t('onboarding.caloriesCounting.options.yes')}
            </Text>
          </View>
          
          <View style={[
            options.checkIconContainer,
            localShowTutorial ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
          ]}>
            {localShowTutorial && (
              <Ionicons name="checkmark" size={16} color={palette.white} />
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
            <Text style={[typography.optionTitle, { color: palette.text.primary }]}>
              {t('onboarding.caloriesCounting.options.no')}
            </Text>
          </View>
          
          <View style={[
            options.checkIconContainer,
            localShowTutorial === false ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
          ]}>
            {localShowTutorial === false && (
              <Ionicons name="checkmark" size={16} color={palette.white} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      {localShowTutorial && (
        <View style={[cardStyles.infoContainer, { marginTop: 20 }]}>
          <Text style={[cardStyles.infoTitle, { marginBottom: 16 }]}>
            {t('onboarding.caloriesCounting.tutorial.title')}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: palette.white }}>1</Text>
            </View>
            <Text style={[cardStyles.infoText, { flex: 1 }]}>
              {t('onboarding.caloriesCounting.tutorial.step1')}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: palette.white }}>2</Text>
            </View>
            <Text style={[cardStyles.infoText, { flex: 1 }]}>
              {t('onboarding.caloriesCounting.tutorial.step2')}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: palette.white }}>3</Text>
            </View>
            <Text style={[cardStyles.infoText, { flex: 1 }]}>
              {t('onboarding.caloriesCounting.tutorial.step3')}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: palette.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: palette.white }}>4</Text>
            </View>
            <Text style={[cardStyles.infoText, { flex: 1 }]}>
              {t('onboarding.caloriesCounting.tutorial.step4')}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, padding: 16, backgroundColor: 'rgba(0, 122, 255, 0.1)', borderRadius: 12 }}>
            <Ionicons name="bulb-outline" size={24} color={palette.primary} style={{ marginRight: 12 }} />
            <Text style={[cardStyles.infoText, { flex: 1, fontStyle: 'italic' }]}>
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
