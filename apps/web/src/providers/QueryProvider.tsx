"use client"; // Разрешаем использовать клиентские React-хуки

import { useState } from "react";       // Хук для сохранения состояния
import type { ReactNode } from "react"; // Тип вложенных компонентов
import { QueryClient, QueryClientProvider, } from "@tanstack/react-query"; // Клиент кеша и его Provider

type QueryProviderProps = {
  children: ReactNode; // Страницы и компоненты внутри Provider
};

export function QueryProvider({children,}: QueryProviderProps) { //Тип содержимого страницы
  const [queryClient] = useState(() => new QueryClient()); // Создаём QueryClient один раз

  return ( //Возвращаем JSX. Передаём QueryClient через контекст
    <QueryClientProvider client={queryClient}> 
      {children}
    </QueryClientProvider>
  );//Отображаем вложенные страницы
}