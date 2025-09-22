import { component$, Slot, useSignal } from '@builder.io/qwik';
import { useSession, useSignIn, useSignOut } from '../plugin@auth';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { RequestHandler } from '@builder.io/qwik-city';

type WeddingUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type WeddinSession = {
  user?: WeddingUser;
  expires: string;
};

// Enhanced server-side session validation with security measures
export const onRequest: RequestHandler = async ({ request, redirect, url, headers }) => {
  const sessionUrl = new URL('/api/auth/session', url.origin);

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

    const sessionResponse = await fetch(sessionUrl, {
      headers: {
        Cookie: request.headers.get('Cookie') || '',
        'User-Agent': request.headers.get('User-Agent') || '',
      },
    });

    if (!sessionResponse.ok) {
      throw new Error(`Session validation failed: ${sessionResponse.status}`);
    }

    const session = await sessionResponse.json();

    // Enhanced session validation
    if (!session?.user) {
      console.warn(`Admin access denied - no session: ${clientIP} -> ${url.pathname}`);
      throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}&error=session_required`);
    }

    if (session.user.role !== 'admin') {
      console.warn(`Admin access denied - insufficient role: ${session.user.email} (${session.user.role}) from ${clientIP}`);
      throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}&error=access_denied`);
    }

    // Session is valid - log successful access
    console.log(`Admin access granted: ${session.user.email} -> ${url.pathname}`);

  } catch (error) {
    if (error instanceof Response) {
      throw error; // Re-throw redirect responses
    }

    console.error('Session validation error:', error);
    throw redirect(302, `/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}&error=validation_failed`);
  }
};

// Admin session loader
export const useAdminSession = routeLoader$(async ({ request, url }) => {
  const sessionUrl = new URL('/api/auth/session', url.origin);

  try {
    const sessionResponse = await fetch(sessionUrl, {
      headers: {
        Cookie: request.headers.get('Cookie') || '',
      },
    });

    const session = await sessionResponse.json();
    return session;
  } catch (error) {
    console.error('Failed to load admin session:', error);
    return null;
  }
});

export default component$(() => {
  const session = useSession();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const isLoading = useSignal(false);

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
              {session.value ? (
                <>
                  <span class="text-sm">
                    Welcome, {session.value.user?.name || session.value.user?.email}
                  </span>
                  <button
                    onClick$={async () => {
                      isLoading.value = true;
                      try {
                        await signOut.submit({});
                        window.location.href = '/';
                      } catch (error) {
                        console.error('Sign out error:', error);
                      } finally {
                        isLoading.value = false;
                      }
                    }}
                    disabled={isLoading.value}
                    class="bg-wedding-accent hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading.value ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <button
                  onClick$={async () => {
                    await signIn.submit({});
                  }}
                  class="bg-wedding-accent hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
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
        {session.value && (session.value as WeddinSession).user?.role === 'admin' ? (
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
              <button
                onClick$={async () => {
                  await signIn.submit({});
                }}
                class="wedding-button"
              >
                Sign In as Admin
              </button>
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
              <span>Session expires in 8 hours</span>
              <span>•</span>
              <span>Auto-refresh every hour</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});