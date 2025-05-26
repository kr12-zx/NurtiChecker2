import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useTranslation } from '../i18n/i18n';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progressPercentage: number; // 0 to 100
  caloriesLeft: number;
  burnedCalories: number;
  baseColorLight?: string;
  baseColorDark?: string;
  progressColorLight?: string;
  progressColorDark?: string;
  textColorLight?: string;
  textColorDark?: string;
  burnedTextColorLight?: string;
  burnedTextColorDark?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progressPercentage,
  caloriesLeft,
  burnedCalories,
  baseColorLight = '#E6E7E8',
  baseColorDark = '#3A3A3C',
  progressColorLight = '#4CAF50', // Green for light theme
  progressColorDark = '#06D6A0',  // Teal/Green for dark theme to match macro
  textColorLight = '#000000',
  textColorDark = '#FFFFFF',
  burnedTextColorLight = '#FF8C00',
  burnedTextColorDark = '#FFA500',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(progressPercentage, 100)) / 100;

  const baseC = isDark ? baseColorDark : baseColorLight;
  
  // Определяем цвет прогресса в зависимости от процента потребления калорий
  let progressC;
  if (progressPercentage > 105) { // Значительный перебор калорий (>5%)
    progressC = isDark ? '#FF453A' : '#FF3B30'; // Красный для обоих тем
  } else if (progressPercentage > 95 && progressPercentage <= 105) { // В пределах нормы с небольшим отклонением
    progressC = isDark ? '#FFD60A' : '#FFCC00'; // Желтый для обоих тем
  } else {
    progressC = isDark ? progressColorDark : progressColorLight; // Зеленый по умолчанию
  }
  
  const textC = isDark ? textColorDark : textColorLight;
  const burnedTextC = isDark ? burnedTextColorDark : burnedTextColorLight;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size + 26} viewBox={`0 0 ${size} ${size + 26}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Base Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={baseC}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressC}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
        {/* Text in the center */}
        <SvgText
          x={size / 2}
          y={size / 2 - 10} // Adjust for two lines of text
          textAnchor="middle"
          dy=".3em" // Vertical alignment adjustment
          fontSize="22" // Larger font for calories left
          fontWeight="bold"
          fill={textC}
        >
          {caloriesLeft}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 12} // Positioned below the calorie number
          textAnchor="middle"
          dy=".3em"
          fontSize="12"
          fill={isDark ? '#AAAAAA' : '#666666'} // Subdued color for "Calories left"
        >
          {t('dashboard.caloriesLeft')}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircularProgress; 