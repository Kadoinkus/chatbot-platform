import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import Progress from '@/components/ui/Progress';
import { BarChart3, Palette, Brain, Headphones, Play, Pause, Server, Users, Calendar, MoreVertical, Settings, Trash2, Copy } from 'lucide-react';
import type { Assistant, Workspace, PlanType } from '@/types';
import { getClientBrandColor } from '@/lib/brandColors';
import { getNextUsageReset } from '@/lib/billingService';

interface AssistantCardProps {
  assistant: Assistant;
  clientId: string;
  workspaceName?: string;
  workspace?: Workspace;
}

export default function AssistantCard({ assistant, clientId, workspaceName, workspace }: AssistantCardProps) {
  const brandColor = getClientBrandColor(assistant.clientId);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement actual status toggle API call
    console.log(`Toggling assistant ${assistant.id} from ${assistant.status} to ${assistant.status === 'Active' ? 'Paused' : 'Active'}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get usage data from workspace (real data) or fallback to defaults
  const bundleLoads = workspace ? {
    current: workspace.bundleLoads.used,
    limit: workspace.bundleLoads.limit,
    percentage: Math.round((workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100)
  } : {
    current: 0,
    limit: 1000,
    percentage: 0
  };

  // Sessions - client-facing metric (separate from messages)
  const sessionUsage = workspace?.sessions ? {
    current: workspace.sessions.used,
    limit: workspace.sessions.limit,
    percentage: Math.round((workspace.sessions.used / workspace.sessions.limit) * 100)
  } : {
    current: 0,
    limit: 5000,
    percentage: 0
  };

  // Get billing plan from workspace
  const workspacePlan = workspace?.plan || 'starter';
  const hasWalletCredits = workspace && workspace.walletCredits > 0;

  // Calculate days until usage reset (separate from invoice date)
  const usageReset = workspace ? getNextUsageReset(workspace) : null;
  const daysUntilReset = usageReset?.daysUntilReset ?? 0;

  // Check if widget can operate (within limits OR has credits)
  const isOverLimit = bundleLoads.percentage >= 100 || sessionUsage.percentage >= 100;
  const canOperate = !isOverLimit || hasWalletCredits;

  const getPlanBadgeStyle = (plan: PlanType) => {
    switch (plan) {
      case 'custom':
        return 'badge-plan-custom';
      case 'enterprise':
        return 'badge-plan-enterprise';
      case 'premium':
        return 'badge-plan-premium';
      case 'basic':
        return 'badge-plan-basic';
      case 'starter':
      default:
        return 'badge-plan-starter';
    }
  };

  const getPlanDisplayName = (plan: PlanType) => {
    switch (plan) {
      case 'custom':
        return 'Custom';
      case 'enterprise':
        return 'Enterprise';
      case 'premium':
        return 'Premium';
      case 'basic':
        return 'Basic';
      case 'starter':
      default:
        return 'Starter';
    }
  };



  return (
    <div className="card-hover group relative flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="p-6 pb-4 flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundColor: brandColor }}
                >
                  <Image
                    src={assistant.image}
                    alt={assistant.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Status indicator - warning if cannot operate */}
                {!canOperate && (
                  <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-surface-elevated flex items-center justify-center bg-error-600 text-white text-xs font-bold shadow-sm"
                  title="Widget stopped - add credits to continue"
                >
                  !
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-2xl text-foreground">{assistant.name}</h3>
                <StatusBadge status={assistant.status} />
              </div>
              <div className="h-10 flex items-start mt-1">
                <p className="text-sm text-foreground-secondary leading-5 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>{assistant.description}</p>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {workspaceName && (
                  <span className="text-xs text-foreground-tertiary">
                    {workspaceName}
                  </span>
                )}
                {workspaceName && <span className="text-foreground-tertiary">•</span>}
                <span className={`badge ${getPlanBadgeStyle(workspacePlan)}`}>
                  {getPlanDisplayName(workspacePlan)}
                </span>
              </div>
            </div>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              className="p-1 hover:bg-background-hover rounded-lg transition-all duration-200 hover:rotate-90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <MoreVertical size={18} className="text-foreground-tertiary transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-8 w-48 bg-surface-elevated border border-border rounded-lg shadow-lg z-10">
                <Link
                  href={`/app/${clientId}/assistant/${assistant.id}/support`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background-hover"
                >
                  <Headphones size={14} />
                  Support & Tickets
                </Link>
                <Link
                  href={`/app/${clientId}/assistant/${assistant.id}/settings`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background-hover"
                >
                  <Settings size={14} />
                  Operations
                </Link>
                <div className="border-t border-border my-1" />
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background-hover w-full text-left">
                  <Copy size={14} />
                  Duplicate
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-700/20 w-full text-left">
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Usage Indicators - Client-facing: Bundle Loads + Sessions */}
        <div className="space-y-3">
          {/* Bundle Loads */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-foreground-secondary flex items-center gap-1.5">
                <Server size={14} className="text-foreground-tertiary" />
                Bundle Loads
              </span>
              <span className="text-xs text-foreground-secondary">
                {bundleLoads.percentage}%
              </span>
            </div>
            <Progress percentage={bundleLoads.percentage} />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-foreground-tertiary">
                {bundleLoads.current.toLocaleString()} / {bundleLoads.limit.toLocaleString()}
              </span>
              {bundleLoads.percentage >= 100 && hasWalletCredits && (
                <span className="text-xs text-warning-600 dark:text-warning-500 font-medium">
                  Using credits
                </span>
              )}
            </div>
          </div>

          {/* Sessions (Conversations) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-foreground-secondary flex items-center gap-1.5">
                <Users size={14} className="text-foreground-tertiary" />
                Sessions
              </span>
              <span className="text-xs text-foreground-secondary">
                {sessionUsage.percentage}%
              </span>
            </div>
            <Progress percentage={sessionUsage.percentage} />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-foreground-tertiary">
                {(sessionUsage.current / 1000).toFixed(1)}k / {(sessionUsage.limit / 1000).toFixed(0)}k
              </span>
              {sessionUsage.percentage >= 100 && hasWalletCredits && (
                <span className="text-xs text-warning-600 dark:text-warning-500 font-medium">
                  Using credits
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-foreground-tertiary">
            {assistant.conversations} conversations today
          </span>
          {workspace && daysUntilReset > 0 && (
            <span className="text-xs text-foreground-tertiary flex items-center gap-1">
              <Calendar size={12} />
              Resets in {daysUntilReset} days
            </span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-border flex items-center">
        <Link
          href={`/app/${clientId}/assistant/${assistant.id}/analytics`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-background-hover transition-all duration-150 group/link"
        >
          <BarChart3 size={16} className="text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only text-sm font-medium text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150">Analytics</span>
        </Link>

        <div className="w-px h-8 bg-border" />

        <Link
          href={`/app/${clientId}/assistant/${assistant.id}/mascot`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-background-hover transition-all duration-150 group/link"
        >
          <Palette size={16} className="text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only text-sm font-medium text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150">Customize</span>
        </Link>

        <div className="w-px h-8 bg-border" />

        <Link
          href={`/app/${clientId}/assistant/${assistant.id}/brain`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-background-hover transition-all duration-150 group/link"
        >
          <Brain size={16} className="text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only text-sm font-medium text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150">Persona</span>
        </Link>

        <div className="w-px h-8 bg-border" />

        <button
          onClick={handleToggleStatus}
          className={`px-4 py-3 hover:bg-background-hover transition-all duration-150 flex items-center justify-center group/pause ${
            assistant.status === 'Draft' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={assistant.status === 'Draft'}
          title={assistant.status === 'Draft' ? 'Complete setup to enable controls' : assistant.status === 'Active' ? 'Pause Agent' : 'Activate Agent'}
        >
          {assistant.status === 'Active' ? (
            <Pause size={16} className="text-error-600 group-hover/pause:scale-110 transition-transform duration-150" />
          ) : (
            <Play size={16} className="text-success-600 group-hover/pause:scale-110 transition-transform duration-150" />
          )}
        </button>
      </div>
    </div>
  );
}
