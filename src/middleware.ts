import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

const signInMessage = (signInUrl: string, requestedPath: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Sign in required</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        background: #e3eef3;
        color: #040f14;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
      }
      .card {
        background: #fff;
        border-radius: 12px;
        border: 1px solid rgba(4, 15, 20, 0.08);
        padding: 2rem;
        max-width: 480px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      }
      a {
        display: inline-flex;
        margin-top: 1rem;
        padding: 0.65rem 1.5rem;
        border-radius: 6px;
        background: #1a759f;
        color: #fff;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Sign in required</h1>
      <p>Access to ${requestedPath} is limited to authenticated admins.</p>
      <a href="${signInUrl}">Go to Clerk sign in</a>
    </div>
  </body>
</html>`;

export const onRequest = clerkMiddleware((auth, context, next) => {
  const { userId } = auth();
  if (isProtectedRoute(context.request) && !userId) {
    const signInUrl =
      import.meta.env.PUBLIC_CLERK_SIGN_IN_URL ||
      `${context.url.origin}/sign-in`;

    return new Response(signInMessage(signInUrl, new URL(context.request.url).pathname), {
      status: 401,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  return next();
});
