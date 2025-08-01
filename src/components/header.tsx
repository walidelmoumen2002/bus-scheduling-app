"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

type User = {
    userId: number;
    role: string;
};

export default function Header({ user }: { user: User }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Bus Scheduler</h1>
            <nav className="flex items-center gap-4">
                {/* Viewer, Dispatcher, and Admin links */}
                <Link href="/schedule" className="text-sm font-medium hover:underline">Schedule</Link>

                {/* Dispatcher and Admin links */}
                {(user.role === 'admin' || user.role === 'dispatcher') && (
                    <>
                        <Link href="/drivers" className="text-sm font-medium hover:underline">Drivers</Link>
                        <Link href="/shifts" className="text-sm font-medium hover:underline">Shifts</Link>
                    </>
                )}

                {/* Admin-only links */}
                {user.role === 'admin' && (
                    <>
                        <Link href="/buses" className="text-sm font-medium hover:underline">Buses</Link>
                        <Link href="/routes" className="text-sm font-medium hover:underline">Routes</Link>
                    </>
                )}

                <span className="text-sm text-gray-500">({user.role})</span>
                <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </nav>
        </header>
    );
}