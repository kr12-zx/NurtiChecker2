import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';
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
        Alert.alert('Скопировано', 'ID пользователя скопирован в буфер обмена');
      } else {
        Alert.alert('Ошибка', 'Не удалось скопировать ID');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скопировать ID');
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
          'Push-уведомления не готовы',
          'Убедитесь, что вы дали разрешение на уведомления и используете реальное устройство.'
        );
        return;
      }

      await sendTestNotification();
      Alert.alert('Успех', 'Тестовое уведомление отправлено! Проверьте через несколько секунд.');
    } catch (error) {
      console.error('Ошибка отправки тестового уведомления:', error);
      Alert.alert('Ошибка', 'Не удалось отправить тестовое уведомление');
    }
  };

  const copyPushToken = async () => {
    if (pushToken) {
      await Clipboard.setStringAsync(pushToken);
      Alert.alert('Скопировано', 'Push токен скопирован в буфер обмена');
    } else {
      Alert.alert('Ошибка', 'Push токен не найден');
    }
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
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Appearance</Text>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                Use System Theme
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                Follow device dark/light mode settings
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
                  Dark Mode
                </Text>
                <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                  Use dark theme for the app
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
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Preferences</Text>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                Notifications
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                Enable push notifications
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
                Units
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {useMetricSystem ? 'Metric (g, ml)' : 'Imperial (oz, fl oz)'}
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
                Manage Allergens
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                Add or remove food allergens
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>User</Text>
          
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                User ID
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                {userId || 'Loading...'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCopyUserId} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color={isDark ? "#777" : "#999"} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>About</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                Privacy Policy
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
                Terms of Service
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, isDark && styles.darkCard]}
            onPress={() => Alert.alert('About', 'NutriChecker v1.0.0\nMade with ❤️')}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                About NutriChecker
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                Version 1.0.0
              </Text>
            </View>
            <Ionicons name="information-circle-outline" size={20} color={isDark ? "#777" : "#999"} />
          </TouchableOpacity>
        </View>

        {/* Push-уведомления (только для разработки) */}
        {__DEV__ && (
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>Push-уведомления (DEV)</Text>
              <Text style={[styles.settingDescription, isDark && styles.darkTextSecondary]}>
                Проверить работу push-уведомлений
              </Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleTestPushNotification}>
              <Ionicons name="notifications-outline" size={20} color={isDark ? "#777" : "#999"} />
            </TouchableOpacity>
          </View>
        )}

        {pushToken && (
          <View style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>Push токен</Text>
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