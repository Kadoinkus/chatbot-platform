# Design System Documentation

> **Source Files:**
> - Token definitions: `src/styles/globals.css`
> - Tailwind extension: `tailwind.config.js`
> - Token reference: `src/styles/tokens.css`
> - UI Components: `src/components/ui/`
> - Class reference: `src/lib/uiClasses.ts`

---

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Component Usage Rules](#component-usage-rules)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Theming & Customization](#theming--customization)

---

## Color Tokens

### Core Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bg-primary` | `#FFFFFF` | `#111827` | Main background |
| `--bg-secondary` | `#F9FAFB` | `#1F2937` | Secondary surfaces, table headers |
| `--bg-tertiary` | `#F3F4F6` | `#374151` | Tertiary surfaces, skeletons |
| `--bg-hover` | `#F3F4F6` | `#1F2937` | Hover states |
| `--bg-active` | `#E5E7EB` | `#374151` | Active/pressed states |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--text-primary` | `#111827` | `#F9FAFB` | Primary text, headings |
| `--text-secondary` | `#4B5563` | `#9CA3AF` | Secondary text, descriptions |
| `--text-tertiary` | `#6B7280` | `#6B7280` | Muted text, placeholders |
| `--text-disabled` | `#9CA3AF` | `#4B5563` | Disabled states |

### Border Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--border-primary` | `#E5E7EB` | `#374151` | Default borders |
| `--border-secondary` | `#D1D5DB` | `#4B5563` | Emphasized borders |
| `--border-focus` | `#111827` | `#9CA3AF` | Focus rings |

### Interactive Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--interactive-primary` | `#111827` | `#FFFFFF` | Primary buttons |
| `--interactive-primary-hover` | `#374151` | `#E5E7EB` | Primary hover |
| `--interactive-secondary` | `#F3F4F6` | `#1F2937` | Secondary buttons |
| `--interactive-secondary-hover` | `#E5E7EB` | `#374151` | Secondary hover |

### Semantic Colors (Consistent Across Themes)

```
Success (Green)
├── 50:  #ECFDF5  (light bg)
├── 100: #D1FAE5  (border light)
├── 500: #10B981  (primary)
├── 600: #059669  (text light mode)
├── 700: #047857  (dark)

Warning (Amber)
├── 50:  #FFFBEB  (light bg)
├── 100: #FEF3C7  (border light)
├── 500: #F59E0B  (primary)
├── 600: #D97706  (text light mode)
├── 700: #B45309  (dark)

Error (Red)
├── 50:  #FEF2F2  (light bg)
├── 100: #FEE2E2  (border light)
├── 500: #EF4444  (primary)
├── 600: #DC2626  (text light mode)
├── 700: #B91C1C  (dark)

Info (Blue)
├── 50:  #EFF6FF  (light bg)
├── 100: #DBEAFE  (border light)
├── 500: #3B82F6  (primary)
├── 600: #2563EB  (text light mode)
├── 700: #1D4ED8  (dark)
```

### Plan Badge Colors

| Plan | Light BG | Light Text | Dark BG | Dark Text |
|------|----------|------------|---------|-----------|
| Starter | `#F3F4F6` | `#374151` | `#374151` | `#E5E7EB` |
| Growth | `#DBEAFE` | `#1D4ED8` | `#1E3A5F` | `#93C5FD` |
| Premium | `#F3E8FF` | `#7C3AED` | `#4C1D95` | `#C4B5FD` |
| Enterprise | `#FFEDD5` | `#C2410C` | `#7C2D12` | `#FDBA74` |

### Sidebar Colors

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--sidebar-bg` | `#000000` | `#0c1425` |
| `--sidebar-text` | `#9CA3AF` | `#94a3b8` |
| `--sidebar-text-active` | `#FFFFFF` | `#FFFFFF` |
| `--sidebar-item-hover` | `rgba(255,255,255,0.08)` | `rgba(59,130,246,0.1)` |

---

## Typography

### Font Families

```css
--font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: JetBrains Mono, Menlo, Monaco, Consolas, monospace;
```

### Type Scale

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Labels, badges, timestamps |
| `text-sm` | 14px | 20px | 400 | Secondary text, helper text |
| `text-base` | 16px | 24px | 400 | Body text |
| `text-lg` | 18px | 28px | 600 | Section titles |
| `text-xl` | 20px | 28px | 600 | Card titles |
| `text-2xl` | 24px | 32px | 700 | Page titles (mobile) |
| `text-3xl` | 30px | 36px | 700 | Page titles (desktop) |

### Typography Hierarchy

```
Page Title:       text-2xl lg:text-3xl font-bold text-foreground
Section Title:    text-lg font-semibold text-foreground
Card Title:       text-xl font-semibold text-foreground
Body Text:        text-base text-foreground
Secondary Text:   text-sm text-foreground-secondary
Muted Text:       text-sm text-foreground-tertiary
Label:            text-sm font-medium text-foreground
Helper Text:      text-sm text-foreground-tertiary
Error Text:       text-sm text-error-600 dark:text-error-500
```

### When to Use Each

| Context | Style |
|---------|-------|
| Page headers | `text-2xl lg:text-3xl font-bold` |
| Card/section headers | `text-lg font-semibold` |
| Form labels | `text-sm font-medium` (use `.label` class) |
| Descriptions | `text-foreground-secondary` |
| Timestamps | `text-xs text-foreground-tertiary` |
| Code/IDs | `font-mono text-sm` |

---

## Spacing

### Spacing Scale

| Token | Value | Pixels |
|-------|-------|--------|
| `0` | 0 | 0px |
| `0.5` | 0.125rem | 2px |
| `1` | 0.25rem | 4px |
| `1.5` | 0.375rem | 6px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `10` | 2.5rem | 40px |
| `12` | 3rem | 48px |
| `16` | 4rem | 64px |

### Spacing Rules by Context

| Context | Spacing | Example |
|---------|---------|---------|
| **Page padding** | `p-4 lg:p-8` | 16px mobile, 32px desktop |
| **Card padding** | `p-4 lg:p-6` | 16px mobile, 24px desktop |
| **Section gap** | `gap-6` | 24px between major sections |
| **Card gap** | `gap-4` | 16px between cards in grid |
| **Form field gap** | `gap-4` or `space-y-4` | 16px between form fields |
| **Button gap** | `gap-2` or `gap-3` | 8-12px between buttons |
| **Icon to text** | `gap-2` | 8px (built into Button) |
| **Badge padding** | `px-2.5 py-1` | 10px × 4px |
| **Table cell** | `px-6 py-4` | 24px × 16px |

### Layout Spacing Patterns

```tsx
// Page container
<div className="container max-w-7xl mx-auto p-4 lg:p-8">

// Card grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

// Form sections
<div className="space-y-6">
  <div className="space-y-4">
    {/* form fields */}
  </div>
</div>

// Action buttons
<div className="flex items-center gap-3">
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-none` | 0 | Rarely used |
| `rounded-sm` | 2px | Rarely used |
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Rarely used |
| `rounded-lg` | 8px | **Buttons**, small cards |
| `rounded-xl` | 12px | **Inputs, selects** |
| `rounded-2xl` | 16px | **Cards, modals** |
| `rounded-full` | 9999px | **Badges, avatars, pills** |

### Radius Rules

| Component | Radius |
|-----------|--------|
| Cards, Modals | `rounded-2xl` |
| Inputs, Selects, Textareas | `rounded-xl` |
| Buttons | `rounded-lg` |
| Badges, Tags | `rounded-full` |
| Avatars | `rounded-full` |
| Dropdowns | `rounded-lg` |

---

## Shadows

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` | `0 1px 2px rgb(0 0 0 / 0.3)` |
| `shadow` | `0 1px 3px rgb(0 0 0 / 0.1)` | `0 1px 3px rgb(0 0 0 / 0.4)` |
| `shadow-md` | `0 4px 6px rgb(0 0 0 / 0.1)` | `0 4px 6px rgb(0 0 0 / 0.4)` |
| `shadow-lg` | `0 10px 15px rgb(0 0 0 / 0.1)` | `0 10px 15px rgb(0 0 0 / 0.4)` |
| `shadow-xl` | `0 20px 25px rgb(0 0 0 / 0.1)` | `0 20px 25px rgb(0 0 0 / 0.4)` |

### Shadow Usage

| Component | Shadow |
|-----------|--------|
| Cards | `shadow-sm` |
| Cards on hover | `shadow-md` |
| Dropdowns | `shadow-lg` |
| Modals | `shadow-xl` |
| Floating buttons | `shadow-md` |

---

## Component Usage Rules

### Buttons

| Variant | When to Use |
|---------|------------|
| `primary` | Main action (Save, Submit, Create) |
| `secondary` | Secondary action (Cancel, Back, Filter) |
| `ghost` | Tertiary action, in-context actions |
| `danger` | Destructive action (Delete, Remove) |

**Button Placement:**
- Primary action on the **right** in dialogs/forms
- Cancel/secondary on the **left**
- In page headers, primary on far right

**Button Sizes:**
- `sm` (h-9): Compact UIs, inline actions
- `md` (h-11): **Default**, most buttons
- `lg` (h-12): Hero sections, CTAs

### Badges

| Type | When to Use |
|------|------------|
| **Status badges** (`<Badge status="live">`) | Bot status, process status |
| **Plan badges** (`<Badge plan="premium">`) | Subscription tiers |
| **Semantic variants** (`<Badge variant="success">`) | Tags, labels, counts |
| **Default** | Neutral tags, categories |

**With Status Dots:**
```tsx
// Use dot for status that can change
<Badge status="live" />  // Has built-in dot

// Manual dot for custom badges
<Badge variant="success" dot>Connected</Badge>
```

### Alerts

| Variant | When to Use |
|---------|------------|
| `info` | Informational messages, tips |
| `success` | Confirmation, completed actions |
| `warning` | Caution, requires attention |
| `error` | Errors, failed actions |

**Alert Placement:**
- Page-level: Top of content area
- Form-level: Above or below form
- Inline: Near the relevant element

### Cards

| Pattern | When to Use |
|---------|------------|
| Basic `<Card>` | Content sections |
| `<Card hover>` | Clickable/selectable items |
| With `CardHeader` | Titled sections with actions |
| Stats cards | KPI display (single metric + label) |

### Form Controls

| Component | When to Use |
|-----------|------------|
| `<Input>` | Single-line text |
| `<Input type="email/password/number">` | Specific data types |
| `<Select>` | Predefined options (< 10 items) |
| `<Textarea>` | Multi-line text |
| `<Toggle>` | On/off settings |

**Select Width:**
- Filter bars: auto-width (default)
- Forms: full-width (`fullWidth` prop)

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Default | < 640px | Mobile |
| `sm:` | ≥ 640px | Large mobile / small tablet |
| `md:` | ≥ 768px | Tablet |
| `lg:` | ≥ 1024px | Desktop |
| `xl:` | ≥ 1280px | Large desktop |
| `2xl:` | ≥ 1536px | Extra large |

### Common Patterns

```tsx
// Sidebar visibility
<div className="lg:hidden">Mobile menu button</div>
<div className="hidden lg:flex">Desktop sidebar</div>

// Grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Page padding
<div className="p-4 lg:p-8 pt-20 lg:pt-8">

// Text size
<h1 className="text-2xl lg:text-3xl">

// Card padding
<div className="p-4 lg:p-6">
```

### Layout Widths

| Component | Width |
|-----------|-------|
| Page container | `max-w-7xl` (1280px) |
| Content area | `max-w-4xl` (896px) |
| Form | `max-w-md` (448px) |
| Modal (sm) | `max-w-sm` (384px) |
| Modal (md) | `max-w-md` (448px) |
| Modal (lg) | `max-w-lg` (512px) |

### Mobile Considerations

- Sidebar collapses to hamburger menu at `lg:` breakpoint
- Touch targets minimum 44px (`h-11`)
- Cards stack vertically on mobile
- Filter bars wrap on mobile (`flex-wrap`)

---

## Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
/* Buttons */
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interactive

/* Inputs */
focus:ring-2 focus:ring-interactive focus:border-transparent

/* Links */
focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2
```

### Icon-Only Buttons

**Required:** Always add `aria-label` for icon-only buttons:

```tsx
// ❌ Bad
<button onClick={onClose}>
  <X size={20} />
</button>

// ✅ Good
<button onClick={onClose} aria-label="Close modal">
  <X size={20} />
</button>

// ✅ With Button component
<Button icon={<X size={18} />} aria-label="Close" />
```

### Form Inputs

**Required attributes:**

```tsx
// Labels (handled by Input component)
<Input label="Email" />  // Auto-generates id and htmlFor

// Error states
<Input
  error
  errorMessage="This field is required"  // Linked via aria-describedby
/>

// Disabled states
<Input disabled />  // Sets aria-disabled implicitly
```

### Color Contrast

| Context | Minimum Ratio |
|---------|---------------|
| Body text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |

All semantic colors meet WCAG AA contrast requirements.

### ARIA Patterns

```tsx
// Modals
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Alerts
<div role="alert">

// Tabs
<button role="tab" aria-selected={isActive} aria-controls="panel-id">
<div role="tabpanel" aria-labelledby="tab-id">

// Tables
<table> // Native semantics sufficient

// Loading states
<div aria-busy="true" aria-live="polite">
<Spinner aria-label="Loading" />
```

### Keyboard Navigation

| Component | Keys |
|-----------|------|
| Buttons | `Enter`, `Space` |
| Modals | `Escape` to close |
| Tabs | `Arrow Left/Right` |
| Select | `Arrow Up/Down`, `Enter` |
| Toggle | `Space` |

---

## Theming & Customization

### How Theming Works

1. CSS variables defined in `:root` (light) and `.dark` (dark mode)
2. Tailwind config extends theme with variable references
3. Components use Tailwind classes that resolve to variables
4. Theme toggle adds/removes `.dark` class on `<html>`

### Adding a New Brand Palette

To add client-specific branding:

**Option 1: CSS Variable Override (Recommended)**

```css
/* styles/brands/acme.css */
.brand-acme {
  --interactive-primary: #FF6B00;
  --interactive-primary-hover: #E55F00;
  --accent: #FF6B00;
  --accent-hover: #E55F00;
}

.brand-acme.dark {
  --interactive-primary: #FF8533;
  --interactive-primary-hover: #FF6B00;
}
```

Apply with:
```tsx
<html className={`${theme} brand-${clientId}`}>
```

**Option 2: Tailwind Theme Extension**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
        }
      }
    }
  }
}
```

### Creating a New Semantic Color

1. Add to CSS variables:
```css
:root {
  --new-color-50: #...;
  --new-color-500: #...;
  --new-color-700: #...;
}
.dark {
  /* dark mode values */
}
```

2. Add to Tailwind config:
```js
colors: {
  newColor: {
    50: 'var(--new-color-50)',
    500: 'var(--new-color-500)',
    700: 'var(--new-color-700)',
  }
}
```

3. Use in components:
```tsx
<div className="bg-newColor-50 text-newColor-700">
```

### Adding a New Plan Tier

1. Add CSS variables:
```css
:root {
  --plan-ultimate-bg: #...;
  --plan-ultimate-text: #...;
  --plan-ultimate-border: #...;
}
```

2. Add CSS class:
```css
.badge-plan-ultimate {
  background-color: var(--plan-ultimate-bg);
  color: var(--plan-ultimate-text);
  border: 1px solid var(--plan-ultimate-border);
}
```

3. Update Badge component:
```tsx
// components/ui/Badge.tsx
export type BadgePlan = 'starter' | 'growth' | 'premium' | 'enterprise' | 'ultimate';

