import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, z, zod$ } from '@builder.io/qwik-city';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { createAuth } from '~/lib/auth';
import { getEnv } from '~/lib/env';

// Check if user is already authenticated
export const useCheckSession = routeLoader$(async ({ cookie, redirect, platform }) => {
  const sessionId = cookie.get('admin_session')?.value;

  if (sessionId) {
    // Validate session directly using auth library
    try {
      const env = getEnv(platform?.env);
      const auth = createAuth(env);
      const validation = await auth.validateSession(sessionId);

      if (validation.valid) {
        throw redirect(302, '/admin');
      }
    } catch (error) {
      // If redirect is thrown, it will be handled by the framework
      if (error instanceof Response && error.status === 302) {
        throw error;
      }
      // Log other errors but don't block signin
      console.error('Session check error:', error);
    }
  }

  return { authenticated: false };
});

// Login action
export const useSignInAction = routeAction$(
  async (values, { fail, platform, cookie, redirect }) => {
    try {
      // Get environment (with fallback for Vite dev mode)
      const env = getEnv(platform?.env);

      // Create auth instance
      const auth = createAuth(env);

      // Authenticate user
      const authResult = await auth.authenticate(values.email, values.password);

      if (!authResult.success) {
        const statusCode = authResult.lockoutTime ? 423 : 401;

        return fail(statusCode, {
          error: authResult.error || 'Authentication failed',
          remainingAttempts: authResult.remainingAttempts,
          lockoutTime: authResult.lockoutTime,
        });
      }

      if (!authResult.session) {
        return fail(500, {
          error: 'Session creation failed',
        });
      }

      // Set secure session cookie
      // Use secure: false for localhost development
      const isProduction = platform?.env?.ENVIRONMENT === 'production';
      
      cookie.set('admin_session', authResult.session.id, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'Strict',
        path: '/',
        maxAge: 24 * 60 * 60, // 24 hours
        expires: new Date(authResult.session.expiresAt)
      });

      // Generate and store CSRF token
      const csrfToken = auth.generateCSRFToken();
      await auth.storeCSRFToken(authResult.session.id, csrfToken);

      // Set CSRF token cookie
      cookie.set('csrf_token', csrfToken, {
        secure: isProduction,
        sameSite: 'Strict',
        path: '/',
        maxAge: 60 * 60, // 1 hour
        httpOnly: false
      });

      // Redirect to admin dashboard
      throw redirect(302, '/admin/');

    } catch (error) {
      // If redirect is thrown, it will be handled by the framework
      if (error instanceof Response && error.status === 302) {
        throw error;
      }

      console.error('Login action error:', error);
      return fail(500, {
        error: 'Login failed. Please try again.',
      });
    }
  },
  zod$({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  })
);

export default component$(() => {
  const signInAction = useSignInAction();
  useCheckSession(); // Just call it to trigger the redirect if needed
  const error = useSignal<string>('');
  const isLoading = useSignal<boolean>(false);

  return (
    <div class="min-h-screen bg-gradient-to-br from-wedding-cream to-wedding-beige flex items-center justify-center p-4">
      <Card class="w-full max-w-md shadow-lg">
        <CardHeader class="text-center">
          <CardTitle class="text-2xl font-bold text-wedding-brown">
            Wedding Admin Login
          </CardTitle>
          <CardDescription class="text-wedding-brown/70">
            Sign in to manage Alfina & Mugni's wedding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            action={signInAction}
            onSubmit$={() => {
              isLoading.value = true;
              error.value = '';
            }}
            onSubmitCompleted$={(event) => {
              isLoading.value = false;
              const result = event.detail;
              if ('failed' in result && result.failed) {
                const failedResult = result as { value: { lockoutTime?: number; remainingAttempts?: number; error?: string } };
                if (failedResult.value?.lockoutTime) {
                  const lockoutMinutes = Math.ceil(failedResult.value.lockoutTime / 60000);
                  error.value = `Account locked. Try again in ${lockoutMinutes} minutes.`;
                } else if (failedResult.value?.remainingAttempts !== undefined) {
                  error.value = `${failedResult.value.error}. ${failedResult.value.remainingAttempts} attempts remaining.`;
                } else {
                  error.value = failedResult.value?.error || 'Login failed';
                }
              } else if ('success' in result && result.success) {
                // Redirect will be handled by the server
                window.location.href = '/admin';
              }
            }}
          >
            <div class="space-y-4">
              {error.value && (
                <Alert class="border-red-200 bg-red-50">
                  <AlertDescription class="text-red-700">
                    {error.value}
                  </AlertDescription>
                </Alert>
              )}

              <div class="space-y-2">
                <Label for="email" class="text-wedding-brown font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  class="border-wedding-sage/30 focus:border-wedding-accent"
                  required
                  disabled={isLoading.value}
                />
              </div>

              <div class="space-y-2">
                <Label for="password" class="text-wedding-brown font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  class="border-wedding-sage/30 focus:border-wedding-accent"
                  required
                  disabled={isLoading.value}
                />
              </div>

              <Button
                type="submit"
                class="w-full bg-wedding-accent hover:bg-wedding-accent/90 text-white"
                disabled={isLoading.value}
              >
                {isLoading.value ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </Form>

          <div class="mt-6 text-center">
            <p class="text-sm text-wedding-brown/60">
              Need access? Contact the wedding admin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});