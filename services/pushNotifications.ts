import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getUserId } from './userService';

// Настройка поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  type?: string;
  userId?: string;
  adviceId?: string;
  [key: string]: any;
}

export class PushNotificationService {
  private static pushToken: string | null = null;
  private static isInitialized = false;

  /**
   * Инициализация push-уведомлений
   */
  static async initialize(): Promise<boolean> {
    try {
      console.log('🔔 Инициализация push-уведомлений...');

      // Проверяем, что это реальное устройство
      if (!Device.isDevice) {
        console.warn('⚠️ Push-уведомления работают только на реальных устройствах');
        return false;
      }

      // Проверяем платформу
      if (Platform.OS === 'ios') {
        console.log('📱 iOS устройство - проверяем entitlements...');
      }

      // Запрашиваем разрешения
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('🔐 Текущий статус разрешений:', existingStatus);

      if (existingStatus !== 'granted') {
        console.log('📝 Запрашиваем разрешения...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('✅ Новый статус разрешений:', status);
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Пользователь отказался от push-уведомлений');
        return false;
      }

      // Получаем push токен с дополнительной обработкой ошибок
      let token;
      try {
        console.log('🎫 Получаем Expo push токен...');
        token = await Notifications.getExpoPushTokenAsync({
          projectId: '1b53789e-f7d8-40d1-a7aa-c65414b28b1d', // Project ID из app.json
        });
        console.log('✅ Push токен получен успешно');
      } catch (tokenError: any) {
        console.error('❌ Ошибка получения push токена:', tokenError);
        
        // Специальная обработка для iOS
        if (Platform.OS === 'ios' && tokenError.message?.includes('aps-environment')) {
          console.error('🍎 iOS ошибка: Проблема с aps-environment entitlement');
          console.error('💡 Решение: Пересоберите приложение с правильными entitlements');
        }
        
        return false;
      }

      this.pushToken = token.data;
      console.log('✅ Push токен сохранен:', token.data.substring(0, 50) + '...');

      // Регистрируем токен на сервере
      await this.registerTokenOnServer(token.data);

      // Настраиваем обработчики уведомлений
      this.setupNotificationHandlers();

      this.isInitialized = true;
      console.log('🎉 Push-уведомления успешно инициализированы');
      return true;

    } catch (error: any) {
      console.error('❌ Ошибка инициализации push-уведомлений:', error);
      
      // Дополнительная информация для отладки
      if (error.message?.includes('aps-environment')) {
        console.error('🔧 Требуется настройка aps-environment в app.json');
      }
      
      console.log('⚠️ Push-уведомления не инициализированы (симулятор или отказ пользователя)');
      return false;
    }
  }

  /**
   * Регистрация токена на сервере
   */
  private static async registerTokenOnServer(pushToken: string): Promise<void> {
    try {
      const userId = await getUserId();
      
      const payload = {
        userId: userId,
        pushToken: pushToken,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osName: Device.osName,
          osVersion: Device.osVersion,
        },
        registeredAt: new Date().toISOString(),
      };

      console.log('📤 Отправка токена на сервер:', { userId, platform: Platform.OS });

      // Отправляем на N8N webhook
      const response = await fetch('https://ttagent.website/webhook/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Push токен успешно зарегистрирован на сервере');
      } else {
        console.error('❌ Ошибка регистрации токена:', response.status);
      }

    } catch (error) {
      console.error('❌ Ошибка отправки токена на сервер:', error);
    }
  }

  /**
   * Настройка обработчиков уведомлений
   */
  private static setupNotificationHandlers(): void {
    // Обработчик получения уведомления (когда приложение открыто)
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Получено уведомление:', notification);
      
      // Можно добавить кастомную логику обработки
      const data = notification.request.content.data as PushNotificationData;
      
      if (data?.type === 'nutrition_advice') {
        console.log('🥗 Получен совет по питанию');
      }
    });

    // Обработчик нажатия на уведомление
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Пользователь нажал на уведомление:', response);
      
      const data = response.notification.request.content.data as PushNotificationData;
      
      // Навигация в зависимости от типа уведомления
      this.handleNotificationPress(data);
    });
  }

  /**
   * Обработка нажатия на уведомление
   */
  private static handleNotificationPress(data: PushNotificationData): void {
    if (!data?.type) return;

    switch (data.type) {
      case 'nutrition_advice':
        // Переход на экран с советами
        console.log('🥗 Переход к советам по питанию');
        // router.push('/nutrition-advice'); // Добавишь позже
        break;
        
      case 'weekly_summary':
        // Переход к недельной сводке
        console.log('📊 Переход к недельной сводке');
        // router.push('/weekly-summary');
        break;
        
      default:
        console.log('📱 Обычное уведомление');
    }
  }

  /**
   * Получить текущий push токен
   */
  static getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Проверить, инициализированы ли уведомления
   */
  static isReady(): boolean {
    return this.isInitialized && this.pushToken !== null;
  }

  /**
   * Отправить тестовое уведомление (для разработки)
   */
  static async sendTestNotification(): Promise<void> {
    if (!this.pushToken) {
      console.warn('⚠️ Push токен не получен');
      return;
    }

    try {
      const userId = await getUserId();
      
      await fetch('https://ttagent.website/webhook/send-test-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          pushToken: this.pushToken,
        }),
      });

      console.log('✅ Тестовое уведомление отправлено');
    } catch (error) {
      console.error('❌ Ошибка отправки тестового уведомления:', error);
    }
  }

  /**
   * Отключить уведомления для пользователя
   */
  static async disableNotifications(): Promise<void> {
    try {
      const userId = await getUserId();
      
      await fetch('https://ttagent.website/webhook/disable-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      console.log('✅ Уведомления отключены');
    } catch (error) {
      console.error('❌ Ошибка отключения уведомлений:', error);
    }
  }
}

// Экспортируем основные функции для удобства
export const initializePushNotifications = () => PushNotificationService.initialize();
export const sendTestNotification = () => PushNotificationService.sendTestNotification();
export const disableNotifications = () => PushNotificationService.disableNotifications();
export const getPushToken = () => PushNotificationService.getPushToken(); 