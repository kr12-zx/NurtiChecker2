// Обработка данных из profiles
console.log('=== ОБРАБОТКА PROFILES ===');

// Получаем данные из предыдущей ноды Get profiles
const profilesData = $input.all();
console.log('Получено записей profiles:', profilesData.length);

// Инициализируем пустой объект для данных профиля
let processedProfileData = {
  locale: 'en',
  timezone: 'UTC',
  timezone_offset: 0,
  country: 'Unknown',
  mailid: null,
  uuid: null
};

// Если есть данные из profiles, используем их
if (profilesData.length > 0) {
  const profileRecord = profilesData[0];
  console.log('Profile record keys:', Object.keys(profileRecord));
  console.log('Profile data:', profileRecord);
  
  processedProfileData = {
    locale: profileRecord.locale || 'en',
    timezone: profileRecord.timezone || 'UTC',
    timezone_offset: profileRecord.timezone_offset || 0,
    country: profileRecord.country || 'Unknown',
    mailid: profileRecord.mailid || null,
    uuid: profileRecord.uuid || null
  };
  
  console.log('✅ Данные profiles обработаны');
} else {
  console.log('⚠️ Нет данных из profiles, используем значения по умолчанию');
}

console.log('=== ОБРАБОТАННЫЕ ДАННЫЕ PROFILES ===');
console.log('Locale:', processedProfileData.locale);
console.log('Timezone:', processedProfileData.timezone);
console.log('Timezone offset:', processedProfileData.timezone_offset);
console.log('Country:', processedProfileData.country);
console.log('Mail ID:', processedProfileData.mailid);
console.log('UUID:', processedProfileData.uuid);

return [{ json: processedProfileData }]; 