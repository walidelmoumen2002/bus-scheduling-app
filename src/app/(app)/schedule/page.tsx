import { db } from '@/db/drizzle';
import { shifts, drivers, buses, routes } from '@/db/schema';
import ShiftsClientPage from '@/components/shifts-client-page';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getShiftsData() {
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
        .leftJoin(routes, eq(shifts.routeId, routes.id))
        .orderBy(shifts.shiftStart);

    const serializableShifts = allShifts.map(shift => ({
        ...shift,
        shiftStart: shift.shiftStart.toISOString(),
        shiftEnd: shift.shiftEnd.toISOString(),
    }));

    const allDrivers = await db.select().from(drivers);
    const allBuses = await db.select().from(buses);
    const allRoutes = await db.select().from(routes);

    return {
        shifts: serializableShifts,
        drivers: allDrivers,
        buses: allBuses,
        routes: allRoutes,
    };
}

export default async function SchedulePage() {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    const { shifts, drivers, buses, routes } = await getShiftsData();

    return (
        <ShiftsClientPage
            initialShifts={shifts}
            drivers={drivers}
            buses={buses}
            routes={routes}
            user={user}
            readOnly={true}
        />
    );
}