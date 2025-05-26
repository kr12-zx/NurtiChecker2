import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SimplePicker from '../../../components/SimplePicker';
import { useTranslation } from '../../../i18n/i18n';
import { UnitSettings } from '../../types/onboarding';
import { OnboardingLayout } from './unifiedLayouts';
import { heightWeight, usePalette } from './unifiedStyles';

interface HeightWeightScreenProps {
  onContinue: () => void;
  onBack: () => void;
  height: number; // в см
  onHeightChange: (height: number) => void;
  currentWeight: number; // в кг
  onWeightChange: (weight: number) => void;
  unitSettings: UnitSettings;
}

const HeightWeightScreen: React.FC<HeightWeightScreenProps> = ({ 
  onContinue, 
  onBack, 
  height,
  onHeightChange,
  currentWeight,
  onWeightChange,
  unitSettings
}) => {
  // Получаем палитру цветов
  const palette = usePalette();
  const { t } = useTranslation();
  
  // Состояние для активной вкладки (рост или вес)
  const [activeTab, setActiveTab] = useState<'height' | 'weight'>('height');
  
  // Локальное состояние для значений высоты и веса
  const [localHeight, setLocalHeight] = useState(height);
  const [localWeight, setLocalWeight] = useState(currentWeight);
  
  // Обновляем локальное состояние при изменении пропсов
  useEffect(() => {
    setLocalHeight(height);
  }, [height]);
  
  useEffect(() => {
    setLocalWeight(currentWeight);
  }, [currentWeight]);

  // Функции для конвертации между метрической и имперской системами
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

  const kgToLbs = (kg: number): number => {
    return Math.round(kg * 2.20462);
  };

  const lbsToKg = (lbs: number): number => {
    return Math.round(lbs / 2.20462);
  };

  // Упрощаем формат значений, чтобы не было строк с единицами измерения
  const generateSimpleHeightValues = () => {
    if (unitSettings.height === 'cm') {
      // от 130 см до 220 см
      return Array.from({ length: 91 }, (_, i) => i + 130);
    } else {
      // Вместо строк типа "5'11" используем числовые значения в дюймах
      // Рост от 4'0" (48 дюймов) до 7'11" (95 дюймов)
      return Array.from({ length: 48 }, (_, i) => i + 48);
    }
  };

  const generateSimpleWeightValues = () => {
    if (unitSettings.weight === 'kg') {
      // от 40 кг до 200 кг
      return Array.from({ length: 161 }, (_, i) => i + 40);
    } else {
      // от 88 фунтов до 440 фунтов
      return Array.from({ length: 353 }, (_, i) => i + 88);
    }
  };
  
  // Функции для обновления роста и веса
  const updateHeight = (newHeight: number | string) => {
    const numValue = typeof newHeight === 'string' ? parseInt(newHeight) : newHeight;
    
    if (unitSettings.height === 'cm') {
      setLocalHeight(numValue);
      onHeightChange(numValue);
    } else {
      // Переводим дюймы в сантиметры
      const cmValue = Math.round(numValue * 2.54);
      setLocalHeight(cmValue);
      onHeightChange(cmValue);
    }
  };
  
  const updateWeight = (newWeight: number | string) => {
    console.log('Выбран вес:', newWeight);
    const numValue = typeof newWeight === 'number' ? newWeight : parseInt(newWeight.toString());
    
    if (unitSettings.weight === 'kg') {
      setLocalWeight(numValue);
      onWeightChange(numValue);
    } else {
      const kgValue = lbsToKg(numValue);
      setLocalWeight(kgValue);
      onWeightChange(kgValue);
    }
  };
  
  // Получаем простые значения для отображения
  const simpleHeightValues = generateSimpleHeightValues();
  const simpleWeightValues = generateSimpleWeightValues();
  
  // Получаем текущее отображаемое значение без единиц измерения
  const displayHeight = unitSettings.height === 'cm' ? localHeight : Math.round(localHeight / 2.54); // Переводим см в дюймы
  const displayWeight = unitSettings.weight === 'kg' ? localWeight : kgToLbs(localWeight);
  
  // Функция форматирования дюймов в строку вида "5'11"
  const formatInchesToFeetString = (inches: number): string => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;  
  };
  
  return (
    <OnboardingLayout
      title={activeTab === 'height' ? t('onboarding.heightWeight.heightTitle') : t('onboarding.heightWeight.weightTitle')}
      subtitle={activeTab === 'height' 
        ? t('onboarding.heightWeight.heightSubtitle')
        : t('onboarding.heightWeight.weightSubtitle')}
      onContinue={onContinue}
      onBack={onBack}
      disableScrollView={true} // Отключаем ScrollView для избежания конфликта с FlatList в SimplePicker
    >
      {activeTab === 'height' ? (
        <>
          <View style={heightWeight.pickerContainer}>
            <SimplePicker
              values={simpleHeightValues}
              selectedValue={displayHeight}
              onChange={updateHeight}
              pickerWidth={150}
              pickerHeight={200}
              formatValue={unitSettings.height === 'cm' ? undefined : (inches) => formatInchesToFeetString(Number(inches))}
            />
          </View>
          
          <TouchableOpacity 
            style={heightWeight.nextStepButton}
            onPress={() => setActiveTab('weight')}
          >
            <Text style={heightWeight.nextStepText}>{t('onboarding.heightWeight.goToWeight')}</Text>
            <Ionicons name="arrow-forward" size={18} color={palette.primary} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={heightWeight.pickerContainer}>
            <SimplePicker
              values={simpleWeightValues}
              selectedValue={displayWeight}
              onChange={updateWeight}
              pickerWidth={150}
              pickerHeight={200}
              formatValue={unitSettings.weight === 'kg' ? 
                (value) => `${value} ${t('onboarding.heightWeight.units.kg')}` : 
                (value) => `${value} ${t('onboarding.heightWeight.units.lb')}`}
            />
          </View>
          
          <TouchableOpacity 
            style={heightWeight.nextStepButton}
            onPress={() => setActiveTab('height')}
          >
            <Ionicons name="arrow-back" size={18} color={palette.primary} />
            <Text style={heightWeight.nextStepText}>{t('onboarding.heightWeight.backToHeight')}</Text>
          </TouchableOpacity>
        </>
      )}
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default HeightWeightScreen;
