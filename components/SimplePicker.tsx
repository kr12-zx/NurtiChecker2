import React, { useEffect, useRef } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface SimplePickerProps {
  values: (string | number)[];
  selectedValue: string | number | undefined;
  onChange: (value: string | number) => void;
  itemHeight?: number;
  pickerWidth?: number;
  pickerHeight?: number;
  formatValue?: (value: string | number) => string; // Функция для форматирования отображаемых значений
}

const SimplePicker: React.FC<SimplePickerProps> = ({
  values,
  selectedValue,
  onChange,
  itemHeight = 40,
  pickerWidth = 100,
  pickerHeight = 200,
  formatValue
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Функция для рендеринга элемента списка
  const renderItem = (item: string | number, index: number) => {
    // Проверяем совпадение либо по точному значению, либо по числовой части
    const itemStr = item.toString();
    const selectedStr = selectedValue !== undefined ? selectedValue.toString() : '';
    
    const exactMatch = itemStr === selectedStr;
    
    // Сравниваем числовые части, если есть
    const itemNum = parseFloat(itemStr);
    const selectedNum = parseFloat(selectedStr);
    const numericMatch = !isNaN(itemNum) && !isNaN(selectedNum) && Math.abs(itemNum - selectedNum) < 0.01;
    
    const isSelected = exactMatch || numericMatch;
    
    return (
      <View key={`${item}-${index}`}>
        <TouchableOpacity
          onPress={() => {
            onChange(item);
          }}
          style={[
            styles.item,
            { height: itemHeight },
            isSelected && styles.selectedItem,
            isDark && styles.darkItem,
            isSelected && isDark && styles.darkSelectedItem
          ]}
          activeOpacity={0.6}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Text 
            style={[
              styles.itemText, 
              isSelected && styles.selectedItemText,
              isDark && styles.darkItemText,
              isSelected && isDark && styles.darkSelectedItemText
            ]}
          >
            {formatValue ? formatValue(item) : item}
          </Text>
        </TouchableOpacity>
        {index < values.length - 1 && (
          <View style={isDark ? styles.darkItemSeparator : styles.itemSeparator} />
        )}
      </View>
    );
  };

  // Находим индекс выбранного элемента для начального скролла
  const findInitialIndex = () => {
    if (selectedValue === undefined) {
      return Math.floor(values.length / 2);
    }
    
    const exactIndex = values.findIndex(val => val === selectedValue);
    if (exactIndex !== -1) return exactIndex;
    
    const selectedStr = selectedValue.toString();
    const selectedNum = parseFloat(selectedStr);
    if (!isNaN(selectedNum)) {
      const approximateIndex = values.findIndex(val => {
        const valNum = parseFloat(val.toString());
        return !isNaN(valNum) && Math.abs(valNum - selectedNum) < 0.01;
      });
      if (approximateIndex !== -1) return approximateIndex;
    }
    
    return Math.floor(values.length / 2);
  };
  
  const initialIndex = findInitialIndex();

  // Скроллим к выбранному элементу при монтировании
  useEffect(() => {
    if (scrollViewRef.current && values.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: initialIndex * itemHeight,
          animated: false,
        });
      }, 100);
    }
  }, []);
  
  return (
    <View style={[
      styles.container, 
      { width: pickerWidth, height: pickerHeight },
      isDark && styles.darkContainer
    ]}>
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingVertical: 0 }}
      >
        {values.map((item, index) => renderItem(item, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    margin: 5,
    // Добавляем тень для визуального выделения
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative', // Для позиционирования индикатора
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  darkContainer: {
    backgroundColor: '#2A2A2C',
    borderColor: '#3A3A3C',
  },
  // Стили для разделительных линий
  itemSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '90%',
    alignSelf: 'center',
  },
  darkItemSeparator: {
    height: 1,
    backgroundColor: '#2C2C2E',
    width: '90%',
    alignSelf: 'center',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    width: '100%', // Растягиваем на всю ширину контейнера
    backgroundColor: '#FFFFFF',
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
    // Делаем более заметное выделение выбранного элемента
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  darkItem: {
    backgroundColor: '#3A3A3C',
  },
  darkSelectedItem: {
    backgroundColor: '#1E3A5F',
    borderLeftWidth: 3,
    borderLeftColor: '#0A84FF',
  },
  itemText: {
    fontSize: 16,
    color: '#1C1C1E',
    paddingVertical: 8, // Увеличиваем область нажатия вокруг текста
    fontWeight: '500',
  },
  selectedItemText: {
    fontWeight: '700',
    color: '#007AFF',
    fontSize: 17, // Делаем выбранный текст немного больше
  },
  darkItemText: {
    color: '#E5E5E7',
  },
  darkSelectedItemText: {
    color: '#64B5F6',
    fontWeight: '700',
  }
});

export default SimplePicker;
