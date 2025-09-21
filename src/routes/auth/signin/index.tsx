import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, z, zod$ } from '@builder.io/qwik-city';
import { useSignIn } from '~/routes/plugin@auth';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';

export const useSignInAction = routeAction$(
  async (values, { redirect }) => {
    // The actual authentication will be handled by Auth.js
    return redirect(302, '/admin');
  },
  zod$({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  })
);

export const useCheckSession = routeLoader$(async () => {
  // If user is already signed in, redirect to admin
  // This will be handled by the Auth.js middleware
  return {};
});

export default component$(() => {
  const signInAction = useSignInAction();
  const signIn = useSignIn();
  const error = useSignal<string>('');

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
            onSubmitCompleted$={(result) => {
              if (result.failed) {
                error.value = 'Invalid username or password';
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
                <Label for="username" class="text-wedding-brown font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  class="border-wedding-sage/30 focus:border-wedding-accent"
                  required
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
                />
              </div>

              <Button
                type="submit"
                class="w-full bg-wedding-accent hover:bg-wedding-accent/90 text-white"
                onClick$={async () => {
                  await signIn.submit({
                    providerId: 'credentials',
                    options: {
                      username: (document.getElementById('username') as HTMLInputElement)?.value,
                      password: (document.getElementById('password') as HTMLInputElement)?.value,
                    },
                  });
                }}
              >
                Sign In
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