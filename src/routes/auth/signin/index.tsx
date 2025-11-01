import { component$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { createAuth } from "~/lib/auth";
import { getEnv } from "~/lib/env";

// Check if user is already authenticated
export const useCheckSession = routeLoader$(
  async ({ cookie, redirect, platform }) => {
    const sessionId = cookie.get("admin_session")?.value;

    if (sessionId) {
      // Validate session directly using auth library
      try {
        const env = getEnv(platform?.env);
        const auth = createAuth(env);
        const validation = await auth.validateSession(sessionId);

        if (validation.valid) {
          throw redirect(302, "/admin");
        }
      } catch (error) {
        // If redirect is thrown, it will be handled by the framework
        if (error instanceof Response && error.status === 302) {
          throw error;
        }
        // Log other errors but don't block signin
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Session check error:", errorMessage);
      }
    }

    return { authenticated: false };
  }
);

export default component$(() => {
  useCheckSession(); // Just call it to trigger the redirect if needed
  const error = useSignal<string>("");
  const isLoading = useSignal<boolean>(false);

  const handleSubmit = $((event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email || !password) {
      error.value = "Email and password are required";
      return;
    }

    // Clear previous errors
    error.value = "";
    isLoading.value = true;

    // Submit to API
    fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (data.success) {
          // Redirect to admin dashboard
          window.location.href = "/admin/";
        } else {
          // Handle different error cases
          if (data.lockoutTime) {
            const lockoutMinutes = Math.ceil(data.lockoutTime / 60000);
            error.value = `Account locked. Try again in ${lockoutMinutes} minutes.`;
          } else if (data.remainingAttempts !== undefined) {
            error.value = `${data.error}. ${data.remainingAttempts} attempts remaining.`;
          } else {
            error.value = data.error || "Login failed";
          }
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        error.value = "Failed to connect to server. Please try again.";
      })
      .finally(() => {
        isLoading.value = false;
      });
  });

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
          <form preventdefault:submit onSubmit$={handleSubmit}>
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
                {isLoading.value ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>

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
