import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Redirect to login if there's no token and the user is not trying to log in
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify the token
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const role = payload.role as string;

        // --- API Authorization Logic ---
        const ADMIN_API_PAGES = ['/api/users', '/api/buses/delete', '/api/drivers/delete'];
        const DISPATCHER_API_PAGES = ['/api/drivers', '/api/shifts', '/api/routes'];

        if (ADMIN_API_PAGES.some(p => pathname.startsWith(p)) && role !== 'admin') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        if (DISPATCHER_API_PAGES.some(p => pathname.startsWith(p)) && role !== 'admin' && role !== 'dispatcher') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        // --- End of API Authorization Logic ---

        // If the token is valid, allow the request to proceed
        return NextResponse.next();

    } catch (err) {
        // If the token is invalid (expired, malformed), redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token'); // Clear the invalid token
        return response;
    }
}

export const config = {
    // This matcher protects all routes except the login page, static assets, and auth API calls
    matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};