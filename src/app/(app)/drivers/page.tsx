import { db } from '@/db/drizzle';
import { drivers } from '@/db/schema';
import DriversClientPage from '@/components/drivers-client-page';
import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    const allDrivers = await db.select().from(drivers);

    return <DriversClientPage initialDrivers={allDrivers} user={user} />;
}