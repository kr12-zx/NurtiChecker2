import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../i18n/i18n';
import { Challenge } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { useOptionsStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface ChallengesScreenProps {
  onContinue: () => void;
  onBack: () => void;
  challenges: Challenge[];
  onChallengesChange: (challenges: Challenge[]) => void;
}

const ChallengesScreen: React.FC<ChallengesScreenProps> = ({ 
  onContinue, 
  onBack, 
  challenges,
  onChallengesChange
}) => {
  // Добавляем локальное состояние для мгновенного отклика
  const [localChallenges, setLocalChallenges] = React.useState<Challenge[]>(challenges.length > 0 ? challenges : ['emotional-eating']);
  
  // Получаем динамические стили
  const palette = usePalette();
  const options = useOptionsStyles();
  const typography = useTypographyStyles();
  const { t } = useTranslation();
  
  // Динамические стили для этого экрана
  const optionsContainerStyle = {
    marginTop: 20,
  };
  
  // Обновляем локальное состояние при изменении пропсов
  React.useEffect(() => {
    setLocalChallenges(challenges);
  }, [challenges]);

  const challengeOptions: {id: Challenge; label: string; icon: string; description: string}[] = [
    { 
      id: 'emotional-eating', 
      label: t('onboarding.challenges.options.emotionalEating'), 
      icon: 'heart-outline',
      description: t('onboarding.challenges.descriptions.emotionalEating')
    },
    { 
      id: 'lack-of-time', 
      label: t('onboarding.challenges.options.timeConstraints'), 
      icon: 'time-outline',
      description: t('onboarding.challenges.descriptions.timeConstraints')
    },
    { 
      id: 'social-pressure', 
      label: t('onboarding.challenges.options.socialPressure'), 
      icon: 'people-outline',
      description: t('onboarding.challenges.descriptions.socialPressure')
    },
    { 
      id: 'cravings', 
      label: t('onboarding.challenges.options.cravings'), 
      icon: 'flame-outline',
      description: t('onboarding.challenges.descriptions.cravings')
    },
    { 
      id: 'night-eating', 
      label: t('onboarding.challenges.options.nightEating'), 
      icon: 'moon-outline',
      description: t('onboarding.challenges.descriptions.nightEating')
    },
    { 
      id: 'lack-of-motivation', 
      label: t('onboarding.challenges.options.lackOfMotivation'), 
      icon: 'battery-dead-outline',
      description: t('onboarding.challenges.descriptions.lackOfMotivation')
    },
    { 
      id: 'stress', 
      label: t('onboarding.challenges.options.stress'), 
      icon: 'thunderstorm-outline',
      description: t('onboarding.challenges.descriptions.stress')
    },
    { 
      id: 'lack-of-knowledge', 
      label: t('onboarding.challenges.options.lackOfKnowledge'), 
      icon: 'help-outline',
      description: t('onboarding.challenges.descriptions.lackOfKnowledge')
    }
  ];

  // Функция для переключения вызова в списке выбранных
  const toggleChallenge = (challengeId: Challenge) => {
    console.log('Выбрано препятствие:', challengeId);
    
    // Обновляем локальное состояние немедленно
    let newChallenges: Challenge[];
    if (localChallenges.includes(challengeId)) {
      newChallenges = localChallenges.filter(id => id !== challengeId);
      setLocalChallenges(newChallenges);
    } else {
      newChallenges = [...localChallenges, challengeId];
      setLocalChallenges(newChallenges);
    }
    
    // Обновляем состояние в родительском компоненте
    onChallengesChange(newChallenges);
  };

  return (
    <OnboardingLayout
      title={t('onboarding.challenges.title')}
      subtitle={t('onboarding.challenges.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
    >
      <View style={optionsContainerStyle}>
        {challengeOptions.map((option) => {
          // Используем локальное состояние для отображения выбранных вариантов
          const isSelected = localChallenges.includes(option.id);
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                options.optionContainer,
                isSelected ? options.selectedOption : options.unselectedOption
              ]}
              onPress={() => toggleChallenge(option.id)}
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
              
              <View style={options.optionTextContainer}>
                <Text style={typography.optionTitle}>
                  {option.label}
                </Text>
                <Text style={typography.optionDescription}>
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
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default ChallengesScreen;
