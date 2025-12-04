// UI Primitives - Design System Components
// =========================================
// These components wrap existing CSS classes to provide
// consistent, type-safe interfaces for the design system.

// Form Controls
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Input, type InputProps } from './Input';
export { Select, type SelectProps, type SelectOption } from './Select';
export { Textarea, type TextareaProps } from './Textarea';
export { Toggle, type ToggleProps } from './Toggle';

// Display Components
export { Badge, type BadgeProps, type BadgeVariant, type BadgePlan, type BadgeStatus } from './Badge';
export { Card, CardHeader, CardBody, CardFooter, type CardProps, type CardHeaderProps, type CardBodyProps, type CardFooterProps } from './Card';
export { Tabs, TabPanel, type TabsProps, type TabPanelProps, type TabItem } from './Tabs';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
} from './Table';

// Feedback Components
export { Modal, type ModalProps } from './Modal';
export { Alert, type AlertProps, type AlertVariant } from './Alert';
export { Skeleton, Spinner, EmptyState, type SkeletonProps, type SpinnerProps, type EmptyStateProps } from './Skeleton';
export { PageSkeleton } from './PageSkeleton';

// Layout Components
export { Page, PageHeader, PageActions, PageContent, type PageProps, type PageHeaderProps, type PageActionsProps, type PageContentProps } from './Page';
