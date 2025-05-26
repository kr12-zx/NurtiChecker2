import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';
import { formatAddedDateTime, getDashboardAddedProducts } from '../../services/dailyNutrition';
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
  dateAdded: string;
  servingMultiplier: number;
  image?: string; // URL изображения продукта
  timestamp?: number; // Время добавления продукта
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
const DashboardProductItem = ({ item, isDark, t }: { item: DashboardProduct; isDark: boolean; t: (key: string) => string }) => {
  const proteinColor = isDark ? MACRO_COLORS.Protein.dark : MACRO_COLORS.Protein.light;
  const fatColor = isDark ? MACRO_COLORS.Fat.dark : MACRO_COLORS.Fat.light;
  const carbsColor = isDark ? MACRO_COLORS.Carbs.dark : MACRO_COLORS.Carbs.light;

  return (
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
        <View style={itemStyles.dashboardIcon}>
          <Ionicons name="nutrition-outline" size={32} color={isDark ? '#FFFFFF' : '#007AFF'} />
        </View>
      )}
      <View style={itemStyles.productInfoContainer}>
        <View style={itemStyles.productHeader}>
          <Text style={[itemStyles.productName, isDark && itemStyles.darkText]} numberOfLines={1}>{item.name}</Text>
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
  );
};

export default function HistoryScreen() {
  const isDark = useColorScheme() === 'dark';
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  
  // Состояние для вкладок
  const [activeTab, setActiveTab] = useState<TabType>('scanned');
  
  // Состояние для данных
  const [scannedProducts, setScannedProducts] = useState<ScanHistoryItem[]>([]);
  const [dashboardProducts, setDashboardProducts] = useState<DashboardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Параметр для переключения на вкладку дашборда (если переходим с главного экрана)
  useFocusEffect(
    useCallback(() => {
      // Проверяем параметр tab и переключаемся на нужную вкладку
      if (params.tab === 'dashboard') {
        setActiveTab('dashboard');
      }
    }, [params.tab])
  );
  
  // Загрузка данных для обеих вкладок
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем сканированные продукты
      const scannedHistory = await getScanHistory();
      setScannedProducts(scannedHistory);
      
      // Загружаем продукты из дашборда
      const dashboardData = await getDashboardAddedProducts();
      setDashboardProducts(dashboardData);
      
    } catch (error) {
      console.error('Ошибка при загрузке данных истории:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Обновление при потягивании вниз
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };
  
  // Загрузка данных при первом отображении экрана
  useEffect(() => {
    loadData();
  }, []);

  // Функция для создания базовых данных анализа
  const createFallbackAnalysis = (historyItem: ScanHistoryItem) => {
    return {
      foodName: historyItem.name,
      portionInfo: {
        description: `Приблизительная порция`,
        estimatedWeight: 350,
        measurementUnit: 'г'
      },
      nutritionInfo: {
        calories: historyItem.calories,
        protein: historyItem.protein,
        carbs: historyItem.carbs,
        fat: historyItem.fat,
        sugars: 0,
        saturatedFat: 0,
        fiber: 0,
        sodium: 0,
        glycemicIndex: null,
        vitamins: [],
        minerals: []
      },
      analysis: {
        healthBenefits: [],
        healthConcerns: [],
        overallHealthScore: 50
      },
      recommendedIntake: {
        description: `Употреблять в умеренных количествах как часть сбалансированной диеты.`,
        maxFrequency: ``
      }
    };
  };

  // Рендер элемента сканированного продукта
  const renderScannedItem = ({ item }: { item: ScanHistoryItem }) => {
    return (
      <TouchableOpacity onPress={() => navigateToProductDetail(item)}>
        <ScannedProductItem 
          item={item} 
          isDark={isDark} 
          t={t} 
          onDelete={loadData} // Обновляем список после удаления
        />
      </TouchableOpacity>
    );
  };

  // Рендер элемента продукта из дашборда
  const renderDashboardItem = ({ item }: { item: DashboardProduct }) => {
    // Для продуктов дашборда нужно создать объект ScanHistoryItem для навигации
    const scanItem: ScanHistoryItem = {
      id: item.productId,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      sugar: item.sugar,
      image: item.image, // Используем изображение из дашборда
      date: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      scanDate: item.dateAdded,
      fullData: undefined
    };

    return (
      <TouchableOpacity onPress={() => navigateToProductDetail(scanItem)}>
        <DashboardProductItem item={item} isDark={isDark} t={t} />
      </TouchableOpacity>
    );
  };

  // Рендер пустого списка для сканированных продуктов
  const renderEmptyScanned = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={64} color={isDark ? "#555" : "#DDD"} />
      <Text style={[styles.emptyText, isDark && styles.darkTextSecondary]}>
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
      <Text style={[styles.emptyText, isDark && styles.darkTextSecondary]}>
        {t('history.noDashboardProducts')}
      </Text>
      <Link href="/main01" asChild>
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Перейти к дашборду</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <View style={[styles.container, isDark && styles.darkContainer]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>{t('history.title')}</Text>
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
              isDark && styles.darkText
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
              isDark && styles.darkText
            ]}>
              {t('history.addedToDashboard')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Контент вкладок */}
        {activeTab === 'scanned' ? (
          <FlatList
            data={scannedProducts}
            renderItem={renderScannedItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={scannedProducts.length === 0 ? styles.emptyListContent : styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyScanned}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0D6EFD']}
                tintColor={isDark ? '#FFFFFF' : '#0D6EFD'}
              />
            }
          />
        ) : (
          <FlatList
            data={dashboardProducts}
            renderItem={renderDashboardItem}
            keyExtractor={(item, index) => `${item.productId}-${index}`}
            contentContainerStyle={dashboardProducts.length === 0 ? styles.emptyListContent : styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyDashboard}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0D6EFD']}
                tintColor={isDark ? '#FFFFFF' : '#0D6EFD'}
              />
            }
          />
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
  }
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