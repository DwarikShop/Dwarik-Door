/**
 * app/not-found.tsx — 404 page.
 * Replaces the old React Router catch-all: { path: '*', element: <Navigate to="/" /> }
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-accent/20 rounded-3xl p-6 mb-6">
        <svg
          width="64"
          height="64"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <rect
            x="20"
            y="10"
            width="80"
            height="100"
            rx="4"
            fill="currentColor"
            opacity="0.3"
          />
          <rect
            x="25"
            y="15"
            width="70"
            height="90"
            rx="3"
            fill="currentColor"
            opacity="0.5"
          />
          <rect
            x="30"
            y="20"
            width="60"
            height="80"
            rx="2"
            fill="currentColor"
          />
          <circle cx="60" cy="60" r="8" fill="#C89B3C" />
        </svg>
      </div>
      <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
      <p className="text-lg font-semibold text-foreground mb-1">
        Page not found
      </p>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm active:scale-95 transition-transform"
      >
        Go home
      </Link>
    </div>
  );
}
