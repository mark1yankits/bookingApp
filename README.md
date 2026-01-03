# Booking Platform

Платформа для бронювання житла з можливістю чату, відстеження переглядів та погодою.

## Нові функції

### 🖼️ AWS S3 Зберігання Зображень

Проект підтримує завантаження зображень на AWS S3 замість локального зберігання.

#### Налаштування AWS S3

1. **Створіть AWS аккаунт та S3 bucket**
   - Перейдіть на [AWS Console](https://console.aws.amazon.com/)
   - Створіть S3 bucket
   - Налаштуйте дозволи для public read

2. **Створіть IAM користувача**
   - Перейдіть до IAM -> Users -> Create user
   - Додайте дозволи:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:GetObject",
             "s3:PutObject",
             "s3:DeleteObject"
           ],
           "Resource": "arn:aws:s3:::your-bucket-name/*"
         }
       ]
     }
     ```

3. **Отримайте API ключі**
   - Access Key ID
   - Secret Access Key

4. **Налаштуйте змінні середовища**

   **Для Docker:**
   Створіть `.env` файл в корені проекту:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   OPENWEATHER_API_KEY=your_weather_api_key
   ```

   **Для локальної розробки:**
   Додайте до `server/.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

5. **Перебудуйте контейнери:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### 💬 Чат між гість-власник

- Гості можуть писати власникам оголошень
- Власники можуть відповідати гостям
- Чат працює без необхідності бронювання

### 👁️ Відстеження переглядів

- Лічильник переглядів для кожного оголошення
- Статистика в панелі управління власника

### 🌤️ Погода

- Інтеграція з OpenWeatherMap API
- Показ погоди за країною оголошення
- Демо-режим без API ключа

## Запуск проекту

### Швидкий старт з Docker

```bash
# Клонування та запуск
docker-compose up --build
```

### Локальна розробка

```bash
# Backend
cd server
npm install
npm run prisma:migrate
npm run dev

# Frontend (в новому терміналі)
cd client
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід
- `GET /auth/me` - Поточний користувач

### Properties
- `GET /properties` - Список оголошень
- `GET /properties/:id` - Деталі оголошення
- `POST /properties` - Створити оголошення
- `GET /properties/host/my-properties` - Мої оголошення

### Bookings
- `POST /bookings` - Забронювати
- `GET /bookings/my-bookings` - Мої бронювання
- `GET /bookings/host-bookings` - Бронювання моїх оголошень
- `PATCH /bookings/:id/status` - Змінити статус

### Messages (чат)
- `GET /messages/property/:propertyId` - Повідомлення оголошення
- `POST /messages` - Надіслати повідомлення
- `GET /messages/property/:propertyId/participants` - Учасники чату

### Weather
- `GET /weather/:location` - Погода за локацією

## Тестові користувачі

Після запуску seed будуть створені:
- **Guest:** guest@example.com / password123
- **Host:** host@example.com / password123
- **Admin:** admin@example.com / password123

## Технічний стек

- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React, React Query, Tailwind CSS
- **Зберігання:** AWS S3 / Локальні файли
- **API:** OpenWeatherMap (опціонально)
- **Контейнеризація:** Docker
