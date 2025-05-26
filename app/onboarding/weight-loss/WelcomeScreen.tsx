import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import OnboardingNavButtons from '../../../components/OnboardingNavButtons';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkTextPrimary]}>Добро пожаловать!</Text>
      <Text style={[styles.subtitle, isDark && styles.darkTextSecondary]}>
        Давайте создадим персонализированный план, который поможет вам достичь успеха.
      </Text>

      <View style={styles.programContainer}>
        <Text style={[styles.programTitle, isDark && styles.darkTextPrimary]}>ПРОГРАММА</Text>
        
        <View style={styles.programSteps}>
          <View style={styles.programStep}>
            <View style={[styles.iconContainer, isDark && styles.darkIconContainerInactive]}>
              <Ionicons name="scale-outline" size={16} color={isDark ? '#A0A0A0' : '#666666'} />
            </View>
            <Text style={[styles.stepText, isDark && styles.darkTextSecondary]}>
              Цель по весу
            </Text>
          </View>
          
          <View style={styles.programStep}>
            <View style={[styles.iconContainer, isDark && styles.darkIconContainerInactive]}>
              <Ionicons name="calculator-outline" size={16} color={isDark ? '#A0A0A0' : '#666666'} />
            </View>
            <Text style={[styles.stepText, isDark && styles.darkTextSecondary]}>
              Калорийность
            </Text>
          </View>
          
          <View style={styles.programStep}>
            <View style={[styles.iconContainer, isDark && styles.darkIconContainerInactive]}>
              <Ionicons name="calendar-outline" size={16} color={isDark ? '#A0A0A0' : '#666666'} />
            </View>
            <Text style={[styles.stepText, isDark && styles.darkTextSecondary]}>
              График приемов пищи
            </Text>
          </View>
          
          <View style={styles.programStep}>
            <View style={[styles.iconContainer, isDark && styles.darkIconContainerInactive]}>
              <Ionicons name="restaurant-outline" size={16} color={isDark ? '#A0A0A0' : '#666666'} />
            </View>
            <Text style={[styles.stepText, isDark && styles.darkTextSecondary]}>
              Стратегия питания
            </Text>
          </View>
          
          <View style={styles.programStep}>
            <View style={[styles.iconContainer, isDark && styles.darkIconContainerInactive]}>
              <Ionicons name="time-outline" size={16} color={isDark ? '#A0A0A0' : '#666666'} />
            </View>
            <Text style={[styles.stepText, isDark && styles.darkTextSecondary]}>
              Интервальное питание
            </Text>
          </View>
        </View>
      </View>

      <OnboardingNavButtons
        onContinue={onContinue}
        isFirstStep={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',    
    paddingHorizontal: 20,
    paddingTop: 24, 
    backgroundColor: '#FFFFFF', 
  },
  darkContainer: {
    backgroundColor: '#121212', 
  },
  title: { 
    fontSize: 20,
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center',
    color: '#333333', 
  },
  subtitle: { 
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32, 
    color: '#666666', 
    lineHeight: 19,
  },
  darkTextPrimary: {
    color: '#F5F5F5', 
  },
  darkTextSecondary: {
    color: '#A0A0A0', 
  },
  programContainer: {
    width: '100%',
    marginBottom: 32, 
  },
  programTitle: { 
    fontSize: 16,
    fontWeight: 'bold', 
    marginBottom: 16,
    textAlign: 'center',
    color: '#333333', 
  },
  programSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', 
  },
  programStep: {
    width: '30%', 
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 80, 
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F0F0F0', 
  },
  darkIconContainerInactive: {
    backgroundColor: '#2C2C2E', 
  },
  stepText: { 
    fontSize: 11,
    textAlign: 'center',
    color: '#666666', 
  },
});

export default WelcomeScreen;
