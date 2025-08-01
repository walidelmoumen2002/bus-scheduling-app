import { pgTable, text, serial, boolean, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    role: text('role', { enum: ['admin', 'dispatcher', 'viewer'] }).notNull(),
});

export const drivers = pgTable('drivers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    licenseNumber: text('license_number').notNull().unique(),
    available: boolean('available').default(true).notNull(),
});

export const buses = pgTable('buses', {
    id: serial('id').primaryKey(),
    plateNumber: text('plate_number').notNull().unique(),
    capacity: integer('capacity').notNull(),
});

export const routes = pgTable('routes', {
    id: serial('id').primaryKey(),
    origin: text('origin').notNull(),
    destination: text('destination').notNull(),
    estimatedDurationMinutes: integer('estimated_duration_minutes').notNull(),
});

export const shifts = pgTable('shifts', {
    id: serial('id').primaryKey(),
    driverId: integer('driver_id').notNull().references(() => drivers.id),
    busId: integer('bus_id').notNull().references(() => buses.id),
    routeId: integer('route_id').notNull().references(() => routes.id),
    shiftStart: timestamp('shift_start', { withTimezone: true }).notNull(),
    shiftEnd: timestamp('shift_end', { withTimezone: true }).notNull(),
}, (table) => {
    return {
        driverShiftIndex: uniqueIndex('driver_shift_idx').on(table.driverId, table.shiftStart),
    };
});