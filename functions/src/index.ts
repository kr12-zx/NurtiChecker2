/* eslint-disable max-len */
/**
 * Cloud Functions для проекта NutriChecker
 * Автоматическое создание миниатюр для загруженных изображений
 */

import * as admin from "firebase-admin";
import {Storage} from "@google-cloud/storage";
// Альтернативный импорт, если возникает ошибка:
// const {Storage} = require('@google-cloud/storage');
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";
import {onObjectFinalized, StorageObjectData} from "firebase-functions/v2/storage";

admin.initializeApp();
const storage = new Storage();

// Параметры для миниатюр
const THUMB_MAX_WIDTH = 200;
const THUMB_MAX_HEIGHT = 200;
const THUMB_PREFIX = "thumbnails/"; // Папка для миниатюр

/**
 * Функция создания миниатюр при загрузке новых изображений
 * Срабатывает автоматически при добавлении файла в Firebase Storage
 */
export const generateThumbnail = onObjectFinalized({
  region: "europe-west1", // Укажите ближайший к вам регион для оптимальной производительности
  // В платном плане можно настроить память: memory: "1GiB",
  eventType: "google.storage.object.finalize",
}, async (event) => {
  const object: StorageObjectData = event.data;

  const filePath = object.name;
  const contentType = object.contentType;
  const bucketName = object.bucket;

  if (!filePath) {
    console.log("Отсутствует путь к файлу.");
    return null;
  }

  // Выходим, если это не изображение
  if (!contentType?.startsWith("image/")) {
    console.log(
      `Это не изображение. (${contentType}) Путь: ${filePath}`,
    );
    return null;
  }

  // Выходим, если это уже миниатюра
  if (filePath.startsWith(THUMB_PREFIX)) {
    console.log(`Это уже миниатюра. Путь: ${filePath}`);
    return null;
  }

  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);

  const bucket = storage.bucket(bucketName);
  // Временный путь для скачанного оригинала
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: contentType,
    metadata: {
      ...object.metadata || {},
      generatedByFunction: true,
    },
  };

  let tempThumbPath = "";

  try {
    await bucket.file(filePath).download({destination: tempFilePath});
    console.log("Изображение загружено локально в", tempFilePath);

    // Генерируем путь для миниатюры
    const thumbFileName = `${fileName}`;
    const thumbFilePathStorage = path.join(
      THUMB_PREFIX,
      fileDir,
      thumbFileName,
    );
    // Временный путь для созданной миниатюры
    tempThumbPath = path.join(os.tmpdir(), `thumb_${fileName}`);

    // Создаем миниатюру с помощью sharp
    await sharp(tempFilePath)
      .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, {fit: "inside"})
      .toFile(tempThumbPath);
    console.log("Миниатюра создана в", tempThumbPath);

    // Загружаем миниатюру в Firebase Storage
    await bucket.upload(tempThumbPath, {
      destination: thumbFilePathStorage,
      metadata: metadata,
    });
    console.log("Миниатюра загружена в", thumbFilePathStorage);

    // Очистка временных файлов
    fs.unlinkSync(tempFilePath);
    console.log("Удален временный оригинал:", tempFilePath);
    fs.unlinkSync(tempThumbPath);
    console.log("Удалена временная миниатюра:", tempThumbPath);

    return console.log("Миниатюра успешно создана.");
  } catch (error) {
    console.error("Ошибка при создании миниатюры:", error);
    
    // Очистка при ошибке
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log("Удален временный оригинал при ошибке:", tempFilePath);
      }
      if (tempThumbPath && fs.existsSync(tempThumbPath)) {
        fs.unlinkSync(tempThumbPath);
        console.log("Удалена временная миниатюра при ошибке:", tempThumbPath);
      }
    } catch (cleanupError) {
      console.error("Ошибка при очистке временных файлов:", cleanupError);
    }
    
    return null;
  }
});
