import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gender } from '../../types/onboarding';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';
import { unifiedStyles } from './unifiedStyles';

interface GenderScreenProps {
  onContinue: () => void;
  onBack: () => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
}

const GenderScreen: React.FC<GenderScreenProps> = ({ 
  onContinue, 
  onBack, 
  gender,
  onGenderChange
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const genderOptions: {id: Gender; label: string; icon: string}[] = [
    { id: 'male', label: 'Мужской', icon: 'male' },
    { id: 'female', label: 'Женский', icon: 'female' },
    { id: 'prefer-not-to-say', label: 'Предпочитаю не указывать', icon: 'person' },
  ];

  // Цвета из дизайн-системы
  const lightThemeColors = {
    accent: '#007AFF',
    secondaryText: '#666666',
    iconSelectedBg: '#FFFFFF', // Цвет иконки на фоне цвета акцента
  };

  const darkThemeColors = {
    accent: '#0A84FF',
    secondaryText: '#A0A0A0',
    iconSelectedBg: '#FFFFFF', // Цвет иконки на фоне цвета акцента
  };

  const currentThemeColors = isDark ? darkThemeColors : lightThemeColors;

  return (
    <View style={[unifiedStyles.container, isDark && unifiedStyles.darkContainer]}>
      <Text style={[unifiedStyles.title, isDark && unifiedStyles.darkTitle]}>Укажите ваш пол</Text>
      
      <Text style={[unifiedStyles.subtitle, isDark && unifiedStyles.darkSubtitle]}>
        Это нужно для более точного расчета энергетических потребностей вашего организма
      </Text>

      {/* Предполагается, что unifiedStyles.optionsContainer, .optionButton, .selectedOption, 
          .iconWrapper, .selectedIconWrapper, .optionLabel, .selectedLabel, 
          .radioWrapper, .radioWrapperSelected корректно стилизуют элементы согласно дизайн-системе. */}
      <View style={unifiedStyles.optionsContainer}>
        {genderOptions.map((option) => {
          const isSelected = gender === option.id;
          const iconColor = isSelected ? currentThemeColors.iconSelectedBg : currentThemeColors.secondaryText;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                unifiedStyles.optionButton,
                isSelected && unifiedStyles.selectedOption // unifiedStyles.selectedOption должен задавать фон цвета акцента
              ]}
              onPress={() => onGenderChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={[
                unifiedStyles.iconWrapper,
                isSelected && unifiedStyles.selectedIconWrapper // unifiedStyles.selectedIconWrapper также должен задавать фон цвета акцента
              ]}>
                <Ionicons
                  name={option.icon as any}
                  size={20} // Размер иконки согласно дизайн-системе (20-24px)
                  color={iconColor} 
                />
              </View>
              
              <Text 
                style={[
                  unifiedStyles.optionLabel,
                  isSelected && unifiedStyles.selectedLabel // unifiedStyles.selectedLabel должен корректно обрабатывать цвет текста для выбранного состояния
                ]}
              >
                {option.label}
              </Text>
              
              <TouchableOpacity
                style={[unifiedStyles.radioWrapper, isSelected && unifiedStyles.radioWrapperSelected]}
                onPress={() => onGenderChange(option.id)} // Дополнительный onPress для удобства, можно убрать если только родительский клик
              >
                {isSelected && <Ionicons name="checkmark-circle" size={16} color={currentThemeColors.accent} />}
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Используем новый компонент для кнопок навигации */}
      <OnboardingNavButtons
        onContinue={onContinue}
        onBack={onBack}
      />
    </View>
  );
};

// Локальные стили больше не нужны, так как используем унифицированные стили
const styles = StyleSheet.create({});

export default GenderScreen;
