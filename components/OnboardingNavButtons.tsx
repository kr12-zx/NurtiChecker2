import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingNavButtonsProps {
  onContinue: () => void;
  onBack?: () => void;
  continueText?: string;
  backText?: string;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  continueEnabled?: boolean;
}

const OnboardingNavButtons: React.FC<OnboardingNavButtonsProps> = ({
  onContinue,
  onBack,
  continueText = 'Продолжить',
  backText = 'Назад',
  isLastStep = false,
  isFirstStep = false,
  continueEnabled = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.buttonsContainer}>
        {!isFirstStep && onBack && (
          <TouchableOpacity 
            style={[styles.backButton, isDark && styles.darkBackButton]} 
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            <Text style={[styles.backButtonText, isDark && styles.darkText]}>{backText}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[
            styles.continueButton, 
            isLastStep && styles.primaryButton,
            isFirstStep && styles.fullWidthButton,
            !continueEnabled && styles.disabledButton
          ]} 
          onPress={() => {
            if (continueEnabled) {
              console.log(`DEBUG: OnboardingNavButtons - ${continueText} button pressed`);
              onContinue();
            }
          }}
          activeOpacity={continueEnabled ? 0.7 : 1}
        >
          <Text style={styles.continueButtonText}>{continueText}</Text>
          {!isLastStep && <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    minWidth: 100,
    justifyContent: 'center',
  },
  darkBackButton: {
    backgroundColor: '#1C1C1E',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
    color: '#000000',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    minWidth: 150,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  fullWidthButton: {
    flex: 1,
  },
  continueButtonText: {
    fontSize: 16,
    marginRight: 4,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  darkText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
});

export default OnboardingNavButtons;
