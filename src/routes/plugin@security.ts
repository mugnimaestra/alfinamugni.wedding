/**
 * Security Middleware Plugin
 * Applies security headers to all responses
 */

import type { RequestHandler } from "@builder.io/qwik-city"
import { applySecurityHeaders, applyCSPHeaders } from "~/middleware/csp"

export const onRequest: RequestHandler = async ({ next, url, headers }) => {
  // Skip for static assets
  if (
    url.pathname.startsWith("/build/") ||
    url.pathname.startsWith("/favicon.") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
  ) {
    await next()
    return
  }

  // Continue with the request
  await next()

  // Apply security headers to response
  applySecurityHeaders(headers)

  // Apply CSP headers
  // Note: In production, consider using a nonce for inline scripts
  const isProduction = process.env.NODE_ENV === "production"
  applyCSPHeaders(headers, undefined, !isProduction) // Report-only in dev
}
