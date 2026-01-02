# Інструкція з запуску проекту

## Крок 1: Запустіть Docker Desktop

Переконайтеся, що Docker Desktop запущений на вашому комп'ютері.

## Крок 2: Запустіть всі сервіси

Відкрийте термінал у кореневій директорії проекту (`booking/`) та виконайте:

```bash
docker-compose up --build
```

Ця команда:
- ✅ Створить та запустить PostgreSQL базу даних
- ✅ Збудує та запустить backend сервер
- ✅ Збудує та запустить frontend клієнт
- ✅ Автоматично виконає міграції бази даних
- ✅ Заповнить базу даних тестовими даними (seed)

## Крок 3: Перевірте роботу сервісів

Після успішного запуску ви побачите в логах:
- ✅ "Server is running on port 5000" - бекенд запущений
- ✅ "Seeding database..." - база даних заповнюється
- ✅ "Seed completed successfully!" - seed завершено

## Доступ до сервісів

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Тестові користувачі

Після seed база даних містить:

### Гість (Guest)
- Email: `guest@example.com`
- Password: `password123`

### Власник (Host)
- Email: `host@example.com`
- Password: `password123`

### Адміністратор (Admin)
- Email: `admin@example.com`
- Password: `password123`

## Тестові дані

База даних містить:
- ✅ 3 користувачі (guest, host, admin)
- ✅ 5 об'єктів нерухомості
- ✅ 2 бронювання

## Корисні команди

### Переглянути логи
```bash
docker-compose logs -f
```

### Зупинити всі сервіси
```bash
docker-compose down
```

### Зупинити та видалити всі дані (включаючи базу даних)
```bash
docker-compose down -v
```

### Перезапустити сервіси
```bash
docker-compose restart
```

### Переглянути статус сервісів
```bash
docker-compose ps
```

### Запустити seed вручну (якщо потрібно)
```bash
docker-compose exec server npm run prisma:seed
```

### Відкрити Prisma Studio (GUI для бази даних)
```bash
docker-compose exec server npm run prisma:studio
```
Потім відкрийте http://localhost:5555

## Вирішення проблем

### Помилка підключення до бази даних
Перевірте, чи PostgreSQL контейнер запущений:
```bash
docker-compose ps
```

Якщо контейнер не запущений, перезапустіть:
```bash
docker-compose restart postgres
```

### Помилка міграцій
Якщо міграції не виконалися, запустіть їх вручну:
```bash
docker-compose exec server npx prisma migrate deploy
```

### Очистити та перезапустити все з нуля
```bash
docker-compose down -v
docker-compose up --build
```

## Наступні кроки

1. Відкрийте http://localhost:3000 у браузері
2. Зареєструйтеся або увійдіть з тестовими даними
3. Перегляньте об'єкти нерухомості
4. Створіть бронювання
5. Якщо ви власник (host), додайте нову нерухомість через Dashboard

