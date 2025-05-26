import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  Platform,
  FlatList,
} from 'react-native';

interface WheelPickerProps {
  values: any[];
  initialValue?: any;
  itemHeight: number;
  onChange?: (value: any) => void;
  suffix?: string;
  pickerWidth?: number;
  fontSize?: number;
  visibleItems?: number;
}

const WheelPicker: React.FC<WheelPickerProps> = ({
  values,
  initialValue,
  itemHeight,
  onChange,
  suffix = '',
  pickerWidth = 80,
  fontSize = 20,
  visibleItems = 5,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Найдем индекс начального значения в массиве
  useEffect(() => {
    if (initialValue !== undefined) {
      const index = values.findIndex(value => value === initialValue);
      if (index !== -1) {
        setSelectedIndex(index);
        // Прокрутим ScrollView к начальному значению
        // Устанавливаем оптимальную задержку для iOS симулятора
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: index * itemHeight,
              animated: false,
            });
          }
        }, 50);
      }
    }
  }, [initialValue, values, itemHeight]);
  
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    
    // Добавляем проверку на наличие значения
    if (index >= 0 && index < values.length && index !== selectedIndex) {
      setSelectedIndex(index);
      // Используем setTimeout для избежания слишком частых вызовов
      if (onChange && !isScrolling) {
        onChange(values[index]);
      }
    }
  };
  
  const handleScrollBegin = () => {
    setIsScrolling(true);
  };
  
  const handleScrollEnd = () => {
    // Прокрутим к ближайшему значению
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * itemHeight,
          animated: true,
        });
        
        // Вызываем onChange только после остановки прокрутки
        if (onChange) {
          onChange(values[selectedIndex]);
        }
        
        setIsScrolling(false);
      }, 50);
    }
  };
  
  // Добавляем пустые элементы в начало и конец для отступов
  const paddingItems = Math.floor(visibleItems / 2);
  const paddedValues = [...Array(paddingItems).fill(''), ...values, ...Array(paddingItems).fill('')];
  
  // Общая высота компонента
  const wheelHeight = itemHeight * visibleItems;
  
  return (
    <View style={[styles.container, { height: wheelHeight, width: pickerWidth }]}>
      {/* Индикатор выбора - горизонтальная линия */}
      <View style={[
        styles.selectionIndicator, 
        { top: wheelHeight / 2 - 1, width: pickerWidth, height: 2 },
        isDark ? styles.darkSelectionIndicator : {}
      ]} />
      
      {/* Прозрачная область сверху */}
      <View style={[
        styles.gradientOverlay, 
        styles.topOverlay, 
        { height: wheelHeight / 2, width: pickerWidth },
        isDark ? styles.darkOverlay : {}
      ]} />
      
      {/* Прозрачная область снизу */}
      <View style={[
        styles.gradientOverlay, 
        styles.bottomOverlay, 
        { height: wheelHeight / 2, width: pickerWidth },
        isDark ? styles.darkOverlay : {}
      ]} />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        snapToInterval={itemHeight}
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.8}
        scrollEventThrottle={50}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingVertical: paddingItems * itemHeight }}
      >
        {paddedValues.map((value, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.item, { height: itemHeight }]}
            onPress={() => {
              const valueIndex = index - paddingItems;
              if (valueIndex >= 0 && valueIndex < values.length) {
                setSelectedIndex(valueIndex);
                if (onChange) {
                  onChange(values[valueIndex]);
                }
                scrollViewRef.current?.scrollTo({
                  y: valueIndex * itemHeight,
                  animated: true,
                });
              }
            }}
          >
            <Text
              style={[
                styles.itemText,
                { fontSize },
                index - paddingItems === selectedIndex && styles.selectedItemText,
                isDark ? styles.darkText : {},
                index - paddingItems === selectedIndex && isDark && styles.darkSelectedItemText,
              ]}
            >
              {value !== '' ? `${value}${suffix}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
  },
  selectedItemText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  darkText: {
    color: '#777',
  },
  darkSelectedItemText: {
    color: '#0A84FF',
  },
  selectionIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    zIndex: 1,
  },
  darkSelectionIndicator: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  topOverlay: {
    top: 0,
  },
  bottomOverlay: {
    bottom: 0,
  },
});

export default WheelPicker;
