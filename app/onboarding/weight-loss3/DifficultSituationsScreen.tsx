import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { useContainerStyles, useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface DifficultSituationsScreenProps {
  onContinue: () => void;
  onBack: () => void;
  difficultSituationsHandling: string | null;
  onDifficultSituationsHandlingChange: (handling: string) => void;
}

const DifficultSituationsScreen: React.FC<DifficultSituationsScreenProps> = ({ 
  onContinue, 
  onBack, 
  difficultSituationsHandling,
  onDifficultSituationsHandlingChange
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localHandling, setLocalHandling] = React.useState<string | null>(difficultSituationsHandling || 'cope-most');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalHandling(difficultSituationsHandling);
  }, [difficultSituationsHandling]);
  
  // Получаем динамические стили
  const palette = usePalette();
  const containers = useContainerStyles();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  
  // Функция обработки выбора способа управления сложными ситуациями
  const handleDifficultSituationsSelect = (handling: string) => {
    console.log('Выбран способ справляться со сложными ситуациями:', handling);
    // Обновляем локальное состояние немедленно
    setLocalHandling(handling);
    // Обновляем состояние в родительском компоненте
    onDifficultSituationsHandlingChange(handling);
  };

  const handlingOptions = [
    { 
      id: 'handle-well', 
      label: t('onboarding.difficultSituations.options.handleWell.label'),
      description: t('onboarding.difficultSituations.options.handleWell.description'),
      icon: 'checkmark-done-outline'
    },
    { 
      id: 'cope-most', 
      label: t('onboarding.difficultSituations.options.copeMost.label'),
      description: t('onboarding.difficultSituations.options.copeMost.description'),
      icon: 'thumbs-up-outline'
    },
    { 
      id: 'struggle-stuck', 
      label: t('onboarding.difficultSituations.options.struggleStuck.label'),
      description: t('onboarding.difficultSituations.options.struggleStuck.description'),
      icon: 'warning-outline'
    },
    { 
      id: 'hard-manage', 
      label: t('onboarding.difficultSituations.options.hardManage.label'),
      description: t('onboarding.difficultSituations.options.hardManage.description'),
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
              {t('onboarding.difficultSituations.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.difficultSituations.subtitle')}
            </Text>

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {handlingOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localHandling === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      { marginBottom: 16 }
                    ]}
                    onPress={() => handleDifficultSituationsSelect(option.id)}
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
          disableContinue={!localHandling}
        />
      </View>
    </SafeAreaView>
  );
};

export default DifficultSituationsScreen;
