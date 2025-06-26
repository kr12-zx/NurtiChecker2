import React, { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import SimplePicker from '../../../components/SimplePicker';
import { useTranslation } from '../../../i18n/i18n';
import { OnboardingLayout } from './unifiedLayouts';
import { usePalette, usePickerStyles } from './unifiedStyles';

interface BirthdayScreenProps {
  onContinue: () => void;
  onBack: () => void;
  birthday: string; // ISO формат: YYYY-MM-DD
  onBirthdayChange: (birthday: string) => void;
}

const BirthdayScreen: React.FC<BirthdayScreenProps> = ({ 
  onContinue, 
  onBack, 
  birthday,
  onBirthdayChange
}) => {
  const palette = usePalette();
  const pickerStyles = usePickerStyles();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Парсим дату рождения
  const [year, month, day] = birthday.split('-').map(Number);
  
  // Состояние для выбранных значений
  const [selectedDay, setSelectedDay] = useState(day);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);

  // Генерируем данные для пикеров
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december'),
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Обновляем дату при изменении значений
  React.useEffect(() => {
    const newBirthday = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    onBirthdayChange(newBirthday);
  }, [selectedDay, selectedMonth, selectedYear, onBirthdayChange]);

  // Функция для получения возраста из даты рождения
  const getAge = () => {
    // Используем актуальное состояние вместо пропса birthday
    const { year, month, day } = { year: selectedYear, month: selectedMonth, day: selectedDay };
    
    const today = new Date();
    const birthDate = new Date(year, month - 1, day); // month - 1 потому что месяцы в Date идут от 0 до 11
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <OnboardingLayout
      title={t('onboarding.birthday.title')}
      subtitle={t('onboarding.birthday.subtitle')}
      onContinue={onContinue}
      onBack={onBack}
      disableScrollView={true}
    >
      <View style={pickerStyles.pickerContainer}>
        {/* Селектор дня */}
        <SimplePicker
          values={days}
          selectedValue={selectedDay}
          onChange={(day) => setSelectedDay(day as number)}
          pickerWidth={60}
          pickerHeight={200} 
        />
        
        {/* Селектор месяца */}
        <SimplePicker
          values={months}
          selectedValue={months[selectedMonth - 1]}
          onChange={(month) => {
            const monthIndex = months.indexOf(month as string) + 1;
            setSelectedMonth(monthIndex);
          }}
          pickerWidth={140} 
          pickerHeight={200}
        />
        
        {/* Селектор года */}
        <SimplePicker
          values={years}
          selectedValue={selectedYear}
          onChange={(year) => setSelectedYear(year as number)}
          pickerWidth={80}
          pickerHeight={200}
        />
      </View>
      
      <Text style={pickerStyles.ageText}>
        {t('onboarding.birthday.yourAge', { age: getAge() })}
      </Text>
    </OnboardingLayout>
  );
};

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default BirthdayScreen;
