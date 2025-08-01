import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { shifts, drivers, buses, routes } from '@/db/schema';
import { eq, and, or, lt, gt } from 'drizzle-orm';

// GET all shifts with related data
export async function GET() {
    try {
        const allShifts = await db.select({
            id: shifts.id,
            driverName: drivers.name,
            busPlateNumber: buses.plateNumber,
            routeOrigin: routes.origin,
            routeDestination: routes.destination,
            shiftStart: shifts.shiftStart,
            shiftEnd: shifts.shiftEnd,
        })
            .from(shifts)
            .leftJoin(drivers, eq(shifts.driverId, drivers.id))
            .leftJoin(buses, eq(shifts.busId, buses.id))
            .leftJoin(routes, eq(shifts.routeId, routes.id));

        return NextResponse.json(allShifts);
    } catch (error) {
        console.error('Error fetching shifts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new shift
export async function POST(request: NextRequest) {
    try {
        const { driverId, busId, routeId, shiftStart, shiftEnd } = await request.json();

        if (!driverId || !busId || !routeId || !shiftStart || !shiftEnd) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newShiftStart = new Date(shiftStart);
        const newShiftEnd = new Date(shiftEnd);

        if (newShiftStart >= newShiftEnd) {
            return NextResponse.json({ error: 'Shift start time must be before shift end time.' }, { status: 400 });
        }

        // --- Conflict Check ---
        // A driver cannot have overlapping shifts.
        // An overlap occurs if (new_start < existing_end) AND (new_end > existing_start)
        const existingShifts = await db.select()
            .from(shifts)
            .where(
                and(
                    eq(shifts.driverId, driverId),
                    lt(shifts.shiftStart, newShiftEnd),
                    gt(shifts.shiftEnd, newShiftStart)
                )
            );

        if (existingShifts.length > 0) {
            return NextResponse.json({ error: 'Scheduling conflict: This driver has an overlapping shift.' }, { status: 409 });
        }

        const newShift = await db.insert(shifts).values({
            driverId,
            busId,
            routeId,
            shiftStart: newShiftStart,
            shiftEnd: newShiftEnd,
        }).returning();

        return NextResponse.json(newShift[0], { status: 201 });
    } catch (error) {
        console.error('Error creating shift:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}