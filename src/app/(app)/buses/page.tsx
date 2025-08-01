import { db } from '@/db/drizzle';
import { buses } from '@/db/schema';
import BusesClientPage from '@/components/buses-client-page';

// Add this line to explicitly mark the page as dynamic
export const dynamic = 'force-dynamic';

export default async function BusesPage() {
    // Fetch the initial data on the server
    const allBuses = await db.select().from(buses);

    // Pass the data to the client component
    return <BusesClientPage initialBuses={allBuses} />;
}