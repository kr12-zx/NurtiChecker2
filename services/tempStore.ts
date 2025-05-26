/**
 * Простое временное хранилище для передачи данных между экранами
 */

type StoreData = {
  [key: string]: any
};

// Используем глобальное состояние для временного хранения данных
const tempStore: StoreData = {};

/**
 * Сохраняет данные во временное хранилище
 */
export const setTempData = (key: string, data: any): void => {
  tempStore[key] = data;
};

/**
 * Получает данные из временного хранилища
 */
export const getTempData = (key: string): any => {
  return tempStore[key];
};

/**
 * Удаляет данные из временного хранилища
 */
export const removeTempData = (key: string): void => {
  delete tempStore[key];
};
