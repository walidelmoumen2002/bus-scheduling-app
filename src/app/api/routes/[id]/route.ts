// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { routes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/session';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUser();
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = params;
        const { origin, destination, estimatedDurationMinutes } = await request.json();

        if (!origin || !destination || !estimatedDurationMinutes) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const updatedRoute = await db.update(routes)
            .set({ origin, destination, estimatedDurationMinutes: Number(estimatedDurationMinutes) })
            .where(eq(routes.id, Number(id)))
            .returning();

        if (updatedRoute.length === 0) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRoute[0]);

    } catch (error) {
        console.error('Error updating route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}