import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useTranslation } from '../i18n/i18n';

interface WelcomeCardProps {
  userCalories?: number;
  userProtein?: number;
  userFat?: number;
  userCarbs?: number;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ 
  userCalories = 2000, 
  userProtein = 120, 
  userFat = 110, 
  userCarbs = 190 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenMainWelcome');
      if (!hasSeenWelcome) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Ошибка при проверке первого посещения:', error);
      setIsVisible(true); // Показываем в случае ошибки
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem('hasSeenMainWelcome', 'true');
      setIsVisible(false);
      console.log('👋 Приветственная карточка скрыта');
    } catch (error) {
      console.error('Ошибка при сохранении состояния:', error);
    }
  };

  const handleLearnMore = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
            <Ionicons 
              name="bulb-outline" 
              size={20} 
              color={isDark ? "#007AFF" : "#007AFF"} 
            />
          </View>
          <Text style={[styles.title, isDark && styles.darkText]}>
            {t('dashboard.welcomeCard.title')}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.closeButton, isDark && styles.darkCloseButton]}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="close" 
            size={16} 
            color={isDark ? "#888888" : "#666666"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: isDark ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 107, 107, 0.08)' }]}>
              <Ionicons name="calculator-outline" size={16} color="#FF6B6B" />
            </View>
            <Text style={[styles.infoText, isDark && styles.darkText]}>
              {t('dashboard.welcomeCard.goalCalculatedWith')} <Text style={styles.boldText}>{userCalories} {t('common.kcal')}/день</Text>
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)' }]}>
              <Ionicons name="calendar-outline" size={16} color="#007AFF" />
            </View>
            <Text style={[styles.infoText, isDark && styles.darkText]}>
              {t('dashboard.welcomeCard.calendarDescription')}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.15)' : 'rgba(52, 199, 89, 0.08)' }]}>
              <Ionicons name="create-outline" size={16} color="#34C759" />
            </View>
            <Text style={[styles.infoText, isDark && styles.darkText]}>
              {t('dashboard.welcomeCard.tapToEdit')} <Ionicons name="pencil" size={14} color="#666666" /> {t('dashboard.welcomeCard.editCaloriesDescription')}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 149, 0, 0.08)' }]}>
              <Ionicons name="camera-outline" size={16} color="#FF9500" />
            </View>
            <Text style={[styles.infoText, isDark && styles.darkText]}>
              {t('dashboard.welcomeCard.scanProductsDescription')}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoIconContainer, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)' }]}>
              <Ionicons name="swap-horizontal" size={16} color="#007AFF" />
            </View>
            <Text style={[styles.infoText, isDark && styles.darkText]}>
              {t('dashboard.welcomeCard.swipeDescription')}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={[styles.expandedSection, isDark && styles.darkExpandedSection]}>
            <Text style={[styles.expandedTitle, isDark && styles.darkText]}>
              {t('dashboard.welcomeCard.personalGoalsTitle')}
            </Text>
            
            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: 'rgba(255, 107, 107, 0.85)' }]} />
                <Text style={[styles.macroValue, isDark && styles.darkText]}>{userCalories}</Text>
                <Text style={[styles.macroLabel, isDark && styles.darkTextSecondary]}>{t('dashboard.welcomeCard.macroLabels.calories')}</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: 'rgba(255, 107, 107, 0.85)' }]} />
                <Text style={[styles.macroValue, isDark && styles.darkText]}>{userProtein}{t('common.gram')}</Text>
                <Text style={[styles.macroLabel, isDark && styles.darkTextSecondary]}>{t('dashboard.welcomeCard.macroLabels.protein')}</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: 'rgba(255, 209, 102, 0.85)' }]} />
                <Text style={[styles.macroValue, isDark && styles.darkText]}>{userFat}{t('common.gram')}</Text>
                <Text style={[styles.macroLabel, isDark && styles.darkTextSecondary]}>{t('dashboard.welcomeCard.macroLabels.fat')}</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: 'rgba(6, 214, 160, 0.85)' }]} />
                <Text style={[styles.macroValue, isDark && styles.darkText]}>{userCarbs}{t('common.gram')}</Text>
                <Text style={[styles.macroLabel, isDark && styles.darkTextSecondary]}>{t('dashboard.welcomeCard.macroLabels.carbs')}</Text>
              </View>
            </View>
            
            <Text style={[styles.disclaimerText, isDark && styles.darkTextSecondary]}>
              {t('dashboard.welcomeCard.disclaimerText')}
            </Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleDismiss}
          >
            <Text style={styles.primaryButtonText}>{t('dashboard.welcomeCard.understood')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton, isDark && styles.darkSecondaryButton]}
            onPress={handleLearnMore}
          >
            <Text style={[styles.secondaryButtonText, isDark && styles.darkSecondaryButtonText]}>
              {isExpanded ? t('dashboard.welcomeCard.hideDetails') : t('dashboard.welcomeCard.moreDetails')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  darkContainer: {
    backgroundColor: '#1C1C1E',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  darkHeader: {
    borderBottomColor: '#3A3A3C',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  darkIconContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  darkText: {
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
  darkCloseButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  content: {
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    flex: 1,
  },
  boldText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  expandedSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  darkExpandedSection: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666666',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  darkSecondaryButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  darkSecondaryButtonText: {
    color: '#0A84FF',
  },
});

// Функция для принудительного показа приветственной карточки (для настроек)
export const showWelcomeCard = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('hasSeenMainWelcome');
    console.log('🔄 Приветственная карточка будет показана при следующем посещении');
  } catch (error) {
    console.error('Ошибка при сбросе статуса приветственной карточки:', error);
  }
};

// Функция для проверки, видел ли пользователь карточку
export const hasSeenWelcomeCard = async (): Promise<boolean> => {
  try {
    const hasSeenWelcome = await AsyncStorage.getItem('hasSeenMainWelcome');
    return hasSeenWelcome === 'true';
  } catch (error) {
    console.error('Ошибка при проверке статуса приветственной карточки:', error);
    return false;
  }
};

export default WelcomeCard; 