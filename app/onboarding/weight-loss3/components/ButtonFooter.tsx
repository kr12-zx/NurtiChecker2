import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../../../../i18n/i18n';
import { palette } from '../unifiedStyles';

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

  return (
    <View style={styles.buttonArea}>
      <View style={styles.buttonContainer}>
        {/* Левая кнопка (Назад или Пропустить) */}
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>{t('onboarding.back')}</Text>
          </TouchableOpacity>
        ) : showSkip ? (
          <TouchableOpacity style={styles.skipButton} onPress={onContinue}>
            <Text style={styles.skipButtonText}>{t('common.skip')}</Text>
          </TouchableOpacity>
        ) : <View style={styles.emptySpace} />}
        
        {/* Кнопка Продолжить - полностью перестроенная */}
        <TouchableOpacity 
          style={[
            styles.continueButton,
            disableContinue && styles.disabledButton
          ]}
          onPress={disableContinue ? undefined : onContinue}
          disabled={disableContinue}
        >
          <Text style={styles.continueButtonText}>
            {continueText || t('common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    height: 90, // Абсолютно фиксированная высота для всех девайсов
    paddingBottom: 34, // Стандартная высота для Home Indicator
    zIndex: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 10, // Стандартный отступ
    alignItems: 'center',
    marginTop: 5, // Уменьшаем отступ сверху
    marginBottom: 10, // Добавляем отступ снизу 10px от нижнего края
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
    backgroundColor: '#007AFF', // Жестко заданный синий цвет
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center', // Добавляем вертикальное центрирование
    height: 48, // Фиксированная высота
  },
  disabledButton: {
    opacity: 0.5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.primary,
    textAlign: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.text.secondary,
    textAlign: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // Жестко заданный белый цвет
    textAlign: 'center',
    letterSpacing: 0.5, // Улучшаем читаемость
    textShadowColor: 'rgba(0,0,0,0.2)', // Добавляем тень для контраста
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  emptySpace: {
    width: 24,
  }
});

export default ButtonFooter;
