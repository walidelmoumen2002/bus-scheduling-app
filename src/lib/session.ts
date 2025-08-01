import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUser() {
    const token = (await cookies()).get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { userId: number; role: string; iat: number; exp: number };
    } catch (err) {
        return null;
    }
}
