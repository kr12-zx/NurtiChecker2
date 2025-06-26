// Обработка данных из webhook_events
console.log('=== ОБРАБОТКА WEBHOOK EVENTS ===');

// Получаем данные из предыдущей ноды Get webhook_events
const webhookEventsData = $input.all();
console.log('Получено записей webhook_events:', webhookEventsData.length);
console.log('Первая запись:', JSON.stringify(webhookEventsData[0], null, 2));

if (webhookEventsData.length === 0) {
  console.error('❌ Нет данных из webhook_events');
  return [{
    json: {
      error: 'No webhook_events data found',
      user: {},
      profile: {},
      settings: {},
      event: {}
    }
  }];
}

// Извлекаем первую запись
const webhookRecord = webhookEventsData[0];
console.log('Webhook record keys:', Object.keys(webhookRecord));

// Проверяем разные возможные структуры данных
let payloadString = null;
if (webhookRecord.payload) {
  payloadString = webhookRecord.payload;
  console.log('✅ Найден payload напрямую');
} else if (webhookRecord.json && webhookRecord.json.payload) {
  payloadString = webhookRecord.json.payload;
  console.log('✅ Найден payload в json');
} else {
  console.error('❌ Нет payload в webhook_events');
  console.error('Webhook record:', JSON.stringify(webhookRecord, null, 2));
  return [{
    json: {
      error: 'No payload in webhook_events',
      user: {},
      profile: {},
      settings: {},
      event: {}
    }
  }];
}

console.log('Payload type:', typeof payloadString);
console.log('Payload length:', payloadString ? payloadString.length : 0);

// Парсим JSON payload
let parsedData = {};
try {
  parsedData = JSON.parse(payloadString);
  console.log('✅ Payload успешно распарсен');
  console.log('Parsed data keys:', Object.keys(parsedData));
} catch (error) {
  console.error('❌ Ошибка парсинга payload:', error.message);
  console.error('Payload string:', payloadString);
  return [{
    json: {
      error: 'Failed to parse payload JSON: ' + error.message,
      user: {},
      profile: {},
      settings: {},
      event: {}
    }
  }];
}

// Извлекаем основные секции
const user = parsedData.user || {};
const profile = parsedData.profile || {};
const settings = parsedData.settings || {};
const event = parsedData.event || {};
const analytics = parsedData.analytics || {};

console.log('User data:', user);
console.log('Profile keys:', Object.keys(profile));
console.log('Settings:', settings);
console.log('Event:', event);

// Функция для расчета возраста
const calculateAge = (birthday) => {
  if (!birthday) {
    console.log('⚠️ Дата рождения не указана');
    return null;
  }
  
  try {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    console.log(`Рассчитан возраст: ${age} лет (дата рождения: ${birthday})`);
    return age > 0 ? age : null;
  } catch (error) {
    console.error('Ошибка расчета возраста:', error.message);
    return null;
  }
};

// Рассчитываем возраст
const calculatedAge = calculateAge(profile.birthday);

// Формируем структурированные данные
const processedData = {
  // Информация о пользователе
  user: {
    emailId: user.emailId || '',
    createdAt: user.createdAt || '',
    age: calculatedAge,
    timezone: user.timezone || null,
    timezoneOffset: user.timezoneOffset || null
  },
  
  // Профиль пользователя
  profile: {
    // Физические параметры
    birthday: profile.birthday || null,
    gender: profile.gender || null,
    height: profile.height || null,
    currentWeight: profile.currentWeight || null,
    goalWeight: profile.goalWeight || null,
    weightLossRate: profile.weightLossRate || null,
    
    // Цели и активность
    primaryGoal: profile.primaryGoal || null,
    activityLevel: profile.activityLevel || null,
    
    // Пищевые предпочтения
    dietPreference: profile.dietPreference || null,
    nutritionFocus: profile.nutritionFocus || null,
    mealFrequency: profile.mealFrequency || null,
    foodPreferences: profile.foodPreferences || null,
    foodVariety: profile.foodVariety || null,
    
    // План похудения
    weightLossPlan: profile.weightLossPlan || null,
    exerciseIntent: profile.exerciseIntent || null,
    showCalorieTutorial: profile.showCalorieTutorial || null,
    useFlexibleCalories: profile.useFlexibleCalories || null,
    intermittentFasting: profile.intermittentFasting || null,
    
    // Психологический профиль
    confidenceLevel: profile.confidenceLevel || null,
    challenges: Array.isArray(profile.challenges) ? profile.challenges : [],
    mainObstacle: profile.mainObstacle || null,
    stressResponse: profile.stressResponse || null,
    adaptability: profile.adaptability || null,
    challengesView: profile.challengesView || null,
    setbacksResponse: profile.setbacksResponse || null,
    decisionMaking: profile.decisionMaking || null,
    difficultSituationsHandling: profile.difficultSituationsHandling || null,
    temptationResponse: profile.temptationResponse || null,
    eatingHabitsAssessment: profile.eatingHabitsAssessment || null
  },
  
  // Настройки единиц измерения
  settings: {
    weightUnit: settings.weightUnit || 'kg',
    heightUnit: settings.heightUnit || 'cm',
    system: settings.system || 'metric'
  },
  
  // Информация о событии
  event: {
    type: event.type || null,
    timestamp: event.timestamp || null,
    step: event.step || null
  },
  
  // Аналитика (если нужна)
  analytics: {
    totalSteps: analytics.totalSteps || 0,
    completedSteps: Array.isArray(analytics.completedSteps) ? analytics.completedSteps : [],
    deviceInfo: analytics.deviceInfo || {}
  }
};

console.log('=== ОБРАБОТАННЫЕ ДАННЫЕ WEBHOOK ===');
console.log('User emailId:', processedData.user.emailId);
console.log('User age:', processedData.user.age);
console.log('Profile gender:', processedData.profile.gender);
console.log('Profile height:', processedData.profile.height);
console.log('Profile currentWeight:', processedData.profile.currentWeight);
console.log('Profile primaryGoal:', processedData.profile.primaryGoal);
console.log('Profile challenges:', processedData.profile.challenges);
console.log('Settings:', processedData.settings);

return [{ json: processedData }]; 