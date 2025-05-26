import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, options, palette, setbacksResponseStyles, typography } from './unifiedStyles';

interface SetbacksResponseScreenProps {
  onContinue: () => void;
  onBack: () => void;
  setbacksResponse: string | null;
  onSetbacksResponseChange: (response: string) => void;
}

const SetbacksResponseScreen: React.FC<SetbacksResponseScreenProps> = ({ 
  onContinue, 
  onBack, 
  setbacksResponse,
  onSetbacksResponseChange
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localSetbacksResponse, setLocalSetbacksResponse] = React.useState<string | null>(setbacksResponse || 'bounce-back');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalSetbacksResponse(setbacksResponse);
  }, [setbacksResponse]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Функция обработки выбора реакции на неудачи
  const handleSetbacksResponseSelect = (response: string) => {
    console.log('Выбрана реакция на неудачи:', response);
    // Обновляем локальное состояние немедленно
    setLocalSetbacksResponse(response);
    // Обновляем состояние в родительском компоненте
    onSetbacksResponseChange(response);
  };

  const responseOptions = [
    { 
      id: 'bounce-back', 
      label: t('onboarding.setbacksResponse.options.bounceBack.label'),
      description: t('onboarding.setbacksResponse.options.bounceBack.description'),
      icon: 'refresh-outline'
    },
    { 
      id: 'recover-effort', 
      label: t('onboarding.setbacksResponse.options.recoverEffort.label'),
      description: t('onboarding.setbacksResponse.options.recoverEffort.description'),
      icon: 'timer-outline'
    },
    { 
      id: 'hard-back', 
      label: t('onboarding.setbacksResponse.options.hardBack.label'),
      description: t('onboarding.setbacksResponse.options.hardBack.description'),
      icon: 'trending-down-outline'
    },
    { 
      id: 'struggle-recover', 
      label: t('onboarding.setbacksResponse.options.struggleRecover.label'),
      description: t('onboarding.setbacksResponse.options.struggleRecover.description'),
      icon: 'warning-outline'
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
              {t('onboarding.setbacksResponse.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.setbacksResponse.subtitle')}
            </Text>

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {responseOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localSetbacksResponse === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      setbacksResponseStyles.responseOption
                    ]}
                    onPress={() => handleSetbacksResponseSelect(option.id)}
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
                    
                    <View style={[options.optionTextContainer, setbacksResponseStyles.responseTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={setbacksResponseStyles.descriptionText}>
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
          disableContinue={!localSetbacksResponse}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default SetbacksResponseScreen;