const planClasses: Record<BadgePlan, string> = {
  // ... existing
  ultimate: 'badge-plan-ultimate',
};
```

### Overriding Tokens Per Page/Section

```tsx
// Apply overrides to a section
<div style={{
  '--bg-primary': '#custom',
  '--text-primary': '#custom',
} as React.CSSProperties}>
  {/* Content uses custom colors */}
</div>
```

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-dropdown` | 10 | Dropdown menus |
| `z-sticky` | 20 | Sticky headers |
| `z-fixed` | 30 | Fixed elements |
| `z-modal-backdrop` | 40 | Modal backdrop |
| `z-modal` | 50 | Modal content |
| `z-popover` | 60 | Popovers |
| `z-tooltip` | 70 | Tooltips |
| `z-toast` | 80 | Toast notifications |

---

## Animation

### Transition Durations

| Token | Duration | Usage |
|-------|----------|-------|
| `duration-fast` | 150ms | Hover, focus |
| `duration-normal` | 200ms | Standard transitions |
| `duration-slow` | 300ms | Complex animations |

### Animation Classes

```css
.animate-fade-in    /* Fade from 0 to 1 opacity */
.animate-slide-up   /* Slide up with fade */
.animate-slide-down /* Slide down with fade */
```

### Transition Patterns

```tsx
// Color transitions (built into components)
transition-colors duration-fast

// All properties
transition-all duration-normal

// Transform
transition-transform duration-fast
```

---

## Quick Reference

### Most Used Classes

```
Backgrounds:  bg-background, bg-surface-elevated, bg-background-secondary
Text:         text-foreground, text-foreground-secondary, text-foreground-tertiary
Borders:      border-border, rounded-2xl (cards), rounded-xl (inputs), rounded-lg (buttons)
Buttons:      btn-primary, btn-secondary, btn-ghost, btn-danger
Forms:        input, select, toggle
Cards:        card, card-hover
Badges:       badge, badge-plan-*, status variants
Tables:       data-table
Layout:       container max-w-7xl mx-auto, p-4 lg:p-8
```

### Component Import

```tsx
import {
  Button,
  Input,
  Select,
  Textarea,
  Toggle,
  Badge,
  Card, CardHeader, CardBody, CardFooter,
  Tabs, TabPanel,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal,
  Alert,
  Skeleton, Spinner, EmptyState,
  Page, PageHeader, PageContent, PageActions,
} from '@/components/ui';
```
