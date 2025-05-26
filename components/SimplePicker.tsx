import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
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
  
  // Функция для рендеринга элемента списка
  const renderItem = ({ item }: { item: string | number }) => {
    // Проверяем совпадение либо по точному значению, либо по числовой части
    const itemStr = item.toString();
    const selectedStr = selectedValue !== undefined ? selectedValue.toString() : '';
    
    const exactMatch = itemStr === selectedStr;
    
    // Сравниваем числовые части, если есть
    const itemNum = parseFloat(itemStr);
    const selectedNum = parseFloat(selectedStr);
    const numericMatch = !isNaN(itemNum) && !isNaN(selectedNum) && Math.abs(itemNum - selectedNum) < 0.01;
    
    // При дебаге писать в консоль сравнение
    // console.log(`Item: ${item} (${itemNum}), Selected: ${selectedValue} (${selectedNum}), Match: ${exactMatch || numericMatch}`);
    
    const isSelected = exactMatch || numericMatch;
    
    return (
      <TouchableOpacity
        onPress={() => {
          console.log('Выбрано значение:', item);
          onChange(item);
        }}
        style={[
          styles.item,
          { height: itemHeight },
          isSelected && styles.selectedItem,
          isDark && styles.darkItem,
          isSelected && isDark && styles.darkSelectedItem
        ]}
        activeOpacity={0.6} // Делаем отклик от нажатия более заметным
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }} // Увеличиваем область нажатия
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
    );
  };

  // Находим индекс выбранного элемента для начального скролла
  // Обрабатываем случаи, когда selectedValue может включать единицы измерения
  const findInitialIndex = () => {
    // Проверяем, определено ли выбранное значение вообще
    if (selectedValue === undefined) {
      return Math.floor(values.length / 2); // Возвращаем середину списка, если значение не определено
    }
    
    // Сначала пробуем найти точное совпадение
    const exactIndex = values.findIndex(val => val === selectedValue);
    if (exactIndex !== -1) return exactIndex;
    
    // Если точного совпадения нет, пробуем найти совпадение по числовой части
    const selectedStr = selectedValue.toString();
    const selectedNum = parseFloat(selectedStr);
    if (!isNaN(selectedNum)) {
      const approximateIndex = values.findIndex(val => {
        const valNum = parseFloat(val.toString());
        // Используем небольшую погрешность для чисел с плавающей точкой
        return !isNaN(valNum) && Math.abs(valNum - selectedNum) < 0.01;
      });
      if (approximateIndex !== -1) return approximateIndex;
    }
    
    // Если ничего не нашли, возвращаем середину списка
    return Math.floor(values.length / 2);
  };
  
  const initialIndex = findInitialIndex();
  const [scrollIndex, setScrollIndex] = useState(initialIndex);
  
  return (
    <View style={[
      styles.container, 
      { width: pickerWidth, height: pickerHeight },
      isDark && styles.darkContainer
    ]}>
      
      <FlatList
        data={values}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        // Добавляем разделительные линии между элементами
        ItemSeparatorComponent={() => <View style={isDark ? styles.darkItemSeparator : styles.itemSeparator} />}
        onScrollToIndexFailed={() => {
          // Если скролл к индексу не удался, прокручиваем к началу списка
          console.warn('SimplePicker: Не удалось прокрутить к указанному индексу:', initialIndex);
          setTimeout(() => {
            if (values.length > 0) {
              setScrollIndex(0);
            }
          }, 100);
        }}
        getItemLayout={(data, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF6E5',
    margin: 5,
    // Добавляем тень для визуального выделения
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative', // Для позиционирования индикатора
  },

  darkContainer: {
    backgroundColor: '#1C1C1E',
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
  },
  selectedItem: {
    backgroundColor: '#E0E0E0',
    // Делаем более заметное выделение выбранного элемента
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  darkItem: {
    backgroundColor: '#1C1C1E',
  },
  darkSelectedItem: {
    backgroundColor: '#2C2C2E',
    borderLeftWidth: 3,
    borderLeftColor: '#0A84FF',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8, // Увеличиваем область нажатия вокруг текста
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 17, // Делаем выбранный текст немного больше
  },
  darkItemText: {
    color: '#CCC',
  },
  darkSelectedItemText: {
    color: '#0A84FF',
  }
});

export default SimplePicker;
