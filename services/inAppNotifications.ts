import { getUserId } from './userService';

// Типы уведомлений
export type NotificationType = 'daily_advice' | 'weekly_summary' | 'vitamin_reminder';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Интерфейс уведомления
export interface InAppNotification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  priority: NotificationPriority;
  data?: any;
  action_url?: string;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

// Базовый URL для Supabase
const SUPABASE_URL = 'https://bespxpyftmnhbynchywl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc3B4cHlmdG1uaGJ5bmNoeXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.YhBJzQJBhYJJzQJBhYJJzQJBhYJJzQJBhYJJzQJBhY';

export class InAppNotificationService {
  
  /**
   * Получить все активные уведомления для текущего пользователя
   */
  static async getNotifications(): Promise<InAppNotification[]> {
    try {
      const userId = await getUserId();
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/active_notifications?user_id=eq.${userId}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const notifications = await response.json();
      return notifications;
    } catch (error) {
      console.error('Ошибка при получении уведомлений:', error);
      return [];
    }
  }

  /**
   * Получить количество непрочитанных уведомлений
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.is_read).length;
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных:', error);
      return 0;
    }
  }

  /**
   * Отметить уведомление как прочитанное
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/in_app_notifications?id=eq.${notificationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_read: true,
            read_at: new Date().toISOString()
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Ошибка при отметке как прочитанное:', error);
      return false;
    }
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const userId = await getUserId();
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/in_app_notifications?user_id=eq.${userId}&is_read=eq.false`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_read: true,
            read_at: new Date().toISOString()
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Ошибка при отметке всех как прочитанные:', error);
      return false;
    }
  }

  /**
   * Архивировать уведомление
   */
  static async archiveNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/in_app_notifications?id=eq.${notificationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_archived: true
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Ошибка при архивировании:', error);
      return false;
    }
  }

  /**
   * Получить уведомления по типу
   */
  static async getNotificationsByType(type: NotificationType): Promise<InAppNotification[]> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => n.notification_type === type);
    } catch (error) {
      console.error('Ошибка при получении уведомлений по типу:', error);
      return [];
    }
  }

  /**
   * Получить последний ежедневный совет
   */
  static async getLatestDailyAdvice(): Promise<InAppNotification | null> {
    try {
      const dailyAdvice = await this.getNotificationsByType('daily_advice');
      return dailyAdvice.length > 0 ? dailyAdvice[0] : null;
    } catch (error) {
      console.error('Ошибка при получении последнего совета:', error);
      return null;
    }
  }

  /**
   * Получить недельную сводку
   */
  static async getWeeklySummary(): Promise<InAppNotification | null> {
    try {
      const weeklySummary = await this.getNotificationsByType('weekly_summary');
      return weeklySummary.length > 0 ? weeklySummary[0] : null;
    } catch (error) {
      console.error('Ошибка при получении недельной сводки:', error);
      return null;
    }
  }

  /**
   * Получить напоминания о витаминах
   */
  static async getVitaminReminders(): Promise<InAppNotification[]> {
    try {
      return await this.getNotificationsByType('vitamin_reminder');
    } catch (error) {
      console.error('Ошибка при получении напоминаний о витаминах:', error);
      return [];
    }
  }
} 