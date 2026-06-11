import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  
  // Public routes
  if (path.startsWith('/login') || path.startsWith('/update-password') || path.startsWith('/api/') || path.startsWith('/auth/')) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // MFA check
  // See if there's a trusted device cookie
  const trustedCookie = request.cookies.get('fysio_trusted_device_mfa');
  if (trustedCookie && trustedCookie.value === 'true') {
    // Trusted device, bypass AAL2 check
    return supabaseResponse;
  }

  // If no trusted cookie, check if the session satisfies aal2 (MFA)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session && session.user.app_metadata?.providers?.includes('email')) { // Assuming email login implies we want MFA. Wait, Supabase provides session.aal
    // Supabase MFA checking logic is typically: `session.aal === 'aal2'` or `session.authenticator_assurance_level === 'aal2'`
    // But `getUser` doesn't always populate `aal`. `mfa.getAuthenticatorAssuranceLevel()` is better.
  }
  
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const currentLevel = data?.currentLevel;
  const nextLevel = data?.nextLevel;
  
  // If nextLevel is aal2 but current is aal1, they need to do MFA.
  if (nextLevel === 'aal2' && currentLevel === 'aal1' && !path.startsWith('/mfa')) {
    const url = request.nextUrl.clone();
    url.pathname = '/mfa';
    return NextResponse.redirect(url);
  }

  // If they don't even have MFA enrolled (nextLevel === 'aal1'), we force them to enroll!
  if (nextLevel === 'aal1' && !path.startsWith('/mfa')) {
     const url = request.nextUrl.clone();
     url.pathname = '/mfa';
     return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
