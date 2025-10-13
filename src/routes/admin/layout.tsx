import { component$, Slot, useSignal } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { RequestHandler } from '@builder.io/qwik-city';

// Enhanced server-side session validation with Custom Auth
export const onRequest: RequestHandler = async ({ request, redirect, url, headers, cookie }) => {
  try {
    // Log admin access attempts for security monitoring
    const clientIP = request.headers.get('CF-Connecting-IP') ||
                    request.headers.get('X-Forwarded-For') ||
                    request.headers.get('X-Real-IP') ||
                    'unknown';

    console.log(`Admin access attempt: ${url.pathname} from IP: ${clientIP}`);

    // Add security headers
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Check for admin session cookie
    const sessionId = cookie.get('admin_session')?.value;

    if (!sessionId) {
      console.warn(`Admin access denied - no session cookie: ${clientIP} -> ${url.pathname}`);
      throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}`);
    }

    // Validate session with Custom Auth API
    const sessionUrl = new URL('/api/auth/login', url.origin);
    const sessionResponse = await fetch(sessionUrl, {
      method: 'GET',
      headers: {
        Cookie: `admin_session=${sessionId}`,
      },
    });

    if (!sessionResponse.ok) {
      console.warn(`Admin access denied - invalid session: ${clientIP} -> ${url.pathname}`);
      // Clear invalid session cookies
      cookie.delete('admin_session', { path: '/' });
      cookie.delete('csrf_token', { path: '/' });
      throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}`);
    }

    const sessionData = await sessionResponse.json();

    if (!sessionData.authenticated) {
      console.warn(`Admin access denied - not authenticated: ${clientIP} -> ${url.pathname}`);
      throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}`);
    }

    // Session is valid - log successful access
    console.log(`Admin access granted: ${sessionData.data?.session?.email} -> ${url.pathname}`);

  } catch (error) {
    if (error instanceof Response) {
      throw error; // Re-throw redirect responses
    }

    console.error('Session validation error:', error);
    throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}`);
  }
};

// Admin session loader
export const useAdminSession = routeLoader$(async ({ cookie, url }) => {
  try {
    const sessionId = cookie.get('admin_session')?.value;

    if (!sessionId) {
      return null;
    }

    const sessionUrl = new URL('/api/auth/login', url.origin);
    const sessionResponse = await fetch(sessionUrl, {
      method: 'GET',
      headers: {
        Cookie: `admin_session=${sessionId}`,
      },
    });

    if (!sessionResponse.ok) {
      return null;
    }

    const sessionData = await sessionResponse.json();
    return sessionData.authenticated ? sessionData.data?.session : null;
  } catch (error) {
    console.error('Failed to load admin session:', error);
    return null;
  }
});

export default component$(() => {
  const adminSession = useAdminSession();
  const isLoading = useSignal(false);

  const handleSignOut = async () => {
    isLoading.value = true;
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Sign out failed');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Admin Navigation Header */}
      <nav class="bg-wedding-brown text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold">Wedding Admin Dashboard</h1>
              <div class="hidden md:block ml-10">
                <div class="flex items-baseline space-x-4">
                  <a
                    href="/admin/dashboard"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-wedding-accent transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/admin/rsvps"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-wedding-accent transition-colors"
                  >
                    RSVPs
                  </a>
                  <a
                    href="/admin/gallery"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-wedding-accent transition-colors"
                  >
                    Gallery
                  </a>
                  <a
                    href="/admin/wishes"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-wedding-accent transition-colors"
                  >
                    Wishes
                  </a>
                  <a
                    href="/admin/settings"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-wedding-accent transition-colors"
                  >
                    Settings
                  </a>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div class="flex items-center space-x-4">
              {adminSession.value ? (
                <>
                  <span class="text-sm">
                    Welcome, {adminSession.value.email}
                  </span>
                  <button
                    onClick$={handleSignOut}
                    disabled={isLoading.value}
                    class="bg-wedding-accent hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading.value ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <a
                  href="/auth/signin"
                  class="bg-wedding-accent hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </a>
              )}
              <a
                href="/"
                class="text-wedding-cream hover:text-white transition-colors"
              >
                ← Back to Website
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {adminSession.value ? (
          <Slot />
        ) : (
          <div class="text-center py-12">
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">
                Access Denied
              </h2>
              <p class="text-gray-600 mb-6">
                You need admin privileges to access this area.
              </p>
              <a
                href="/auth/signin"
                class="wedding-button inline-block"
              >
                Sign In as Admin
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer class="bg-white border-t border-gray-200 mt-12">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">
              Wedding Admin Dashboard - Alfina & Mugni 2025
            </p>
            <div class="flex space-x-4 text-sm text-gray-500">
              <span>Session expires in 24 hours</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});