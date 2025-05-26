# Документация по реализации работы камеры в AllerScan

## 1. Обзор

В приложении AllerScan реализована функциональность камеры для сканирования продуктов с целью анализа их состава и выявления потенциальных аллергенов. Основной поток работы с камерой включает в себя: получение разрешения на использование камеры, захват изображения, обработку и преобразование изображения, загрузку на сервер и анализ полученного изображения.

## 2. Технические компоненты

Реализация камеры основана на следующих технологиях и библиотеках:

- **expo-camera**: Основная библиотека для работы с камерой
- **expo-image-picker**: Библиотека для выбора изображений из галереи
- **@bam.tech/react-native-image-resizer**: Инструмент для изменения размера изображений
- **@react-native-firebase/storage**: Сервис для загрузки и хранения изображений
- **Firebase Functions**: Облачные функции для обработки изображений (создание миниатюр)

## 3. Структура реализации

### 3.1. Настройка разрешений

Разрешения для камеры и галереи настроены в конфигурационных файлах:

- `app.config.js`: Содержит плагины для expo-camera и expo-image-picker с настройками текстов разрешений
- `Info.plist`: Содержит соответствующие ключи для iOS (NSCameraUsageDescription, NSPhotoLibraryUsageDescription)

### 3.2. Компонент экрана сканирования (app/(tabs)/scan.tsx)

Основной файл, отвечающий за функциональность камеры, содержит:

#### 3.2.1. Состояния камеры

```typescript
const [hasPermission, setHasPermission] = useState<boolean | null>(null);
const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
const [isCameraReady, setIsCameraReady] = useState(false);
```

#### 3.2.2. Запрос разрешений

```typescript
useEffect(() => {
  (async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  })();
}, []);
```

#### 3.2.3. Компонент камеры

```typescript
<CameraView
  ref={cameraRef}
  style={styles.camera}
  facing={cameraType}
  flash={flashMode}
  onCameraReady={() => setIsCameraReady(true)}
  ratio="4:3"
>
  {/* Содержимое компонента камеры */}
</CameraView>
```

#### 3.2.4. Захват изображения

```typescript
const takePicture = async () => {
  if (!cameraRef.current || !isCameraReady) {
    return;
  }
  
  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      skipProcessing: Platform.OS === 'android', 
    });
    
    if (!photo || !photo.uri) {
      throw new Error('Failed to take photo');
    }
    
    setCapturedImage(photo.uri);
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert(translate('common.error'), translate('scanScreen.errorTakePhoto'));
  }
};
```

### 3.3. Обработка и анализ изображения

#### 3.3.1. Изменение размера изображения перед загрузкой

```typescript
const resizedImage = await ImageResizer.createResizedImage(
  capturedImage,
  1300,
  1300,
  'JPEG',
  80,
  0,
  undefined,
  false,
  { mode: 'contain', onlyScaleDown: true }
);
```

#### 3.3.2. Загрузка изображения в Firebase Storage

```typescript
const imageUrl = await uploadImage(resizedImage.uri, (progress) => {
  setUploadProgress(progress);
});
```

#### 3.3.3. Процесс загрузки в Firebase

Функция `uploadImage` в `utils/firebase/storage.ts`:

```typescript
export const uploadImage = async (
  uri: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Генерация уникального имени файла
  const filename = `product_${Date.now()}`;
  const reference = firebaseStorage.ref(`products/${filename}`);
  
  // Загрузка файла с отслеживанием прогресса
  const uploadTask = reference.putFile(uri);
  
  // Обработчик прогресса
  if (onProgress) {
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        onProgress(progress);
      }
    );
  }
  
  // Ждем завершения загрузки
  await uploadTask;
  
  // Получение URL загруженного изображения
  const downloadURL = await reference.getDownloadURL();
  
  return downloadURL;
};
```

#### 3.3.4. Создание миниатюр изображений

После загрузки изображения в Firebase Storage, облачная функция автоматически создает миниатюру изображения:

```typescript
// Облачная функция в functions/src/index.ts
export const generateImageThumbnail = onObjectFinalized({
  region: "europe-west1", // Регион функции
  memory: "1GiB", // Выделенная память
  timeoutSeconds: 300, // Таймаут выполнения
}, async (event: StorageObjectData) => {
  // Логика создания миниатюры с использованием библиотеки sharp
  await sharp(tempFilePath)
    .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, {fit: "inside"})
    .toFile(tempThumbPath);
  
  // Загрузка миниатюры в Storage
  await bucket.upload(tempThumbPath, {
    destination: thumbFilePathStorage,
    metadata: metadata,
  });
});
```

