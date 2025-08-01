import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// List of pages that require admin access
const ADMIN_PAGES = ['/api/users', '/api/buses/delete', '/api/drivers/delete'];

// List of pages that require dispatcher access
const DISPATCHER_PAGES = ['/api/drivers', '/api/shifts', '/api/routes'];


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Allow login and static files to be accessed without a token
    if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname === '/') {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const role = payload.role as string;

        // Admin Access Control
        if (ADMIN_PAGES.some(p => pathname.startsWith(p)) && role !== 'admin') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        // Dispatcher Access Control
        if (DISPATCHER_PAGES.some(p => pathname.startsWith(p)) && role !== 'admin' && role !== 'dispatcher') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        return NextResponse.next();
    } catch (err) {
        // If token is invalid, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api/auth).*)'], // Apply middleware to all routes except the auth API
};