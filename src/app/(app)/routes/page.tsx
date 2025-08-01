import { db } from '@/db/drizzle';
import { routes } from '@/db/schema';
import RoutesClientPage from '@/components/routes-client-page';


export const dynamic = 'force-dynamic';

export default async function RoutesPage() {
    const allRoutes = await db.select().from(routes);
    return <RoutesClientPage initialRoutes={allRoutes} />;
}