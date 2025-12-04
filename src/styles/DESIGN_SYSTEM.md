# Design System Playbook

This is a concise, consultant-style guide so anyone can understand how to design and build in this system without digging through code.

**Where things live**
- Tokens: `src/styles/globals.css`, `src/styles/tokens.css`
- Tailwind bridge: `tailwind.config.js`
- Components: `src/components/ui/`
- Utility class map: `src/lib/uiClasses.ts`

---

## 1) Principles (defaults you can trust)
- Light/dark via CSS variables; toggling `.dark` on `<html>` flips themes.
- Primary action color: `--interactive-primary`. Default surfaces: `--bg-secondary`.
- Rounded look: cards `rounded-2xl`, inputs/selects `rounded-xl`, buttons `rounded-lg`.
- Shadows stay subtle: `shadow-sm` resting, `shadow-md` hover, `shadow-xl` modals.
- Spacing rhythm: 4/8/12/16/24/32px. Page padding `p-4 lg:p-8`.
- Type: Inter for UI (`--font-sans`), JetBrains Mono for code (`--font-mono`). Page titles use `text-2xl lg:text-3xl font-bold`.

---

## 2) Color system (essentials only)
- Backgrounds: primary (page), secondary (cards/tables), tertiary (muted/skeleton), plus hover/active tokens.
- Text: primary, secondary, tertiary, disabled.
- Borders: primary (default), secondary (emphasis), focus ring.
- Buttons: interactive primary + hover; interactive secondary for secondary buttons.
- Semantics: Success/Warning/Error/Info defined at 50/100/500/600/700; AA compliant.
- Plans: pre-set badge colors for starter, growth, premium, enterprise (see Badge component).
- Sidebar: dark shell by default; active text is white.

---

## 3) Type scale & hierarchy
- Sizes: 12/14/16/18/20/24/30 px mapped to `text-xs` through `text-3xl`.
- Use:
  - Page headers: `text-2xl lg:text-3xl font-bold`
  - Section/Card headers: `text-lg font-semibold`
  - Body: `text-base`
  - Helper/secondary: `text-sm text-foreground-secondary`
  - Timestamps: `text-xs text-foreground-tertiary`
  - Code/IDs: `font-mono text-sm`

---

## 4) Spacing & layout rules
- Page padding: `p-4 lg:p-8`
- Card padding: `p-4 lg:p-6`
- Section gaps: `gap-6` for big sections, `gap-4` inside cards/forms
- Icon/text gaps: `gap-2`
- Table cells: `px-6 py-4`
- Layout widths: page `max-w-7xl`, content `max-w-4xl`, forms `max-w-md`, modals `max-w-sm/md/lg`
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Sidebar shows from `lg` up.

---

## 5) Components (picking the right variant)
- Buttons: primary = main action; secondary = cancel/back/filter; ghost = tertiary; danger = destructive. Primary sits on the right in forms/dialogs.
- Badges: status badges for live/paused/etc; plan badges for tiers; semantic variants for tags/counts.
- Alerts: info/success/warning/error. Page-level alerts go at the top of content.
- Cards: plain Card for content; `hover` for selectable tiles; stat cards = label + single KPI.
- Forms: Input for single-line, Select for small option sets, Textarea for multi-line, Toggle for binary. Selects are auto-width in filters; full width in forms.

---

## 6) Radius, shadows, z-index (apply without thinking)
- Radius: Cards/Modals `rounded-2xl`; Inputs/Selects/Textareas `rounded-xl`; Buttons `rounded-lg`; Badges/Avatars `rounded-full`.
- Shadows: `shadow-sm` base; `shadow-md` hover; `shadow-xl` modals.
- Z-index: dropdown 10, sticky 20, fixed 30, modal backdrop 40, modal 50, popover 60, tooltip 70, toast 80.

---

## 7) Accessibility essentials
- Visible focus rings (`focus:ring-2` with interactive color).
- Icon-only buttons must have `aria-label`.
- Inputs: use the components to auto-link labels, errors, and `aria-describedby`.
- Contrast: body text 4.5:1, large text 3:1, UI 3:1 (tokens already comply).
- Keyboard: Buttons (Enter/Space), Modals (Escape), Tabs (Arrow keys), Select (Arrow/Enter), Toggle (Space).

---

## 8) Responsive patterns
- Sidebar hidden on mobile: `lg:hidden` trigger, `hidden lg:flex` desktop rail.
- Grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` with `gap-4`.
- Cards stack on mobile; filter bars wrap (`flex-wrap`).
- Touch targets: height 44px (`h-11`).

---

## 9) Theming & brand overrides
- Theme toggle: add/remove `.dark` on `<html>`.
- Fast brand swap: add `.brand-{client}` that overrides key vars (`--interactive-primary`, `--accent`, etc.) in a small CSS file, then set `<html className={`${theme} brand-{client}`}>`.
- Tailwind extension: add new color namespaces in `tailwind.config.js` if you need class-level access.
- New plan tiers: extend badge classes and `BadgePlan` union when adding a tier.
- Per-section overrides: inline CSS vars on a container to localize a palette.

---

## 10) Animation
- Durations: fast 150ms, normal 200ms, slow 300ms.
- Common classes: `animate-fade-in`, `animate-slide-up`, `animate-slide-down`.
- Use `transition-colors duration-fast` for hover/focus; `transition-all duration-normal` for bigger state changes.

---

## 11) Quick import cheat sheet
```tsx
import {
  Page, PageHeader, PageContent, PageActions,
  Card, CardHeader, CardBody, CardFooter,
  Button, Input, Select, Textarea, Toggle,
  Badge, Tabs, TabPanel,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, Alert, Skeleton, Spinner, EmptyState,
} from '@/components/ui';
```

If you need the exact token values, they remain in `tokens.css` and the Tailwind config; this playbook is the "how to design here" guide.
