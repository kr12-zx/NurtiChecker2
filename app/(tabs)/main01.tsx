import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalorieAwareDatePicker, { CalorieStatus, DayCalorieData } from '../../components/CalorieAwareDatePicker';
import CircularProgress from '../../components/CircularProgress';
import ProductCard, { ProductData } from '../../components/ProductCard';
import { useTranslation } from '../../i18n/i18n';
import { DailyNutritionData, formatDateToString, getDailyNutrition } from '../../services/dailyNutrition';
import { navigateToHistoryDashboard } from '../../services/navigationService';
import { getRecentScans } from '../../services/scanHistory';
import { styles } from './main01.styles';

interface MacronutrientData {
  current: number;
  goal: number;
  name: string;
  color: string;
  colorDark: string;
}

export default function Main01Screen() { 
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  // Значения по умолчанию для дневных целей
  const defaultCalorieGoal = 2000;
  const defaultMaxSugar = 25;
  
  // Состояние для хранения дневной статистики питания
  const [dailyNutritionData, setDailyNutritionData] = useState<DailyNutritionData | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Сохраняем данные о калориях за предыдущие дни
  const [historicalCalorieData, setHistoricalCalorieData] = useState<DayCalorieData[]>([]);
  
  // Значения для отображения
  const dailyCalorieGoal = defaultCalorieGoal;
  const consumedCalories = dailyNutritionData?.caloriesConsumed || 0;
  const burnedCalories = 0; // В текущей версии не отслеживаем сожженные калории
  const caloriesActuallyConsumed = consumedCalories - burnedCalories;
  const caloriesLeft = dailyCalorieGoal - caloriesActuallyConsumed; 
  const circularProgressPercentage = (caloriesActuallyConsumed / dailyCalorieGoal) * 100;
  
  // Данные по скрытому сахару
  const currentSugar = dailyNutritionData?.sugar || 0;
  const maxSugar = defaultMaxSugar;

  // Целевые значения макронутриентов
  const proteinGoal = 120;
  const fatGoal = 110;
  const carbGoal = 190;

  // Макронутриенты с реальными данными
  const [macronutrients, setMacronutrients] = useState<MacronutrientData[]>([
    { name: t('dashboard.protein'), current: 0, goal: proteinGoal, color: '#FF8A80', colorDark: '#FF6B6B' },
    { name: t('dashboard.fat'), current: 0, goal: fatGoal, color: '#FFCF50', colorDark: '#FFD166' },
    { name: t('dashboard.carbs'), current: 0, goal: carbGoal, color: '#80D8FF', colorDark: '#06D6A0' },
  ]);
  
  // Используем реальные данные из истории сканирований
  const [recentScans, setRecentScans] = useState<ProductData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Обработчик изменения даты
  const handleDateChange = (date: Date) => {
    console.log(`Выбрана новая дата: ${formatDateToString(date)}`);
    setCurrentDate(date);
    
    // Загружаем данные для выбранной даты и обновляем индикаторы только для нее
    loadNutritionData(date);
    
    // Больше не загружаем исторические данные при каждом переключении даты
    // Это поможет избежать проблем с перезаписью данных и исчезновением индикаторов
  };
  
  // Обработчик обновления данных при pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadNutritionData(currentDate),
      loadRecentScans()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [currentDate]);
  
  // Загружаем сохраненные данные при старте
  useEffect(() => {
    // Загружаем сохраненные данные из AsyncStorage
    const loadSavedData = async () => {
      try {
        const savedHistoricalData = await AsyncStorage.getItem('historicalCalorieData');
        if (savedHistoricalData) {
          const parsedData = JSON.parse(savedHistoricalData) as DayCalorieData[];
          // Преобразуем строки дат в объекты Date
          const processedData = parsedData.map(item => ({
            ...item,
            date: new Date(item.date)
          }));
          console.log(`Загружены сохраненные данные: ${processedData.length} записей`);
          setHistoricalCalorieData(processedData);
        }
      } catch (error) {
        console.error('Ошибка при загрузке сохраненных данных:', error);
      }
    };
    
    loadSavedData();
  }, []);
  
  // Инициализация данных при первой загрузке экрана
  // Разделяем на два useEffect для двух разных фаз загрузки
  useEffect(() => {
    console.log('Первичная загрузка данных - фаза 1');
    
    // Загружаем данные за текущий день
    loadNutritionData(currentDate);
    
    // Загружаем последние сканы
    loadRecentScans();
    
    // Пересчитываем данные календаря
    setCalorieData(getCalorieData());
    
    // Загружаем данные за 13 и 12 мая для быстрого отображения
    loadHistoricalData();
  }, []);
  
  // Специально отключили полную загрузку истории с задержкой, так как она перезаписывает правильные данные
  useEffect(() => {
    // Загружаем исторические данные только один раз при начальной загрузке
    // И больше не запускаем никаких таймеров, которые могут перезаписать правильные данные
    console.log('Начальная загрузка исторических данных');
    loadHistoricalData();
    
    // Не запускаем загрузку по таймеру, так как это приводит к перезаписи данных
  }, []);
  
  // Обновляем данные при возврате на экран (например, после добавления продукта)
  useFocusEffect(
    useCallback(() => {
      console.log('Экран получил фокус, обновляем данные питания...');
      
      // Загружаем данные для текущей выбранной даты
      loadNutritionData(currentDate);
      
      // Загружаем последние сканы
      loadRecentScans();

      // Обновляем индикаторы только если есть новые данные и только для текущего дня
      if (dailyNutritionData && dailyNutritionData.caloriesConsumed > 0) {
        // Гарантируем, что у нас есть запись и устанавливаем правильный статус
        const today = new Date();
        let status = CalorieStatus.EMPTY;
        const consumed = dailyNutritionData.caloriesConsumed;
        
        // Определяем статус на основе потребления
        if (consumed > dailyCalorieGoal * 1.05) {
          status = CalorieStatus.OVER;   // Перебор калорий (красный)
        } else if (consumed >= dailyCalorieGoal * 0.95 && consumed <= dailyCalorieGoal * 1.05) {
          status = CalorieStatus.NORMAL; // В пределах нормы (желтый)
        } else if (consumed > 0) {
          status = CalorieStatus.UNDER;  // Недобор калорий (зеленый) - это тот индикатор, который исчезал
        }
        
        if (consumed > 0) {
          // Создаем объект данных для сегодняшнего дня
          const newTodayData = {
            date: today,
            consumed,
            goal: dailyCalorieGoal,
            status
          };
          
          // Сначала обновляем данные календаря напрямую, чтобы индикатор появился мгновенно
          setCalorieData(prevData => {
            // Удаляем старые записи за сегодня
            const filteredData = prevData.filter(d => {
              const dDate = new Date(d.date);
              return !(dDate.getDate() === today.getDate() && 
                      dDate.getMonth() === today.getMonth() && 
                      dDate.getFullYear() === today.getFullYear());
            });
            
            console.log(`Непосредственное обновление данных календаря: потреблено=${consumed}, статус=${status}`);
            return [...filteredData, newTodayData];
          });
          
          // Затем обновляем исторические данные
          setHistoricalCalorieData(prevData => {
            const filteredData = prevData.filter(d => {
              const dDate = new Date(d.date);
              return !(dDate.getDate() === today.getDate() && 
                      dDate.getMonth() === today.getMonth() && 
                      dDate.getFullYear() === today.getFullYear());
            });
            
            return [...filteredData, newTodayData];
          });
        }
      }
      
      return () => {};
    }, [currentDate])
  );
  
  // Функция загрузки данных о питании за выбранную дату
  const loadNutritionData = async (date: Date) => {
    try {
      const dateString = formatDateToString(date);
      console.log(`Загрузка данных о питании за ${dateString}...`);
      
      const nutritionData = await getDailyNutrition(dateString);
      setDailyNutritionData(nutritionData);
      
      // Обновляем макронутриенты на основе загруженных данных
      setMacronutrients([
        { name: t('dashboard.protein'), current: nutritionData?.protein || 0, goal: proteinGoal, color: '#FF8A80', colorDark: '#FF6B6B' },
        { name: t('dashboard.fat'), current: nutritionData?.fat || 0, goal: fatGoal, color: '#FFCF50', colorDark: '#FFD166' },
        { name: t('dashboard.carbs'), current: nutritionData?.carbs || 0, goal: carbGoal, color: '#80D8FF', colorDark: '#06D6A0' },
      ]);
      
      console.log(`Загружены данные о питании: калории=${nutritionData?.caloriesConsumed || 0}, сахар=${nutritionData?.sugar || 0}`);
      
      // Добавляем данные в историю для отображения индикаторов в календаре
      const isDateToday = isSameDay(date, new Date());
      const existingData = historicalCalorieData.find(d => 
        isSameDay(new Date(d.date), date)
      );
      
      // Для текущего дня: принудительно удаляем из истории, если нет данных
      if (isDateToday && (!nutritionData || nutritionData.caloriesConsumed <= 0)) {
        console.log(`Текущий день ${formatDateToString(date)}: нет данных, удаляем из истории`);
        
        // Если существует запись в истории за текущий день - удаляем её
        if (existingData) {
          setHistoricalCalorieData(prevData => 
            prevData.filter(d => !isSameDay(new Date(d.date), date))
          );
        }
      } 
      // Для дней с данными: добавляем их в историю
      else if (nutritionData && nutritionData.caloriesConsumed > 0) {
        // Определяем статус на основе потребления
        let status = CalorieStatus.EMPTY;
        const consumed = nutritionData.caloriesConsumed;
        
        if (consumed > dailyCalorieGoal * 1.05) {
          status = CalorieStatus.OVER;   // Перебор калорий (красный)
        } else if (consumed >= dailyCalorieGoal * 0.95 && consumed <= dailyCalorieGoal * 1.05) {
          status = CalorieStatus.NORMAL; // В пределах нормы (желтый)
        } else if (consumed > 0) {
          status = CalorieStatus.UNDER;  // Недобор калорий (зеленый)
        }
        
        // Добавляем в историю данные о потребленных калориях
        if (!existingData || existingData.consumed !== consumed) {
          console.log(`Добавляем данные в историю для ${formatDateToString(date)}: ${consumed} ккал, статус=${status}`);
          setHistoricalCalorieData(prevData => {
            // Убираем старые данные за этот день, если есть
            const filteredData = prevData.filter(d => !isSameDay(new Date(d.date), date));
            return [...filteredData, {
              date: date,
              consumed: consumed,
              goal: dailyCalorieGoal,
              status: status
            }];
          });
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных о питании:', error);
    }
  };
  
  // Загрузка исторических данных о питании за последнюю неделю
  const loadHistoricalData = async () => {
    try {
      console.log('Запущена загрузка данных за последнюю неделю...');
      const today = new Date();
      
      // Сохраняем текущие данные для сегодняшнего дня перед обновлением
      const todayData = historicalCalorieData.find(d => isSameDay(new Date(d.date), today));
      
      // Создаем временный массив данных, чтобы обновить их все сразу
      let newHistoricalData: DayCalorieData[] = [...historicalCalorieData];
      let dataChanged = false;
      
      // Загружаем данные за последние 7 дней
      const dates = [];
      for (let i = -7; i <= 0; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        // Загружаем данные для всех дат, включая текущую дату
        // и даже включая вчерашний день (-7 вместо -6)
        dates.push(date);
      }
      
      // Загружаем данные для всех дат параллельно
      const promises = dates.map(date => {
        const dateString = formatDateToString(date);
        return getDailyNutrition(dateString)
          .then(nutritionData => {
            if (nutritionData && nutritionData.caloriesConsumed > 0) {
              console.log(`Загружены исторические данные за ${dateString}: калории=${nutritionData.caloriesConsumed}`);
              
              // Определяем статус на основе потребления
              let status = CalorieStatus.EMPTY;
              const consumed = nutritionData.caloriesConsumed;
              if (consumed > dailyCalorieGoal * 1.05) {
                status = CalorieStatus.OVER;
              } else if (consumed >= dailyCalorieGoal * 0.95 && consumed <= dailyCalorieGoal * 1.05) {
                status = CalorieStatus.NORMAL;
              } else if (consumed > 0) {
                status = CalorieStatus.UNDER;
              }
              
              // Добавляем или обновляем данные в нашем временном массиве
              const existingIndex = newHistoricalData.findIndex(d => isSameDay(new Date(d.date), date));
              if (existingIndex !== -1) {
                // Обновляем существующие данные
                if (newHistoricalData[existingIndex].consumed !== consumed || 
                    newHistoricalData[existingIndex].status !== status) {
                  newHistoricalData[existingIndex] = {
                    date: date,
                    consumed: consumed,
                    goal: dailyCalorieGoal,
                    status: status
                  };
                  dataChanged = true;
                }
              } else {
                // Добавляем новые данные
                newHistoricalData.push({
                  date: date,
                  consumed: consumed,
                  goal: dailyCalorieGoal,
                  status: status
                });
                dataChanged = true;
              }
            } else if (isSameDay(date, today) && (!nutritionData || nutritionData.caloriesConsumed <= 0)) {
              // Удаляем запись для текущего дня без данных
              const existingIndex = newHistoricalData.findIndex(d => isSameDay(new Date(d.date), date));
              if (existingIndex !== -1) {
                newHistoricalData.splice(existingIndex, 1);
                dataChanged = true;
              }
            }
            return null;
          })
          .catch(error => {
            console.error(`Ошибка при загрузке данных за ${dateString}:`, error);
            return null;
          });
      });
      
      // Ждем завершения всех запросов
      await Promise.all(promises);
      
      // Обновляем исторические данные только если они изменились
      if (dataChanged) {
        // Если у нас были данные для сегодняшнего дня, убедимся что они не потерялись
        if (todayData && todayData.consumed > 0) {
          const todayExists = newHistoricalData.some(d => isSameDay(new Date(d.date), today));
          if (!todayExists) {
            // Если данные для сегодня пропали, вернем их обратно
            newHistoricalData.push(todayData);
            console.log('Восстановлены данные для текущего дня:', todayData);
          }
        }
        
        console.log('Обновляем все данные календаря, найдено новых записей:', newHistoricalData.length);
        setHistoricalCalorieData(newHistoricalData);
        
        // Пересчитываем данные для календаря
        setCalorieData(getCalorieData());
      }
      
      console.log('Загрузка исторических данных завершена. Исторических записей:', newHistoricalData.length);
    } catch (error) {
      console.error('Ошибка при загрузке исторических данных:', error);
    }
  };

  // Загрузка последних сканирований
  const loadRecentScans = async () => {
    try {
      console.log('Загрузка последних сканирований...');
      const recentHistory = await getRecentScans(3);
      console.log('Получено сканирований:', recentHistory.length);
      
      if (recentHistory.length > 0) {
        console.log('Последнее сканирование:', recentHistory[0].name, 'Дата:', recentHistory[0].scanDate);
      }
      
      // Преобразуем в формат ProductData для компонента ProductCard
      const formattedScans: ProductData[] = recentHistory.map(item => ({
        id: item.id,
        name: item.name,
        calories: item.calories,
        macros: { 
          protein: item.protein, 
          fat: item.fat, 
          carbs: item.carbs 
        },
        timestamp: new Date(item.timestamp),
        imageUrl: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
        fullData: item.fullData // Добавляем полные данные, если они есть
      }));
      
      setRecentScans(formattedScans);
      console.log('Обновлены последние сканы на главном экране');
    } catch (error) {
      console.error('Ошибка при загрузке последних сканирований:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Удалены повторяющиеся коды

  
  // Добавим помощник для сравнения дат
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  // Вспомогательная функция для определения статуса калорий
  const determineCalorieStatus = (consumed: number, goal: number): CalorieStatus => {
    if (consumed <= 0) {
      return CalorieStatus.EMPTY;
    } else if (consumed > goal * 1.05) {
      return CalorieStatus.OVER;   // Перебор калорий (красный)
    } else if (consumed >= goal * 0.95 && consumed <= goal * 1.05) {
      return CalorieStatus.NORMAL; // В пределах нормы (желтый)
    } else {
      return CalorieStatus.UNDER;  // Недобор калорий (зеленый)
    }
  };

  // Функция для получения данных о калориях без изменения состояния
  const getCalorieData = useCallback((): DayCalorieData[] => {
    console.log('** Вызов функции getCalorieData **');
    const today = new Date();
    let data: DayCalorieData[] = [];
    
    // Используем только реальные исторические данные
    // Берем копию массива исторических данных
    data = [...historicalCalorieData].map(item => ({
      ...item,
      // Пересчитываем статус на основе фактического потребления
      status: determineCalorieStatus(item.consumed, item.goal)
    }));
    
    // Проверяем, есть ли сегодняшний день в массиве
    const todayDataExists = data.some(item => isSameDay(new Date(item.date), today));
    
    // Если есть данные о питании за сегодня и они не совпадают с историческими
    if (dailyNutritionData && dailyNutritionData.caloriesConsumed > 0 && !todayDataExists) {
      // Добавляем сегодняшние данные с правильным статусом
      const consumed = dailyNutritionData.caloriesConsumed;
      const status = determineCalorieStatus(consumed, dailyCalorieGoal);
      
      data.push({
        date: today,
        consumed,
        goal: dailyCalorieGoal,
        status
      });
      
      console.log(`Добавлены данные за сегодня: consumed=${consumed}, статус=${status}`);
    } 
    // Если есть исторические данные за сегодня, но есть и новые данные
    else if (dailyNutritionData && dailyNutritionData.caloriesConsumed > 0 && todayDataExists) {
      // Обновляем существующие данные за сегодня
      data = data.map(item => {
        if (isSameDay(new Date(item.date), today)) {
          const consumed = dailyNutritionData.caloriesConsumed;
          return {
            ...item,
            consumed,
            status: determineCalorieStatus(consumed, item.goal)
          };
        }
        return item;
      });
      
      console.log(`Обновлены данные за сегодня: consumed=${dailyNutritionData.caloriesConsumed}`);
    }
    
    return data;
  }, [dailyNutritionData, dailyCalorieGoal, historicalCalorieData]);

  // Данные для календаря
  const [calorieData, setCalorieData] = useState<DayCalorieData[]>([]);
  
  // Важный эффект: обновляем данные календаря при изменении исторических данных
  useEffect(() => {
    // Обновляем данные календаря при изменении исторических данных
    console.log(`Обновление данных календаря: исторических данных: ${historicalCalorieData.length}`);
    const newCalorieData = getCalorieData();
    setCalorieData(newCalorieData);
    
    // Сохраняем данные в AsyncStorage для постоянства между запусками
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('historicalCalorieData', JSON.stringify(historicalCalorieData));
        console.log('Данные календаря сохранены в постоянное хранилище');
      } catch (error) {
        console.error('Ошибка сохранения данных:', error);
      }
    };
    
    // Сохраняем данные только если есть что сохранять
    if (historicalCalorieData.length > 0) {
      saveData();
    }
    if (dailyNutritionData) {
      const today = new Date();
      const existingData = historicalCalorieData.find(d => 
        isSameDay(new Date(d.date), today)
      );
      
      if (!existingData || existingData.status === CalorieStatus.EMPTY) {
        // Создаем запись только для текущего дня
        let status = CalorieStatus.EMPTY;
        const consumed = dailyNutritionData.caloriesConsumed;
        
        // Определяем статус
        if (consumed > dailyCalorieGoal * 1.05) {
          status = CalorieStatus.OVER;   // Перебор калорий (красный)
        } else if (consumed >= dailyCalorieGoal * 0.95 && consumed <= dailyCalorieGoal * 1.05) {
          status = CalorieStatus.NORMAL; // В пределах нормы (желтый)
        } else if (consumed > 0) {
          status = CalorieStatus.UNDER;  // Недобор калорий (зеленый)
        }
        
        const newData = {
          date: today,
          consumed,
          goal: dailyCalorieGoal,
          status
        };
        
        // Добавляем только если есть данные или статус не EMPTY
        if (status !== CalorieStatus.EMPTY) {
          setHistoricalCalorieData(prevData => {
            // Убираем старые данные за этот день, если есть
            const filteredData = prevData.filter(d => !isSameDay(new Date(d.date), today));
            return [...filteredData, newData];
          });
        }
      }
    }
  }, [dailyNutritionData, dailyCalorieGoal]);

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkSafeArea]}>
      <ScrollView 
        style={[styles.scrollViewContainer, isDark && styles.darkContainer]}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D6EFD']}
            tintColor={isDark ? '#FFFFFF' : '#0D6EFD'}
          />
        }
      >
        {/* Заголовок и иконка настроек теперь в самом верху */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>{t('dashboard.title')}</Text>
          <Link href="/settings" asChild> 
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
          </Link>
        </View>
        
        {/* Календарь с выбором дат - теперь ниже заголовка */}
        <CalorieAwareDatePicker
          calorieData={calorieData}
          onDateSelected={handleDateChange}
          dailyCalorieGoal={dailyCalorieGoal}
        />

        {/* Карточка с информацией о калориях */}
        <TouchableOpacity 
          onPress={navigateToHistoryDashboard}
          activeOpacity={0.7}
        >
          <View style={[
            styles.calorieCard, 
            isDark && styles.darkCard, 
            isDark && styles.darkCardShadow
          ]}>
            <View style={styles.calorieStatusHeader}>
              <Text style={[styles.calorieSummaryText, isDark && styles.darkText]}>
                {t('nutrition.goal')}: {consumedCalories}/{dailyCalorieGoal} {t('nutrition.kcal')} ({Math.round(circularProgressPercentage) || 0}%)
              </Text>
            </View>
            
            <View style={styles.summaryContainer}>
              <View style={styles.circularProgressContainer}>
                <CircularProgress
                  size={135} /* Увеличили размер с 110 до 135 */
                  strokeWidth={12} /* Увеличили толщину круга */
                  progressPercentage={circularProgressPercentage}
                  caloriesLeft={caloriesLeft}
                  burnedCalories={burnedCalories}
                  progressColorLight={isDark? '#06D6A0' : '#4CAF50'}
                  progressColorDark={isDark? '#06D6A0' : '#4CAF50'}
                />
              </View>

              <View style={styles.macronutrientsContainer}>
                {macronutrients.map((macro) => {
                  const progress = (macro.current / macro.goal) * 100;
                  const macroBarColor = isDark ? macro.colorDark : macro.color;
                  return (
                    <View key={macro.name} style={styles.macroItem}>
                      <View style={styles.macroHeader}>
                        <Text style={[styles.macroName, isDark && styles.darkText]}>{macro.name}</Text>
                        <Text style={[styles.macroValues, isDark && styles.darkTextSecondary]}>
                          {macro.current}/{macro.goal}г
                        </Text>
                      </View>
                      <View style={[styles.linearProgressBar, isDark && styles.darkLinearProgressBar]}>
                        <View 
                          style={[
                            styles.linearProgressFill, 
                            { 
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: macroBarColor 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            
            {/* Индикатор скрытого сахара внутри карточки */}
            <View style={styles.activityContainer}>
              <View style={styles.sugarBarContainer}>
                <Text style={[styles.sugarTitle, isDark && styles.darkText]}>
                  {t('nutrition.hiddenSugar')}
                </Text>
                <Text style={[styles.sugarValues, isDark && styles.darkText]}>
                  {currentSugar}/{maxSugar}г
                </Text>
              </View>
              <View style={styles.sugarIndicatorContainer}>
                <View style={styles.sugarBar}>
                  <View 
                    style={[styles.sugarBarFill, { width: `${Math.min((currentSugar / maxSugar) * 100, 100)}%` }]} 
                  />
                </View>
                {currentSugar >= maxSugar && (
                  <View style={styles.sugarIcon}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderTitle, isDark && styles.darkText]}>{t('dashboard.recentScans')}</Text>
          <Link href="/history" asChild>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, isDark && styles.darkTextSecondary]}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        {recentScans.length > 0 ? (
          <View style={styles.productCardsContainer}>
            {recentScans.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={loadRecentScans} // Обновляем список после удаления
              />
            ))}
            <Link href="/scan" asChild>
              <TouchableOpacity style={[styles.scanButtonSmall, {alignSelf: 'center', marginTop: 8}]}>
                <Text style={styles.scanButtonText}>{t('common.scanMore')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="camera-outline" size={48} color={isDark ? "#666" : "#CCC"} />
            <Text style={[styles.emptyStateText, isDark && styles.darkTextSecondary]}>
              {t('dashboard.noScannedProducts')}
            </Text>
            <Link href="/scan" asChild> 
              <TouchableOpacity style={styles.scanButton}>
                <Text style={styles.scanButtonText}>{t('common.scanProduct')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 