### 3.4. Анализ изображения продукта

#### 3.4.1. Отправка на анализ

После успешной загрузки изображения, URL передается в функцию анализа:

```typescript
const result = await analyzeProductImage(imageUrl);
```

#### 3.4.2. Функция анализа продукта

В `utils/services/allergenAnalysisService.ts`:

```typescript
export const analyzeProductImage = async (imageUrl: string): Promise<ScanResult | null> => {
  try {
    // Получаем аллергены пользователя
    const allUserAllergens = await getAllergens();
    
    // Подготавливаем параметры для API
    const selectedDefaultIds = allUserAllergens
      .filter(allergen => !allergen.isCustom && allergen.selected)
      .map(allergen => allergen.id)
      .join(',');
      
    const customAllergens = allUserAllergens
      .filter(allergen => allergen.isCustom)
      .map(({ id, name }) => ({ id, name }));
      
    // Кодируем параметры для URL
    const customAllergensString = encodeURIComponent(JSON.stringify(customAllergens));
    
    // Создаем URL с параметрами
    const url = new URL(N8N_WEBHOOK_URL);
    url.searchParams.append('imageUrl', imageUrl);
    url.searchParams.append('selectedAllergenIds', selectedDefaultIds);
    url.searchParams.append('customAllergens', customAllergensString);
    url.searchParams.append('language', i18n.locale);
    
    // Отправляем запрос и получаем результат
    const response = await fetch(url.toString());
    const data = await response.json();
    
    // Обрабатываем результат
    const scanResult = parseResponseData(data);
    
    // Сохраняем в историю
    await saveScanToHistory(scanResult);
    
    return scanResult;
  } catch (error) {
    console.error('Ошибка при анализе продукта:', error);
    return null;
  }
};
```

## 4. Пользовательский интерфейс камеры

### 4.1. Основные элементы управления

- **Переключение камеры**: Функция `toggleCameraType` меняет камеру между передней и задней
- **Управление вспышкой**: Функция `toggleFlash` циклически переключает режимы вспышки (on/off/auto)
- **Кнопка съемки**: Большая белая кнопка в нижней части экрана для захвата изображения
- **Выбор из галереи**: Позволяет пользователю выбрать изображение из галереи вместо съёмки

### 4.2. Сетка наведения

На экране камеры отображается сетка для удобства кадрирования:

```typescript
<Animated.View 
  style={[
    styles.gridOverlay,
    { opacity: animatedOpacity }
  ]}
>
  <View style={styles.gridRow}>
    <View style={styles.gridCell} />
    <View style={styles.gridCell} />
    <View style={styles.gridCell} />
  </View>
  {/* ... еще 2 ряда ... */}
</Animated.View>
```

### 4.3. Инструкции для пользователя

Отображается подсказка о том, как правильно использовать камеру для сканирования:

```typescript
<View style={styles.scanInstructions}>
  <Text style={/* стили */}>
    {translate('scanScreen.instruction')}
  </Text>
</View>
```

## 5. Процесс обработки результатов

После успешного анализа изображения, результаты отображаются на экране результатов:

```typescript
router.push({
  pathname: '/scan-result',
  params: {
    scanId: result.id,
    imageUrl: result.imageUrl
  }
});
```

## 6. Ограничения и особенности

- **Лимит сканирований**: В приложении реализована система ограничения количества сканирований для пользователей без премиум-подписки
- **Проверка премиум-статуса**: Функция `checkPremiumStatus` проверяет наличие премиум-подписки
- **Оптимизация изображений**: Перед загрузкой изображения уменьшаются для экономии трафика и ускорения анализа
- **Локализация**: Все тексты поддерживают многоязычность через систему локализации

## 7. Обработка ошибок

Реализована система обработки различных ошибок:
- Отсутствие разрешений на использование камеры
- Ошибки при захвате изображения
- Ошибки при изменении размера изображения
- Ошибки при загрузке и анализе изображения

## 8. Заключение

Реализация работы камеры в приложении AllerScan представляет собой комплексное решение, включающее взаимодействие с аппаратной частью устройства, обработку изображений и интеграцию с облачными сервисами для анализа продуктов. Система построена с учетом оптимизации использования ресурсов и предоставления удобного пользовательского интерфейса. 