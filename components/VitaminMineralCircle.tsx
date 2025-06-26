import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface VitaminMineralData {
  name: string;
  shortName: string;
  current: number;
  goal: number;
  color: string;
}

interface VitaminMineralCircleProps {
  data: VitaminMineralData[];
  title: string;
  totalScore: number;
  size?: number;
  showPlaceholder?: boolean; // Новый пропс для показа состояния "нет данных"
}

const VitaminMineralCircle: React.FC<VitaminMineralCircleProps> = ({
  data,
  title,
  totalScore,
  size = 120,
  showPlaceholder = false
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Мемоизируем значения для предотвращения бесконечных рендеров
  const memoizedData = useMemo(() => ({
    dataLength: data?.length || 0,
    totalScore,
    firstItemColor: data?.[0]?.color || '#4CAF50',
    hasData: data && data.length > 0
  }), [data, totalScore]);
  
  // Логирование только при реальных изменениях данных
  useEffect(() => {
    // Логируем только если есть существенные изменения
    if (memoizedData.dataLength > 0 || totalScore > 0) {
      console.log(`🔵 VitaminMineralCircle ${title} обновлен:`, {
        dataLength: memoizedData.dataLength,
        totalScore: memoizedData.totalScore,
        hasData: memoizedData.hasData
      });
    }
  }, [memoizedData.dataLength, memoizedData.totalScore, title]);
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Общий прогресс определяет какую часть кольца займет цветная дуга
  const totalProgressAngle = showPlaceholder ? 0 : (Math.min(totalScore, 100) / 100) * 360;
  
  // Цвета текста как в CircularProgress
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? '#AAAAAA' : '#666666';

  return (
    <View style={styles.container}>
        <Svg width={size} height={size}>
          {/* Фоновый круг */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={isDark ? '#3A3A3C' : '#E6E7E8'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
        {/* Единый цветной круг прогресса */}
        {totalProgressAngle > 0 && (
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={memoizedData.firstItemColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${(totalProgressAngle / 360) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
        )}
        
        {/* Центральный текст - используем SVG Text как в CircularProgress */}
        <SvgText
          x={centerX}
          y={centerY - 6} // Немного выше центра для двух строк
          textAnchor="middle"
          dy=".3em"
          fontSize="22" // Соответствует CircularProgress
          fontWeight="bold"
          fill={textColor}
        >
          {showPlaceholder ? '?' : `${totalScore}%`}
        </SvgText>
        
        {/* Подпись */}
        <SvgText
          x={centerX}
          y={centerY + 12} // Ниже основного текста
          textAnchor="middle"
          dy=".3em"
          fontSize="12"
          fill={secondaryTextColor}
        >
            {title}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

export default VitaminMineralCircle; 