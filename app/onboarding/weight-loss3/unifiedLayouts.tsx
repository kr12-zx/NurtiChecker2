import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonFooter from './components/ButtonFooter';
import {
    useContainerStyles,
    useOptionsStyles,
    usePalette,
    useTypographyStyles
} from './unifiedStyles';

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
  const containers = useContainerStyles();
  const typography = useTypographyStyles();
  
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
  const containers = useContainerStyles();
  
  return (
    <View style={containers.optionsList}>
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
  const optionsStyles = useOptionsStyles();
  const typography = useTypographyStyles();

  return (
    <TouchableOpacity
      style={[
        optionsStyles.optionContainer,
        isSelected ? optionsStyles.selectedOption : optionsStyles.unselectedOption
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {renderIcon ? (
        renderIcon(option, isSelected)
      ) : option.icon ? (
        <View style={optionsStyles.optionIconContainer}>
          <Ionicons
            name={option.icon as any}
            size={24}
            color={isSelected ? palette.primary : palette.text.secondary}
          />
        </View>
      ) : null}
      
      <View style={optionsStyles.optionTextContainer}>
        <Text style={typography.optionTitle}>
          {option.label}
        </Text>
        {option.description && (
          <Text style={typography.optionDescription}>
            {option.description}
          </Text>
        )}
      </View>
      
      <View style={[
        optionsStyles.checkIconContainer,
        isSelected ? optionsStyles.selectedCheckIconContainer : optionsStyles.unselectedCheckIconContainer
      ]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={palette.text.white} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// Все стили перенесены в unifiedStyles.ts для централизованного управления

