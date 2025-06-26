import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';
import { MealService } from '../../services/mealService';
import { getPushToken, PushNotificationService, sendTestNotification } from '../../services/pushNotifications';
import { copyUserIdToClipboard, getUserId } from '../../services/userService';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Mock settings
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [useMetricSystem, setUseMetricSystem] = useState(true);
  
  // Состояние для ID пользователя
  const [userId, setUserId] = useState<string>('');
  const [pushToken, setPushToken] = useState<string>('');

  // Загружаем ID пользователя при монтировании компонента
  useEffect(() => {
    const loadUserData = async () => {
      const id = await getUserId();
      setUserId(id);
      
      const token = getPushToken();
      if (token) {
        setPushToken(token);
      }
    };
    
    loadUserData();
  }, []);

  // Handler for copying user ID
  const handleCopyUserId = async () => {
    try {
      const success = await copyUserIdToClipboard();
      if (success) {
        Alert.alert(t('settings.copied'), t('settings.userIdCopied'));
      } else {
        Alert.alert(t('settings.error'), t('settings.failedToCopy'));
      }
    } catch (error) {
      Alert.alert(t('settings.error'), t('settings.failedToCopy'));
    }
  };
  
  // Handler for theme toggle
  const toggleDarkMode = (value: boolean) => {
    // In a real app, we would apply the theme here
    setDarkMode(value);
  };

  const handleTestPushNotification = async () => {
    try {
      if (!PushNotificationService.isReady()) {
        Alert.alert(
          t('settings.pushNotificationsNotReady'),
          t('settings.pushNotificationsNotReadyMessage')
        );
        return;
      }

      await sendTestNotification();
      Alert.alert(t('settings.success'), t('settings.testNotificationSent'));
    } catch (error) {
      console.error('Ошибка отправки тестового уведомления:', error);
      Alert.alert(t('settings.error'), t('settings.failedToSendNotification'));
    }
  };

  // Test meal data webhook (DEV only)
  const testMealWebhook = async () => {
    try {
      console.log('Тестирование отправки данных о продукте...');
      
      const testMealData = {
        userId: '', // Will be filled by service
        dish: 'Тестовый продукт',
        grams: 100,
        kcal: 250,
        prot: 12,
        fat: 8,
        carb: 30,
        sugar: 5,
        fiber: 3,
        sodium: 200,
        glycemicIndex: 45,
        saturatedFat: 2,
        vitamins: ['Vitamin C', 'Vitamin B6'],
        minerals: ['Iron', 'Calcium'],
        healthBenefits: ['Высокое содержание витаминов', 'Хороший источник клетчатки'],
        healthConcerns: ['Умеренное содержание сахара'],
        overallHealthScore: 70,
        recommendedIntakeDescr: 'Употреблять 1-2 раза в день',
        packageInfo: 'Тестовая упаковка 100г',
        targetLanguage: 'ru',
        isSafeForUser: true,
        allergenId: undefined,
        allergenName: undefined,
        messageAllergen: undefined,
        recommendedIntakeMaxFrequency: 'daily',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
        ingredients: 'Тестовые ингредиенты',
        description: 'Тестовое описание продукта'
      };

      const success = await MealService.addMealToDashboard(testMealData);
      
      if (success) {
        Alert.alert(t('settings.success'), t('settings.testDataSent'));
      } else {
        Alert.alert(t('settings.error'), t('settings.failedToSendTestData'));
      }
    } catch (error) {
      console.error('Ошибка тестирования webhook:', error);
      Alert.alert(t('settings.error'), t('settings.testingError'));
    }
  };

  const copyPushToken = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken);
      Alert.alert(t('settings.copied'), t('settings.pushTokenCopied'));
    } else {
      Alert.alert(t('settings.error'), t('settings.pushTokenNotFound'));
    }
  };

  // Функция полной очистки данных
  const handleClearAllData = async () => {
    Alert.alert(
      t('settings.clearDataConfirmTitle'),
      t('settings.clearDataConfirmMessage'),
      [
        {
          text: t('settings.clearDataCancel'),
          style: 'cancel',
        },
        {
          text: t('settings.clearDataConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Импортируем AsyncStorage
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              
              console.log('🧹 Начинаем полную очистку всех данных...');
              
              // Очищаем все данные
              await AsyncStorage.clear();
              
              console.log('✅ AsyncStorage очищен, webhook будет отправлен при открытии Welcome экрана');
              
              Alert.alert(
                t('settings.clearDataSuccess'),
                t('settings.clearDataSuccessMessage'),
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Перенаправляем на онбординг
                      router.replace('/onboarding');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Ошибка при очистке данных:', error);
              Alert.alert(
                t('settings.clearDataError'),
                t('settings.clearDataErrorMessage')
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.darkText]}>{t('settings.title')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.settingsList}>
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('settings.appearance')}</Text>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.useSystemTheme')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.useSystemThemeDescription')}
              </Text>
            </View>
            <Switch
              value={useSystemTheme}
              onValueChange={(value) => {
                setUseSystemTheme(value);
                if (value) {
                  // If using system theme, set dark mode based on system
                  setDarkMode(colorScheme === 'dark');
                }
              }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={useSystemTheme ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          {!useSystemTheme && (
            <View style={[styles.settingItem, isDark && styles.darkCard]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                  {t('settings.darkMode')}
                </Text>
                <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                  {t('settings.darkModeDescription')}
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                disabled={useSystemTheme}
              />
            </View>
          )}
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('settings.preferences')}</Text>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.notifications')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.notificationsDescription')}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.units')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {useMetricSystem ? t('settings.metric') : t('settings.imperial')}
              </Text>
            </View>
            <Switch
              value={useMetricSystem}
              onValueChange={setUseMetricSystem}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={useMetricSystem ? '#007AFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => router.push('/allergens')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.manageAllergens')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.manageAllergensDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('settings.user')}</Text>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.userId')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {userId || t('settings.loading')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCopyUserId} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color={isDark ? "#777" : "#999"} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('settings.about')}</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => router.push('/calculation-science')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.calculationScience')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.calculationScienceDescription')}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDark ? '#888888' : '#666666'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => router.push('/user-profile')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.userProfile')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.userProfileDescription')}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDark ? '#888888' : '#666666'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.privacyPolicy')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.termsOfService')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => Alert.alert(t('settings.about'), t('settings.aboutMessage'))}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                {t('settings.aboutApp')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.version')}
              </Text>
            </View>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleClearAllData}
            style={[styles.settingItem, isDark && styles.darkCard]}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: 'rgba(255, 59, 48, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText, { color: '#FF3B30' }]}>
                {t('settings.clearAllData')}
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {t('settings.clearAllDataDescription')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Push-уведомления (только для разработки) */}
        {__DEV__ && (
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{t('settings.development')}</Text>
            
            <View style={[styles.settingItem, isDark && styles.darkCard]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, isDark && styles.darkText]}>{t('settings.pushNotificationsDev')}</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                  {t('settings.pushNotificationsDevDescription')}
                </Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={handleTestPushNotification}>
                <Ionicons name="notifications-outline" size={20} color={isDark ? "#777" : "#999"} />
              </TouchableOpacity>
            </View>

            <View style={[styles.settingItem, isDark && styles.darkCard]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, isDark && styles.darkText]}>{t('settings.testMealWebhook')}</Text>
                <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                  {t('settings.testMealWebhookDescription')}
                </Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={testMealWebhook}>
                <Ionicons name="restaurant-outline" size={20} color={isDark ? "#777" : "#999"} />
              </TouchableOpacity>
            </View>


          </View>
        )}

        {pushToken && (
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>{t('settings.pushToken')}</Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]} numberOfLines={1}>
                {pushToken.substring(0, 30)}...
              </Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={copyPushToken}>
              <Ionicons name="copy-outline" size={20} color={isDark ? "#777" : "#999"} />
            </TouchableOpacity>
          </View>
        )}


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  darkHeader: {
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  settingsList: {
    flex: 1,
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  copyButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 

 