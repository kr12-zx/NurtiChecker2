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

interface ConfidenceLevelScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function ConfidenceLevelScreen({ onContinue, onBack }: ConfidenceLevelScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { confidenceLevel, setConfidenceLevel, validateOnboardingStep } = useOnboardingStore();

  // Определяем варианты уровней уверенности
  const confidenceLevels = [
    { 
      id: 5, 
      label: 'Очень уверен(а)', 
      description: 'Я точно знаю, что достигну своей цели',
      icon: 'trophy' 
    },
    { 
      id: 4, 
      label: 'Уверен(а)', 
      description: 'Я верю, что смогу достичь своей цели с небольшими трудностями',
      icon: 'thumbs-up' 
    },
    { 
      id: 3, 
      label: 'Умеренно уверен(а)', 
      description: 'У меня есть сомнения, но я готов(а) попробовать',
      icon: 'help-buoy' 
    },
    { 
      id: 2, 
      label: 'Не очень уверен(а)', 
      description: 'Мне будет сложно придерживаться плана',
      icon: 'shuffle' 
    },
    { 
      id: 1, 
      label: 'Совсем не уверен(а)', 
      description: 'Я пробую, но имею серьезные сомнения',
      icon: 'warning' 
    },
  ];

  // Обработчик выбора уровня уверенности
  const onConfidenceLevelChange = (level: number) => {
    setConfidenceLevel(level);
  };
  
  // Переход на следующий экран
  const handleNext = () => {
    if (validateOnboardingStep('confidenceLevel')) {
      onContinue();
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>Насколько вы уверены в успехе?</Text>
      
      <Text style={[styles.subtitle, isDark && styles.darkSecondaryText]}>
        Ваша уверенность - ключевой фактор в достижении цели
      </Text>

      <View style={styles.optionsContainer}>
        {confidenceLevels.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              confidenceLevel === option.id && styles.selectedOption
            ]}
            onPress={() => onConfidenceLevelChange(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.iconWrapper,
                confidenceLevel === option.id && styles.selectedIconWrapper
              ]}>
                <Ionicons
                  name={option.icon as any}
                  size={22}
                  color={confidenceLevel === option.id ? "#007AFF" : "#666666"}
                />
              </View>
              
              <View style={styles.textContainer}>
                <Text 
                  style={[
                    styles.optionLabel,
                    confidenceLevel === option.id && styles.selectedText
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    confidenceLevel === option.id && styles.selectedDescription
                  ]}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
              </View>
            </View>
            
            {confidenceLevel === option.id && (
              <View style={styles.confidenceIndicator}>
                <View style={styles.confidenceDot} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {confidenceLevel && confidenceLevel <= 2 && (
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={20} color="#007AFF" style={styles.infoIcon} />
          <Text style={styles.tipText}>
            Не беспокойтесь! Мы создадим для вас план, учитывающий сложности и поможем построить уверенность шаг за шагом.
          </Text>
        </View>
      )}

      <OnboardingNavButtons 
        onContinue={handleNext} 
        onBack={onBack}
        continueEnabled={!!confidenceLevel}
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
    maxHeight: '60%',
    marginBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  textContainer: {
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
  confidenceIndicator: {
    marginLeft: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 16,
    width: '95%',
  },
  infoIcon: {
    marginRight: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#333333',
    flex: 1,
    lineHeight: 18,
  },
});
