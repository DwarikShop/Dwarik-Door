/**
 * PostCSS Configuration
 *
 * Uses @tailwindcss/postcss (v4) as the adapter for Next.js.
 * The Vite project uses @tailwindcss/vite — both read the same CSS source files,
 * so no Tailwind configuration changes are needed.
 *
 * NOTE: When running `next dev` / `next build`, this PostCSS config is used.
 *       When running `vite dev` / `vite build`, the @tailwindcss/vite plugin
 *       in vite.config.ts takes over and this file is ignored by Vite.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
