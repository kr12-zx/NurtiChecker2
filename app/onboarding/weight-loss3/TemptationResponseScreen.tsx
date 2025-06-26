import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { useContainerStyles, useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface TemptationResponseScreenProps {
  onContinue: () => void;
  onBack: () => void;
  temptationResponse: string | null;
  onTemptationResponseChange: (response: string) => void;
}

const TemptationResponseScreen: React.FC<TemptationResponseScreenProps> = ({ 
  onContinue, 
  onBack, 
  temptationResponse,
  onTemptationResponseChange
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localTemptationResponse, setLocalTemptationResponse] = React.useState<string | null>(temptationResponse || 'usually-control');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalTemptationResponse(temptationResponse);
  }, [temptationResponse]);
  
  // Получаем динамические стили
  const palette = usePalette();
  const containers = useContainerStyles();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Функция обработки выбора реакции на искушения
  const handleTemptationResponseSelect = (response: string) => {
    console.log('Выбрана реакция на искушения:', response);
    // Обновляем локальное состояние немедленно
    setLocalTemptationResponse(response);
    // Обновляем состояние в родительском компоненте
    onTemptationResponseChange(response);
  };

  const responseOptions = [
    { 
      id: 'easily-resist', 
      label: t('onboarding.temptationResponse.options.easilyResist.label'),
      description: t('onboarding.temptationResponse.options.easilyResist.description'),
      icon: 'shield-checkmark-outline'
    },
    { 
      id: 'usually-control', 
      label: t('onboarding.temptationResponse.options.usuallyControl.label'),
      description: t('onboarding.temptationResponse.options.usuallyControl.description'),
      icon: 'thumbs-up-outline'
    },
    { 
      id: 'try-resist', 
      label: t('onboarding.temptationResponse.options.tryResist.label'),
      description: t('onboarding.temptationResponse.options.tryResist.description'),
      icon: 'trending-up-outline'
    },
    { 
      id: 'often-give-in', 
      label: t('onboarding.temptationResponse.options.oftenGiveIn.label'),
      description: t('onboarding.temptationResponse.options.oftenGiveIn.description'),
      icon: 'alert-circle-outline'
    }
  ];

  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      <View style={containers.rootContainer}>
        {/* Основной контент */}
        <View style={containers.contentContainer}>
          <ScrollView 
            style={containers.scrollView}
            contentContainerStyle={containers.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={typography.screenTitle}>
              {t('onboarding.temptationResponse.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.temptationResponse.subtitle')}
            </Text>

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {responseOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localTemptationResponse === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      { marginBottom: 16 }
                    ]}
                    onPress={() => handleTemptationResponseSelect(option.id)}
                    activeOpacity={0.5}
                    // Увеличиваем область нажатия для лучшего отклика
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={options.optionIconContainer}>
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={isSelected ? palette.primary : palette.text.secondary}
                      />
                    </View>
                    
                    <View style={[options.optionTextContainer, { flex: 1 }]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={[typography.optionDescription, { marginTop: 4 }]}>
                        {option.description}
                      </Text>
                    </View>
                    
                    <View style={[
                      options.checkIconContainer,
                      isSelected ? options.selectedCheckIconContainer : options.unselectedCheckIconContainer
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={palette.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue} 
          disableContinue={!localTemptationResponse}
        />
      </View>
    </SafeAreaView>
  );
};

export default TemptationResponseScreen;
