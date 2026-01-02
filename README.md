# Housing Rental Platform - Платформа оренди житла

Повнофункціональна платформа для оренди житла з можливістю локального запуску.

## 🚀 Швидкий старт (Локальний запуск)

### Передумови

- Node.js 18+ встановлений
- PostgreSQL 15+ встановлений і запущений
- npm або yarn

### Крок 1: Встановлення залежностей

```bash
# Backend
cd server
npm install

# Frontend (в новому терміналі)
cd ../client
npm install
```

### Крок 2: Налаштування бази даних

1. Створіть базу даних PostgreSQL:
```bash
createdb booking_db
# або через psql:
psql -U postgres -c "CREATE DATABASE booking_db;"
```

2. Налаштуйте `.env` файл в папці `server`:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/booking_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

### Крок 3: Запуск міграцій та seed

```bash
cd server

# Генерація Prisma Client
npx prisma generate

# Запуск міграцій
npx prisma migrate dev

# Заповнення бази тестовими даними
npm run prisma:seed
```

### Крок 4: Запуск серверів

**Термінал 1 - Backend:**
```bash
cd server
npm run dev
```

**Термінал 2 - Frontend:**
```bash
cd client
npm run dev
```

### Доступ до додатку

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📋 Тестові облікові записи

Після виконання seed:

- **Гість**: `guest@example.com` / `password123`
- **Власник**: `host@example.com` / `password123`
- **Адмін**: `admin@example.com` / `password123`

## 🐳 Запуск через Docker (опціонально)

Якщо хочете використовувати Docker:

```bash
docker-compose up --build
```

## 📁 Структура проекту

```
booking/
├── client/          # React frontend
├── server/          # Express backend
├── docker-compose.yml
└── README.md
```

## 🔧 Корисні команди

### Backend
```bash
cd server

# Міграції
npx prisma migrate dev          # Створити та застосувати міграцію
npx prisma migrate deploy       # Застосувати існуючі міграції
npx prisma migrate status       # Статус міграцій

# Prisma Studio (GUI для бази даних)
npx prisma studio               # Відкриється на http://localhost:5555

# Seed
npm run prisma:seed             # Заповнити базу тестовими даними
```

### Frontend
```bash
cd client

npm run dev        # Запуск dev сервера
npm run build      # Збірка для production
npm run preview    # Перегляд production збірки
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід
- `GET /auth/me` - Поточний користувач (захищено)

### Properties
- `GET /properties` - Список нерухомості (з фільтрами)
- `GET /properties/:id` - Деталі нерухомості
- `POST /properties` - Створити нерухомість (Host/Admin)

### Bookings
- `POST /bookings` - Створити бронювання
- `GET /bookings/my-bookings` - Мої бронювання
- `GET /bookings/host-bookings` - Бронювання для власника
- `PATCH /bookings/:id/status` - Оновити статус бронювання

## 🛠 Технології

- **Frontend**: React, Vite, Tailwind CSS, React Query
- **Backend**: Node.js, Express, Prisma
- **Database**: PostgreSQL
- **Auth**: JWT

## 📝 Примітки

- Для локального запуску потрібна локальна база PostgreSQL
- Зображення зберігаються локально в `server/uploads/`
- Для production налаштуйте AWS S3 в `.env`

