import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { useCardStyles, useContainerStyles, usePalette, useTypographyStyles } from './unifiedStyles';

interface MedicalDisclaimerScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const MedicalDisclaimerScreen: React.FC<MedicalDisclaimerScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();
  
  // Получаем динамические стили
  const palette = usePalette();
  const containers = useContainerStyles();
  const typography = useTypographyStyles();
  const cards = useCardStyles();

  // Дополнительные динамические стили для этого экрана
  const disclaimerTextStyle = {
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    marginBottom: 16,
  };

  const infoTitleStyle = {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 16,
  };

  const infoItemStyle = {
    marginBottom: 12,
  };

  const infoTextStyle = {
    fontSize: 16,
    lineHeight: 22,
    color: palette.text.primary,
  };

  const acknowledgementTextStyle = {
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'center' as const,
  };

  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      <View style={containers.rootContainer}>
        {/* Основной контент */}
        <View style={containers.contentContainer}>
          <ScrollView
            style={containers.scrollView}
            contentContainerStyle={containers.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={typography.screenTitle}>
              {t('onboarding.medicalDisclaimer.title')}
            </Text>
            
            <Text style={typography.screenSubtitle}>
              {t('onboarding.medicalDisclaimer.subtitle')}
            </Text>
            
            {/* Используем cards.section вместо inline стилей */}
            <View style={[cards.section, { marginTop: 20 }]}>
              <Text style={disclaimerTextStyle}>
                {t('onboarding.medicalDisclaimer.disclaimerText1')}
              </Text>
              
              <View style={cards.divider} />
              
              <Text style={disclaimerTextStyle}>
                {t('onboarding.medicalDisclaimer.disclaimerText2')}
              </Text>
            </View>
            
            <View style={{ marginTop: 10 }}>
              <Text style={infoTitleStyle}>
                {t('onboarding.medicalDisclaimer.consultTitle')}
              </Text>
              
              <View style={infoItemStyle}>
                <Text style={infoTextStyle}>
                  {t('onboarding.medicalDisclaimer.conditions.chronic')}
                </Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoTextStyle}>
                  {t('onboarding.medicalDisclaimer.conditions.medications')}
                </Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoTextStyle}>
                  {t('onboarding.medicalDisclaimer.conditions.pregnancy')}
                </Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoTextStyle}>
                  {t('onboarding.medicalDisclaimer.conditions.eatingDisorders')}
                </Text>
              </View>
              
              <View style={infoItemStyle}>
                <Text style={infoTextStyle}>
                  {t('onboarding.medicalDisclaimer.conditions.weightIssues')}
                </Text>
              </View>
            </View>
            
            {/* Используем cards.section для acknowledgement контейнера */}
            <View style={[cards.section, { marginTop: 20, padding: 16 }]}>
              <Text style={acknowledgementTextStyle}>
                {t('onboarding.medicalDisclaimer.acknowledgement')}
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Единый компонент кнопок */}
        <ButtonFooter
          onBack={onBack}
          onContinue={onContinue}
          disableContinue={false}
          continueText={t('common.continue')}
        />
      </View>
    </SafeAreaView>
  );
};

export default MedicalDisclaimerScreen;
