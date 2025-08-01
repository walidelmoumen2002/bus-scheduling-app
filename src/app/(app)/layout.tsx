// src/app/(app)/layout.tsx

import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Header from '@/components/header';

// This line is crucial. It forces all pages using this layout to be dynamic.
export const dynamic = 'force-dynamic';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} />
            <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
    );
}