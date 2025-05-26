import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// Ширина экрана для расчета сдвига при скролле
const SCREEN_WIDTH = Dimensions.get('window').width;
const DATE_ITEM_WIDTH = 60; // Ширина элемента даты

// Статусы потребления калорий
export enum CalorieStatus {
  EMPTY = 'empty',   // Нет данных
  UNDER = 'under',   // Недобор калорий (зеленый)
  NORMAL = 'normal', // Норма калорий (желтый)
  OVER = 'over'      // Перебор калорий (красный)
}

// Формат данных о потреблении калорий за день
export interface DayCalorieData {
  date: Date;
  consumed: number;
  goal: number;
  status: CalorieStatus;
}

// Проп-тайпы компонента
interface CalorieAwareDatePickerProps {
  calorieData: DayCalorieData[];
  onDateSelected: (date: Date) => void;
  dailyCalorieGoal: number;
}

/**
 * Компонент выбора даты с поддержкой индикаторов калорий
 */
const CalorieAwareDatePicker: React.FC<CalorieAwareDatePickerProps> = ({ 
  calorieData, 
  onDateSelected,
  dailyCalorieGoal
}) => {
  // Режим темы
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Перевод дней недели на русский
  const dayNamesRu = {
    'Mo': 'Пн',
    'Tu': 'Вт',
    'We': 'Ср',
    'Th': 'Чт',
    'Fr': 'Пт',
    'Sa': 'Сб',
    'Su': 'Вс'
  };
  
  // Генерируем массив дат для календаря (7 дней назад, сегодня и 7 дней вперед)
  const today = new Date();
  const dates = [];
  for (let i = -7; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  // Выбранная дата (по умолчанию сегодня)
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  
  // Ref для прокрутки к выбранной дате
  const scrollViewRef = useRef<ScrollView | null>(null);
  
  // Простые функции проверки дат
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };
  
  const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    if (date.getFullYear() > today.getFullYear()) return true;
    if (date.getFullYear() < today.getFullYear()) return false;
    if (date.getMonth() > today.getMonth()) return true;
    if (date.getMonth() < today.getMonth()) return false;
    return date.getDate() > today.getDate();
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };
  
  // Проверка даты на совпадение с жестко закодированными датами (12-13 мая 2025)
  // Для этих дат всегда показываем красный индикатор
  
  // Проверка, является ли дата текущим днем
  const isTodaysDate = (date: Date): boolean => {
    const now = new Date();
    return date.getDate() === now.getDate() && 
           date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  };
  
  // Простая функция для получения статуса калорий
  const getCalorieStatusForDate = (date: Date): CalorieStatus => {
    
    // Простая проверка будущих дат
    const now = new Date();
    if (date > now && !isTodaysDate(date)) {
      return CalorieStatus.EMPTY;
    }
    
    // Ищем прямое совпадение по дате
    const matchingData = calorieData.find(d => {
      const dDate = new Date(d.date);
      return dDate.getDate() === date.getDate() && 
             dDate.getMonth() === date.getMonth() && 
             dDate.getFullYear() === date.getFullYear();
    });
    
    // Если нашли данные с потреблением > 0
    if (matchingData && matchingData.consumed > 0) {
      // Простые правила определения статуса
      if (matchingData.consumed > matchingData.goal * 1.05) {
        return CalorieStatus.OVER;   // Перебор калорий (красный)
      } 
      else if (matchingData.consumed >= matchingData.goal * 0.95 && matchingData.consumed <= matchingData.goal * 1.05) {
        return CalorieStatus.NORMAL; // В пределах нормы (желтый)
      } 
      else if (matchingData.consumed > 0) {
        return CalorieStatus.UNDER;  // Недобор калорий (зеленый)
      }
    }
    
    // Если нет данных - пустой индикатор
    return CalorieStatus.EMPTY;
  };
  
  // Обработчик нажатия на дату
  const handleDatePress = (date: Date, index: number) => {
    // Проверяем, чтобы не вызывать событие для уже выбранной даты
    if (selectedDate && isSameDay(selectedDate, date)) {
      return;
    }
    
    // Устанавливаем выбранную дату и уведомляем родительский компонент
    setSelectedDate(date);
    // Вызываем коллбэк с небольшой задержкой
    setTimeout(() => {
      onDateSelected(date);
    }, 10);
    
    // Прокручиваем календарь к выбранной дате
    if (scrollViewRef.current) {
      const xOffset = index * DATE_ITEM_WIDTH - (SCREEN_WIDTH / 2) + (DATE_ITEM_WIDTH / 2);
      scrollViewRef.current.scrollTo({ x: xOffset, animated: true });
    }
  };
  
  // Индекс сегодняшнего дня в массиве дат
  const todayIndex = dates.findIndex(d => isSameDay(d, new Date()));
  
  // Получить цвет индикатора в зависимости от статуса
  const getIndicatorColor = (status: CalorieStatus): string => {
    switch (status) {
      case CalorieStatus.OVER:
        return '#FF6B6B'; // Красный для перебора
      case CalorieStatus.NORMAL:
        return '#FFD166'; // Желтый для нормы
      case CalorieStatus.UNDER:
        return '#4CD964'; // Зеленый для недобора
      case CalorieStatus.EMPTY:
      default:
        return isDark ? '#3A3A3C' : '#E0E0E0'; // Серый для пустых данных
    }
  };
  
  // Вынесено в начало файла, чтобы избежать дублирования
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        decelerationRate="fast"
        snapToInterval={DATE_ITEM_WIDTH}
        snapToAlignment="center"
        onLayout={() => {
          if (scrollViewRef.current && todayIndex !== -1) {
            const initialXOffset = todayIndex * DATE_ITEM_WIDTH - (SCREEN_WIDTH / 2) + (DATE_ITEM_WIDTH / 2);
            scrollViewRef.current.scrollTo({ x: initialXOffset, animated: false });
          }
        }}
      >
        {dates.map((date, index) => {
          // Получаем английское сокращение дня недели и преобразуем в русское
          const engDayName = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2);
          const dayName = dayNamesRu[engDayName as keyof typeof dayNamesRu];
          const dayNumber = date.getDate();
          const isSelected = isSameDay(date, selectedDate);
          
          // Напрямую определяем цвет индикатора без промежуточных переменных
          let indicatorColor = '';
          let showIndicator = false;
          
          // Для всех дат используем только реальные данные о потреблении калорий
          const matchingData = calorieData.find(d => {
            const dDate = new Date(d.date);
            return dDate.getDate() === date.getDate() && 
                   dDate.getMonth() === date.getMonth() && 
                   dDate.getFullYear() === date.getFullYear();
          });
          
          if (matchingData && matchingData.consumed > 0) {
            showIndicator = true;
            
            // Применяем простые правила определения цвета
            if (matchingData.consumed > matchingData.goal * 1.05) {
              indicatorColor = '#FF6B6B'; // Красный для перебора
            } 
            else if (matchingData.consumed >= matchingData.goal * 0.95 && 
                     matchingData.consumed <= matchingData.goal * 1.05) {
              indicatorColor = '#FFD166'; // Желтый для нормы
            } 
            else if (matchingData.consumed > 0) {
              indicatorColor = '#4CD964'; // Зеленый для недобора
            }
          }
          
          // Дебаггинг
          if (date.getDate() === 14 && date.getMonth() === 4 && date.getFullYear() === 2025) {
            console.log('14 мая:', showIndicator ? `Показываем индикатор цвета ${indicatorColor}` : 'Индикатор не показываем');
          }
          
          return (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dateItem,
                { width: DATE_ITEM_WIDTH },
                isSelected ? (isDark ? styles.selectedItemDark : styles.selectedItemLight) : {},
              ]}
              onPress={() => handleDatePress(date, index)}
            >
              <Text style={[
                styles.dayName,
                isSelected ? (isDark ? styles.selectedTextDark : styles.selectedTextLight) : (isDark ? styles.dayNameDark : styles.dayNameLight)
              ]}>
                {dayName}
              </Text>
              
              <View style={styles.dayNumberContainer}>
                <Text style={[
                  styles.dayNumber,
                  isSelected ? (isDark ? styles.selectedTextDark : styles.selectedTextLight) : (isDark ? styles.dayNumberDark : styles.dayNumberLight),
                  isTodaysDate(date) && styles.todayText
                ]}>
                  {dayNumber}
                </Text>
                
                {/* Индикатор калорий - прямая проверка */}
                {showIndicator && (
                  <View style={[styles.calorieIndicator, { backgroundColor: indicatorColor }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -5,
    marginBottom: 8,
  },
  darkContainer: {
    // оставляем пустым, так как нет фона
  },
  scrollViewContent: {
    paddingHorizontal: 10,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginHorizontal: 0,
    borderRadius: 12,
  },
  selectedItemLight: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  selectedItemDark: {
    borderWidth: 2,
    borderColor: '#0A84FF',
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '500',
    color: '#8E8E93',
  },
  dayNameDark: {
    color: '#8E8E93',
  },
  dayNameLight: {
    color: '#8E8E93',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  dayNumberDark: {
    color: '#FFFFFF',
  },
  dayNumberLight: {
    color: '#000000',
  },
  selectedTextDark: {
    color: '#FFFFFF', // Цвет текста в темном режиме остается белым
  },
  selectedTextLight: {
    color: '#000000', // Цвет текста в светлом режиме теперь черный
  },
  todayText: {
    fontWeight: '800',
  },
  dayNumberContainer: {
    alignItems: 'center',
  },
  calorieIndicator: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
  },
});

export default CalorieAwareDatePicker;
