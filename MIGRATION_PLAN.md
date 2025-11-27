# Design System Migration Plan

## Overview

Migrate all pages from raw Tailwind classes to `@/components/ui` primitives while normalizing layouts, enforcing consistency, and ensuring accessibility.

---

## Phase 1: High-Traffic Page Migration

### Priority Order
1. **Dashboard Home** (`/app/[clientId]/home`)
2. **All Bots** (`/app/[clientId]`)
3. **Workspace Detail** (`/app/[clientId]/workspace/[workspaceId]`)
4. **Users** (`/app/[clientId]/users`)
5. **Team** (`/app/[clientId]/team`)
6. **Billing** (`/app/[clientId]/billing`)
7. **Plans** (`/app/[clientId]/plans`)

### Migration Tasks Per Page

For each page, apply these changes:

#### Layout Normalization
- [ ] Wrap with `<Page>` component
- [ ] Replace header section with `<PageHeader title="..." description="..." actions={...} />`
- [ ] Wrap content with `<PageContent maxWidth="7xl">`
- [ ] Ensure consistent `pt-20 lg:pt-8` for mobile menu clearance

#### Component Replacements
- [ ] `<button className="btn-primary">` → `<Button>`
- [ ] `<button className="btn-secondary">` → `<Button variant="secondary">`
- [ ] `<input className="input">` → `<Input>`
- [ ] `<select className="select">` → `<Select options={[...]}>`
- [ ] `<div className="card">` → `<Card>`
- [ ] Status badges → `<Badge status="live|paused|..." />`
- [ ] Plan badges → `<Badge plan="starter|growth|..." />`
- [ ] Manual tabs → `<Tabs>` / `<TabPanel>`

#### Feedback Components
- [ ] Loading spinners → `<Spinner />`
- [ ] Skeleton loaders → `<Skeleton />`
- [ ] Empty states → `<EmptyState />`
- [ ] Alert banners → `<Alert variant="info|success|warning|error">`

---

## Phase 2: Secondary Pages Migration

### Pages
- [ ] Conversations (`/app/[clientId]/conversations`)
- [ ] Analytics (`/app/[clientId]/analytics`)
- [ ] Settings (`/app/[clientId]/settings`)
- [ ] Marketplace (`/app/[clientId]/marketplace`)
- [ ] Checkout (`/app/[clientId]/checkout`)

### Bot Detail Pages
- [ ] Bot Overview (`/app/[clientId]/bot/[botId]`)
- [ ] Bot Analytics (`/app/[clientId]/bot/[botId]/analytics`)
- [ ] Bot Brain (`/app/[clientId]/bot/[botId]/brain`)
- [ ] Bot Mascot (`/app/[clientId]/bot/[botId]/mascot`)
- [ ] Bot Settings (`/app/[clientId]/bot/[botId]/settings`)
- [ ] Bot Support (`/app/[clientId]/bot/[botId]/support`)
- [ ] Bot Chat (`/app/[clientId]/bot/[botId]/chat`)

### Auth & Static Pages
- [ ] Login (`/login`)
- [ ] Profile (`/profile`)
- [ ] Help (`/help`)

---

## Phase 3: Consistency Enforcement

### ESLint Rule Setup

Create `.eslintrc.rules.js` with custom rule to flag raw class usage:

```js
// Flag these patterns outside components/ui/
const flaggedPatterns = [
  'btn-primary', 'btn-secondary', 'btn-ghost', 'btn-danger',
  'className="card"', 'className="input"', 'className="select"',
  'className="badge"', 'className="alert-',
];
```

**Allowed exceptions:**
- `src/components/ui/*` (primitive definitions)
- `src/lib/uiClasses.ts` (documentation)
- `src/styles/globals.css` (class definitions)

### Migration Checklist Template

For each page, verify:
- [ ] No raw `btn-*` classes
- [ ] No raw `input`/`select` classes
- [ ] No raw `card` class (use `<Card>`)
- [ ] No inline status styling (use `<Badge>`)
- [ ] Uses `<Page>` wrapper
- [ ] Uses `<PageHeader>` for title section
- [ ] Loading states use `<Spinner>` or `<Skeleton>`
- [ ] Empty states use `<EmptyState>`
- [ ] Alerts use `<Alert>`

---

## Phase 4: Token Verification

### Tasks
- [ ] Audit `globals.css` variables against `DESIGN_SYSTEM.md`
- [ ] Audit `tailwind.config.js` theme extension
- [ ] Verify no hardcoded colors in component files
- [ ] Test light/dark mode toggle on all pages

### Visual Verification Options

**Option A: Quick Token Page**
Create `/dev/tokens` route (dev only) that displays:
- Color swatches (all tokens)
- Typography samples
- Spacing visualization
- Component showcase

**Option B: Storybook**
- More effort to set up
- Better for ongoing development
- Defer unless team needs it

---

## Phase 5: Accessibility Sweep

### Per-Page Audit

- [ ] All icon-only buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Error messages linked via `aria-describedby`
- [ ] Focus visible on all interactive elements
- [ ] Modals trap focus and close on Escape
- [ ] Color contrast passes WCAG AA

### Keyboard Navigation Test

For each page:
- [ ] Tab through all interactive elements
- [ ] Verify focus order is logical
- [ ] Test Enter/Space on buttons
- [ ] Test Escape on modals
- [ ] Test arrow keys on tabs/selects

---

## Phase 6: Theming Hooks (If Needed)

### Per-Client Branding

1. Create brand override structure:
```
src/styles/brands/
├── _template.css
├── client-acme.css
└── client-techcorp.css
```

2. Brand file template:
```css
.brand-acme {
  --interactive-primary: #FF6B00;
  --interactive-primary-hover: #E55F00;
  --sidebar-bg: #1a0a00;
}
.brand-acme.dark {
  --interactive-primary: #FF8533;
}
```

3. Apply in layout:
```tsx
<html className={cn(theme, clientBrand && `brand-${clientBrand}`)}>
```

4. Test with at least 2 brand variations

---

## Phase 7: Cleanup

### After Migration Complete

- [ ] Remove unused CSS classes from `globals.css`
- [ ] Delete any local component copies
- [ ] Update imports across codebase
- [ ] Run final build to verify no breaking changes
- [ ] Document any exceptions/edge cases

---

## Progress Tracking

### Migration Status

| Page | Layout | Buttons | Inputs | Cards | Badges | Loading | Accessible |
|------|--------|---------|--------|-------|--------|---------|------------|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| All Bots | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Workspace | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Team | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Billing | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ | ⬜ |
| Plans | ✅ | ✅ | ⬜ | ✅ | ⬜ | ✅ | ⬜ |
| Conversations | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Analytics | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Settings | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Marketplace | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Checkout | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Overview | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Analytics | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Brain | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Mascot | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Settings | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Support | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bot Chat | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Login | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Profile | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Help | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Legend:** ⬜ Not started | 🟡 In progress | ✅ Complete

---

## Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1 (High-traffic) | ~4-6 hours | 7 pages, most reuse |
| Phase 2 (Secondary) | ~6-8 hours | 14 pages, more complex |
| Phase 3 (Enforcement) | ~1 hour | ESLint rule setup |
| Phase 4 (Tokens) | ~1-2 hours | Audit + verification |
| Phase 5 (Accessibility) | ~2-3 hours | Audit + fixes |
| Phase 6 (Theming) | ~1-2 hours | If needed |
| Phase 7 (Cleanup) | ~1 hour | Final sweep |

**Total: ~16-23 hours**

---

## Next Action

Ready to start? Begin with Phase 1, Page 1: **Dashboard Home** (`/app/[clientId]/home`)
