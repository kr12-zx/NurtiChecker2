import React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../../i18n/i18n';
import ButtonFooter from './components/ButtonFooter';
import { containers, medicalDisclaimer, typography } from './unifiedStyles';

interface MedicalDisclaimerScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

const MedicalDisclaimerScreen: React.FC<MedicalDisclaimerScreenProps> = ({
  onContinue,
  onBack
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
            
            <View style={medicalDisclaimer.disclaimerCard}>
              <Text style={medicalDisclaimer.disclaimerText}>
                {t('onboarding.medicalDisclaimer.disclaimerText1')}
              </Text>
              
              <View style={medicalDisclaimer.divider} />
              
              <Text style={medicalDisclaimer.disclaimerText}>
                {t('onboarding.medicalDisclaimer.disclaimerText2')}
              </Text>
            </View>
            
            <View style={medicalDisclaimer.infoContainer}>
              <Text style={medicalDisclaimer.infoTitle}>
                {t('onboarding.medicalDisclaimer.consultTitle')}
              </Text>
              
              <View style={medicalDisclaimer.infoItem}>
                <Text style={medicalDisclaimer.infoText}>
                  {t('onboarding.medicalDisclaimer.conditions.chronic')}
                </Text>
              </View>
              
              <View style={medicalDisclaimer.infoItem}>
                <Text style={medicalDisclaimer.infoText}>
                  {t('onboarding.medicalDisclaimer.conditions.medications')}
                </Text>
              </View>
              
              <View style={medicalDisclaimer.infoItem}>
                <Text style={medicalDisclaimer.infoText}>
                  {t('onboarding.medicalDisclaimer.conditions.pregnancy')}
                </Text>
              </View>
              
              <View style={medicalDisclaimer.infoItem}>
                <Text style={medicalDisclaimer.infoText}>
                  {t('onboarding.medicalDisclaimer.conditions.eatingDisorders')}
                </Text>
              </View>
              
              <View style={medicalDisclaimer.infoItem}>
                <Text style={medicalDisclaimer.infoText}>
                  {t('onboarding.medicalDisclaimer.conditions.weightIssues')}
                </Text>
              </View>
            </View>
            
            <View style={medicalDisclaimer.acknowledgementContainer}>
              <Text style={medicalDisclaimer.acknowledgementText}>
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

// Локальных стилей больше нет - все стили вынесены в унифицированный модуль unifiedStyles.ts

export default MedicalDisclaimerScreen;
