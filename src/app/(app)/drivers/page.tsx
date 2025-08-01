import { db } from '@/db/drizzle';
import { drivers } from '@/db/schema';
import DriversClientPage from '@/components/drivers-client-page';
import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';

// Add this line to explicitly mark the page as dynamic
export const dynamic = 'force-dynamic';

export default async function DriversPage() {
    const user = await getUser();

    // Although the layout redirects, it's good practice to have this check
    if (!user) {
        redirect('/login');
    }

    const allDrivers = await db.select().from(drivers);

    // Pass both initialDrivers and the fetched user to the client component
    return <DriversClientPage initialDrivers={allDrivers} user={user} />;
}