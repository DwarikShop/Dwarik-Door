// Single source of truth for cn() lives in src/app/utils/cn.ts
// All shadcn/ui components import from this file — this re-export keeps
// their imports unchanged while eliminating the duplicate implementation.
export { cn } from "../../utils/cn";
