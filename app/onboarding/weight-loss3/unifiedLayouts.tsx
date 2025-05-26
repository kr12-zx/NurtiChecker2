import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonFooter from './components/ButtonFooter';
import { containers, typography, usePalette } from './unifiedStyles';

/**
 * Унифицированный макет для всех экранов онбординга
 * Содержит общую структуру: безопасная область, скроллируемый контент и подвал с кнопками
 */
export const OnboardingLayout: React.FC<{
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onContinue: () => void;
  continueText?: string;
  backText?: string;
  hideBackButton?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
  disableScrollView?: boolean;
  headerIcon?: ReactNode;
}> = ({
  children,
  title,
  subtitle,
  onBack,
  onContinue,
  continueText,
  backText,
  hideBackButton,
  scrollRef,
  disableScrollView,
  headerIcon
}) => {
  const palette = usePalette();
  
  return (
    <SafeAreaView edges={['top']} style={containers.safeArea}>
      <View style={containers.rootContainer}>
        <View style={containers.contentContainer}>
          {disableScrollView ? (
            <View style={containers.nonScrollContent}>
              {headerIcon}
              {title && <Text style={typography.screenTitle}>{title}</Text>}
              {subtitle && <Text style={typography.screenSubtitle}>{subtitle}</Text>}
              
              {children}
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={containers.scrollView}
              contentContainerStyle={containers.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              {headerIcon}
              {title && <Text style={typography.screenTitle}>{title}</Text>}
              {subtitle && <Text style={typography.screenSubtitle}>{subtitle}</Text>}
              
              {children}
            </ScrollView>
          )}
        </View>
        
        <ButtonFooter 
          onBack={hideBackButton ? undefined : onBack}
          onContinue={onContinue} 
          continueText={continueText}
          showSkip={false}
        />
      </View>
    </SafeAreaView>
  );
};

/**
 * Компонент для группы опций выбора, унифицирует отображение списка элементов
 */
export const OptionsGroup: React.FC<{
  options: Array<{
    id: string | number;
    label: string;
    description?: string;
    icon?: string;
  }>;
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
  renderIcon?: (option: any, isSelected: boolean) => React.ReactNode;
}> = ({ options, selectedId, onSelect, renderIcon }) => {
  const palette = usePalette();
  const styles = getStyles(palette);
  
  return (
    <View style={styles.optionsContainer}>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        
        return (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={isSelected}
            onSelect={() => onSelect(option.id)}
            renderIcon={renderIcon}
          />
        );
      })}
    </View>
  );
};

/**
 * Компонент элемента опции с унифицированным стилем
 */
export const OptionItem: React.FC<{
  option: {
    id: string | number;
    label: string;
    description?: string;
    icon?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  renderIcon?: (option: any, isSelected: boolean) => React.ReactNode;
}> = ({ option, isSelected, onSelect, renderIcon }) => {
  const palette = usePalette();
  
  // Используем функцию получения стилей с текущей палитрой
  const styles = getStyles(palette);

  return (
    <TouchableOpacity
      style={[
        styles.optionContainer,
        isSelected ? styles.selectedOption : styles.unselectedOption
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {renderIcon ? (
        renderIcon(option, isSelected)
      ) : option.icon ? (
        <View style={styles.optionIconContainer}>
          <Ionicons
            name={option.icon as any}
            size={24}
            color={isSelected ? palette.primary : palette.text.secondary}
          />
        </View>
      ) : null}
      
      <View style={styles.optionTextContainer}>
        <Text style={styles.optionTitle}>
          {option.label}
        </Text>
        {option.description && (
          <Text style={styles.optionDescription}>
            {option.description}
          </Text>
        )}
      </View>
      
      <View style={[
        styles.checkIconContainer,
        isSelected ? styles.selectedCheckIconContainer : styles.unselectedCheckIconContainer
      ]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={palette.text.white} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Локальные стили, использующие палитру
// Создаем функцию для стилей, использующих палитру
const getStyles = (palette: any) => ({
  optionsContainer: {
    marginTop: 20,
  },
  optionContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectedOption: {
    borderColor: palette.option.selectedBorder,
    backgroundColor: palette.option.selectedBackground,
  },
  unselectedOption: {
    borderColor: palette.option.unselectedBorder,
    backgroundColor: palette.option.unselectedBackground,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.background,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: palette.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: palette.text.secondary,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  selectedCheckIconContainer: {
    backgroundColor: palette.primary,
  },
  unselectedCheckIconContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.border.inactive,
  },
});

// Исправление для недостающего импорта

