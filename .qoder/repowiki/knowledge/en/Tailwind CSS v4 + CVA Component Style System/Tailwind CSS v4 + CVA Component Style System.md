---
kind: frontend_style
name: Tailwind CSS v4 + CVA Component Style System
category: frontend_style
scope:
    - '**'
source_files:
    - src/app/globals.css
    - postcss.config.mjs
    - utils/utils.ts
    - src/components/ui/button.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/popover.tsx
    - package.json
---

## What system/approach is used

The application uses **Tailwind CSS v4** (via `@tailwindcss/postcss` plugin, no legacy `tailwind.config.js`) combined with **Class Variance Authority (CVA)** for component-level variant styling. The global stylesheet lives in `src/app/globals.css`, which imports Tailwind via the new `@import "tailwindcss"` syntax and declares design tokens using the Tailwind v4 `@theme inline` block. A lightweight `cn` utility (`utils/utils.ts`) merges class names with `clsx` + `tailwind-merge`. Low-level UI primitives are implemented as small React components under `src/components/ui/` (Button, Badge, Popover) that expose CVA-driven `variant` and `size` props.

## Key files and packages

- `src/app/globals.css` — root stylesheet: Tailwind import, CSS custom properties for background/foreground, `@theme inline` token declarations, a custom `flipDown` keyframe animation, and scoped input-spinner hiding rules for campaign modals.
- `postcss.config.mjs` — PostCSS config registering only `@tailwindcss/postcss` (no other plugins).
- `utils/utils.ts` — exports the shared `cn(...)` helper built on `clsx` + `tailwind-merge`.
- `src/components/ui/button.tsx` — CVA-based Button with variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`), plus focus/invalid/disabled states.
- `src/components/ui/badge.tsx` — CVA-based Badge with variants (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`).
- `src/components/ui/popover.tsx` — Radix Popover wrapper consumed by layout modals.
- `package.json` — declares `tailwindcss ^4`, `@tailwindcss/postcss ^4`, `class-variance-authority ^0.7`, `clsx ^2`, `tailwind-merge ^3`, `lucide-react ^1`, and Radix UI primitives (`react-popover`, `react-dropdown-menu`, `react-navigation-menu`, `react-slot`).

## Architecture and conventions

- **Global theme via CSS variables**: `--background` and `--foreground` are defined in `:root` and re-exported into Tailwind's theme namespace as `--color-background` / `--color-foreground`. Font families (`--font-sans`, `--font-mono`) reference Geist fonts declared elsewhere in the Next.js template.
- **Component-scoped styles via CVA**: Each UI primitive defines a `cva(...)` configuration object describing all visual variants and their Tailwind class strings. Components accept `variant` and `size` props typed through `VariantProps<typeof ...Variants>` and merge them with user-supplied `className` via `cn()`.
- **Data attributes for testability/debugging**: Components emit `data-slot="button"` / `data-slot="badge"` and `data-variant` / `data-size` attributes so downstream code can target rendered elements without relying on class names alone.
- **Dark-mode defaults**: The root stylesheet forces a dark palette (`--background: #0a0a0a`, `--foreground: #ededed`) and uses `dark:` prefixed utilities throughout the CVA definitions, indicating the app ships dark-first.
- **Custom animations**: Non-Tailwind animations live in `globals.css` as `@keyframes flipDown` with two utility classes `.animate-flip-fast` (1s) and `.animate-flip-slow` (2s).
- **Scoped browser quirks**: Number-input spinners inside `.campaign-modal` inputs are hidden via vendor-prefixed pseudo-elements to allow exact numeric entry.
- **Radix primitives**: Where interactive primitives beyond buttons/badges are needed, the app composes Radix UI (`@radix-ui/react-popover`, `react-dropdown-menu`, `react-navigation-menu`) rather than building from scratch; a minimal `Slot` shim is used locally to avoid pulling in the full `@radix-ui/react-slot` package at call sites.

## Conventions and constraints

- All component styling goes through CVA + Tailwind utility classes; inline style objects are not used for presentation in the UI primitives.
- Class name merging always goes through the shared `cn()` helper from `utils/utils.ts` to guarantee deterministic output when multiple class sources collide.
- New UI primitives should follow the pattern of `src/components/ui/*`: define a `cva` configuration, export both the component and its `*Variants` type, and mark slots with `data-*` attributes.
- Global tokens must be declared in `src/app/globals.css` under `:root` and re-referenced via `@theme inline`; ad-hoc color literals should be avoided in favor of semantic tokens like `bg-primary`, `text-foreground`, `border-border`, etc.
- Dark mode is treated as the default surface; light-mode overrides are expressed with `dark:` prefixes where needed.