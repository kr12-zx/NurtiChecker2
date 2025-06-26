/**
 * Утилиты для работы с часовыми поясами пользователя
 */

/**
 * Получить название часового пояса пользователя (например, "Europe/Moscow")
 */
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Не удалось определить timezone:', error);
    return 'Europe/Moscow';
  }
};

/**
 * Получить смещение часового пояса в минутах (например, -180 для GMT+3)
 * Отрицательное значение означает восточнее UTC
 */
export const getTimezoneOffset = (): number => {
  try {
    return new Date().getTimezoneOffset();
  } catch (error) {
    console.warn('Не удалось определить timezone offset:', error);
    return -180;
  }
};

/**
 * Получить полную информацию о часовом поясе пользователя
 */
export const getTimezoneInfo = () => {
  return {
    timezone: getUserTimezone(),
    timezoneOffset: getTimezoneOffset(),
    currentTime: new Date().toISOString(),
  };
};

/**
 * Конвертировать offset в читаемый формат (например, "+03:00")
 */
export const formatTimezoneOffset = (offset: number): string => {
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-'; // Инвертируем знак (getTimezoneOffset возвращает обратное)
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Логирование информации о timezone для отладки
 */
export const logTimezoneInfo = () => {
  const info = getTimezoneInfo();
  console.log('🕒 Timezone Info:', {
    timezone: info.timezone,
    offset: info.timezoneOffset,
    formatted: formatTimezoneOffset(info.timezoneOffset),
    currentTime: info.currentTime,
    localTime: new Date().toLocaleString(),
  });
  return info;
}; 