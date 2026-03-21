# mini-rag

Мини-приложение на Next.js с двумя фичами:
- генератор LinkedIn-текста;
- вкладка `Birth Vibes` (дата рождения -> неделя -> top songs + фильм недели -> AI-описание).

Проект показывает простую идею RAG-подхода: добавить подготовленный контекст к запросу в LLM и получить более управляемый ответ.

## Что делает проект

- **LinkedIn Generator**
  - принимает текстовый запрос;
  - отправляет его в `POST /api/search`;
  - получает структурированный JSON-ответ от OpenAI.
- **Birth Vibes**
  - принимает дату рождения;
  - нормализует дату к weekly-ключу;
  - выбирает песню из weekly top-10 c weighted random (по rank);
  - отправляет retrieved-контекст в OpenAI и возвращает вайб-описание в драматичном тоне.

## Технологии

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- OpenAI SDK (`openai`)
- Lucide React (иконки)

## Требования

- Node.js 18.18+ (рекомендуется Node.js 20+)
- npm
- OpenAI API key

## Установка и запуск

1. Установите зависимости:

```bash
npm install
```

2. Создайте файл `.env.local` в корне проекта:

```bash
OPEN_AI_API_KEY=your_openai_api_key
```

3. Запустите dev-сервер:

```bash
npm run dev
```

4. Откройте [http://localhost:3000](http://localhost:3000)

## Доступные скрипты

- `npm run dev` - запуск в режиме разработки (Turbopack)
- `npm run build` - production-сборка
- `npm run start` - запуск production-сборки
- `npm run lint` - запуск линтера
- `npm run data:build` - конвертация `data/raw/*.csv` в `data/*.json` (только записи с `rank = 1`)
- `npm run data:prepare` - weekly-нормализация и подготовка `data/*.json` из `data/raw/*.csv`
- `npm run songs:build` - сборка только `data/songs.json` как weekly top-10

## Структура проекта

- `app/page.tsx` - основной UI (поле ввода, отправка запроса, отображение ответа)
- `app/api/search/route.ts` - серверный роут с вызовом OpenAI
- `app/api/birth-vibes/route.ts` - API для вкладки Birth Vibes
- `components/BirthVibesForm.tsx` - UI формы Birth Vibes
- `lib/findClosestDate.ts` - fallback-поиск ближайшей даты назад
- `lib/normalizeDateToWeek.ts` - нормализация даты пользователя к старту недели
- `lib/getRandomSong.ts` - random/weighted-random выбор песни недели
- `data/raw/*.csv` - исходные CSV-файлы
- `data/songs.json`, `data/movies.json` - отфильтрованные данные для рантайма
- `app/navbar.tsx` - навигационная панель
- `app/globals.css` - глобальные стили

## API (кратко)

### `POST /api/search`

Тело запроса:

```json
{
  "search": "Тема для генерации поста"
}
```

Ожидаемый формат ответа:

```json
{
  "response": {
    "post": "Сгенерированный текст",
    "aboutNataliaki": "Дополнительный блок",
    "title": "Заголовок",
    "hashtags": ["#tag1", "#tag2"]
  }
}
```

### `POST /api/birth-vibes`

Тело запроса:

```json
{
  "date": "2010-07-20"
}
```

Ожидаемый формат ответа:

```json
{
  "song": {
    "title": "Tik Tok",
    "artist": "Kesha"
  },
  "movie": {
    "title": "Inception"
  },
  "text": "..."
}
```

## CSV -> JSON пайплайн

1. Положите сырые CSV:
   - `data/raw/songs.csv` (колонки: `date,rank,song,artist`)
   - `data/raw/movies.csv` (колонки: `date,title,rank`)
2. Запустите:

```bash
npm run data:prepare
```

3. Скрипт оставит:
   - для песен: `rank <= 10` (weekly top-10);
   - для фильмов: `rank = 1`;
   и соберет:
   - `data/songs.json`
   - `data/movies.json`

## Примечания

- Используется переменная окружения `OPEN_AI_API_KEY` (именно в таком формате).
- Для `Birth Vibes` дата сначала нормализуется к неделе, затем ищется совпадение в weekly-датасете.
- Проект подходит как учебный шаблон для экспериментов с RAG-подходом и структурированными ответами LLM.
