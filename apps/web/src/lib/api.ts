//общая браузерная функция запросов с обработкой HTTP-ошибок

export async function api<T>(   //Общая асинхронная функция запросов
  path: string,                 // Путь запроса без /api
  options: RequestInit = {},    // Метод, заголовки и тело запроса
): Promise<T> {
  const headers = new Headers(options.headers); // Копируем переданные заголовки

  if (
    typeof options.body === "string" && //Проверяем, является ли тело строкой.
    !headers.has("Content-Type")        //Не перезаписываем явный заголовок
  ) {
    headers.set("Content-Type", "application/json"); // Строковое тело считаем JSON
  }

  const response = await fetch(`/api${path}`, {
    ...options,                 // Сохраняем переданные настройки
    headers,                    // Используем подготовленные заголовки
    credentials: "include",     // Разрешаем браузеру отправлять cookie
  });

  if (!response.ok) {           //Отдельно обрабатываем HTTP-ошибку
    const error = await response.json().catch(() => null); //Пробуем прочитать JSON ошибки

    throw new Error(
      error?.message || `Ошибка запроса: ${response.status}`, //Передаём ошибку вызывающему коду
    );
  }

  if (response.status === 204) {return undefined as T;}      // Ответ 204 не содержит JSON
  
  return response.json();       // Возвращаем успешный JSON
}