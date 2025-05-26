import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/i18n';

interface SugarIndicatorProps {
  currentSugar: number;
  maxSugar: number;
}

const SugarIndicator: React.FC<SugarIndicatorProps> = ({ currentSugar, maxSugar }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  // Calculate percentage of max sugar consumed
  const percentage = (currentSugar / maxSugar) * 100;
  
  // Determine color based on percentage
  let indicatorColor = '#4CD964'; // Green
  let iconName = 'checkmark';
  
  if (percentage >= 100) {
    indicatorColor = '#FF3B30'; // Red
    iconName = 'alert';
  } else if (percentage >= 75) {
    indicatorColor = '#FF9500'; // Orange
    iconName = 'warning';
  }

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, isDark && styles.darkText]}>
          {t('nutrition.hiddenSugar')}
        </Text>
        <Text style={[styles.values, isDark && styles.darkText]}>
          {currentSugar}/{maxSugar}г
        </Text>
      </View>
      
      <View style={styles.indicatorContainer}>
        <View style={styles.sugarBarContainer}>
          <View 
            style={[
              styles.sugarBarFill, 
              { width: `${Math.min(percentage, 100)}%`, backgroundColor: indicatorColor }
            ]} 
          />
        </View>
        
        <View style={[styles.statusIcon, { backgroundColor: indicatorColor }]}>
          <Ionicons name={'checkmark-circle'} size={14} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#1C1C1E',
    shadowOpacity: 0.2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  darkText: {
    color: '#FFFFFF',
  },
  values: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sugarBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E9E9E9',
    marginRight: 6,
    overflow: 'hidden',
  },
  sugarBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default SugarIndicator;
