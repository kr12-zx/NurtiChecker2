import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../../i18n/i18n';
import { useButtonStyles, useContainerStyles, usePalette, useTypographyStyles } from '../unifiedStyles';

interface ButtonFooterProps {
  onBack?: () => void;
  onContinue: () => void;
  continueText?: string;
  showSkip?: boolean;
  disableContinue?: boolean;
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({ 
  onBack, 
  onContinue, 
  continueText,
  showSkip = false,
  disableContinue = false
}) => {
  const { t } = useTranslation();
  const palette = usePalette();
  const containers = useContainerStyles();
  const buttonStyles = useButtonStyles();
  const typography = useTypographyStyles();

  // Создаем динамические стили для этого компонента
  const dynamicStyles = {
    buttonArea: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: palette.surface,
      borderTopWidth: 1,
      borderTopColor: palette.border.secondary,
      height: 90,
      paddingBottom: 34,
      zIndex: 100,
    },
    buttonContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 40,
      paddingVertical: 10,
      alignItems: 'center' as const,
      marginTop: 5,
      marginBottom: 10,
    },
    backButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.primary,
      backgroundColor: 'transparent',
    },
    skipButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    },
    continueButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: palette.primary,
      minWidth: 150,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      height: 48,
    },
    disabledButton: {
      opacity: 0.5,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: palette.primary,
      textAlign: 'center' as const,
    },
    skipButtonText: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: palette.text.secondary,
      textAlign: 'center' as const,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: palette.white,
      textAlign: 'center' as const,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    emptySpace: {
      width: 24,
    }
  };

  return (
    <View style={dynamicStyles.buttonArea}>
      <View style={dynamicStyles.buttonContainer}>
        {/* Левая кнопка (Назад или Пропустить) */}
        {onBack ? (
          <TouchableOpacity style={dynamicStyles.backButton} onPress={onBack}>
            <Text style={dynamicStyles.backButtonText}>{t('onboarding.back')}</Text>
          </TouchableOpacity>
        ) : showSkip ? (
          <TouchableOpacity style={dynamicStyles.skipButton} onPress={onContinue}>
            <Text style={dynamicStyles.skipButtonText}>{t('common.skip')}</Text>
          </TouchableOpacity>
        ) : <View style={dynamicStyles.emptySpace} />}
        
        {/* Кнопка Продолжить */}
        <TouchableOpacity 
          style={[
            dynamicStyles.continueButton,
            disableContinue && dynamicStyles.disabledButton
          ]}
          onPress={disableContinue ? undefined : onContinue}
          disabled={disableContinue}
        >
          <Text style={dynamicStyles.continueButtonText}>
            {continueText || t('common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ButtonFooter;
