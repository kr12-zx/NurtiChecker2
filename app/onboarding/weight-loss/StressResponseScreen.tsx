import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../stores/onboardingStore';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';

interface StressResponseScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function StressResponseScreen({ onContinue, onBack }: StressResponseScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { stressResponse, setStressResponse, validateOnboardingStep } = useOnboardingStore();

  // Определяем варианты реакции на стресс
  const responseOptions = [
    { 
      id: 'emotional-eater', 
      label: 'Я заедаю стресс', 
      description: 'В стрессовых ситуациях я склонен(на) употреблять больше пищи',
      icon: 'fast-food' 
    },
    { 
      id: 'stress-exerciser', 
      label: 'Физическая активность', 
      description: 'Я снимаю стресс через упражнения или физическую активность',
      icon: 'fitness' 
    },
    { 
      id: 'stress-avoider', 
      label: 'Я избегаю стресса', 
      description: 'Я стараюсь отвлечься или избегать стрессовых ситуаций',
      icon: 'cloud' 
    },
    { 
      id: 'stress-processor', 
      label: 'Я обдумываю ситуацию', 
      description: 'Я анализирую ситуацию и стараюсь найти решение',
      icon: 'brain' 
    },
    { 
      id: 'stress-sleeper', 
      label: 'Я нарушаю режим сна', 
      description: 'Стресс влияет на мой сон и режим отдыха',
      icon: 'bed' 
    },
  ];
  
  // Обработчик выбора типа реакции на стресс
  const onStressResponseChange = (responseType: string) => {
    setStressResponse(responseType);
  };
  
  // Переход на следующий экран
  const handleNext = () => {
    if (validateOnboardingStep('stressResponse')) {
      onContinue();
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>Как вы реагируете на стресс?</Text>
      
      <Text style={[styles.subtitle, isDark && styles.darkSecondaryText]}>
        Ваш способ справляться со стрессом влияет на пищевые привычки
      </Text>

      <View style={styles.optionsContainer}>
        {responseOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              stressResponse === option.id && styles.selectedOption
            ]}
            onPress={() => onStressResponseChange(option.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconWrapper,
              stressResponse === option.id && styles.selectedIconWrapper
            ]}>
              <Ionicons
                name={option.icon as any}
                size={22}
                color={stressResponse === option.id ? "#007AFF" : "#666666"}
              />
            </View>
            
            <View style={styles.optionLabelContainer}>
              <Text 
                style={[
                  styles.optionLabel,
                  stressResponse === option.id && styles.selectedText
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  stressResponse === option.id && styles.selectedDescription
                ]}
              >
                {option.description}
              </Text>
            </View>
            
            {stressResponse === option.id && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" style={styles.checkmark} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <OnboardingNavButtons 
        onContinue={handleNext} 
        onBack={onBack}
        continueEnabled={!!stressResponse}
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
  checkmark: {
    marginLeft: 8,
  },
});
