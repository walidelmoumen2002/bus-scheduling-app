// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { buses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/session';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUser();
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { plateNumber, capacity } = await request.json();

        if (!plateNumber || !capacity) {
            return NextResponse.json({ error: 'Plate number and capacity are required' }, { status: 400 });
        }

        const updatedBus = await db.update(buses)
            .set({ plateNumber, capacity: Number(capacity) })
            .where(eq(buses.id, Number(id)))
            .returning();

        if (updatedBus.length === 0) {
            return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBus[0]);

    } catch (error) {
        console.error('Error updating bus:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}