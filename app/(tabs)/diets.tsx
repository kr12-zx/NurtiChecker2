import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';

export default function DietsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>{t('diets.title')}</Text>
      </View>
      
      <View style={styles.comingSoonContainer}>
        <Ionicons 
          name="nutrition-outline" 
          size={60} 
          color={isDark ? "#555" : "#DDD"} 
        />
        <Text style={[styles.comingSoonTitle, isDark && styles.darkText]}>
          {t('diets.comingSoon')}
        </Text>
        <Text style={[styles.comingSoonText, isDark && styles.darkTextSecondary]}>
          {t('diets.comingSoonDescription')}
        </Text>
        
        <View style={styles.featureList}>
          <View style={[styles.featureItem, isDark && styles.darkFeatureItem]}>
            <Ionicons name="calendar-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            <Text style={[styles.featureText, isDark && styles.darkText]}>
              {t('diets.features.mealPlans')}
            </Text>
          </View>
          
          <View style={[styles.featureItem, isDark && styles.darkFeatureItem]}>
            <Ionicons name="restaurant-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            <Text style={[styles.featureText, isDark && styles.darkText]}>
              {t('diets.features.recipes')}
            </Text>
          </View>
          
          <View style={[styles.featureItem, isDark && styles.darkFeatureItem]}>
            <Ionicons name="analytics-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            <Text style={[styles.featureText, isDark && styles.darkText]}>
              {t('diets.features.tracking')}
            </Text>
          </View>
          
          <View style={[styles.featureItem, isDark && styles.darkFeatureItem]}>
            <Ionicons name="cart-outline" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            <Text style={[styles.featureText, isDark && styles.darkText]}>
              {t('diets.features.shopping')}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.notifyButton}>
          <Text style={styles.notifyButtonText}>
            {t('diets.notifyMe')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
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
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featureList: {
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  darkFeatureItem: {
    backgroundColor: '#1C1C1E',
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#000000',
  },
  notifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  notifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 