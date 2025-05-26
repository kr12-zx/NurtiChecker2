import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SimplePicker from '../../../components/SimplePicker';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';

interface HeightScreenProps {
  onContinue: () => void;
  onBack: () => void;
  height: number; // в см
  onHeightChange: (height: number) => void;
  units: 'cm' | 'ft';
  onUnitsChange: (units: 'cm' | 'ft') => void;
}

const HeightScreen: React.FC<HeightScreenProps> = ({ 
  onContinue, 
  onBack, 
  height,
  onHeightChange,
  units,
  onUnitsChange
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Генерация значений для выбора роста
  const generateHeightValues = () => {
    if (units === 'cm') {
      // от 130 см до 220 см
      return Array.from({ length: 91 }, (_, i) => i + 130);
    } else {
      // Футы от 4'0" до 7'0"
      const feet = [];
      for (let ft = 4; ft <= 7; ft++) {
        for (let inch = 0; inch <= 11; inch++) {
          feet.push(`${ft}'${inch}"`);
        }
      }
      return feet;
    }
  };

  // Конвертация между единицами измерения
  const cmToFeet = (cm: number): string => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const feetToCm = (feetString: string): number => {
    const match = feetString.match(/(\d+)'(\d+)"/);
    if (!match) return 170; // значение по умолчанию
    
    const feet = parseInt(match[1]);
    const inches = parseInt(match[2]);
    const totalInches = feet * 12 + inches;
    return Math.round(totalInches * 2.54);
  };

  // Получаем текущее значение в правильных единицах
  const getCurrentValue = () => {
    if (units === 'cm') {
      return height;
    } else {
      return cmToFeet(height);
    }
  };

  const heightValues = generateHeightValues();

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkTextPrimary]}>Какой у вас рост?</Text>

      <View style={styles.unitsContainer}>
        <TouchableOpacity
          style={[
            styles.unitButton,
            isDark ? styles.unitButtonDark : styles.unitButtonLight,
            units === 'cm' && (isDark ? styles.activeUnitButtonDark : styles.activeUnitButtonLight)
          ]}
          onPress={() => onUnitsChange('cm')}
        >
          <Text
            style={[
              styles.unitButtonText,
              isDark ? styles.unitButtonTextDark : styles.unitButtonTextLight,
              units === 'cm' && styles.activeUnitButtonText
            ]}
          >
            см
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.unitButton,
            isDark ? styles.unitButtonDark : styles.unitButtonLight,
            units === 'ft' && (isDark ? styles.activeUnitButtonDark : styles.activeUnitButtonLight)
          ]}
          onPress={() => onUnitsChange('ft')}
        >
          <Text
            style={[
              styles.unitButtonText,
              isDark ? styles.unitButtonTextDark : styles.unitButtonTextLight,
              units === 'ft' && styles.activeUnitButtonText
            ]}
          >
            ft/in
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        {/* TODO: SimplePicker needs to be updated to support dark mode (e.g., accept an isDark prop) 
            and adjust its internal text/background colors based on the design system. */}
        <SimplePicker
          values={heightValues.map(value => typeof value === 'number' ? (value + (units === 'cm' ? ' см' : '')) : value)}
          selectedValue={typeof getCurrentValue() === 'number' ? (getCurrentValue() + (units === 'cm' ? ' см' : '')) : getCurrentValue()}
          onChange={(value) => {
            // Обрабатываем строку с единицами измерения
            const numericValue = typeof value === 'string' && units === 'cm' 
              ? parseInt(value.replace(' см', ''))
              : value;
              
            if (typeof numericValue === 'number') {
              onHeightChange(numericValue);
            } else {
              onHeightChange(feetToCm(numericValue as string));
            }
          }}
          pickerWidth={120}
          pickerHeight={200}
        />
      </View>
      
      <Text style={[styles.infoText, isDark && styles.darkTextSecondary]}>
        Ваш рост используется для определения оптимального веса
        и расчета суточной нормы калорий.
      </Text>

      <OnboardingNavButtons
        onContinue={onContinue}
        onBack={onBack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24, // Design system spacing
    backgroundColor: '#FFFFFF', // Светлая тема фон
  },
  darkContainer: {
    backgroundColor: '#121212', // Темная тема фон
  },
  title: { // H1 Onboarding
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24, // Spacing
    textAlign: 'center',
    color: '#333333', // Светлая тема основной текст
  },
  darkTextPrimary: {
    color: '#F5F5F5', // Темная тема основной текст
  },
  unitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24, // Spacing
  },
  unitButton: { // Option Button style
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 10, // Design system corner radius
    borderWidth: 1, // Optional: for better definition or remove if bg is enough
  },
  unitButtonLight: {
    backgroundColor: '#F0F0F0', // Светлая тема неактивный фон
    borderColor: '#F0F0F0', // or #E0E0E0 if border needed
  },
  unitButtonDark: {
    backgroundColor: '#2C2C2E', // Темная тема неактивный фон
    borderColor: '#2C2C2E', // or #3A3A3C if border needed
  },
  activeUnitButtonLight: {
    backgroundColor: '#007AFF', // Светлая тема активный фон
    borderColor: '#007AFF',
  },
  activeUnitButtonDark: {
    backgroundColor: '#0A84FF', // Темная тема активный фон
    borderColor: '#0A84FF',
  },
  unitButtonText: { // Option Button text style
    fontSize: 15,
    fontWeight: '500',
  },
  unitButtonTextLight: {
    color: '#333333', // Светлая тема неактивный текст
  },
  unitButtonTextDark: {
    color: '#F5F5F5', // Темная тема неактивный текст
  },
  activeUnitButtonText: {
    color: '#FFFFFF', // Активный текст (для обеих тем)
  },
  pickerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginBottom: 24, // Spacing
  },
  infoText: { // Body 2 style
    fontSize: 13,
    fontWeight: '400', // Regular
    textAlign: 'center',
    marginBottom: 32, // Spacing before nav buttons
    paddingHorizontal: 20, // Adjusted padding
    color: '#666666', // Светлая тема вторичный текст
  },
  darkTextSecondary: {
    color: '#A0A0A0', // Темная тема вторичный текст
  },
});

export default HeightScreen;
