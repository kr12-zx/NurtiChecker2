import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../types/onboarding';

// Импортируем новые унифицированные стили
import {
  containers,
  typography,
  options,
  getThemeColors,
  getOptionStyles,
  getSelectionIndicatorStyles,
  getButtonStyles,
  getOptionTextStyles,
  getNeomorphicStyle,
  palette
} from './unifiedStyles';

interface ConfidenceLevelScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const confidenceLevels: { value: number; label: string }[] = [
  { value: 1, label: '1 - Совсем не уверен(а)' },
  { value: 2, label: '2 - Скорее не уверен(а)' },
  { value: 3, label: '3 - Нейтрально / Не знаю' },
  { value: 4, label: '4 - Скорее уверен(а)' },
  { value: 5, label: '5 - Полностью уверен(а)' },
];

const ConfidenceLevelScreen: React.FC<ConfidenceLevelScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  // Получаем текущую тему
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = getThemeColors(isDark);

  const [selectedConfidence, setSelectedConfidence] = useState<number | undefined>(
    userProfile.confidenceLevel
  );

  const handleSelectConfidence = (level: number) => {
    setSelectedConfidence(level);
  };

  const handleContinue = () => {
    if (selectedConfidence) {
      updateUserProfile({ confidenceLevel: selectedConfidence });
      onContinue();
    }
  };

  const canContinue = selectedConfidence !== undefined;
  
  // Получаем стили кнопок в зависимости от темы
  const primaryButtonStyles = getButtonStyles('primary', isDark);
  const secondaryButtonStyles = getButtonStyles('secondary', isDark);
  const disabledButtonStyles = getButtonStyles('disabled', isDark);

  // Используем красивый лавандовый фон
  const backgroundStyle = { backgroundColor: palette.background.lavender };
  
  return (
    <View style={[containers.screen, backgroundStyle]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[containers.content, { backgroundColor: 'transparent' }]}>
          <View style={containers.header}>
            <Text style={[typography.headline, { color: themeColors.textPrimary }]}>
              Уверенность в цели
            </Text>
            <Text style={[typography.subtitle, { color: themeColors.textSecondary }]}>
              Насколько вы уверены в достижении своих целей?
            </Text>
          </View>

          <View style={containers.optionsGroup}>
            {confidenceLevels.map((option) => {
              const isSelected = selectedConfidence === option.value;
              const optionStyles = getOptionStyles(isSelected, isDark);
              const { indicatorStyle, dotStyle } = getSelectionIndicatorStyles(isSelected, isDark);
              const textStyles = getOptionTextStyles(isSelected, isDark);
              
              // Создаем неоморфный стиль для опций
              const modernOptionStyle = {
                backgroundColor: isSelected ? 'rgba(93, 95, 239, 0.1)' : '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                shadowOpacity: isSelected ? 0.2 : 0.1,
                shadowRadius: isSelected ? 8 : 4,
                elevation: isSelected ? 4 : 2,
                borderWidth: isSelected ? 2 : 0,
                borderColor: isSelected ? palette.primary : 'transparent',
              };
              
              return (
                <TouchableOpacity
                  key={option.value}
                  style={modernOptionStyle}
                  onPress={() => handleSelectConfidence(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[
                      typography.optionTitle,
                      { 
                        color: isSelected ? palette.primary : themeColors.textPrimary,
                        fontSize: 16,
                        fontWeight: isSelected ? '600' : '500',
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                  
                  <View style={{
                    width: 24, 
                    height: 24, 
                    borderRadius: 12, 
                    borderWidth: 2,
                    borderColor: isSelected ? palette.primary : '#E0E0E0',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {isSelected && (
                      <View style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: palette.primary,
                      }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[containers.navigationButtons, { marginBottom: 20 }]}>
        <TouchableOpacity
          style={{
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            borderWidth: 2,
            borderColor: palette.primary,
            backgroundColor: 'transparent',
          }}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={{
            color: palette.primary,
            fontSize: 18,
            fontWeight: '600',
          }}>
            Назад
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            backgroundColor: canContinue ? palette.primary : '#CCCCCC',
            shadowColor: canContinue ? palette.primary : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: canContinue ? 5 : 0,
          }}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!canContinue}
        >
          <Text style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '600',
          }}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default ConfidenceLevelScreen;
