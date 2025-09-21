import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';

export const useErrorLoader = routeLoader$(({ url }) => {
  const error = url.searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Signin: 'Try signing in with a different account.',
    OAuthSignin: 'Try signing in with a different account.',
    OAuthCallback: 'Try signing in with a different account.',
    OAuthCreateAccount: 'Try signing in with a different account.',
    EmailCreateAccount: 'Try signing in with a different account.',
    Callback: 'Try signing in with a different account.',
    OAuthAccountNotLinked: 'To confirm your identity, sign in with the same account you used originally.',
    EmailSignin: 'Check your email address.',
    CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
    default: 'Unable to sign in.',
  };

  return {
    error: error || 'unknown',
    message: errorMessages[error || 'default'] || errorMessages.default,
  };
});

export default component$(() => {
  const errorData = useErrorLoader();

  return (
    <div class="min-h-screen bg-gradient-to-br from-wedding-cream to-wedding-beige flex items-center justify-center p-4">
      <Card class="w-full max-w-md shadow-lg">
        <CardHeader class="text-center">
          <CardTitle class="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription class="text-wedding-brown/70">
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert class="border-red-200 bg-red-50 mb-6">
            <AlertDescription class="text-red-700">
              {errorData.value.message}
            </AlertDescription>
          </Alert>

          <div class="space-y-4">
            <Button
              class="w-full bg-wedding-accent hover:bg-wedding-accent/90 text-white"
              onClick$={() => {
                window.location.href = '/auth/signin';
              }}
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              class="w-full border-wedding-sage/30 text-wedding-brown"
              onClick$={() => {
                window.location.href = '/';
              }}
            >
              Back to Home
            </Button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-wedding-brown/60">
              Error code: {errorData.value.error}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});