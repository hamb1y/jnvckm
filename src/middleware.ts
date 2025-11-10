import { clerkMiddleware } from "@clerk/astro/server";

export const onRequest = clerkMiddleware();
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/forum(.*)"]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { isAuthenticated, redirectToSignIn, userId } = auth();

  if (!isAuthenticated && isProtectedRoute(context.request)) {
    // Add custom logic to run before redirecting

    return redirectToSignIn();
  }
});
