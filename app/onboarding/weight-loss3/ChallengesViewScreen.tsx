import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, options, palette, typography } from './unifiedStyles';

interface ChallengesViewScreenProps {
  onContinue: () => void;
  onBack: () => void;
  challengesView: string | null;
  onChallengesViewChange: (view: string) => void;
}

const ChallengesViewScreen: React.FC<ChallengesViewScreenProps> = ({ 
  onContinue, 
  onBack, 
  challengesView,
  onChallengesViewChange
}) => {
  const { t } = useTranslation();
  
  // Добавляем локальное состояние для мгновенного отклика
  const [localChallengesView, setLocalChallengesView] = React.useState<string | null>(challengesView || 'growth-opportunity');
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalChallengesView(challengesView);
  }, [challengesView]);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Функция обработки выбора отношения к трудностям
  const handleChallengesViewSelect = (view: string) => {
    console.log('Выбрано отношение к трудностям:', view);
    // Обновляем локальное состояние немедленно
    setLocalChallengesView(view);
    // Обновляем состояние в родительском компоненте
    onChallengesViewChange(view);
  };

  const viewOptions = [
    { 
      id: 'growth-opportunity', 
      label: t('onboarding.challengesView.options.growthOpportunity.label'),
      description: t('onboarding.challengesView.options.growthOpportunity.description'),
      icon: 'trending-up-outline'
    },
    { 
      id: 'try-learn', 
      label: t('onboarding.challengesView.options.tryLearn.label'),
      description: t('onboarding.challengesView.options.tryLearn.description'),
      icon: 'school-outline'
    },
    { 
      id: 'avoid-failure', 
      label: t('onboarding.challengesView.options.avoidFailure.label'),
      description: t('onboarding.challengesView.options.avoidFailure.description'),
      icon: 'exit-outline'
    },
    { 
      id: 'too-difficult', 
      label: t('onboarding.challengesView.options.tooDifficult.label'),
      description: t('onboarding.challengesView.options.tooDifficult.description'),
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
              {t('onboarding.challengesView.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.challengesView.subtitle')}
            </Text>

            <View style={[containers.optionsList, { marginTop: 20 }]}>
              {viewOptions.map((option) => {
                // Используем локальное состояние для отображения выбранного варианта
                const isSelected = localChallengesView === option.id;
                
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      options.optionContainer,
                      isSelected ? options.selectedOption : options.unselectedOption,
                      styles.viewOption
                    ]}
                    onPress={() => handleChallengesViewSelect(option.id)}
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
                    
                    <View style={[options.optionTextContainer, styles.viewTextContainer]}>
                      <Text style={typography.optionTitle}>
                        {option.label}
                      </Text>
                      <Text style={styles.descriptionText}>
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
          disableContinue={!localChallengesView}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  viewOption: {
    marginBottom: 12,
    paddingVertical: 16,
  },
  viewTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  descriptionText: {
    fontSize: 12,
    color: palette.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  }
});

export default ChallengesViewScreen;
