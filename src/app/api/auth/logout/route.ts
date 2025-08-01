// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    (await cookies()).delete('token'); // ← await the cookie store
    return NextResponse.json({ message: 'Logged out' });
}
