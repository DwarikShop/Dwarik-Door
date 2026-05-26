import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: {
    default: "Dwarik Door",
    template: "%s | Dwarik Door",
  },
  description:
    "Premium Door Manufacturing — Order, Inventory & Employee Management",
  applicationName: "Dwarik",
  manifest: "/manifest.json?v=2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dwarik Door",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
  },
  keywords: ["door manufacturing", "inventory", "orders", "employees"],
  authors: [{ name: "Dwarik Door" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4E342E" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1210" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="tap-highlight-none scroll-smooth-mobile">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
