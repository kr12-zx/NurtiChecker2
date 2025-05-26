import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, mealFeelings, options, palette, typography } from './unifiedStyles';

interface MealFeelingsScreenProps {
  onContinue: () => void;
  onBack: () => void;
  mealFeeling: string | null;
  onMealFeelingChange: (feeling: string) => void;
}

const MealFeelingsScreen: React.FC<MealFeelingsScreenProps> = ({ 
  onContinue, 
  onBack, 
  mealFeeling,
  onMealFeelingChange
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localMealFeeling, setLocalMealFeeling] = React.useState<string | null>(mealFeeling || 'energized');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalMealFeeling(mealFeeling);
  }, [mealFeeling]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Функция обработки выбора самочувствия после еды
  const handleMealFeelingSelect = (feeling: string) => {
    console.log('Выбрано самочувствие после еды:', feeling);
    // Обновляем локальное состояние немедленно
    setLocalMealFeeling(feeling);
    // Обновляем состояние в родительском компоненте
    onMealFeelingChange(feeling);
  };

  const feelingOptions = [
    { 
      id: 'energized', 
      label: t('onboarding.mealFeelings.options.energized'),
      description: t('onboarding.mealFeelings.descriptions.energized'),
      icon: 'battery-charging-outline'
    },
    { 
      id: 'satisfied', 
      label: t('onboarding.mealFeelings.options.satisfied'),
      description: t('onboarding.mealFeelings.descriptions.satisfied'),
      icon: 'restaurant-outline'
    },
    { 
      id: 'tired', 
      label: t('onboarding.mealFeelings.options.tired'),
      description: t('onboarding.mealFeelings.descriptions.tired'),
      icon: 'bed-outline'
    },
    { 
      id: 'bloated', 
      label: t('onboarding.mealFeelings.options.bloated'),
      description: t('onboarding.mealFeelings.descriptions.bloated'),
      icon: 'fitness-outline'
    },
    { 
      id: 'stillHungry', 
      label: t('onboarding.mealFeelings.options.stillHungry'),
      description: t('onboarding.mealFeelings.descriptions.stillHungry'),
      icon: 'time-outline'
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
              {t('onboarding.mealFeelings.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.mealFeelings.subtitle')}
            </Text>

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {feelingOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localMealFeeling === option.id;
                // Исправляем иконку для вздутия
                const iconName = option.id === 'bloated' ? 'fitness-outline' : option.icon;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      mealFeelings.feelingOption
                    ]}
                    onPress={() => handleMealFeelingSelect(option.id)}
                    activeOpacity={0.5}
                    // Увеличиваем область нажатия для лучшего отклика
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={options.optionIconContainer}>
                      <Ionicons
                        name={iconName as any}
                        size={24}
                        color={isSelected ? palette.primary : palette.text.secondary}
                      />
                    </View>
                    
                    <View style={[options.optionTextContainer, mealFeelings.feelingTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={mealFeelings.descriptionText}>
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
            
            <Text style={mealFeelings.disclaimerText}>
              {t('onboarding.mealFeelings.disclaimer')}
            </Text>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter 
          onBack={onBack}
          onContinue={onContinue} 
          disableContinue={!localMealFeeling}
        />
      </View>
    </SafeAreaView>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default MealFeelingsScreen;
