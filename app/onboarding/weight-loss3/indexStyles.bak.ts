import { StyleSheet } from 'react-native';
import { palette } from './unifiedStyles';

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: palette.border.inactive,
    position: 'absolute',
    top: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: palette.primary,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.border.inactive,
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: palette.primary,
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
});
