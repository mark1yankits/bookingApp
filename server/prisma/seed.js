import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
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
      images: [],
      amenities: ['Wi-Fi', 'Кондиціонер', 'Пральна машина', 'Парковка'],
    },
  });

  const property2 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Сучасний будинок біля моря',
      description: 'Розкішний будинок з 3 спальнями, басейном та приватним пляжем. Ідеальне місце для відпочинку з сім\'єю або друзями. Повна приватність та всі зручності.',
      pricePerNight: 5000,
      location: 'Одеса, вул. Приморська, 25',
      images: [],
      amenities: ['Басейн', 'Пляж', 'Wi-Fi', 'Парковка', 'Сауна', 'Барбекю'],
    },
  });

  const property3 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Студія в історичному центрі Львова',
      description: 'Компактна студія в самому серці старого міста. Поруч всі основні пам\'ятки, ресторани та кав\'ярні. Ідеально для романтичної подорожі.',
      pricePerNight: 800,
      location: 'Львів, вул. Ринок, 10',
      images: [],
      amenities: ['Wi-Fi', 'Центральне опалення', 'Пральна машина'],
    },
  });

  const property4 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Пентхаус з панорамним видом',
      description: 'Розкішний пентхаус на останньому поверсі з панорамним видом на місто. 2 спальні, велика вітальня, тераса. Для тих, хто цінує комфорт та розкіш.',
      pricePerNight: 3500,
      location: 'Київ, вул. Банкова, 5',
      images: [],
      amenities: ['Тераса', 'Wi-Fi', 'Кондиціонер', 'Парковка', 'Ліфт', 'Охорона'],
    },
  });

  const property5 = await prisma.property.create({
    data: {
      hostId: host.id,
      title: 'Заміський котедж у лісі',
      description: 'Дерев\'яний котедж серед природи. Камін, сауна, мангал. Відмінне місце для відпочинку від міської метушні. Поруч озеро для риболовлі.',
      pricePerNight: 2000,
      location: 'Карпати, с. Яблуниця',
      images: [],
      amenities: ['Камін', 'Сауна', 'Мангал', 'Парковка', 'Wi-Fi'],
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

  console.log('\n📊 Seed completed successfully!');
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

