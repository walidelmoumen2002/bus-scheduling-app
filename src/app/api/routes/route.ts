import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { routes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/session';


export async function GET() {
    try {
        const allRoutes = await db.select().from(routes);
        return NextResponse.json(allRoutes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    const user = await getUser();
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const { origin, destination, estimatedDurationMinutes } = await request.json();

        if (!origin || !destination || !estimatedDurationMinutes) {
            return NextResponse.json({ error: 'Origin, destination, and estimated duration are required' }, { status: 400 });
        }

        const newRoute = await db.insert(routes).values({
            origin,
            destination,
            estimatedDurationMinutes: Number(estimatedDurationMinutes),
        }).returning();

        return NextResponse.json(newRoute[0], { status: 201 });
    } catch (error) {
        console.error('Error creating route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    const user = await getUser();
    if (user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Route ID is required' }, { status: 400 });
        }

        const deletedRoute = await db.delete(routes).where(eq(routes.id, id)).returning();

        if (deletedRoute.length === 0) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Route deleted successfully' });
    } catch (error) {
        console.error('Error deleting route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}