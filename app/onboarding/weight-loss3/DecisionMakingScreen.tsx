import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, decisionMaking, options, palette, typography } from './unifiedStyles';

interface DecisionMakingScreenProps {
  onContinue: () => void;
  onBack: () => void;
  decisionConfidence: string | null;
  onDecisionConfidenceChange: (confidence: string) => void;
}

const DecisionMakingScreen: React.FC<DecisionMakingScreenProps> = ({ 
  onContinue, 
  onBack, 
  decisionConfidence,
  onDecisionConfidenceChange
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localDecisionConfidence, setLocalDecisionConfidence] = React.useState<string | null>(decisionConfidence || 'confident-doubt');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalDecisionConfidence(decisionConfidence);
  }, [decisionConfidence]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Функция обработки выбора уверенности в решениях
  const handleDecisionConfidenceSelect = (confidence: string) => {
    console.log('Выбрана уверенность в решениях:', confidence);
    // Обновляем локальное состояние немедленно
    setLocalDecisionConfidence(confidence);
    // Обновляем состояние в родительском компоненте
    onDecisionConfidenceChange(confidence);
  };

  const confidenceOptions = [
    { 
      id: 'fully-trust', 
      label: t('onboarding.decisionMaking.options.fullyTrust.label'),
      description: t('onboarding.decisionMaking.options.fullyTrust.description'),
      icon: 'shield-checkmark-outline'
    },
    { 
      id: 'confident-doubt', 
      label: t('onboarding.decisionMaking.options.confidentDoubt.label'),
      description: t('onboarding.decisionMaking.options.confidentDoubt.description'),
      icon: 'thumbs-up-outline'
    },
    { 
      id: 'often-unsure', 
      label: t('onboarding.decisionMaking.options.oftenUnsure.label'),
      description: t('onboarding.decisionMaking.options.oftenUnsure.description'),
      icon: 'help-circle-outline'
    },
    { 
      id: 'second-guess', 
      label: t('onboarding.decisionMaking.options.secondGuess.label'),
      description: t('onboarding.decisionMaking.options.secondGuess.description'),
      icon: 'repeat-outline'
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
              {t('onboarding.decisionMaking.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.decisionMaking.subtitle')}
            </Text>

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {confidenceOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localDecisionConfidence === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      decisionMaking.confidenceOption
                    ]}
                    onPress={() => handleDecisionConfidenceSelect(option.id)}
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
                    
                    <View style={[options.optionTextContainer, decisionMaking.confidenceTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={decisionMaking.descriptionText}>
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
          disableContinue={!localDecisionConfidence}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default DecisionMakingScreen;
