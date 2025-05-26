import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { UserProfile } from '../../types/onboarding';

// Импортируем современный синий стиль
import {
  containers,
  palette,
  typography,
} from './modernBlueStyles';

// Получаем размеры экрана
const { width, height } = Dimensions.get('window');

// Интерфейс для трудностей
interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface ChallengesScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

// Список возможных трудностей
const challenges: Challenge[] = [
  {
    id: 'emotional-eating',
    title: 'Эмоциональное питание',
    description: 'Я часто ем, когда испытываю стресс или другие сильные эмоции',
    icon: 'heart',
  },
  {
    id: 'lack-of-time',
    title: 'Нехватка времени',
    description: 'Мне не хватает времени на приготовление здоровой пищи',
    icon: 'time',
  },
  {
    id: 'social-pressure',
    title: 'Социальное давление',
    description: 'Трудно придерживаться диеты при встречах с друзьями или праздниках',
    icon: 'people',
  },
  {
    id: 'cravings',
    title: 'Сильные желания',
    description: 'Трудно отказаться от сладкого или других вредных продуктов',
    icon: 'flash',
  },
  {
    id: 'motivation',
    title: 'Недостаток мотивации',
    description: 'Сложно поддерживать режим питания длительное время',
    icon: 'battery-half',
  },
];

const ChallengesScreen: React.FC<ChallengesScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Состояния выбранных трудностей
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(
    (userProfile.challenges as string[]) || []
  );

  const toggleChallenge = (challengeId: string) => {
    if (selectedChallenges.includes(challengeId)) {
      setSelectedChallenges(selectedChallenges.filter(id => id !== challengeId));
    } else {
      setSelectedChallenges([...selectedChallenges, challengeId]);
    }
  };

  const handleContinue = () => {
    // Приводим типы к ожидаемым в UserProfile
    updateUserProfile({ challenges: selectedChallenges as any });
    onContinue();
  };

  return (
    <View style={styles.container}>
      {/* Основной контент с голубым фоном */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={containers.header}>
          <Text style={typography.headline}>
            С какими трудностями вы сталкиваетесь?
          </Text>
          <Text style={typography.subtitle}>
            Выберите препятствия, которые мешают вам достичь цели
          </Text>
        </View>

        <View style={containers.optionsGroup}>
          {challenges.map((challenge) => {
            const isSelected = selectedChallenges.includes(challenge.id);
            
            return (
              <TouchableOpacity
                key={challenge.id}
                style={[
                  styles.challengeOption,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: isSelected ? palette.primary : palette.border.light,
                  }
                ]}
                onPress={() => toggleChallenge(challenge.id)}
                activeOpacity={0.7}
              >
                <View style={styles.challengeIconContainer}>
                  <Ionicons 
                    name={challenge.icon as any} 
                    size={24} 
                    color={isSelected ? palette.primary : palette.icon.secondary} 
                  />
                </View>
                
                <View style={styles.challengeTextContainer}>
                  <Text style={[
                    styles.challengeTitle,
                    { color: isSelected ? palette.primary : palette.text.primary }
                  ]}>
                    {challenge.title}
                  </Text>
                  <Text style={styles.challengeDescription}>
                    {challenge.description}
                  </Text>
                </View>
                
                <View style={[
                  styles.checkboxContainer,
                  { borderColor: isSelected ? palette.primary : palette.border.medium }
                ]}>
                  {isSelected && (
                    <View style={styles.checkboxSelected}>
                      <Ionicons name="checkmark" size={18} color="#FFF" weight="bold" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Белый блок внизу экрана */}
      <View style={styles.whiteBottomBackground} />
      
      {/* Кнопки навигации */}
      <View style={styles.buttonContainer}>
        {/* Кнопка Назад */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        {/* Кнопка Продолжить */}
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Продолжить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2EDFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  // Белый фон внизу экрана
  whiteBottomBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60, // Уменьшена высота белого блока
    backgroundColor: '#FFFFFF',
  },
  
  // Контейнер для кнопок - горизонтальное расположение
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, 
    paddingHorizontal: 10,
    paddingTop: 16, 
    paddingBottom: 0, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Стили кнопок в соответствии с запросом
  backButton: {
    width: '35%', // Уже для кнопки Назад
    height: 44, // Еще меньшая высота
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  
  continueButton: {
    width: '60%', // Шире для кнопки Продолжить
    height: 44, // Такая же высота как у кнопки Назад
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  challengeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    // Тень для эффекта глубины и объема
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: palette.text.primary,
  },
  challengeDescription: {
    fontSize: 14,
    color: palette.text.secondary,
    lineHeight: 20,
  },
  checkboxContainer: {
    width: 22, // Уменьшение с 28 до 22
    height: 22, // Уменьшение с 28 до 22
    borderRadius: 22, // Сохраняем круглую форму
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    width: 18, // Уменьшение с 24 до 18
    height: 18, // Уменьшение с 24 до 18
    borderRadius: 18, // Сохраняем круглую форму
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChallengesScreen;
