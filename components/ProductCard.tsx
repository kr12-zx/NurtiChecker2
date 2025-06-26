import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useTranslation } from '../i18n/i18n';
import { navigateToProductDetail } from '../services/navigationService';
import { deleteScanFromHistory, ScanHistoryItem } from '../services/scanHistory';
import { getThumbnailUrl } from '../utils/imageUtils';

interface MacroData {
  protein: number | undefined;
  fat: number | undefined;
  carbs: number | undefined;
}

export interface ProductData {
  id: string;
  name: string;
  calories: number | undefined;
  macros: MacroData;
  timestamp: Date;
  imageUrl?: string;
  fullData?: string; // Добавляем поле для полных данных от n8n
}

interface ProductCardProps {
  product: ProductData;
  onDelete?: () => void; // Callback для обновления списка после удаления
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  // Функция для обрезки длинных названий
  const truncateProductName = (name: string, maxLength: number = 28): string => {
    if (name.length <= maxLength) {
      return name;
    }
    return name.substring(0, maxLength).trim() + '...';
  };

  // Функция для перехода на экран продукта с использованием унифицированного сервиса
  const handleProductPress = () => {
    // Валидируем данные перед созданием ScanHistoryItem
    const calories = product.calories ?? 0;
    const protein = product.macros?.protein ?? 0;
    const fat = product.macros?.fat ?? 0;
    const carbs = product.macros?.carbs ?? 0;
    
    // Проверяем что данные валидны
    if (calories === 0 && protein === 0 && fat === 0 && carbs === 0) {
      console.warn('Попытка навигации с невалидными данными продукта:', product);
      return; // Не переходим если данные невалидны
    }
    
    // Преобразуем данные ProductData в ScanHistoryItem
    const scanItem: ScanHistoryItem = {
      id: product.id,
      name: product.name || 'Неизвестный продукт',
      calories: calories,
      protein: protein,
      fat: fat,
      carbs: carbs,
      image: product.imageUrl,
      date: new Date().toLocaleTimeString(),
      timestamp: product.timestamp?.getTime() ?? Date.now(),
      scanDate: product.timestamp?.toLocaleDateString() ?? new Date().toLocaleDateString(),
      fullData: product.fullData // Добавляем полные данные, если они есть
    };
    
    // Используем единый навигационный сервис
    navigateToProductDetail(scanItem);
  };

  // Функция для удаления продукта
  const handleDelete = async () => {
    Alert.alert(
      t('common.deleteProduct'),
      t('common.deleteProductConfirm', { productName: product.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteScanFromHistory(product.id);
              if (success && onDelete) {
                onDelete(); // Вызываем callback для обновления списка
              }
            } catch (error) {
              console.error('Ошибка при удалении продукта:', error);
              Alert.alert(t('common.error'), t('common.failedToDeleteProduct'));
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleProductPress}>
      <View style={[styles.card, isDark && styles.darkCard]}>
        {product.imageUrl ? (
          <Image 
            source={{ uri: getThumbnailUrl(product.imageUrl) || product.imageUrl }} 
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={{ blurhash: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.' }}
            onError={(error) => {
              console.warn('❌ Ошибка загрузки изображения в ProductCard:', error);
            }}
            recyclingKey={product.id} // Помогает с переиспользованием изображений
          />
        ) : (
          <View style={[styles.imagePlaceholder, isDark && styles.darkImagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>{product.name.charAt(0)}</Text>
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text 
              style={[styles.productName, isDark && styles.darkText]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {truncateProductName(product.name)}
            </Text>
            
            {/* Кнопка удаления в правом верхнем углу */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="trash-outline" 
                size={18} 
                color={isDark ? "#888888" : "#666666"} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.calories, isDark && styles.darkText]}>
            {product.calories ?? 0} {t('nutrition.calories')}
          </Text>
          
          <View style={styles.macrosContainer}>
            <View style={[styles.macroBadge, styles.proteinBadge]}>
              <Text style={styles.macroLabel}>P</Text>
              <Text style={styles.macroValue}>{Math.round(product.macros?.protein ?? 0)}g</Text>
            </View>
            
            <View style={[styles.macroBadge, styles.fatBadge]}>
              <Text style={styles.macroLabel}>F</Text>
              <Text style={styles.macroValue}>{Math.round(product.macros?.fat ?? 0)}g</Text>
            </View>
            
            <View style={[styles.macroBadge, styles.carbsBadge]}>
              <Text style={styles.macroLabel}>C</Text>
              <Text style={styles.macroValue}>{Math.round(product.macros?.carbs ?? 0)}g</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
    shadowOpacity: 0.2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkImagePlaceholder: {
    backgroundColor: '#2C2C2E',
  },
  imagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000000',
    maxWidth: '85%',
    marginRight: 8,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
  },
  calories: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  macrosContainer: {
    flexDirection: 'row',
  },
  macroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  proteinBadge: {
    backgroundColor: 'rgba(255, 138, 128, 0.5)',
  },
  fatBadge: {
    backgroundColor: 'rgba(255, 207, 80, 0.5)',
  },
  carbsBadge: {
    backgroundColor: 'rgba(128, 216, 255, 0.5)',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  macroValue: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
});

export default ProductCard;
