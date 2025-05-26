import { create } from 'zustand';
import { Gender, ActivityLevel, DietPreference, MealFrequency, PrimaryGoal, Challenge } from '../types/onboarding';

interface OnboardingState {
  // Основные биометрические данные
  birthday: string | null;
  height: number | null;
  gender: Gender | null;
  currentWeight: number | null;
  goalWeight: number | null;
  
  // Цели и предпочтения
  primaryGoal: PrimaryGoal | null;
  weightLossRate: number | null;
  activityLevel: ActivityLevel | null;
  dietPreference: DietPreference | null;
  mealFrequency: MealFrequency | null;
  challenges: Challenge[] | null;
  
  // Психологический профиль
  stressResponse: string | null;
  confidenceLevel: number | null;
  
  // Метрические настройки
  useMetricSystem: boolean;

  // Методы
  setBirthday: (date: string) => void;
  setHeight: (height: number) => void;
  setGender: (gender: Gender) => void;
  setCurrentWeight: (weight: number) => void;
  setGoalWeight: (weight: number) => void;
  setPrimaryGoal: (goal: PrimaryGoal) => void;
  setWeightLossRate: (rate: number) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  setDietPreference: (diet: DietPreference) => void;
  setMealFrequency: (frequency: MealFrequency) => void;
  setChallenges: (challenges: Challenge[]) => void;
  setStressResponse: (response: string) => void;
  setConfidenceLevel: (level: number) => void;
  setUseMetricSystem: (useMetric: boolean) => void;
  
  // Метод валидации заполнения полей
  validateOnboardingStep: (step: string) => boolean;

  // Сброс данных
  resetOnboardingData: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Инициализация состояния
  birthday: null,
  height: null,
  gender: null,
  currentWeight: null,
  goalWeight: null,
  primaryGoal: null,
  weightLossRate: null,
  activityLevel: null,
  dietPreference: null,
  mealFrequency: null,
  challenges: null,
  stressResponse: null,
  confidenceLevel: null,
  useMetricSystem: true,
  
  // Методы установки значений
  setBirthday: (date) => set({ birthday: date }),
  setHeight: (height) => set({ height }),
  setGender: (gender) => set({ gender }),
  setCurrentWeight: (weight) => set({ currentWeight: weight }),
  setGoalWeight: (weight) => set({ goalWeight: weight }),
  setPrimaryGoal: (goal) => set({ primaryGoal: goal }),
  setWeightLossRate: (rate) => set({ weightLossRate: rate }),
  setActivityLevel: (level) => set({ activityLevel: level }),
  setDietPreference: (diet) => set({ dietPreference: diet }),
  setMealFrequency: (frequency) => set({ mealFrequency: frequency }),
  setChallenges: (challenges) => set({ challenges }),
  setStressResponse: (response) => set({ stressResponse: response }),
  setConfidenceLevel: (level) => set({ confidenceLevel: level }),
  setUseMetricSystem: (useMetric) => set({ useMetricSystem: useMetric }),
  
  // Валидация заполнения полей по имени шага
  validateOnboardingStep: (step) => {
    const state = get();
    
    switch(step) {
      case 'birthday':
        return !!state.birthday;
      case 'height':
        return !!state.height;
      case 'gender':
        return !!state.gender;
      case 'currentWeight':
        return !!state.currentWeight;
      case 'goalWeight':
        return !!state.goalWeight;
      case 'primaryGoal':
        return !!state.primaryGoal;
      case 'weightLossRate':
        return !!state.weightLossRate;
      case 'activityLevel':
        return !!state.activityLevel;
      case 'dietPreference':
        return !!state.dietPreference;
      case 'mealFrequency':
        return !!state.mealFrequency;
      case 'challenges':
        return !!state.challenges && state.challenges.length > 0;
      case 'stressResponse':
        return !!state.stressResponse;
      case 'confidenceLevel':
        return !!state.confidenceLevel;
      default:
        return true;
    }
  },
  
  // Сброс всех данных онбординга
  resetOnboardingData: () => set({
    birthday: null,
    height: null,
    gender: null,
    currentWeight: null,
    goalWeight: null,
    primaryGoal: null,
    weightLossRate: null,
    activityLevel: null,
    dietPreference: null,
    mealFrequency: null,
    challenges: null,
    stressResponse: null,
    confidenceLevel: null,
  }),
}));
