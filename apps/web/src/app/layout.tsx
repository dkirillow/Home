import type { Metadata } from "next";     //Тип для информации о сайте
import type { ReactNode } from "react";   //Тип для содержимого React-компонентов
import { Inter } from "next/font/google"; //Подключение шрифта Inter
import "./globals.css";                   //Подключение общих стилей
import { QueryProvider } from "@/providers/QueryProvider"; // Общий кеш запросов
import { Toaster } from "sonner"; // Область показа уведомлений

const inter = Inter({                     //Создаём настройку шрифта.
  subsets: ["latin", "cyrillic"],         //Поддержка латиницы и кириллицы.
  variable: "--font-inter",               //Имя CSS-переменной шрифта
});

export const metadata: Metadata = {                 //Метаданные всех страниц
  title: "Home",                                    //Задаём заголовок
  description: "Цифровой помощник для вашего дома", //Задаём описание
};

export default function RootLayout({                //Корневая оболочка; принимает children.
  children,
}: {
  children: ReactNode;                              //Тип содержимого страницы
}) {
  return (                                          //Возвращаем JSX. Язык документа — русский. Применяем CSS-переменную шрифта
    <html lang="ru"> 
      <body className={inter.variable}>
      <QueryProvider>
         {children}
         <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
