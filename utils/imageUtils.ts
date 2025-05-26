/**
 * Утилиты для работы с изображениями
 * Позволяют получать URL миниатюр для оптимизации загрузки интерфейса
 */

/**
 * Генерирует URL для миниатюры изображения на основе оригинального URL из Firebase Storage.
 * Миниатюры хранятся в префиксе 'thumbnails/' с тем же путем, что и оригинал.
 * 
 * @param originalUrl Оригинальный URL изображения из Firebase Storage.
 * @returns URL миниатюры или оригинальный URL в случае ошибки.
 */
export const getThumbnailUrl = (originalUrl: string | null | undefined): string | undefined => {
  if (!originalUrl) {
    return undefined;
  }
  
  try {
    const url = new URL(originalUrl);
    const pathname = decodeURIComponent(url.pathname);

    // Извлекаем имя бакета (между /b/ и /o/)
    const bucketMatch = pathname.match(/\/b\/(.*?)\/o\//);
    const bucketName = bucketMatch?.[1];

    // Извлекаем путь к файлу (после /o/)
    const pathMatch = pathname.match(/\/o\/(.*)/);
    const filePath = pathMatch?.[1];

    if (!bucketName || !filePath) {
      console.log("Не удалось извлечь имя бакета или путь к файлу из URL:", originalUrl);
      return originalUrl; // Возвращаем оригинал, если не смогли распарсить
    }

    // Формируем путь к thumbnail'у
    const thumbPath = `thumbnails/${filePath}`;

    // Формируем новый URL, используя извлеченное имя бакета
    const thumbnailUrl = new URL(
      `${url.origin}/v0/b/${bucketName}/o/${encodeURIComponent(thumbPath)}`
    );

    // Копируем параметры запроса (особенно токен)
    url.searchParams.forEach((value, key) => {
      thumbnailUrl.searchParams.set(key, value);
    });
    
    // Убедимся, что alt=media есть (для прямого доступа к изображению)
    if (!thumbnailUrl.searchParams.has('alt')) {
      thumbnailUrl.searchParams.set('alt', 'media');
    }

    return thumbnailUrl.toString();
  } catch (e) {
    console.log("Ошибка при генерации URL миниатюры:", e);
    return originalUrl; // Возвращаем оригинал при ошибке
  }
};
