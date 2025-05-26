import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SimplePicker from '../../../components/SimplePicker';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Генерация значений для выбора даты рождения
  const generateYears = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 80; year <= currentYear - 16; year++) {
      years.push(year);
    }
    return years;
  };

  const years = generateYears();
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Разбираем выбранную дату
  const [selectedDate, setSelectedDate] = useState({
    year: 1990,
    month: 0,
    day: 1
  });

  // Обновляем внутреннее состояние при изменении пропса birthday
  useEffect(() => {
    if (birthday) {
      const [year, month, day] = birthday.split('-').map(Number);
      setSelectedDate({
        year,
        month: month - 1, // месяцы начинаются с 0
        day
      });
    }
  }, [birthday]);

  // Функция для обновления даты
  const updateDate = (year: number, month: number, day: number) => {
    // Проверяем на корректность даты (например, 31 февраля)
    const newDate = new Date(year, month, day);
    const adjustedDay = newDate.getDate();
    const adjustedMonth = newDate.getMonth();
    const adjustedYear = newDate.getFullYear();
    
    // Форматируем в ISO строку
    const isoDate = `${adjustedYear}-${String(adjustedMonth + 1).padStart(2, '0')}-${String(adjustedDay).padStart(2, '0')}`;
    
    onBirthdayChange(isoDate);
    
    // Обновляем внутреннее состояние
    setSelectedDate({
      year: adjustedYear,
      month: adjustedMonth,
      day: adjustedDay
    });
  };

  // Функция для получения возраста из даты рождения
  const getAge = () => {
    if (!birthday) return 30; // Значение по умолчанию

    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkTextPrimary]}>Когда у вас день рождения?</Text>

      <View style={styles.pickerContainer}>
        {/* TODO: SimplePicker needs to be updated to support dark mode (e.g., accept an isDark prop) 
            and adjust its internal text/background colors based on the design system. 
            For now, isDark prop is removed to avoid lint errors. */}
        <SimplePicker
          values={days}
          selectedValue={selectedDate.day}
          onChange={(day) => updateDate(selectedDate.year, selectedDate.month, day as number)}
          pickerWidth={60}
          pickerHeight={200} 
        />
        
        <SimplePicker
          values={months}
          selectedValue={months[selectedDate.month]}
          onChange={(month) => {
            const monthIndex = months.indexOf(month as string);
            if (monthIndex !== -1) {
              updateDate(selectedDate.year, monthIndex, selectedDate.day);
            }
          }}
          pickerWidth={140} 
          pickerHeight={200}
        />
        
        <SimplePicker
          values={years}
          selectedValue={selectedDate.year}
          onChange={(year) => updateDate(year as number, selectedDate.month, selectedDate.day)}
          pickerWidth={80}
          pickerHeight={200}
        />
      </View>
      
      <Text style={[styles.ageText, isDark && styles.darkTextPrimary]}>
        Ваш возраст: {getAge()} лет
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
    paddingTop: 24,         
    backgroundColor: '#FFFFFF', 
  },
  darkContainer: {
    backgroundColor: '#121212', 
  },
  title: { 
    fontSize: 20,
    fontWeight: 'bold', 
    marginBottom: 32, 
    textAlign: 'center',
    color: '#333333', 
  },
  darkTextPrimary: {
    color: '#F5F5F5', 
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200, 
    marginBottom: 32, 
  },
  ageText: { 
    fontSize: 17,
    fontWeight: '500', 
    marginBottom: 40, 
    color: '#333333', 
  },
});

export default BirthdayScreen;
