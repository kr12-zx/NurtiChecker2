"use strict";
/* eslint-disable max-len */
/**
 * Cloud Functions для проекта NutriChecker
 * Автоматическое создание миниатюр для загруженных изображений
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnail = void 0;
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("@google-cloud/storage");
// Альтернативный импорт, если возникает ошибка:
// const {Storage} = require('@google-cloud/storage');
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const storage_2 = require("firebase-functions/v2/storage");
admin.initializeApp();
const storage = new storage_1.Storage();
// Параметры для миниатюр
const THUMB_MAX_WIDTH = 200;
const THUMB_MAX_HEIGHT = 200;
const THUMB_PREFIX = "thumbnails/"; // Папка для миниатюр
/**
 * Функция создания миниатюр при загрузке новых изображений
 * Срабатывает автоматически при добавлении файла в Firebase Storage
 */
exports.generateThumbnail = (0, storage_2.onObjectFinalized)({
    region: "europe-west1",
    // В платном плане можно настроить память: memory: "1GiB",
    eventType: "google.storage.object.finalize",
}, async (event) => {
    const object = event.data;
    const filePath = object.name;
    const contentType = object.contentType;
    const bucketName = object.bucket;
    if (!filePath) {
        console.log("Отсутствует путь к файлу.");
        return null;
    }
    // Выходим, если это не изображение
    if (!contentType?.startsWith("image/")) {
        console.log(`Это не изображение. (${contentType}) Путь: ${filePath}`);
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
        await bucket.file(filePath).download({ destination: tempFilePath });
        console.log("Изображение загружено локально в", tempFilePath);
        // Генерируем путь для миниатюры
        const thumbFileName = `${fileName}`;
        const thumbFilePathStorage = path.join(THUMB_PREFIX, fileDir, thumbFileName);
        // Временный путь для созданной миниатюры
        tempThumbPath = path.join(os.tmpdir(), `thumb_${fileName}`);
        // Создаем миниатюру с помощью sharp
        await (0, sharp_1.default)(tempFilePath)
            .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, { fit: "inside" })
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
    }
    catch (error) {
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
        }
        catch (cleanupError) {
            console.error("Ошибка при очистке временных файлов:", cleanupError);
        }
        return null;
    }
});
//# sourceMappingURL=index.js.map