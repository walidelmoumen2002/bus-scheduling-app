import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;


    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }


    try {
        await jwtVerify(token, SECRET_KEY);

        return NextResponse.next();

    } catch (err) {

        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }
}

export const config = {

    matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};