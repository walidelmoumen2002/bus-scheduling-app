// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { drivers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/session';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUser();
    if (user?.role !== 'admin' && user?.role !== 'dispatcher') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { name, licenseNumber, available } = await request.json();

        if (!name || !licenseNumber || typeof available !== 'boolean') {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const updatedDriver = await db.update(drivers)
            .set({ name, licenseNumber, available })
            .where(eq(drivers.id, Number(id)))
            .returning();

        if (updatedDriver.length === 0) {
            return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
        }

        return NextResponse.json(updatedDriver[0]);

    } catch (error) {
        console.error('Error updating driver:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}