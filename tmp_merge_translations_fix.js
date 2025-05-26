// Проверяем существование nodeов с данными
const prepTranslationExists = $node["Prepare Translation"] !== undefined && 
  Object.keys($node["Prepare Translation"]).length > 0;

const codeNodeExists = $node["Code"] !== undefined && 
  Object.keys($node["Code"]).length > 0;

// Получаем переведенные данные
const translationNode = $input.item ? $input.item : {};
const originalData = prepTranslationExists ? $node["Prepare Translation"].json : { originalResult: "{}" };

// Это критическое место - нужно проверять наличие данных из Code node
const codeData = codeNodeExists ? $node["Code"].json : {};

// Тут идёт при наличии информации из Prepare Translation
const originalResult = originalData.originalResult ? JSON.parse(originalData.originalResult) : {};

// Безопасная функция для слияния JSON
function safeJsonMerge(obj1, obj2) {
  try {
    return { ...obj1, ...obj2 };
  } catch (e) {
    return obj1;
  }
}

// Формируем итоговый результат, используя данные из Code node только если они существуют
let mergedResult;
if (codeNodeExists && codeData.allergenAnalysis) {
  // Если у нас есть данные об аллергенах из Code node, используем их
  mergedResult = safeJsonMerge(originalResult, codeData);
} else {
  // Если нет данных из Code node, используем только данные из Prepare Translation
  mergedResult = originalResult;
}

// Возвращаем итоговый результат
return {
  json: mergedResult
};
