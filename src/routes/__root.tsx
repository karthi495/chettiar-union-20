import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10 shadow-elegant">
        <h1 className="font-display text-7xl text-primary">404</h1>
        <h2 className="mt-3 font-display text-2xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page has wandered off. Let's get you back to your match journey.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-royal text-secondary px-5 py-2.5 text-sm font-medium shadow-elegant"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-10 shadow-elegant">
        <h1 className="font-display text-2xl text-primary">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-royal text-secondary px-5 py-2.5 text-sm font-medium shadow-elegant"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chettiar Connect — Premium Tamil Matrimony" },
      {
        name: "description",
        content:
          "Trusted matrimony for the Chettiar community. Find your life partner with verified profiles, horoscope matching, and Tamil tradition.",
      },
      { property: "og:title", content: "Chettiar Connect — Premium Tamil Matrimony" },
      { property: "og:description", content: "Find your perfect match in the Chettiar community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
