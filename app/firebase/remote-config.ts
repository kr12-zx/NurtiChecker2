import { firebaseRemoteConfig } from './config';

/**
 * u041fu043eu043bu0443u0447u0430u0435u0442 u0441u0442u0440u043eu043au043eu0432u043eu0435 u0437u043du0430u0447u0435u043du0438u0435 u0438u0437 Remote Config
 * @param key u041au043bu044eu0447 u043fu0430u0440u0430u043cu0435u0442u0440u0430
 * @param defaultValue u0417u043du0430u0447u0435u043du0438u0435 u043fu043e u0443u043cu043eu043bu0447u0430u043du0438u044e
 * @returns u0417u043du0430u0447u0435u043du0438u0435 u043fu0430u0440u0430u043cu0435u0442u0440u0430
 */
export const getStringValue = (key: string, defaultValue: string = ''): string => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return defaultValue;
    }

    return firebaseRemoteConfig.getValue(key).asString() || defaultValue;
  } catch (error) {
    console.error(`u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0437u043du0430u0447u0435u043du0438u044f ${key}:`, error);
    return defaultValue;
  }
};

/**
 * u041fu043eu043bu0443u0447u0430u0435u0442 u0431u0443u043bu0435u0432u043e u0437u043du0430u0447u0435u043du0438u0435 u0438u0437 Remote Config
 * @param key u041au043bu044eu0447 u043fu0430u0440u0430u043cu0435u0442u0440u0430
 * @param defaultValue u0417u043du0430u0447u0435u043du0438u0435 u043fu043e u0443u043cu043eu043bu0447u0430u043du0438u044e
 * @returns u0417u043du0430u0447u0435u043du0438u0435 u043fu0430u0440u0430u043cu0435u0442u0440u0430
 */
export const getBooleanValue = (key: string, defaultValue: boolean = false): boolean => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return defaultValue;
    }

    return firebaseRemoteConfig.getValue(key).asBoolean() || defaultValue;
  } catch (error) {
    console.error(`u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0437u043du0430u0447u0435u043du0438u044f ${key}:`, error);
    return defaultValue;
  }
};

/**
 * u041fu043eu043bu0443u0447u0430u0435u0442 u0447u0438u0441u043bu043eu0432u043eu0435 u0437u043du0430u0447u0435u043du0438u0435 u0438u0437 Remote Config
 * @param key u041au043bu044eu0447 u043fu0430u0440u0430u043cu0435u0442u0440u0430
 * @param defaultValue u0417u043du0430u0447u0435u043du0438u0435 u043fu043e u0443u043cu043eu043bu0447u0430u043du0438u044e
 * @returns u0417u043du0430u0447u0435u043du0438u0435 u043fu0430u0440u0430u043cu0435u0442u0440u0430
 */
export const getNumberValue = (key: string, defaultValue: number = 0): number => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return defaultValue;
    }

    return firebaseRemoteConfig.getValue(key).asNumber() || defaultValue;
  } catch (error) {
    console.error(`u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0437u043du0430u0447u0435u043du0438u044u ${key}:`, error);
    return defaultValue;
  }
};

/**
 * u041eu0431u043du043eu0432u043bu044fu0435u0442 u0437u043du0430u0447u0435u043du0438u044u Remote Config с принудительной очисткой кэша
 * @returns true, u0435u0441u043bu0438 u043eu0431u043du043eu0432u043bu0435u043du0438u0435 u043fu0440u043eu0448u043bu043e u0443u0441u043fu0435u0448u043du043e
 */
export const refreshRemoteConfig = async (): Promise<boolean> => {
  try {
    if (!firebaseRemoteConfig) {
      console.error('Remote Config не инициализирован');
      return false;
    }

    // Устанавливаем минимальный интервал получения на 0
    await firebaseRemoteConfig.setConfigSettings({
      minimumFetchIntervalMillis: 0, // Получать обновления каждый раз
    });

    // Принудительно очищаем кэш для тестирования
    try {
      console.log('⚙️ Очистка кэша Remote Config...');
      // Сначала получаем новые данные с сервера
      await firebaseRemoteConfig.fetch(0);
      console.log('⚙️ Успешно загружены новые данные с сервера');
    } catch (fetchError) {
      console.error('Ошибка при загрузке новых данных:', fetchError);
    }

    // Активируем новые значения (даже если они кэшированы)
    const fetchedRemotely = await firebaseRemoteConfig.fetchAndActivate();
    
    // Показываем текущие значения для отладки
    const versionValue = firebaseRemoteConfig.getValue('onboarding_version').asString();
    console.log('⚙️ Текущее значение onboarding_version:', versionValue);
    
    console.log(
      fetchedRemotely
        ? '✅ Получены новые значения из Remote Config'
        : '⚠️ Используются кэшированные значения Remote Config'
    );

    return true;
  } catch (error) {
    console.error('Ошибка при обновлении Remote Config:', error);
    return false;
  }
};
