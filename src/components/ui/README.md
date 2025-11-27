# UI Kit

A collection of reusable UI primitives that wrap the design system's CSS classes.

## Quick Start

```tsx
import { Button, Input, Card, Badge } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <Input label="Name" placeholder="Enter name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

## Components

### Form Controls

#### Button
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
<Button icon={<Plus size={18} />}>Add Item</Button>
<Button loading>Saving...</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button fullWidth>Full Width</Button>
```

#### Input
```tsx
<Input placeholder="Basic input" />
<Input label="Email" type="email" />
<Input icon={<Search size={20} />} placeholder="Search..." />
<Input error errorMessage="This field is required" />
<Input helperText="Enter your full name" />
```

#### Select
```tsx
<Select
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
/>
<Select placeholder="Choose..." options={options} />
<Select label="Country" fullWidth options={countries} />
```

#### Textarea
```tsx
<Textarea placeholder="Enter description..." />
<Textarea label="Bio" rows={4} />
<Textarea resizable />
```

#### Toggle
```tsx
<Toggle checked={enabled} onChange={...} />
<Toggle label="Enable notifications" />
<Toggle label="Dark mode" description="Enable dark theme" />
```

### Display Components

#### Badge
```tsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge status="live" />
<Badge status="paused" />
<Badge plan="premium">Premium</Badge>
<Badge dot variant="success">Active</Badge>
```

#### Card
```tsx
<Card>Basic card content</Card>
<Card hover>Hoverable card</Card>
<Card padding="lg">Large padding</Card>

<Card padding="none">
  <CardHeader title="Settings" description="Manage your preferences" />
  <CardBody>Content here</CardBody>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

#### Tabs
```tsx
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

<Tabs tabs={tabs} defaultTab="overview">
  <TabPanel tabId="overview">Overview content</TabPanel>
  <TabPanel tabId="settings">Settings content</TabPanel>
</Tabs>
```

#### Table
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
      <TableCell><Badge status="live" /></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Feedback Components

#### Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="This action cannot be undone"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  Are you sure you want to delete this item?
</Modal>
```

#### Alert
```tsx
<Alert variant="info" title="Note">Informational message</Alert>
<Alert variant="success">Operation completed successfully</Alert>
<Alert variant="warning">Please review before continuing</Alert>
<Alert variant="error" dismissible onDismiss={...}>An error occurred</Alert>
```

#### Skeleton & Spinner
```tsx
<Skeleton width="100%" height="1rem" />
<Skeleton width="3rem" height="3rem" rounded="full" />
<Spinner size="lg" />
```

#### EmptyState
```tsx
<EmptyState
  icon={<FileText size={48} />}
  title="No documents"
  message="Upload your first document to get started"
  action={<Button>Upload Document</Button>}
/>
```

### Layout Components

#### Page
```tsx
<Page>
  <PageContent>
    <PageHeader
      title="Dashboard"
      description="Welcome back!"
      actions={<Button>New Item</Button>}
    />
    {/* Page content */}
  </PageContent>
</Page>
```

## Design Tokens

All components use CSS variables defined in `styles/tokens.css`. Key tokens:

- **Colors**: `bg-background`, `text-foreground`, `border-border`
- **Semantic**: `success-*`, `warning-*`, `error-*`, `info-*`
- **Interactive**: `bg-interactive`, `bg-interactive-secondary`
- **Surfaces**: `bg-surface-elevated`, `bg-background-secondary`

## Class Reference

For edge cases where primitives don't fit, use the canonical classes from `lib/uiClasses.ts`:

```tsx
import { buttonClasses, cardClasses } from '@/lib/uiClasses';

<button className={buttonClasses.primary}>Custom Button</button>
```

## Migration Guide

Replace raw class usage with primitives:

```tsx
// Before
<button className="btn-primary px-4 py-2">
  <Plus size={20} />
  Add
</button>

// After
<Button icon={<Plus size={18} />}>Add</Button>
```

```tsx
// Before
<input className="input pl-10" ... />

// After
<Input icon={<Search size={20} />} ... />
```

```tsx
// Before
<div className="card p-6">...</div>

// After
<Card>...</Card>
```
