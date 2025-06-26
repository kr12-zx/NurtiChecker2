import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';

// Интерфейс для аллергена
interface Allergen {
  id: string;
  name: string;
  englishName: string; // Добавляем название на английском
  translationKey: string;
  selected: boolean;
}

// Function to create allergen list with translations
const createAllergensList = (t: any): Allergen[] => [
  // Основные аллергены
  { id: 'milk', name: 'Молоко', englishName: 'Milk', translationKey: 'Молоко', selected: false },
  { id: 'eggs', name: 'Яйца', englishName: 'Eggs', translationKey: 'Яйца', selected: false },
  { id: 'peanuts', name: 'Арахис', englishName: 'Peanuts', translationKey: 'Арахис', selected: false },
  { id: 'nuts', name: 'Орехи', englishName: 'Tree Nuts', translationKey: 'Орехи', selected: false },
  { id: 'fish', name: 'Рыба', englishName: 'Fish', translationKey: 'Рыба', selected: false },
  { id: 'shellfish', name: 'Моллюски', englishName: 'Shellfish', translationKey: 'Моллюски', selected: false },
  { id: 'wheat', name: 'Пшеница', englishName: 'Wheat', translationKey: 'Пшеница', selected: false },
  { id: 'soy', name: 'Соя', englishName: 'Soy', translationKey: 'Соя', selected: false },
  { id: 'sesame', name: 'Кунжут', englishName: 'Sesame', translationKey: 'Кунжут', selected: false },
  { id: 'gluten', name: 'Глютен', englishName: 'Gluten', translationKey: 'Глютен', selected: false },
  
  // Дополнительные аллергены
  { id: 'crustaceans', name: 'Ракообразные', englishName: 'Crustaceans', translationKey: 'Ракообразные', selected: false },
  { id: 'celery', name: 'Сельдерей', englishName: 'Celery', translationKey: 'Сельдерей', selected: false },
  { id: 'mustard', name: 'Горчица', englishName: 'Mustard', translationKey: 'Горчица', selected: false },
  { id: 'lupin', name: 'Люпин', englishName: 'Lupin', translationKey: 'Люпин', selected: false },
  { id: 'lactose', name: 'Лактоза', englishName: 'Lactose', translationKey: 'Лактоза', selected: false },
  { id: 'fructose', name: 'Фруктоза', englishName: 'Fructose', translationKey: 'Фруктоза', selected: false },
  { id: 'histamine', name: 'Гистамин', englishName: 'Histamine', translationKey: 'Гистамин', selected: false },
  
  // Пищевые добавки
  { id: 'sulfites', name: 'Сульфиты', englishName: 'Sulfites', translationKey: 'Сульфиты', selected: false },
  { id: 'nitrates', name: 'Нитраты', englishName: 'Nitrates', translationKey: 'Нитраты', selected: false },
  { id: 'msg', name: 'Глутамат', englishName: 'MSG', translationKey: 'Глутамат', selected: false },
  { id: 'carrageenan', name: 'Каррагинан', englishName: 'Carrageenan', translationKey: 'Каррагинан', selected: false },
];

// Ключи для AsyncStorage
const KEYS = {
  USER_SETTINGS: '@nutrichecker:user_settings',
  CUSTOM_ALLERGENS: '@nutrichecker:custom_allergens'
};

