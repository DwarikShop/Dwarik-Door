"use client";

/**
 * LoadingScreen
 *
 * Shown while AuthContext is rehydrating the session from the JWT cookie.
 * Matches the app's primary brand colour so there's no flash of unstyled content.
 * Preserves the existing splash screen aesthetic.
 */

export function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-primary flex flex-col items-center justify-center gap-6">
      {/* Door icon — same inline SVG used in LoginScreen and SplashScreen */}
      <div className="bg-accent/20 rounded-3xl p-6">
        <svg
          width="72"
          height="72"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground"
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

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-accent animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
