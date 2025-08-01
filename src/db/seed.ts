import { drizzle } from 'drizzle-orm/postgres-js';
import { users, drivers, buses, routes, shifts } from './schema';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
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
    await db.delete(shifts);
    await db.delete(users);
    await db.delete(drivers);
    await db.delete(buses);
    await db.delete(routes);

    // Seed Users
    const seededUsers = await db.insert(users).values([
        { username: 'admin', password: adminPassword, role: 'admin' },
        { username: 'dispatcher', password: dispatcherPassword, role: 'dispatcher' },
        { username: 'viewer', password: viewerPassword, role: 'viewer' },
    ]).returning();
    console.log('Seeded users:', seededUsers);

    // Seed Drivers
    const seededDrivers = await db.insert(drivers).values([
        { name: 'John Doe', licenseNumber: 'D12345', available: true },
        { name: 'Jane Smith', licenseNumber: 'D67890', available: true },
        { name: 'Peter Jones', licenseNumber: 'D54321', available: false },
    ]).returning();
    console.log('Seeded drivers:', seededDrivers);

    // Seed Buses
    const seededBuses = await db.insert(buses).values([
        { plateNumber: 'BUS-001', capacity: 50 },
        { plateNumber: 'BUS-002', capacity: 45 },
    ]).returning();
    console.log('Seeded buses:', seededBuses);

    // Seed Routes
    const seededRoutes = await db.insert(routes).values([
        { origin: 'Depot A', destination: 'City Center', estimatedDurationMinutes: 60 },
        { origin: 'City Center', destination: 'Uptown', estimatedDurationMinutes: 45 },
    ]).returning();
    console.log('Seeded routes:', seededRoutes);

    // Seed Shifts
    const seededShifts = await db.insert(shifts).values([
        {
            driverId: seededDrivers[0].id,
            busId: seededBuses[0].id,
            routeId: seededRoutes[0].id,
            shiftStart: new Date('2024-08-01T08:00:00Z'),
            shiftEnd: new Date('2024-08-01T16:00:00Z'),
        },
        {
            driverId: seededDrivers[1].id,
            busId: seededBuses[1].id,
            routeId: seededRoutes[1].id,
            shiftStart: new Date('2024-08-01T09:00:00Z'),
            shiftEnd: new Date('2024-08-01T17:00:00Z'),
        },
        {
            driverId: seededDrivers[0].id, // John Doe's second shift, non-overlapping
            busId: seededBuses[0].id,
            routeId: seededRoutes[0].id,
            shiftStart: new Date('2024-08-02T08:00:00Z'),
            shiftEnd: new Date('2024-08-02T16:00:00Z'),
        },
    ]).returning();
    console.log('Seeded shifts:', seededShifts);


    console.log('Database seeded successfully!');
    process.exit(0);
}

seed().catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
});