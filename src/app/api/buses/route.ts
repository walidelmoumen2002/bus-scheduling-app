import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { buses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/session';

// GET all buses
export async function GET() {
    try {
        const allBuses = await db.select().from(buses);
        return NextResponse.json(allBuses);
    } catch (error) {
        console.error('Error fetching buses:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new bus
export async function POST(request: NextRequest) {
    const user = await getUser();
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const { plateNumber, capacity } = await request.json();

        if (!plateNumber || !capacity) {
            return NextResponse.json({ error: 'Plate number and capacity are required' }, { status: 400 });
        }

        const newBus = await db.insert(buses).values({ plateNumber, capacity: Number(capacity) }).returning();

        return NextResponse.json(newBus[0], { status: 201 });
    } catch (error) {
        console.error('Error creating bus:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE a bus
export async function DELETE(request: NextRequest) {
    const user = await getUser();
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Bus ID is required' }, { status: 400 });
        }

        const deletedBus = await db.delete(buses).where(eq(buses.id, id)).returning();

        if (deletedBus.length === 0) {
            return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Bus deleted successfully' });
    } catch (error) {
        console.error('Error deleting bus:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}