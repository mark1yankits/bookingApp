import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if data already exists
  const existingUsers = await prisma.user.count();
  const existingReviews = await prisma.review.count();

  if (existingUsers === 0) {
    console.log('📝 База порожня, створюємо тестові дані...');

    // Clear existing data (just in case)
    await prisma.booking.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

  const guest = await prisma.user.create({
    data: {
      email: 'guest@example.com',
      passwordHash: hashedPassword,
      role: 'guest',
    },
  });

  const host = await prisma.user.create({
    data: {
      email: 'host@example.com',
      passwordHash: hashedPassword,
      role: 'host',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Created users:', { guest: guest.email, host: host.email, admin: admin.email });

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Затишна квартира в центрі Києва',
      description: 'Сучасна однокімнатна квартира з видом на місто. Повністю обладнана кухня, безкоштовний Wi-Fi, кондиціонер. Ідеально підходить для бізнес-поїздок або туризму.',
      pricePerNight: 1500,
      location: 'Київ, вул. Хрещатик, 1',
      country: 'Україна',
      type: 'Квартира',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      images: [],
      amenities: ['Wi-Fi', 'Кондиціонер', 'Пральна машина', 'Парковка'],
      rules: ['Заборонено курити', 'Домашні тварини не дозволені', 'Тихі години: 22:00-08:00'],
    },
  });

  const property2 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Сучасний будинок біля моря',
      description: 'Розкішний будинок з 3 спальнями, басейном та приватним пляжем. Ідеальне місце для відпочинку з сім\'єю або друзями. Повна приватність та всі зручності.',
      pricePerNight: 5000,
      location: 'Одеса, вул. Приморська, 25',
      country: 'Україна',
      type: 'Будинок',
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 8,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      images: [],
      amenities: ['Басейн', 'Пляж', 'Wi-Fi', 'Парковка', 'Сауна', 'Барбекю'],
      rules: ['Заборонено курити', 'Тихі години: 23:00-08:00', 'Домашні тварини за погодженням'],
    },
  });

  const property3 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Студія в історичному центрі Львова',
      description: 'Компактна студія в самому серці старого міста. Поруч всі основні пам\'ятки, ресторани та кав\'ярні. Ідеально для романтичної подорожі.',
      pricePerNight: 800,
      location: 'Львів, вул. Ринок, 10',
      country: 'Україна',
      type: 'Студія',
      bedrooms: 0,
      bathrooms: 1,
      maxGuests: 2,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      images: [],
      amenities: ['Wi-Fi', 'Центральне опалення', 'Пральна машина'],
      rules: ['Заборонено курити', 'Домашні тварини не дозволені'],
    },
  });

  const property4 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Пентхаус з панорамним видом',
      description: 'Розкішний пентхаус на останньому поверсі з панорамним видом на місто. 2 спальні, велика вітальня, тераса. Для тих, хто цінує комфорт та розкіш.',
      pricePerNight: 3500,
      location: 'Київ, вул. Банкова, 5',
      country: 'Україна',
      type: 'Квартира',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      images: [],
      amenities: ['Тераса', 'Wi-Fi', 'Кондиціонер', 'Парковка', 'Ліфт', 'Охорона'],
      rules: ['Заборонено курити', 'Тихі години: 22:00-08:00', 'Домашні тварини не дозволені'],
    },
  });

  const property5 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Заміський котедж у лісі',
      description: 'Дерев\'яний котедж серед природи. Камін, сауна, мангал. Відмінне місце для відпочинку від міської метушні. Поруч озеро для риболовлі.',
      pricePerNight: 2000,
      location: 'Карпати, с. Яблуниця',
      country: 'Україна',
      type: 'Котедж',
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 6,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      images: [],
      amenities: ['Камін', 'Сауна', 'Мангал', 'Парковка', 'Wi-Fi'],
      rules: ['Домашні тварини дозволені', 'Мінімальне бронювання 2 ночі'],
    },
  });

  console.log('✅ Created properties:', property1.title, property2.title, property3.title, property4.title, property5.title);

  // Create bookings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

  const booking1 = await prisma.booking.create({
    data: {
      propertyId: property1.id,
      userId: guest.id,
      startDate: tomorrow,
      endDate: dayAfterTomorrow,
      totalPrice: 3000, // 2 nights * 1500
      status: 'confirmed',
    },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date();
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 10);

  const booking2 = await prisma.booking.create({
    data: {
      propertyId: property2.id,
      userId: guest.id,
      startDate: nextWeek,
      endDate: nextWeekEnd,
      totalPrice: 15000, // 3 nights * 5000
      status: 'pending',
    },
  });

  console.log('✅ Created bookings');

  // Create reviews (only for completed bookings)
  const pastBooking1 = await prisma.booking.create({
    data: {
      propertyId: property1.id,
      userId: guest.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-03'),
      totalPrice: 3000,
      status: 'confirmed',
    },
  });

  const review1 = await prisma.review.create({
    data: {
      propertyId: property1.id,
      userId: guest.id,
      rating: 5,
      comment: 'Чудова квартира! Все було чисто і зручно. Рекомендую!',
    },
  });

  const pastBooking2 = await prisma.booking.create({
    data: {
      propertyId: property2.id,
      userId: guest.id,
      startDate: new Date('2024-01-05'),
      endDate: new Date('2024-01-08'),
      totalPrice: 15000,
      status: 'confirmed',
    },
  });

  const review2 = await prisma.review.create({
    data: {
      propertyId: property2.id,
      userId: guest.id,
      rating: 4,
      comment: 'Гарний будинок біля моря. Басейн був чудовий, але Wi-Fi міг бути кращим.',
    },
  });

  const review3 = await prisma.review.create({
    data: {
      propertyId: property1.id,
      userId: guest.id,
      rating: 5,
      comment: 'Ідеальне місце для короткого відпочинку в Києві!',
    },
  });

  // Update property ratings
  const property1Reviews = await prisma.review.findMany({
    where: { propertyId: property1.id },
    select: { rating: true },
  });
  const property1AvgRating = property1Reviews.reduce((sum, r) => sum + r.rating, 0) / property1Reviews.length;

  const property2Reviews = await prisma.review.findMany({
    where: { propertyId: property2.id },
    select: { rating: true },
  });
  const property2AvgRating = property2Reviews.reduce((sum, r) => sum + r.rating, 0) / property2Reviews.length;

  await prisma.property.update({
    where: { id: property1.id },
    data: {
      rating: Math.round(property1AvgRating * 10) / 10,
    },
  });

  await prisma.property.update({
    where: { id: property2.id },
    data: {
      rating: Math.round(property2AvgRating * 10) / 10,
    },
  });

  console.log('✅ Created reviews and updated ratings');

    console.log('\n📊 Seed completed successfully!');
    console.log('\n👤 Test users:');
    console.log('  Guest: guest@example.com / password123');
    console.log('  Host:  host@example.com / password123');
    console.log('  Admin: admin@example.com / password123');
  } else {
    console.log('✅ Основні тестові дані вже існують');
  }

  // Add reviews if they don't exist
  if (existingReviews === 0) {
    console.log('📝 Додаємо тестові відгуки...');

    // Get existing data
    const guest = await prisma.user.findFirst({ where: { email: 'guest@example.com' } });
    const host = await prisma.user.findFirst({ where: { email: 'host@example.com' } });
    const properties = await prisma.property.findMany();

    if (guest && properties.length > 0) {
      // Create past bookings for reviews
      const pastDate1 = new Date();
      pastDate1.setDate(pastDate1.getDate() - 30); // 30 days ago
      const pastDate1End = new Date(pastDate1);
      pastDate1End.setDate(pastDate1End.getDate() + 2);

      const booking1 = await prisma.booking.create({
        data: {
          propertyId: properties[0].id,
          userId: guest.id,
          startDate: pastDate1,
          endDate: pastDate1End,
          totalPrice: properties[0].pricePerNight * 2,
          status: 'confirmed',
        },
      });

      const review1 = await prisma.review.create({
        data: {
          propertyId: properties[0].id,
          userId: guest.id,
          rating: 5,
          comment: 'Чудова квартира! Все було чисто і зручно. Рекомендую!',
        },
      });

      if (properties.length > 1) {
        const pastDate2 = new Date();
        pastDate2.setDate(pastDate2.getDate() - 20);
        const pastDate2End = new Date(pastDate2);
        pastDate2End.setDate(pastDate2End.getDate() + 3);

        const booking2 = await prisma.booking.create({
          data: {
            propertyId: properties[1].id,
            userId: guest.id,
            startDate: pastDate2,
            endDate: pastDate2End,
            totalPrice: properties[1].pricePerNight * 3,
            status: 'confirmed',
          },
        });

        const review2 = await prisma.review.create({
          data: {
            propertyId: properties[1].id,
            userId: guest.id,
            rating: 4,
            comment: 'Гарний будинок біля моря. Басейн був чудовий, але Wi-Fi міг бути кращим.',
          },
        });

        // Update property ratings
        const property1Reviews = await prisma.review.findMany({
          where: { propertyId: properties[0].id },
          select: { rating: true },
        });
        const property1AvgRating = property1Reviews.reduce((sum, r) => sum + r.rating, 0) / property1Reviews.length;

        const property2Reviews = await prisma.review.findMany({
          where: { propertyId: properties[1].id },
          select: { rating: true },
        });
        const property2AvgRating = property2Reviews.reduce((sum, r) => sum + r.rating, 0) / property2Reviews.length;

        await prisma.property.update({
          where: { id: properties[0].id },
          data: { rating: Math.round(property1AvgRating * 10) / 10 },
        });

        await prisma.property.update({
          where: { id: properties[1].id },
          data: { rating: Math.round(property2AvgRating * 10) / 10 },
        });
      }

      console.log('✅ Додано тестові відгуки та оновлено рейтинги');
    }
  } else {
    console.log(`📊 Знайдено ${existingReviews} відгуків у базі даних`);
  }

  console.log('\n🎉 База даних готова до використання!');
  console.log('\n👤 Test users:');
  console.log('  Guest: guest@example.com / password123');
  console.log('  Host:  host@example.com / password123');
  console.log('  Admin: admin@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

