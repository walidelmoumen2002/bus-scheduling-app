import { drizzle } from 'drizzle-orm/postgres-js';
import { users, drivers, buses, routes } from './schema';
import postgres from 'postgres';
import *s dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set!');
}

const db = drizzle(postgres(connectionString));

async function seed() {
    console.log('Seeding database...');

    // Hashing passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const dispatcherPassword = await bcrypt.hash('dispatcher123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);

    // Clear existing data
    await db.delete(users);
    await db.delete(drivers);
    await db.delete(buses);
    await db.delete(routes);

    // Seed Users
    await db.insert(users).values([
        { username: 'admin', password: adminPassword, role: 'admin' },
        { username: 'dispatcher', password: dispatcherPassword, role: 'dispatcher' },
        { username: 'viewer', password: viewerPassword, role: 'viewer' },
    ]);

    // Seed Drivers
    await db.insert(drivers).values([
        { name: 'John Doe', licenseNumber: 'D12345', available: true },
        { name: 'Jane Smith', licenseNumber: 'D67890', available: true },
        { name: 'Peter Jones', licenseNumber: 'D54321', available: false },
    ]);

    // Seed Buses
    await db.insert(buses).values([
        { plateNumber: 'BUS-001', capacity: 50 },
        { plateNumber: 'BUS-002', capacity: 45 },
    ]);

    // Seed Routes
    await db.insert(routes).values([
        { origin: 'Depot A', destination: 'City Center', estimatedDurationMinutes: 60 },
        { origin: 'City Center', destination: 'Uptown', estimatedDurationMinutes: 45 },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
}

seed().catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
});