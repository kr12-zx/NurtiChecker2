import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n/i18n';
import { translateVitamin, translateMineral } from '../utils/nutrientsTranslation';

interface NutrientBadgeProps {
  name: string;
  type?: 'vitamin' | 'mineral';
  size?: 'small' | 'medium' | 'large';
}

/**
 * u041au043eu043cu043fu043eu043du0435u043du0442 u0434u043bu044f u043eu0442u043eu0431u0440u0430u0436u0435u043du0438u044f u0432u0438u0442u0430u043cu0438u043du043eu0432 u0438 u043cu0438u043du0435u0440u0430u043bu043eu0432 u0441 u043bu043eu043au0430u043bu0438u0437u0430u0446u0438u0435u0439
 * @param name u041du0430u0437u0432u0430u043du0438u0435 u0432u0438u0442u0430u043cu0438u043du0430 u0438u043bu0438 u043cu0438u043du0435u0440u0430u043bu0430
 * @param type u0422u0438u043f: 'vitamin' u0438u043bu0438 'mineral'
 * @param size u0420u0430u0437u043cu0435u0440: 'small', 'medium', 'large'
 * @returns u041au043eu043cu043fu043eu043du0435u043du0442 NutrientBadge
 */
const NutrientBadge: React.FC<NutrientBadgeProps> = ({ 
  name, 
  type = 'vitamin', 
  size = 'medium' 
}) => {
  const { t, locale } = useTranslation();
  
  // u041eu043fu0440u0435u0434u0435u043bu044fu0435u043c, u043au0430u043au0443u044e u0444u0443u043du043au0446u0438u044e u043fu0435u0440u0435u0432u043eu0434u0430 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u0442u044c
  const translateName = type === 'vitamin' ? translateVitamin : translateMineral;
  
  // u041fu043eu043bu0443u0447u0430u0435u043c u043fu0435u0440u0435u0432u0435u0434u0435u043du043du043eu0435 u043du0430u0437u0432u0430u043du0438u0435
  const localizedName = translateName(name, locale);
  
  return (
    <View style={[styles.badge, styles[size]]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>
        {localizedName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    color: '#388E3C',
    fontWeight: '500',
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});

export default NutrientBadge;
