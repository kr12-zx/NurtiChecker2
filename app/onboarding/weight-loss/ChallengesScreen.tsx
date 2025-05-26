import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { Challenge } from '../../types/onboarding';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';

interface ChallengesScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function ChallengesScreen({ onContinue, onBack }: ChallengesScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { challenges, setChallenges, validateOnboardingStep } = useOnboardingStore();
  
  // Инициализируем массив challenges, если он пустой
  const selectedChallenges = challenges || [];
  
  // Активируем кнопку Далее только если выбрана хотя бы одна проблема
  const [isNextEnabled, setIsNextEnabled] = useState(selectedChallenges.length > 0);

  // Определяем список основных препятствий
  const challengeOptions: {id: Challenge; label: string; description: string; icon: string}[] = [
    { 
      id: 'emotional-eating', 
      label: 'Эмоциональное питание', 
      description: 'Я часто ем, когда испытываю стресс или другие сильные эмоции',
      icon: 'heart' 
    },
    { 
      id: 'lack-of-time', 
      label: 'Нехватка времени', 
      description: 'Мне не хватает времени на приготовление здоровой пищи',
      icon: 'time' 
    },
    { 
      id: 'social-pressure', 
      label: 'Социальное давление', 
      description: 'Сложно придерживаться диеты на встречах с друзьями или праздниках',
      icon: 'people' 
    },
    { 
      id: 'cravings', 
      label: 'Сильные желания', 
      description: 'Трудно отказаться от сладкого или других вредных продуктов',
      icon: 'ice-cream' 
    },
    { 
      id: 'lack-of-motivation', 
      label: 'Недостаток мотивации', 
      description: 'Сложно поддерживать режим питания длительное время',
      icon: 'battery-dead' 
    },
  ];

  // Обработчик выбора/отмены выбора препятствия
  const toggleChallenge = (challenge: Challenge) => {
    let newChallenges: Challenge[];
    
    if (selectedChallenges.includes(challenge)) {
      // Если уже выбрано - удаляем
      newChallenges = selectedChallenges.filter(c => c !== challenge);
    } else {
      // Если не выбрано - добавляем
      newChallenges = [...selectedChallenges, challenge];
    }
    
    setChallenges(newChallenges);
    setIsNextEnabled(newChallenges.length > 0);
  };
  
  // Переход на следующий экран
  const handleNext = () => {
    if (validateOnboardingStep('challenges')) {
      onContinue();
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>С какими трудностями вы сталкиваетесь?</Text>
      
      <Text style={[styles.subtitle, isDark && styles.darkSecondaryText]}>
        Выберите препятствия, которые мешают вам достичь цели
      </Text>

      <View style={styles.optionsContainer}>
        {challengeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedChallenges.includes(option.id) && styles.selectedOption
            ]}
            onPress={() => toggleChallenge(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <View style={[
                styles.iconWrapper,
                selectedChallenges.includes(option.id) && styles.selectedIconWrapper
              ]}>
                <Ionicons
                  name={option.icon as any}
                  size={22}
                  color={selectedChallenges.includes(option.id) ? "#007AFF" : "#666666"}
                />
              </View>
              
              <View style={styles.optionLabelContainer}>
                <Text 
                  style={[
                    styles.optionLabel,
                    selectedChallenges.includes(option.id) && styles.selectedText
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    selectedChallenges.includes(option.id) && styles.selectedDescription
                  ]}
                >
                  {option.description}
                </Text>
              </View>
              
              <View style={[
                styles.checkboxWrapper, 
                selectedChallenges.includes(option.id) && styles.selectedCheckbox
              ]}>
                {selectedChallenges.includes(option.id) && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <OnboardingNavButtons 
        onContinue={handleNext} 
        onBack={onBack}
        continueEnabled={isNextEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
    paddingHorizontal: 10,
  },
  darkSecondaryText: {
    color: '#AAAAAA',
  },
  optionsContainer: {
    width: '95%',
    maxHeight: '70%',
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  selectedOption: {
    backgroundColor: '#F0F7FF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIconWrapper: {
    backgroundColor: '#E6F2FF',
  },
  optionLabelContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  optionDescription: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
    paddingRight: 10,
  },
  selectedText: {
    color: '#007AFF',
  },
  selectedDescription: {
    color: '#0077CC',
  },
  checkboxWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});