export default function AllergensScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  const [allergens, setAllergens] = useState<Allergen[]>(createAllergensList(t));
  const [newAllergen, setNewAllergen] = useState('');
  const [allergenWarningsEnabled, setAllergenWarningsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customAllergens, setCustomAllergens] = useState<Allergen[]>([]);
  
  // Загрузка данных при открытии экрана
  useEffect(() => {
    loadAllergensData();
  }, []);
  
  // Загружаем данные об аллергенах из AsyncStorage
  const loadAllergensData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем пользовательские аллергены
      const customAllergensJSON = await AsyncStorage.getItem(KEYS.CUSTOM_ALLERGENS);
      let loadedCustomAllergens: Allergen[] = [];
      if (customAllergensJSON) {
        loadedCustomAllergens = JSON.parse(customAllergensJSON);
        setCustomAllergens(loadedCustomAllergens);
      }
      
      // Загружаем настройки пользователя для получения предупреждений об аллергенах
      const userSettingsJSON = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      if (userSettingsJSON) {
        const userSettings = JSON.parse(userSettingsJSON);
        if (userSettings.allergenWarningsEnabled !== undefined) {
          setAllergenWarningsEnabled(userSettings.allergenWarningsEnabled);
        }
      }
      
      // Загружаем выбранные аллергены и применяем к списку стандартных аллергенов
      const allAllergens = [...createAllergensList(t), ...loadedCustomAllergens];
      
      if (userSettingsJSON) {
        const userSettings = JSON.parse(userSettingsJSON);
        if (userSettings.selectedAllergenIds && Array.isArray(userSettings.selectedAllergenIds)) {
          // Применяем выбранные аллергены к полному списку
          const updatedAllergens = allAllergens.map(allergen => ({
            ...allergen,
            selected: userSettings.selectedAllergenIds.includes(allergen.id)
          }));
          setAllergens(updatedAllergens);
        } else {
          setAllergens(allAllergens);
        }
      } else {
        setAllergens(allAllergens);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных об аллергенах:', error);
      // В случае ошибки используем дефолтный список
      setAllergens([...createAllergensList(t), ...customAllergens]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Сохраняем выбранные аллергены и настройки предупреждений
  const saveAllergens = async () => {
    try {
      // Получаем текущие настройки пользователя
      const userSettingsJSON = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      const userSettings = userSettingsJSON ? JSON.parse(userSettingsJSON) : {};
      
      // Получаем ID выбранных аллергенов
      const selectedAllergenIds = allergens
        .filter(allergen => allergen.selected)
        .map(allergen => allergen.id);
      
      // Обновляем настройки
      const updatedSettings = {
        ...userSettings,
        selectedAllergenIds,
        allergenWarningsEnabled
      };
      
      // Сохраняем обновленные настройки
      await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(updatedSettings));
      console.log('Аллергены успешно сохранены');
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении аллергенов:', error);
      return false;
    }
  };
  
  // Автоматическое сохранение при изменении выбранных аллергенов или настроек предупреждений
  useEffect(() => {
    // Пропускаем первоначальную загрузку
    if (!isLoading) {
      saveAllergens();
    }
  }, [allergens, allergenWarningsEnabled]);
  
  // Toggle allergen selection
  const toggleAllergen = (id: string) => {
    // Находим выбранный аллерген
    const targetAllergen = allergens.find(allergen => allergen.id === id);
    const newSelected = targetAllergen ? !targetAllergen.selected : false;
    
    // Обновляем список аллергенов
    setAllergens(allergens.map(allergen => 
      allergen.id === id 
        ? { ...allergen, selected: newSelected } 
        : allergen
    ));
    
    // Показываем уведомление, если аллерген выбран
    if (newSelected) {
      const allergenName = targetAllergen ? t(`allergens.${targetAllergen.translationKey}`, { defaultValue: targetAllergen.name }) : '';
      
      if (Platform.OS === 'android') {
        // Для Android используем ToastAndroid
        ToastAndroid.showWithGravity(
          t('allergens.allergenWarningInfo'),
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        // Для iOS используем Alert с таймером
        const alertTitle = t('allergens.allergenWarnings');
        const alertMessage = `${allergenName}: ${t('allergens.allergenWarningInfo')}`;
        
        Alert.alert(
          alertTitle,
          alertMessage,
          [{ text: 'OK', style: 'cancel' }],
          { cancelable: true }
        );
        
        // Автоматически закрываем через 2 секунды
        setTimeout(() => {
          // Закрыть Alert непосредственно нельзя,
          // поэтому просто ничего не делаем,
          // Alert закроется при нажатии OK
        }, 2000);
      }
    }
  };
  
  // Add new allergen
  const addAllergen = async () => {
    if (!newAllergen.trim()) {
      return;
    }
    
    const allergenName = newAllergen.trim();
    
    // Проверяем, существует ли уже такой аллерген
    const exists = allergens.some(
      allergen => allergen.name.toLowerCase() === allergenName.toLowerCase()
    );
    
    if (exists) {
      Alert.alert(t('allergens.alreadyAdded'), t('allergens.allergenExists'));
      return;
    }
    
    try {
      // Создаем новый пользовательский аллерген
      const newItem: Allergen = {
        id: `custom_${Date.now()}`,
        name: allergenName,
        englishName: allergenName, // По умолчанию используем то же название и для английского
        translationKey: allergenName, // Используем само имя как ключ перевода для новых аллергенов
        selected: true,
      };
      
      // Обновляем локальное состояние
      setAllergens([...allergens, newItem]);
      
      // Добавляем его в список пользовательских аллергенов
      const updatedCustomAllergens = [...customAllergens, newItem];
      setCustomAllergens(updatedCustomAllergens);
      
      // Сохраняем обновленный список пользовательских аллергенов
      await AsyncStorage.setItem(KEYS.CUSTOM_ALLERGENS, JSON.stringify(updatedCustomAllergens));
      
      setNewAllergen('');
    } catch (error) {
      console.error('Ошибка при добавлении аллергена:', error);
      Alert.alert(
        t('common.error'),
        t('allergens.errorAddingAllergen')
      );
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>{t('allergens.title')}</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#007AFF' : '#007AFF'} />
          <Text style={[styles.loadingText, isDark && styles.darkText]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <View style={[styles.warningToggleContainer, isDark && styles.darkCard]}>
          <View style={styles.warningTextContainer}>
            <Text style={[styles.warningToggleTitle, isDark && styles.darkText]}>
              {t('allergens.allergenWarnings')}
            </Text>
            <Text style={[styles.warningToggleSubtitle, isDark && styles.darkTextSecondary]}>
              {t('allergens.allergenWarningsDescription')}
            </Text>
          </View>
          <Switch
            value={allergenWarningsEnabled}
            onValueChange={setAllergenWarningsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={allergenWarningsEnabled ? '#007AFF' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      )}
      
      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
        {t('allergens.yourAllergens')}
      </Text>
      
      <View style={[styles.addAllergenContainer, isDark && styles.darkCard]}>
        <TextInput
          style={[styles.allergenInput, isDark && styles.darkInput]}
          placeholder={t('allergens.addNewAllergen')}
          placeholderTextColor={isDark ? '#777' : '#999'}
          value={newAllergen}
          onChangeText={setNewAllergen}
          returnKeyType="done"
          onSubmitEditing={addAllergen}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[
            styles.addButton,
            !newAllergen.trim() && styles.disabledButton
          ]}
          onPress={addAllergen}
          disabled={!newAllergen.trim()}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.allergensList}>
        {!isLoading && allergens.map(allergen => (
          <TouchableOpacity 
            key={allergen.id}
            style={[
              styles.allergenItem, 
              isDark && styles.darkCard,
              allergen.selected && styles.selectedAllergen,
              isDark && allergen.selected && styles.darkSelectedAllergen
            ]}
            onPress={() => toggleAllergen(allergen.id)}
          >
            <Text 
              style={[
                styles.allergenName, 
                isDark && styles.darkText,
                allergen.selected && styles.selectedAllergenText
              ]}
            >
              {/* Для основных аллергенов используем перевод, */}
              {/* а для пользовательских - просто название */}
              {t(`allergens.${allergen.translationKey}`, { defaultValue: allergen.name })}
            </Text>
            <View style={styles.checkboxContainer}>
              {allergen.selected ? (
                <View style={styles.checkboxChecked}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.checkboxUnchecked, isDark && styles.darkCheckbox]} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* u041fu0440u0435u0434u0443u043fu0440u0435u0436u0434u0435u043du0438u0435 u0443u0434u0430u043bu0435u043du043e u043fu043e u0442u0440u0435u0431u043eu0432u0430u043du0438u044e u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f */}
    </SafeAreaView>
  );
}

// Стили остаются без изменений
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  loadingContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
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
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  warningToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  warningTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  warningToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  warningToggleSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  addAllergenContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  allergenInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginRight: 1,
  },
  darkInput: {
    color: '#FFFFFF',
    backgroundColor: '#1C1C1E',
    borderColor: '#3A3A3C',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 48,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0', 
  },
  allergensList: {
    flex: 1,
    marginBottom: 16,
  },
  allergenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedAllergen: {
    backgroundColor: '#E7F3FF', // Light blue for selected
    borderColor: '#007AFF',
  },
  darkSelectedAllergen: {
    backgroundColor: '#004080', // Darker blue for selected in dark mode
    borderColor: '#007AFF',
  },
  allergenName: {
    fontSize: 16,
    color: '#000000',
  },
  selectedAllergenText: {
    fontWeight: '500',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
  },
  darkCheckbox: {
    borderColor: '#555',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
}); 