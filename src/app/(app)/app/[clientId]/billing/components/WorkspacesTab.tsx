'use client';

import { Plus, Layers, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, Skeleton, EmptyState, Alert } from '@/components/ui';
import { WorkspaceBillingCard } from '@/components/billing';
import type { Workspace, Assistant } from '@/types';

interface WorkspacesTabProps {
  clientId: string;
  clientSlug: string;
  workspaces: Workspace[];
  workspaceAssistants: Record<string, Assistant[]>;
  expandedWorkspaces: Set<string>;
  onToggleExpand: (workspaceId: string) => void;
  getMascotTotal: (workspaceSlug: string, plan: string) => number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Workspaces tab - Billing per workspace with expandable details
 */
export function WorkspacesTab({
  clientId,
  clientSlug,
  workspaces,
  workspaceAssistants,
  expandedWorkspaces,
  onToggleExpand,
  getMascotTotal,
  isLoading = false,
  error = null,
  onRetry,
}: WorkspacesTabProps) {
  if (isLoading) {
    return <WorkspacesTabSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Failed to load workspaces">
        <p className="mt-1">{error}</p>
        {onRetry && (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<RefreshCw size={14} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </Alert>
    );
  }

  if (workspaces.length === 0) {
    return (
      <EmptyState
        icon={<Layers size={48} />}
        title="No workspaces yet"
        message="Create your first workspace to start managing billing."
        action={
          <Link href={`/app/${clientId}/home`}>
            <Button icon={<Plus size={16} />}>Create Workspace</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count and action */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Layers size={24} />
          Your Workspaces ({workspaces.length})
        </h2>
        <Link href={`/app/${clientId}/home`}>
          <Button icon={<Plus size={18} />}>New Workspace</Button>
        </Link>
      </div>

      {/* Workspace Cards */}
      <div className="space-y-4">
        {workspaces.map((workspace) => (
          <WorkspaceBillingCard
            key={workspace.id}
            workspace={workspace}
            assistants={workspaceAssistants[workspace.slug] || []}
            isExpanded={expandedWorkspaces.has(workspace.id)}
            onToggleExpand={() => onToggleExpand(workspace.id)}
            clientSlug={clientSlug}
            mascotTotal={getMascotTotal(workspace.slug, workspace.plan)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loading state for Workspaces tab
 */
function WorkspacesTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height="1.75rem" width="200px" />
        <Skeleton height="2.5rem" width="150px" rounded="lg" />
      </div>

      {/* Card skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton height="3rem" width="3rem" rounded="lg" />
              <div>
                <Skeleton height="1.25rem" width="150px" className="mb-2" />
                <Skeleton height="1rem" width="100px" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton height="1.5rem" width="80px" rounded="full" />
              <Skeleton height="2rem" width="2rem" rounded="md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default WorkspacesTab;
