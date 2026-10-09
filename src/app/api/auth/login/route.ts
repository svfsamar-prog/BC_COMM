import { NextResponse } from 'next/server';
import { authenticateUser, createSessionToken } from '@/lib/serverAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, captchaEntered, captchaExpected } = body;

    // Verify captcha if provided
    if (captchaEntered && captchaExpected) {
      if (captchaEntered.trim().toUpperCase() !== captchaExpected.trim().toUpperCase()) {
        return NextResponse.json({ error: 'Invalid security code. Please try again.' }, { status: 400 });
      }
    }

    const authResult = await authenticateUser(username, password);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Invalid username or password' }, { status: 401 });
    }

    const token = createSessionToken(authResult.user);

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('svf_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
