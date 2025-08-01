import { db } from '@/db/drizzle';
import { routes } from '@/db/schema';
import RoutesClientPage from '@/components/routes-client-page';

// Add this line to explicitly mark the page as dynamic
export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
    // Fetch the initial data on the server
    const allRoutes = await db.select().from(routes);

    // Pass the data to the client component
    return <RoutesClientPage initialRoutes={allRoutes} />;
}