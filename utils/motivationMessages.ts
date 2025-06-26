
// Типы мотивирующих сообщений
export enum MessageType {
  SUCCESS = 'success',        // ТИП 1 - справился с целью вчера
  EXCEEDED = 'exceeded',      // ТИП 2 - превысил лимит вчера  
  NO_DATA = 'no_data',        // ТИП 3 - нет данных вчера
  FIRST_TIME = 'first_time'   // ТИП 4 - первый запуск
}

/**
 * Получить случайное сообщение по типу с использованием локализации
 */
export const getMotivationMessage = (type: MessageType, t: (key: string) => string): string => {
  switch (type) {
    case MessageType.SUCCESS:
      const successMessages = t('dashboard.motivationMessages.success') as any;
      if (Array.isArray(successMessages)) {
        return successMessages[Math.floor(Math.random() * successMessages.length)];
      }
      return successMessages || "Great job! Keep up the good work! 🔥";
      
    case MessageType.EXCEEDED:
      const exceededMessages = t('dashboard.motivationMessages.exceeded') as any;
      if (Array.isArray(exceededMessages)) {
        return exceededMessages[Math.floor(Math.random() * exceededMessages.length)];
      }
      return exceededMessages || "Good job tracking! Let's get back on track today! 💙";
      
    case MessageType.NO_DATA:
      const noDataMessages = t('dashboard.motivationMessages.noData') as any;
      if (Array.isArray(noDataMessages)) {
        return noDataMessages[Math.floor(Math.random() * noDataMessages.length)];
      }
      return noDataMessages || "Good job coming back! Today is a great day to start tracking! 🌟";
      
    case MessageType.FIRST_TIME:
      return t('dashboard.motivationMessages.firstTime') || "Welcome! Let's begin the journey to healthy habits! 🎯";
      
    default:
      return t('dashboard.motivationMessages.firstTime') || "Welcome! Let's begin the journey to healthy habits! 🎯";
  }
};

/**
 * Определить тип сообщения на основе данных за вчера
 */
export const getMessageType = async (
  isFirstTime: boolean,
  yesterdayCalories: number | null,
  calorieGoal: number
): Promise<MessageType> => {
  console.log('🎯 Определение типа сообщения:', {
    isFirstTime,
    yesterdayCalories,
    calorieGoal
  });

  // Первый запуск приложения
  if (isFirstTime) {
    console.log('✅ Выбран тип: FIRST_TIME (первый запуск)');
    return MessageType.FIRST_TIME;
  }

  // Нет данных за вчера
  if (yesterdayCalories === null || yesterdayCalories === 0) {
    console.log('✅ Выбран тип: NO_DATA (нет данных за вчера)');
    return MessageType.NO_DATA;
  }

  // Превысил лимит калорий
  if (yesterdayCalories > calorieGoal) {
    console.log('✅ Выбран тип: EXCEEDED (превысил лимит)');
    return MessageType.EXCEEDED;
  }

  // Справился с целью (в пределах лимита)
  console.log('✅ Выбран тип: SUCCESS (справился с целью)');
  return MessageType.SUCCESS;
};

/**
 * Получить мотивирующее сообщение для пользователя с локализацией
 */
export const getDailyMotivationMessage = async (
  isFirstTime: boolean,
  yesterdayCalories: number | null,
  calorieGoal: number,
  t: (key: string) => string
): Promise<string> => {
  console.log('🎯 Запрос мотивирующего сообщения с параметрами:', { 
    isFirstTime, 
    yesterdayCalories, 
    calorieGoal 
  });
  
  const messageType = await getMessageType(isFirstTime, yesterdayCalories, calorieGoal);
  const message = getMotivationMessage(messageType, t);
  
  console.log('📢 Итоговое сообщение:', { messageType, message: message.substring(0, 50) + '...' });
  
  return message;
}; 