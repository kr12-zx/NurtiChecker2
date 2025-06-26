import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';
import { getDashboardAddedProducts, removeProductFromDay } from '../../services/dailyNutrition';
import { navigateToProductDetail } from '../../services/navigationService';
import { getScanHistory, ScanHistoryItem } from '../../services/scanHistory';
import { getThumbnailUrl } from '../../utils/imageUtils';

// Тип для вкладок
type TabType = 'scanned' | 'dashboard';

// Тип для продуктов дашборда
interface DashboardProduct {
  productId: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  saturatedFat: number;
  dateAdded: string;
  servingMultiplier: number;
  baseWeight?: number; // Базовый вес продукта в граммах
  image?: string; // URL изображения продукта
  timestamp?: number; // Время добавления продукта
  fullData?: string; // Полные данные анализа продукта
}

// Цвета макронутриентов
const MACRO_COLORS = {
  Protein: { light: '#FF8A80', dark: '#FF6B6B' },
  Fat: { light: '#FFCF50', dark: '#FFD166' },
  Carbs: { light: '#80D8FF', dark: '#06D6A0' },
};

// Компонент для отображения элемента сканированного продукта
const ScannedProductItem = ({ 
  item, 
  isDark, 
  t, 
  onDelete 
}: { 
  item: ScanHistoryItem; 
  isDark: boolean; 
  t: (key: string) => string;
  onDelete?: () => void;
}) => {
  const proteinColor = isDark ? MACRO_COLORS.Protein.dark : MACRO_COLORS.Protein.light;
  const fatColor = isDark ? MACRO_COLORS.Fat.dark : MACRO_COLORS.Fat.light;
  const carbsColor = isDark ? MACRO_COLORS.Carbs.dark : MACRO_COLORS.Carbs.light;

  // Функция для удаления продукта
  const handleDelete = async () => {
    Alert.alert(
      'Удалить продукт',
      `Вы уверены, что хотите удалить "${item.name}" из истории?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteScanFromHistory } = await import('../../services/scanHistory');
              const success = await deleteScanFromHistory(item.id);
              if (success && onDelete) {
                onDelete(); // Вызываем callback для обновления списка
              }
            } catch (error) {
              console.error('Ошибка при удалении продукта:', error);
              Alert.alert('Ошибка', 'Не удалось удалить продукт');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[itemStyles.productItem, isDark && itemStyles.darkProductItem]}>
      <Image 
        source={{ uri: getThumbnailUrl(item.image) || item.image }} 
        style={itemStyles.productImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
      <View style={itemStyles.productInfoContainer}>
        <View style={itemStyles.productHeader}>
          <Text style={[itemStyles.productName, isDark && itemStyles.darkText]} numberOfLines={1}>{item.name}</Text>
          
          {/* Кнопка удаления */}
          <TouchableOpacity 
            style={itemStyles.deleteButton}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="trash-outline" 
              size={16} 
              color={isDark ? "#888888" : "#666666"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[itemStyles.caloriesText, isDark && itemStyles.darkText]}>{item.calories} {t('history.calories')}</Text>
        <View style={itemStyles.macrosRowScanned}>
          <View style={itemStyles.macroDetail}>
            <View style={[itemStyles.macroCircle, { backgroundColor: proteinColor }]}>
              <Text style={itemStyles.macroLetter}>P</Text>
            </View>
            <Text style={[itemStyles.macroValue, isDark && itemStyles.darkTextSecondary]}>{Math.round(item.protein)}г</Text>
          </View>
          <View style={itemStyles.macroDetail}>
            <View style={[itemStyles.macroCircle, { backgroundColor: fatColor }]}>
              <Text style={itemStyles.macroLetter}>F</Text>
            </View>
            <Text style={[itemStyles.macroValue, isDark && itemStyles.darkTextSecondary]}>{Math.round(item.fat)}г</Text>
          </View>
          <View style={itemStyles.macroDetail}>
            <View style={[itemStyles.macroCircle, { backgroundColor: carbsColor }]}>
              <Text style={itemStyles.macroLetter}>C</Text>
            </View>
            <Text style={[itemStyles.macroValue, isDark && itemStyles.darkTextSecondary]}>{Math.round(item.carbs)}г</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Компонент для отображения элемента продукта из дашборда
const DashboardProductItem = ({ item, isDark, t, onDelete }: { 
  item: DashboardProduct; 
  isDark: boolean; 
  t: (key: string) => string;
  onDelete?: () => void;
}) => {
  const proteinColor = '#E74C3C';
  const fatColor = '#F39C12';
  const carbsColor = '#27AE60';

  const formatAddedDateTime = (timestamp?: number, dateAdded?: string) => {
    if (timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return dateAdded || '';
  };

  // Функция для удаления продукта из дневника питания
  const handleDelete = async () => {
    const baseMessage = t('common.deleteFromDiaryMessage');
    const message = baseMessage.replace('удалить', `удалить "${item.name}"`).replace('eliminar', `eliminar "${item.name}"`).replace('delete', `delete "${item.name}"`);
    
    Alert.alert(
      t('common.deleteFromDiary'),
      message,
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
              console.log('🗑️ Удаляем продукт из дневника:', item.name, 'ID:', item.productId);
              
              // Удаляем продукт из дневника питания
              const updatedData = await removeProductFromDay(item.productId, item.dateAdded);
              
              if (updatedData && onDelete) {
                console.log('✅ Продукт успешно удален из дневника');
                onDelete(); // Обновляем список
              }
            } catch (error) {
              console.error('❌ Ошибка при удалении продукта из дневника:', error);
              Alert.alert(t('common.error'), t('common.failedToDeleteFromDiary'));
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={() => {
      // Создаем объект ScanHistoryItem из DashboardProduct для навигации
      const scanItem: ScanHistoryItem = {
        id: item.productId,
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        fat: item.fat,
        carbs: item.carbs,
        sugar: item.sugar,
        image: item.image || '',
        timestamp: item.timestamp || Date.now(),
        scanDate: item.dateAdded,
        date: item.dateAdded,
        fullData: item.fullData
      };
      
      navigateToProductDetail(scanItem, { 
        actualCalories: item.calories,
        actualProtein: item.protein,
        actualFat: item.fat,
        actualCarbs: item.carbs,
        actualSugar: item.sugar,
        actualFiber: item.fiber,
        actualSaturatedFat: item.saturatedFat,
        servingMultiplier: item.servingMultiplier,
        baseWeight: item.baseWeight
      });
    }}>
      <View style={[itemStyles.productItem, isDark && itemStyles.darkProductItem]}>
        {item.image ? (
          <Image 
            source={{ uri: getThumbnailUrl(item.image) || item.image }} 
            style={itemStyles.productImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <View style={[itemStyles.dashboardIcon, isDark && { backgroundColor: '#333' }]}>
            <Ionicons name="nutrition-outline" size={32} color={isDark ? "#666" : "#AAA"} />
          </View>
        )}
        <View style={itemStyles.productInfoContainer}>
          <View style={itemStyles.productHeader}>
            <Text style={[itemStyles.productName, isDark && itemStyles.darkText]} numberOfLines={1}>{item.name}</Text>
            
            {/* Кнопка удаления из дневника */}
            <TouchableOpacity 
              style={itemStyles.deleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="trash-outline" 
                size={16} 
                color={isDark ? "#888888" : "#666666"} 
              />
            </TouchableOpacity>
          </View>
          <Text style={[itemStyles.caloriesText, isDark && itemStyles.darkText]}>
            {item.calories} {t('history.calories')}
            {item.servingMultiplier !== 1 && (
              <Text style={[itemStyles.servingText, isDark && itemStyles.darkTextSecondary]}>
                {' '}(x{item.servingMultiplier})
              </Text>
            )}
          </Text>
          <View style={itemStyles.macrosRow}>
            <View style={itemStyles.macrosLeft}>
              <View style={itemStyles.macroDetail}>
                <View style={[itemStyles.macroCircle, { backgroundColor: proteinColor }]}>
                  <Text style={itemStyles.macroLetter}>P</Text>
                </View>
                <Text style={[itemStyles.macroValue, isDark && itemStyles.darkTextSecondary]}>{Math.round(item.protein)}г</Text>
              </View>
              <View style={itemStyles.macroDetail}>
                <View style={[itemStyles.macroCircle, { backgroundColor: fatColor }]}>
                  <Text style={itemStyles.macroLetter}>F</Text>
                </View>
                <Text style={[itemStyles.macroValue, isDark && itemStyles.darkTextSecondary]}>{Math.round(item.fat)}г</Text>
              </View>
              <View style={itemStyles.macroDetail}>
                <View style={[itemStyles.macroCircle, { backgroundColor: carbsColor }]}>
                  <Text style={itemStyles.macroLetter}>C</Text>
                </View>
                <Text style={[itemStyles.macroValue, isDark && itemStyles.darkTextSecondary]}>{Math.round(item.carbs)}г</Text>
              </View>
            </View>
            <Text style={[itemStyles.dateAdded, isDark && itemStyles.darkTextSecondary]}>
              {formatAddedDateTime(item.timestamp, item.dateAdded)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  // Состояния
  const [activeTab, setActiveTab] = useState<TabType>((params.tab as TabType) || 'dashboard');
  const [scannedProducts, setScannedProducts] = useState<ScanHistoryItem[]>([]);
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Состояния для пагинации
  const [displayedScannedProducts, setDisplayedScannedProducts] = useState<ScanHistoryItem[]>([]);
  const [displayedDashboardProducts, setDisplayedDashboardProducts] = useState<DashboardProduct[]>([]);
  const [scannedPageSize] = useState(20);
  const [dashboardPageSize] = useState(20);
  const [scannedPage, setScannedPage] = useState(1);
  const [dashboardPage, setDashboardPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Инициализация данных при загрузке экрана
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Функция загрузки данных
  const loadData = async () => {
    try {
      const [scannedData, dashboardData] = await Promise.all([
        getScanHistory(),
        getDashboardAddedProducts()
      ]);
      
      // Сортируем по timestamp (новые сначала)
      const sortedScannedData = scannedData.sort((a, b) => b.timestamp - a.timestamp);
      const sortedDashboardData = dashboardData.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });

      setScannedProducts(sortedScannedData);
      setDashboardProducts(sortedDashboardData);
      
      // Сбрасываем пагинацию и отображаем первые элементы
      setScannedPage(1);
      setDashboardPage(1);
      setDisplayedScannedProducts(sortedScannedData.slice(0, scannedPageSize));
      setDisplayedDashboardProducts(sortedDashboardData.slice(0, dashboardPageSize));
    } catch (error) {
      console.error('Ошибка при загрузке данных истории:', error);
    }
  };

  // Функция обновления
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Функция загрузки дополнительных элементов
  const loadMoreItems = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    
    if (activeTab === 'scanned') {
      const nextPage = scannedPage + 1;
      const startIndex = (nextPage - 1) * scannedPageSize;
      const endIndex = startIndex + scannedPageSize;
      const newItems = scannedProducts.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedScannedProducts(prev => [...prev, ...newItems]);
        setScannedPage(nextPage);
      }
    } else {
      const nextPage = dashboardPage + 1;
      const startIndex = (nextPage - 1) * dashboardPageSize;
      const endIndex = startIndex + dashboardPageSize;
      const newItems = dashboardProducts.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedDashboardProducts(prev => [...prev, ...newItems]);
        setDashboardPage(nextPage);
      }
    }
    
    setIsLoadingMore(false);
  };

  // Функция группировки продуктов по дням
  const groupProductsByDate = (products: (ScanHistoryItem | DashboardProduct)[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    const groups: { [key: string]: (ScanHistoryItem | DashboardProduct)[] } = {
      today: [],
      yesterday: [],
      earlier: []
    };
    
    products.forEach(product => {
      let productDate: Date;
      
      if ('timestamp' in product && product.timestamp) {
        productDate = new Date(product.timestamp);
      } else if ('dateAdded' in product) {
        productDate = new Date(product.dateAdded);
      } else {
        productDate = new Date(0); // Очень старая дата для неопределенных
      }
      
      const productDateStr = productDate.toDateString();
      
      if (productDateStr === todayStr) {
        groups.today.push(product);
      } else if (productDateStr === yesterdayStr) {
        groups.yesterday.push(product);
      } else {
        groups.earlier.push(product);
      }
    });
    
    return groups;
  };

  // Создаем fallback анализ для старых сканирований
  const createFallbackAnalysis = (historyItem: ScanHistoryItem) => {
    return {
      foodName: historyItem.name,
      portionInfo: {
        description: 'Historical scan',
        estimatedWeight: 100,
        measurementUnit: 'g'
      },
      nutritionInfo: {
        calories: historyItem.calories,
        protein: historyItem.protein,
        fat: historyItem.fat,
        carbs: historyItem.carbs,
        sugar: historyItem.sugar || 0
      }
    };
  };

  // Рендер элемента сканированного продукта
  const renderScannedItem = ({ item }: { item: ScanHistoryItem }) => {
    const onItemPress = () => {
      const analysisData = item.fullData ? JSON.parse(item.fullData) : createFallbackAnalysis(item);
      navigateToProductDetail({
        ...item,
        fullData: JSON.stringify(analysisData)
      });
    };

    return (
      <TouchableOpacity onPress={onItemPress}>
        <ScannedProductItem item={item} isDark={isDark} t={t} onDelete={loadData} />
      </TouchableOpacity>
    );
  };

  // Рендер элемента продукта из дашборда
  const renderDashboardItem = ({ item }: { item: DashboardProduct }) => {
    return <DashboardProductItem item={item} isDark={isDark} t={t} onDelete={loadData} />;
  };

  // Рендер разделителя групп
  const renderGroupHeader = (groupKey: string, hasItems: boolean) => {
    if (!hasItems) return null;
    
    let title = '';
    switch (groupKey) {
      case 'today':
        title = t('history.today');
        break;
      case 'yesterday':
        title = t('history.yesterday');
        break;
      case 'earlier':
        title = t('history.earlier');
        break;
    }
    
    return (
      <View style={[styles.groupHeader, isDark && styles.darkGroupHeader]}>
        <Text style={[
          styles.groupTitle, 
          isDark && { color: '#999999' }
        ]}>
          {title}
        </Text>
      </View>
    );
  };

  // Рендер футера со кнопкой "Загрузить еще"
  const renderLoadMoreFooter = () => {
    const currentProducts = activeTab === 'scanned' ? displayedScannedProducts : displayedDashboardProducts;
    const allProducts = activeTab === 'scanned' ? scannedProducts : dashboardProducts;
    
    if (currentProducts.length >= allProducts.length) {
      return null; // Все элементы уже загружены
    }
    
    return (
      <TouchableOpacity 
        style={[styles.loadMoreButton, isDark && styles.darkLoadMoreButton]}
        onPress={loadMoreItems}
        disabled={isLoadingMore}
      >
        <Text style={[styles.loadMoreText, isDark && itemStyles.darkText]}>
          {isLoadingMore ? t('history.loading') : `Загрузить ещё (${allProducts.length - currentProducts.length})`}
        </Text>
        {isLoadingMore && (
          <View style={styles.loadingIndicator}>
            <Text style={[styles.loadingDots, isDark && itemStyles.darkText]}>...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Рендер группированного списка
  const renderGroupedList = (products: (ScanHistoryItem | DashboardProduct)[], renderItem: any) => {
    const groups = groupProductsByDate(products);
    const flatData: Array<{ type: 'header' | 'item'; data: any; key: string }> = [];
    
    // Добавляем группы в том порядке: сегодня, вчера, ранее
    ['today', 'yesterday', 'earlier'].forEach(groupKey => {
      const groupItems = groups[groupKey];
      if (groupItems.length > 0) {
        // Добавляем заголовок группы
        flatData.push({ type: 'header', data: groupKey, key: `header-${groupKey}` });
        
        // Добавляем элементы группы
        groupItems.forEach((item, index) => {
          const key = 'id' in item ? item.id : `${item.productId}-${index}`;
          flatData.push({ type: 'item', data: item, key: `item-${key}` });
        });
      }
    });
    
    return (
      <FlatList
        data={flatData}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return renderGroupHeader(item.data, true);
          } else {
            return renderItem({ item: item.data });
          }
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={flatData.length === 0 ? styles.emptyListContent : styles.listContent}
        ListFooterComponent={renderLoadMoreFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D6EFD']}
            tintColor={isDark ? '#FFFFFF' : '#0D6EFD'}
          />
        }
      />
    );
  };

  // Рендер пустого списка для сканированных продуктов
  const renderEmptyScanned = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={64} color={isDark ? "#555" : "#DDD"} />
      <Text style={[styles.emptyText, isDark && itemStyles.darkTextSecondary]}>
        {t('history.noScannedProducts')}
      </Text>
      <Link href="/scan" asChild>
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>{t('common.scanProduct')}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  // Рендер пустого списка для продуктов дашборда
  const renderEmptyDashboard = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="nutrition-outline" size={64} color={isDark ? "#555" : "#DDD"} />
      <Text style={[styles.emptyText, isDark && itemStyles.darkTextSecondary]}>
        {t('history.noDashboardProducts')}
      </Text>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>{t('history.goToDashboard')}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <View style={[styles.container, isDark && styles.darkContainer]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && itemStyles.darkText]}>{t('history.title')}</Text>
        </View>

        {/* Вкладки */}
        <View style={[styles.tabsContainer, isDark && styles.darkTabsContainer]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'scanned' && styles.activeTab,
              activeTab === 'scanned' && !isDark && styles.activeTabLight,
              activeTab === 'scanned' && isDark && styles.activeTabDark
            ]}
            onPress={() => setActiveTab('scanned')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'scanned' && styles.activeTabText,
              isDark && itemStyles.darkText
            ]}>
              {t('history.scannedProducts')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'dashboard' && styles.activeTab,
              activeTab === 'dashboard' && !isDark && styles.activeTabLight,
              activeTab === 'dashboard' && isDark && styles.activeTabDark
            ]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'dashboard' && styles.activeTabText,
              isDark && itemStyles.darkText
            ]}>
              {t('history.addedToDashboard')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Контент вкладок */}
        {activeTab === 'scanned' ? (
          displayedScannedProducts.length === 0 ? (
            renderEmptyScanned()
          ) : (
            renderGroupedList(displayedScannedProducts, renderScannedItem)
          )
        ) : (
          displayedDashboardProducts.length === 0 ? (
            renderEmptyDashboard()
          ) : (
            renderGroupedList(displayedDashboardProducts, renderDashboardItem)
          )
        )}
      </View>
    </SafeAreaView>
  );
}

// Основные стили
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  darkSafeArea: {
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  darkContainer: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  
  // Стили для вкладок
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  darkTabsContainer: {
    backgroundColor: '#1C1C1E',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTabLight: {
    backgroundColor: '#007AFF',
  },
  activeTabDark: {
    backgroundColor: '#0A84FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Стили для пустых состояний
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: '-20%',
  },
  emptyText: {
    fontSize: 17,
    color: '#666666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  groupHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  darkGroupHeader: {
    // Оставляем пустым, без фона
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  loadMoreButton: {
    padding: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  darkLoadMoreButton: {
    backgroundColor: '#1C1C1E',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  loadingDots: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

// Стили для элементов списка
const itemStyles = StyleSheet.create({
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  darkProductItem: {
    backgroundColor: '#1C1C1E',
  },
  productImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    marginRight: 12,
  },
  dashboardIcon: {
    width: 75,
    height: 75,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#A0A0A0',
  },
  caloriesText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  servingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macrosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  macroCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  macroLetter: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  macroValue: {
    fontSize: 13,
    color: '#666666',
  },
  dateAdded: {
    fontSize: 10,
    color: '#A0A0A0',
    textAlign: 'right',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  macrosRowScanned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
}); 