import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DATE_ITEM_WIDTH = SCREEN_WIDTH / 8; // Show 8 items now

interface DatePickerProps {
  onDateSelected: (date: Date) => void;
}

const HorizontalDatePicker: React.FC<DatePickerProps> = ({ onDateSelected }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates, setDates] = useState<Date[]>(() => {
    const today = new Date();
    const initialDates: Date[] = [];
    // Adjusted range for more items
    for (let i = -25; i <= 25; i++) { 
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      initialDates.push(date);
    }
    return initialDates;
  });

  const handleDatePress = (date: Date, index: number) => {
    setSelectedDate(date);
    onDateSelected(date);
    if (scrollViewRef.current) {
      const xOffset = index * DATE_ITEM_WIDTH - (SCREEN_WIDTH / 2) + (DATE_ITEM_WIDTH / 2);
      scrollViewRef.current.scrollTo({ x: xOffset, animated: true });
    }
  };

  const todayIndex = dates.findIndex(d => 
    d.getFullYear() === new Date().getFullYear() &&
    d.getMonth() === new Date().getMonth() &&
    d.getDate() === new Date().getDate()
  );

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
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2);
          const dayNumber = date.getDate();
          const isSelected = date.toDateString() === selectedDate.toDateString();

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
              <Text style={[
                styles.dayNumber,
                isSelected ? (isDark ? styles.selectedTextDark : styles.selectedTextLight) : (isDark ? styles.dayNumberDark : styles.dayNumberLight)
              ]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60, // Further reduced height
    marginTop: 4, // Reduced margin-top to bring closer to header
    marginBottom: 8, // Further reduced margin-bottom
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6, // Further reduced padding
    borderRadius: 8,  // Reduced border radius
    marginHorizontal: 2, // Further reduced margin
    height: 50, // Further reduced height
  },
  selectedItemLight: {
    backgroundColor: '#E0E0E0', 
  },
  selectedItemDark: {
    backgroundColor: '#3A3A3C',
  },
  dayName: {
    fontSize: 11, // Further reduced font size
    fontWeight: '500',
    marginBottom: 2, // Further reduced margin
  },
  dayNameLight: {
    color: '#666666',
  },
  dayNameDark: {
    color: '#AAAAAA',
  },
  dayNumber: {
    fontSize: 14, // Further reduced font size
    fontWeight: 'bold',
  },
  dayNumberLight: {
    color: '#000000',
  },
  dayNumberDark: {
    color: '#FFFFFF',
  },
  selectedTextLight: {
    color: '#000000',
  },
  selectedTextDark: {
    color: '#FFFFFF',
  },
});

export default HorizontalDatePicker; 