import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../../i18n/i18n';

export default function CalculationScienceScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const SectionCard = ({ 
    id, 
    icon, 
    title, 
    subtitle, 
    children 
  }: { 
    id: string; 
    icon: keyof typeof Ionicons.glyphMap; 
    title: string; 
    subtitle: string; 
    children: React.ReactNode; 
  }) => (
    <View style={[styles.sectionCard, isDark && styles.darkCard]}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection(id)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
            <Ionicons name={icon} size={24} color="#007AFF" />
          </View>
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>{title}</Text>
            <Text style={[styles.sectionSubtitle, isDark && styles.darkTextSecondary]}>{subtitle}</Text>
          </View>
        </View>
        <Ionicons 
          name={expandedSection === id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={isDark ? "#777" : "#999"} 
        />
      </TouchableOpacity>
      
      {expandedSection === id && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );

  const FormulaBox = ({ title, formula, description }: { title: string; formula: string; description: string }) => (
    <View style={[styles.formulaBox, isDark && styles.darkFormulaBox]}>
      <Text style={[styles.formulaTitle, isDark && styles.darkText]}>{title}</Text>
      <Text style={[styles.formulaText, isDark && styles.darkTextSecondary]}>{formula}</Text>
      <Text style={[styles.formulaDescription, isDark && styles.darkTextSecondary]}>{description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>{t('calculationScience.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Введение */}
        <View style={[styles.introSection, isDark && styles.darkCard]}>
          <Text style={[styles.introTitle, isDark && styles.darkText]}>
            {t('calculationScience.introTitle')}
          </Text>
          <Text style={[styles.introText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.introText')}
          </Text>
        </View>

        {/* Базовые расчеты */}
        <SectionCard
          id="basics"
          icon="calculator-outline"
          title={t('calculationScience.sections.basics.title')}
          subtitle={t('calculationScience.sections.basics.subtitle')}
        >
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.basics.bmrExplanation')}
          </Text>
          
          <FormulaBox
            title={t('calculationScience.sections.basics.formulaTitle')}
            formula={`${t('calculationScience.sections.basics.formulaMale')}
${t('calculationScience.sections.basics.formulaFemale')}`}
            description={t('calculationScience.sections.basics.formulaDescription')}
          />
          
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.basics.tdeeExplanation')}
          </Text>
          
          <View style={[styles.activityTable, isDark && styles.darkFormulaBox]}>
            <Text style={[styles.tableTitle, isDark && styles.darkText]}>{t('calculationScience.sections.basics.activityCoefficients')}</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.basics.sedentary')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>×1.2</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.basics.lightActivity')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>×1.375</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.basics.moderateActivity')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>×1.55</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.basics.highActivity')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>×1.725</Text>
            </View>
          </View>
        </SectionCard>

        {/* Персонализация */}
        <SectionCard
          id="personalization"
          icon="person-outline"
          title={t('calculationScience.sections.personalization.title')}
          subtitle={t('calculationScience.sections.personalization.subtitle')}
        >
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.personalization.explanation')}
          </Text>
          
          <View style={[styles.factorsList, isDark && styles.darkFormulaBox]}>
            <View style={styles.factorItem}>
              <Ionicons name="medical-outline" size={16} color="#007AFF" />
              <Text style={[styles.factorText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.personalization.medicalConditions')}</Text>
              </Text>
            </View>
            <View style={styles.factorItem}>
              <Ionicons name="heart-outline" size={16} color="#007AFF" />
              <Text style={[styles.factorText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.personalization.lifestyle')}</Text>
              </Text>
            </View>
            <View style={styles.factorItem}>
              <Ionicons name="restaurant-outline" size={16} color="#007AFF" />
              <Text style={[styles.factorText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.personalization.nutrition')}</Text>
              </Text>
            </View>
            <View style={styles.factorItem}>
              <Ionicons name="fitness-outline" size={16} color="#007AFF" />
              <Text style={[styles.factorText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.personalization.activity')}</Text>
              </Text>
            </View>
          </View>
          
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.personalization.example')}
          </Text>
        </SectionCard>

        {/* Макронутриенты */}
        <SectionCard
          id="macros"
          icon="pie-chart-outline"
          title={t('calculationScience.sections.macros.title')}
          subtitle={t('calculationScience.sections.macros.subtitle')}
        >
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.macros.qualityMatters')}
          </Text>
          
          <FormulaBox
            title={t('calculationScience.sections.macros.thermalEffect')}
            formula={`${t('calculationScience.sections.macros.proteinThermal')}
${t('calculationScience.sections.macros.carbsThermal')}
${t('calculationScience.sections.macros.fatsThermal')}`}
            description={t('calculationScience.sections.macros.proteinBenefit')}
          />
          
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.macros.proteinNeeds')}
          </Text>
          
          <View style={[styles.activityTable, isDark && styles.darkFormulaBox]}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.macros.sedentaryProtein')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>1.0-1.2 г/кг</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.macros.activeProtein')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>1.2-1.6 г/кг</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.macros.weightLossProtein')}</Text>
              <Text style={[styles.tableValue, isDark && styles.darkText]}>1.6-2.2 г/кг</Text>
            </View>
          </View>
        </SectionCard>

        {/* Безопасность */}
        <SectionCard
          id="safety"
          icon="shield-checkmark-outline"
          title={t('calculationScience.sections.safety.title')}
          subtitle={t('calculationScience.sections.safety.subtitle')}
        >
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.safety.noDangerousDiets')}
          </Text>
          
          <View style={[styles.safetyList, isDark && styles.darkFormulaBox]}>
            <View style={styles.safetyItem}>
              <View style={styles.safetyIcon}>
                <Ionicons name="warning-outline" size={16} color="#FF9500" />
              </View>
              <Text style={[styles.safetyText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.safety.minimumThresholds')}</Text>
              </Text>
            </View>
            <View style={styles.safetyItem}>
              <View style={styles.safetyIcon}>
                <Ionicons name="speedometer-outline" size={16} color="#FF9500" />
              </View>
              <Text style={[styles.safetyText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.safety.safePace')}</Text>
              </Text>
            </View>
            <View style={styles.safetyItem}>
              <View style={styles.safetyIcon}>
                <Ionicons name="medical-outline" size={16} color="#FF9500" />
              </View>
              <Text style={[styles.safetyText, isDark && styles.darkTextSecondary]}>
                <Text style={styles.boldText}>{t('calculationScience.sections.safety.medicalLimitations')}</Text>
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Адаптация */}
        <SectionCard
          id="adaptation"
          icon="sync-outline"
          title={t('calculationScience.sections.adaptation.title')}
          subtitle={t('calculationScience.sections.adaptation.subtitle')}
        >
          <Text style={[styles.contentText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.sections.adaptation.uniqueOrganism')}
          </Text>
          
          <View style={[styles.adaptationList, isDark && styles.darkFormulaBox]}>
            <Text style={[styles.adaptationTitle, isDark && styles.darkText]}>{t('calculationScience.sections.adaptation.automaticAdjustment')}</Text>
            <Text style={[styles.adaptationItem, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.adaptation.weightChange')}</Text>
            <Text style={[styles.adaptationItem, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.adaptation.activityChange')}</Text>
            <Text style={[styles.adaptationItem, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.adaptation.plateau')}</Text>
            <Text style={[styles.adaptationItem, isDark && styles.darkTextSecondary]}>{t('calculationScience.sections.adaptation.lifeChanges')}</Text>
          </View>
        </SectionCard>

        {/* Научные источники */}
        <View style={[styles.sourcesSection, isDark && styles.darkCard]}>
          <View style={styles.sourcesHeader}>
            <Ionicons name="library-outline" size={20} color="#007AFF" />
            <Text style={[styles.sourcesTitle, isDark && styles.darkText]}>{t('calculationScience.scientificBasis.title')}</Text>
          </View>
          <Text style={[styles.sourcesText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.scientificBasis.description')}
          </Text>
          <TouchableOpacity 
            style={styles.learnMoreButton}
            onPress={() => Linking.openURL('https://example.com/scientific-sources')}
          >
            <Text style={styles.learnMoreText}>{t('calculationScience.scientificBasis.learnMore')}</Text>
            <Ionicons name="arrow-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Дисклеймер */}
        <View style={[styles.disclaimerSection, isDark && styles.darkDisclaimerSection]}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#FF9500" />
            <Text style={[styles.disclaimerTitle, isDark && styles.darkText]}>{t('calculationScience.disclaimer.title')}</Text>
          </View>
          <Text style={[styles.disclaimerText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.disclaimer.accuracy')}
          </Text>
          <Text style={[styles.disclaimerText, isDark && styles.darkTextSecondary]}>
            {t('calculationScience.disclaimer.consultation')}
          </Text>
        </View>
        
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  darkHeader: {
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#AAAAAA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Введение
  introSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1C1C1E',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  
  // Секции
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  darkIconContainer: {
    backgroundColor: '#003366',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  
  // Контент
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '600',
    color: '#000000',
  },
  
  // Формулы
  formulaBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  darkFormulaBox: {
    backgroundColor: '#2C2C2E',
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  formulaDescription: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  
  // Таблицы
  activityTable: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tableLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  
  // Факторы персонализации
  factorsList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  factorText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  
  // Безопасность
  safetyList: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  safetyIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  safetyText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    lineHeight: 20,
  },
  
  // Адаптация
  adaptationList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  adaptationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  adaptationItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 20,
  },
  
  // Научные источники
  sourcesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  sourcesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  learnMoreText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
  },
  
  // Дисклеймер
  disclaimerSection: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE4B3',
  },
  darkDisclaimerSection: {
    backgroundColor: '#2C1F0F',
    borderColor: '#664D26',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
}); 