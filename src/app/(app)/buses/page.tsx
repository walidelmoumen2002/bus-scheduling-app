import { db } from '@/db/drizzle';
import { buses } from '@/db/schema';
import BusesClientPage from '@/components/buses-client-page';
import { getUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function BusesPage() {
    const user = await getUser();
    // user is guaranteed by (app)/layout redirect, but fetch it for RBAC in UI
    const allBuses = await db.select().from(buses);
    return <BusesClientPage initialBuses={allBuses} user={user!} />;
}
