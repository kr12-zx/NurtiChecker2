import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaywallScreenProps {
  onSubscribe: () => void;
  onSkip: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ onSubscribe, onSkip }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Paywall</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSecondaryText]}>
          Получите доступ ко всем премиум-функциям
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          <Text style={[styles.featureText, isDark && styles.darkText]}>
            Персонализированный план питания
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          <Text style={[styles.featureText, isDark && styles.darkText]}>
            Подробная аналитика питательных веществ
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          <Text style={[styles.featureText, isDark && styles.darkText]}>
            Рекомендации по оптимизации рациона
          </Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          <Text style={[styles.featureText, isDark && styles.darkText]}>
            Расширенный анализ продуктов
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={onSubscribe}
        >
          <Text style={styles.subscribeButtonText}>Продолжить</Text>
        </TouchableOpacity>
        
        {/* Кнопка для пропуска, которую можно будет легко удалить в будущем */}
        <TouchableOpacity
          style={[styles.skipButton, isDark && styles.darkSkipButton]}
          onPress={onSkip}
        >
          <Text style={[styles.skipButtonText, isDark && styles.darkSkipButtonText]}>
            Пропустить (для тестирования)
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.note, isDark && styles.darkSecondaryText]}>
        *В этом месте будет Paywall от Revenuecat
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'space-between',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  darkSecondaryText: {
    color: '#AAAAAA',
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  darkSkipButton: {
    borderColor: '#444444',
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  darkSkipButtonText: {
    color: '#AAAAAA',
  },
  note: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginBottom: 10,
  },
});

export default PaywallScreen;
