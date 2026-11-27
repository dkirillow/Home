import { House } from "lucide-react";            // Иконка дома
import { Button } from "@/components/ui/button"; // Кнопка shadcn

export default function HomePage() { //Временная страница для проверки UI
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"> {/*Flex-колонка на весь экран, центрирование */}
      <House
        size={40}         // Размер иконки
        strokeWidth={1.5} // тонкая обводка
      />

      <h1 className="text-4xl font-bold">  {/*Главный заголовок*/}
        Home            
      </h1>

      <p className="text-center text-home-secondary"> {/*Вторичный текст из дизайн-токена*/}
        Дом, который помнит всё за тебя.
      </p>

      <Button>
        Начать
      </Button> {/*Проверяем компонент shadcn */}
    </main>
  );
}