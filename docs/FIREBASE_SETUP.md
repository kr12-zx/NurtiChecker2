# Настройка Firebase для iOS в проекте Expo

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект" и следуйте инструкциям
3. Введите название проекта "AllerScan" (или другое по вашему выбору)
4. Настройте Google Analytics для проекта (по желанию)
5. Дождитесь создания проекта

## Шаг 2: Регистрация iOS-приложения в Firebase

1. В Firebase Console перейдите в раздел "Project Overview"
2. Нажмите на иконку iOS (значок Apple), чтобы добавить iOS-приложение
3. Введите Bundle ID вашего приложения (например, `com.allerscan.allergenchecker`)
   - Bundle ID можно найти в файле `app.json` в поле `ios.bundleIdentifier`
   - Если его там нет, добавьте его: `"bundleIdentifier": "com.allerscan.allergenchecker"`
4. Введите название приложения и App Store ID (необязательно)
5. Нажмите "Зарегистрировать приложение"

## Шаг 3: Загрузка и добавление конфигурационного файла

1. Скачайте файл `GoogleService-Info.plist`
2. Для проекта Expo вам нужно добавить этот файл в проект с помощью плагина

## Шаг 4: Настройка Expo для работы с Firebase

1. Установите плагин для работы с конфигурацией Firebase:

```bash
npx expo install @react-native-firebase/app
```

2. Для поддержки iOS, установите пакет для конфигурации:

```bash
npx expo install expo-build-properties
```

3. Добавьте следующую конфигурацию в ваш файл `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

## Шаг 5: Настройка переменных окружения

1. Откройте загруженный файл `GoogleService-Info.plist` и найдите следующие значения:
   - API_KEY
   - AUTH_DOMAIN
   - PROJECT_ID
   - STORAGE_BUCKET
   - MESSAGING_SENDER_ID
   - APP_ID
   - MEASUREMENT_ID

2. Добавьте эти значения в файл `.env` в корне вашего проекта:

```
EXPO_PUBLIC_FIREBASE_API_KEY=ваш_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ваш_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ваш_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ваш_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ваш_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=ваш_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=ваш_measurement_id
```

## Шаг 6: Проверка установки

1. Если вы используете EAS (Expo Application Services), соберите превью:

```bash
eas build --profile preview --platform ios
```

2. Если вы разрабатываете на симуляторе или устройстве:

```bash
npx expo run:ios
```

## Шаг 7: Настройка дополнительных возможностей Firebase

### Аутентификация

1. В Firebase Console перейдите в раздел "Authentication"
2. Нажмите "Начать" и включите нужные методы аутентификации:
   - Email/Password
   - Google
   - Apple
   - Anonymous

### Cloud Storage

1. В Firebase Console перейдите в раздел "Storage"
2. Нажмите "Начать" и настройте правила хранения:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firestore Database

1. В Firebase Console перейдите в раздел "Firestore Database"
2. Нажмите "Создать базу данных" и выберите режим (тестовый или производственный)
3. Настройте правила базы данных:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Дополнительные ресурсы

- [Официальная документация Expo по Firebase](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/) 