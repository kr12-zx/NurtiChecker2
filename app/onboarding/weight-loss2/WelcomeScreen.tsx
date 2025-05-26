import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { darkThemeColors, lightThemeColors, sharedOnboardingStyles } from './sharedOnboardingStyles';

interface WelcomeScreenProps {
  onContinue: () => void;
  // userProfile, updateUserProfile будут добавлены, если этот экран будет что-то менять в профиле
}

const programItems = [
  { icon: 'scale-outline', text: 'Цель по весу' },
  { icon: 'calculator-outline', text: 'Калорийность' },
  { icon: 'calendar-outline', text: 'График приемов пищи' },
  { icon: 'restaurant-outline', text: 'Стратегия питания' },
  { icon: 'time-outline', text: 'Интервальное питание' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          {/* Header: Title and Subtitle */}
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Добро пожаловать!
            </Text>
            <Text style={[sharedOnboardingStyles.subtitleText, { color: themeColors.textSecondary }]}>
              Давайте создадим персонализированный план, который поможет вам достичь успеха.
            </Text>
          </View>

          {/* Program Section */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={[
                sharedOnboardingStyles.optionTitle, // Используем стиль заголовка опции для консистентности
                { color: themeColors.textPrimary, marginBottom: 16, textTransform: 'uppercase' }
            ]}>
              Программа
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
              {programItems.map((item, index) => (
                <View key={index} style={{ alignItems: 'center', width: '30%', marginBottom: 20, minWidth: 80 }}>
                  <View style={[
                    sharedOnboardingStyles.optionIconContainer,
                    {
                      backgroundColor: themeColors.iconContainerBackground, // Неактивный фон
                      width: 40, height: 40, borderRadius: 20, marginBottom: 8 // Чуть крупнее для WelcomeScreen
                    }
                  ]}>
                    <Ionicons name={item.icon as any} size={20} color={themeColors.iconColor} />
                  </View>
                  <Text style={[
                    sharedOnboardingStyles.optionDescription, // Используем стиль описания опции
                    { color: themeColors.textSecondary, textAlign: 'center' }
                  ]}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[sharedOnboardingStyles.navButtonContainer, { paddingBottom: 16 /* Отступ для SafeArea */ } ]}>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            { backgroundColor: themeColors.navButtonPrimaryBackground, flex: 1 } // Одна кнопка занимает всю ширину
          ]}
          onPress={onContinue}
          activeOpacity={0.7}
        >
          <Text style={[sharedOnboardingStyles.navButtonText, { color: themeColors.navButtonPrimaryText }]}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;
