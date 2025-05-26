import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
  Platform, // Для потенциальных платформозависимых стилей Picker
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { sharedOnboardingStyles, lightThemeColors, darkThemeColors } from './sharedOnboardingStyles';
import { UserProfile } from '../../types/onboarding';

interface BirthdayScreenProps {
  onContinue: () => void;
  onBack: () => void;
  userProfile: Partial<UserProfile>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const MIN_AGE = 13;
const MAX_AGE = 100;

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const BirthdayScreen: React.FC<BirthdayScreenProps> = ({
  onContinue,
  onBack,
  userProfile,
  updateUserProfile,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkThemeColors : lightThemeColors;

  const initialDate = userProfile.birthday ? new Date(userProfile.birthday) : new Date();
  if (userProfile.birthday && isNaN(initialDate.getTime())) {
    // Fallback if saved birthday is invalid, default to 25 years ago
    initialDate.setFullYear(new Date().getFullYear() - 25);
  }

  const [selectedDay, setSelectedDay] = useState<number>(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.getFullYear());

  const [age, setAge] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - MAX_AGE;
    const endYear = currentYear - MIN_AGE;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();
  }, []);

  const daysInMonth = useMemo(() => {
    // month is 0-indexed for Date, selectedMonth is also 0-indexed
    const numDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    // Adjust day if it's out of bounds for the new month/year
    if (selectedDay > daysInMonth.length) {
      setSelectedDay(daysInMonth.length);
    }
  }, [daysInMonth, selectedDay]);

  useEffect(() => {
    const birthDate = new Date(selectedYear, selectedMonth, selectedDay);
    if (isNaN(birthDate.getTime())) {
      setErrorMessage('Некорректная дата.');
      setAge(null);
      return;
    }

    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);

    if (calculatedAge < MIN_AGE) {
      setErrorMessage(`Вам должно быть не менее ${MIN_AGE} лет.`);
    } else if (calculatedAge > MAX_AGE) {
      setErrorMessage(`Возраст не должен превышать ${MAX_AGE} лет.`);
    } else {
      setErrorMessage('');
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const handleContinue = () => {
    if (!errorMessage && age !== null && age >= MIN_AGE && age <= MAX_AGE) {
      const formattedMonth = (selectedMonth + 1).toString().padStart(2, '0');
      const formattedDay = selectedDay.toString().padStart(2, '0');
      const birthdayString = `${selectedYear}-${formattedMonth}-${formattedDay}`;
      updateUserProfile({ birthday: birthdayString });
      onContinue();
    }
  };

  const pickerItemStyle = {
    color: themeColors.textPrimary,
    // fontSize: Platform.OS === 'android' ? 18 : 20, // Adjust font size if needed
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[sharedOnboardingStyles.contentContainer, { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={sharedOnboardingStyles.headerContainer}>
            <Text style={[sharedOnboardingStyles.titleText, { color: themeColors.textPrimary }]}>
              Когда у вас день рождения?
            </Text>
          </View>

          <View style={styles.pickerRowContainer}>
            <View style={styles.pickerColumn}>
              <Picker
                selectedValue={selectedDay}
                onValueChange={(itemValue: number) => setSelectedDay(itemValue)}
                style={[styles.pickerStyle, { backgroundColor: themeColors.inputBackground }]} // Added background
                itemStyle={pickerItemStyle}
              >
                {daysInMonth.map((d) => (
                  <Picker.Item key={d} label={d.toString()} value={d} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerColumn}>
              <Picker
                selectedValue={selectedMonth} // 0-11
                onValueChange={(itemValue: number) => setSelectedMonth(itemValue)}
                style={[styles.pickerStyle, { backgroundColor: themeColors.inputBackground }]} // Added background
                itemStyle={pickerItemStyle}
              >
                {monthNames.map((name, index) => (
                  <Picker.Item key={index} label={name} value={index} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerColumn}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(itemValue: number) => setSelectedYear(itemValue)}
                style={[styles.pickerStyle, { backgroundColor: themeColors.inputBackground }]} // Added background
                itemStyle={pickerItemStyle}
              >
                {years.map((y) => (
                  <Picker.Item key={y} label={y.toString()} value={y} />
                ))}
              </Picker>
            </View>
          </View>

          {age !== null && (
            <Text style={[styles.ageText, { color: themeColors.textSecondary, marginTop: 20 }]}>
              Ваш возраст: {age} лет
            </Text>
          )}
          {errorMessage ? (
            <Text style={[sharedOnboardingStyles.errorText, { marginTop: 10 }]}>
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={[sharedOnboardingStyles.navButtonContainer, { paddingBottom: 16 }]}>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            sharedOnboardingStyles.navButtonSecondary,
            { backgroundColor: themeColors.navButtonSecondaryBackground, borderColor: themeColors.navButtonSecondaryBorder, marginRight: 8 }
          ]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={[sharedOnboardingStyles.navButtonText, { color: themeColors.navButtonSecondaryText }]}>
            Назад
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            sharedOnboardingStyles.navButton,
            { 
              backgroundColor: !errorMessage && age !== null ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground,
              borderColor: !errorMessage && age !== null ? themeColors.navButtonPrimaryBackground : themeColors.navButtonDisabledBackground
            }
          ]}
          onPress={handleContinue}
          activeOpacity={0.7}
          disabled={!!errorMessage || age === null}
        >
          <Text style={[
            sharedOnboardingStyles.navButtonText, 
            { color: !errorMessage && age !== null ? themeColors.navButtonPrimaryText : themeColors.navButtonDisabledText }
            ]}>
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: -5, // To counteract picker internal padding if any
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5, // Spacing between pickers
    // On iOS, Picker has a default height. On Android, height needs to be set for itemStyle to work well or for the Picker itself.
    // Height can be tricky with Picker. Adjust as needed.
    height: Platform.OS === 'android' ? 50 : 180, // Android pickers often need explicit height for dropdown mode items to show, or use mode="dropdown"
    justifyContent: 'center', // Center picker text if possible
  },
  pickerStyle: {
    width: '100%',
    // height: Platform.OS === 'ios' ? 180 : 50, // For iOS, height controls the wheel size. For Android, it's for the container.
    // backgroundColor: isDark ? darkThemeColors.inputBackground : lightThemeColors.inputBackground, // Example for dynamic background
    borderRadius: 8, // Added border radius
  },
  ageText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default BirthdayScreen;
