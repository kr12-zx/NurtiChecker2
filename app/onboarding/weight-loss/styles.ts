import { StyleSheet } from 'react-native';

export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  screenContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#007AFF',
  },
  darkActiveIndicator: {
    backgroundColor: '#0A84FF',
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  darkSkipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#000000',
  },
  darkSkipButtonText: {
    color: '#FFFFFF',
  },
});
