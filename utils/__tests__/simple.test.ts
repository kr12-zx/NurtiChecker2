// Простой тест для проверки настройки Jest
describe('Basic Math Operations', () => {
  test('addition works correctly', () => {
    expect(2 + 2).toBe(4);
  });

  test('multiplication works correctly', () => {
    expect(3 * 4).toBe(12);
  });

  test('string concatenation works', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
  });
});

// Тест для работы с датами
describe('Date Operations', () => {
  test('date creation works', () => {
    const date = new Date('2024-12-25T12:00:00.000Z'); // Указываем UTC время
    expect(date.getUTCFullYear()).toBe(2024);
    expect(date.getUTCMonth()).toBe(11); // Декабрь = 11
    expect(date.getUTCDate()).toBe(25);
  });

  test('date formatting works', () => {
    const date = new Date(2024, 11, 25); // Используем конструктор с числами
    const formatted = `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    expect(formatted).toBe('25.12.2024');
  });
});

// Тест для проверки JSON операций
describe('JSON Operations', () => {
  test('JSON parsing works', () => {
    const jsonString = '{"calories": 150, "protein": 20}';
    const parsed = JSON.parse(jsonString);
    expect(parsed.calories).toBe(150);
    expect(parsed.protein).toBe(20);
  });

  test('JSON stringifying works', () => {
    const obj = { name: 'Apple', calories: 52 };
    const jsonString = JSON.stringify(obj);
    expect(jsonString).toBe('{"name":"Apple","calories":52}');
  });
}); 