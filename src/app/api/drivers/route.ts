import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { drivers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all drivers
export async function GET() {
    try {
        const allDrivers = await db.select().from(drivers);
        return NextResponse.json(allDrivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new driver
export async function POST(request: NextRequest) {
    try {
        const { name, licenseNumber } = await request.json();

        if (!name || !licenseNumber) {
            return NextResponse.json({ error: 'Name and license number are required' }, { status: 400 });
        }

        const newDriver = await db.insert(drivers).values({ name, licenseNumber }).returning();

        return NextResponse.json(newDriver[0], { status: 201 });
    } catch (error) {
        console.error('Error creating driver:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a driver
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
        }

        const deletedDriver = await db.delete(drivers).where(eq(drivers.id, id)).returning();

        if (deletedDriver.length === 0) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        console.error('Error deleting driver:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}