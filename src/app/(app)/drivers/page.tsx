import { db } from '@/db/drizzle';
import { drivers } from '@/db/schema';
import DriversClientPage from '@/components/drivers-client-page';

// Add this line to explicitly mark the page as dynamic
export const dynamic = 'force-dynamic';

export default async function DriversPage() {
    // Fetch the initial data on the server
    const allDrivers = await db.select().from(drivers);

    // Pass the data to the client component
    return <DriversClientPage initialDrivers={allDrivers} />;
}