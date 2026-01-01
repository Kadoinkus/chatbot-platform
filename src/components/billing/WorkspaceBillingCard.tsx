'use client';

import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Bot as BotIcon,
  BarChart3,
  User,
  MessageCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { Workspace, Assistant } from '@/types';
import { getClientBrandColor } from '@/lib/brandColors';
import {
  formatMoney,
  getPlanBadgeType,
  getPlanDisplayConfig,
  getMascotPricing,
  getMascotCost,
} from '@/lib/billingDataService';

export interface WorkspaceBillingCardProps {
  workspace: Workspace;
  assistants: Assistant[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  clientSlug: string;
  mascotTotal: number;
}

export function WorkspaceBillingCard({
  workspace,
  assistants,
  isExpanded,
  onToggleExpand,
  clientSlug,
  mascotTotal,
}: WorkspaceBillingCardProps) {
  const bundleUsagePercent = workspace.bundleLoads.limit
    ? (workspace.bundleLoads.used / workspace.bundleLoads.limit) * 100
    : 0;
  const sessionsUsagePercent = workspace.sessions?.limit
    ? (workspace.sessions.used / workspace.sessions.limit) * 100
    : 0;
  const planConfig = getPlanDisplayConfig(workspace.plan);
  const totalCost = (workspace.monthlyFee || 0) + mascotTotal;

  return (
    <Card padding="none">
      <div
        className="p-6 cursor-pointer hover:bg-background-hover transition-colors"
        onClick={onToggleExpand}
      >
        {/* Compact Summary View */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-foreground">{workspace.name}</h3>
                <Badge plan={getPlanBadgeType(workspace.plan)}>{planConfig.name}</Badge>
                {workspace.status !== 'active' && (
                  <Badge variant="error">{workspace.status.toUpperCase()}</Badge>
                )}
              </div>
              <p className="text-sm text-foreground-secondary">
                {assistants.length} AI assistant{assistants.length !== 1 ? 's' : ''} •{' '}
                {workspace.billingCycle} billing • {workspace.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-foreground-tertiary">Monthly Cost</p>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {totalCost === 0 ? 'Included' : formatMoney(totalCost, 'EUR')}
                </p>
                {mascotTotal > 0 && (
                  <p className="text-xs text-foreground-tertiary">
                    Plan: {formatMoney(workspace.monthlyFee, 'EUR')} + Mascots:{' '}
                    {formatMoney(mascotTotal, 'EUR')}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground-tertiary">Credits</p>
              <p className="text-lg font-semibold text-foreground">
                {formatMoney(workspace.walletCredits, 'EUR')}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp size={20} className="text-foreground-tertiary" />
            ) : (
              <ChevronDown size={20} className="text-foreground-tertiary" />
            )}
          </div>
        </div>

        {/* AI Assistant Summary */}
        {assistants.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
                <BotIcon size={14} />
                {assistants.filter(a => a.status === 'Active').length} active of{' '}
                {assistants.length} AI assistants
              </p>
              <span className="text-xs text-foreground-tertiary">Click to expand</span>
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              {assistants.slice(0, 4).map(assistant => {
                const brandBg = getClientBrandColor(assistant.clientId);
                return (
                  <div
                    key={assistant.id}
                    className="relative flex-shrink-0 w-8 h-8 rounded-full border-2 border-surface-elevated shadow-sm overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: brandBg }}
                  >
                    {assistant.image?.trim() ? (
                      <img
                        src={assistant.image.trim()}
                        alt={assistant.name}
                        className="w-full h-full object-cover"
                        title={`${assistant.name} - ${assistant.status}`}
                      />
                    ) : (
                      <span
                        className="text-xs font-semibold text-white"
                        title={`${assistant.name} - ${assistant.status}`}
                      >
                        {assistant.name.charAt(0)}
                      </span>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-elevated ${
                        assistant.status === 'Active'
                          ? 'bg-success-500'
                          : assistant.status === 'Paused'
                            ? 'bg-warning-500'
                            : 'bg-error-500'
                      }`}
                    />
                  </div>
                );
              })}
              {assistants.length > 4 && (
                <div className="w-8 h-8 bg-background-tertiary rounded-full flex items-center justify-center text-xs text-foreground-secondary font-medium">
                  +{assistants.length - 4}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-3">
            <BotIcon size={16} className="text-foreground-tertiary mx-auto mb-1" />
            <p className="text-sm text-foreground-tertiary">No AI assistants in this workspace</p>
            <button className="text-xs text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400 mt-1">
              + Add first AI Assistant
            </button>
          </div>
        )}
      </div>

      {/* Detailed Expanded View */}
      {isExpanded && (
        <div className="border-t border-border p-6 bg-background-secondary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Detailed Resource Usage */}
            <div>
              <h4 className="text-sm font-semibold text-foreground-secondary mb-4 flex items-center gap-2">
                <BarChart3 size={16} />
                Resource Usage Details
              </h4>
              <div className="space-y-4">
                <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User size={14} className="text-info-600 dark:text-info-500" />
                      Unique Users
                    </span>
                    <span className="text-sm text-foreground-secondary">
                      {workspace.bundleLoads.used.toLocaleString()} /{' '}
                      {workspace.bundleLoads.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${
                        bundleUsagePercent > 90
                          ? 'bg-error-500'
                          : bundleUsagePercent > 70
                            ? 'bg-warning-500'
                            : 'bg-info-500'
                      }`}
                      style={{ width: `${Math.min(100, bundleUsagePercent)}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground-tertiary">
                    €{workspace.overageRates.bundleLoads}/load overage ·{' '}
                    {workspace.bundleLoads.remaining.toLocaleString()} remaining
                  </p>
                </div>

                <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MessageCircle size={14} className="text-plan-premium-text" />
                      Conversations
                    </span>
                    <span className="text-sm text-foreground-secondary">
                      {workspace.sessions?.used.toLocaleString()} /{' '}
                      {workspace.sessions?.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all ${
                        sessionsUsagePercent > 90
                          ? 'bg-error-500'
                          : sessionsUsagePercent > 70
                            ? 'bg-warning-500'
                            : 'bg-plan-premium-text'
                      }`}
                      style={{ width: `${Math.min(100, sessionsUsagePercent)}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground-tertiary">
                    €{workspace.overageRates.sessions}/session overage ·{' '}
                    {workspace.sessions?.remaining.toLocaleString()} remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Workspace AI Assistants & Actions */}
            <div>
              <h4 className="text-sm font-semibold text-foreground-secondary mb-4 flex items-center gap-2">
                <BotIcon size={16} />
                Workspace AI Assistants ({assistants.length})
              </h4>
              {assistants.length > 0 ? (
                <div className="space-y-2 mb-6">
                  {assistants.map(assistant => {
                    const mascotInfo = getMascotPricing(assistant.id);
                    const mascotCost = getMascotCost(assistant.id, workspace.plan);
                    const isIncluded = mascotInfo.type === 'notso-pro' && workspace.plan !== 'starter';

                    return (
                      <div
                        key={assistant.id}
                        className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg border border-border"
                      >
                        {assistant.image?.trim() ? (
                          <img
                            src={assistant.image.trim()}
                            alt={assistant.name}
                            className="w-10 h-10 rounded-full"
                            style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                            style={{ backgroundColor: getClientBrandColor(assistant.clientId) }}
                          >
                            {assistant.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">{assistant.name}</p>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                assistant.status === 'Active'
                                  ? 'bg-success-500'
                                  : assistant.status === 'Paused'
                                    ? 'bg-warning-500'
                                    : 'bg-error-500'
                              }`}
                            />
                          </div>
                          <p className="text-xs text-foreground-tertiary mb-1">
                            {assistant.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-foreground-secondary">
                              {mascotInfo.studioName}
                            </span>
                            {mascotInfo.type === 'notso-pro' && (
                              <Badge variant="info" className="text-xs">
                                Pro
                              </Badge>
                            )}
                            {mascotInfo.type === 'third-party' && (
                              <Badge variant="warning" className="text-xs">
                                3rd Party
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {mascotCost === 0 ? (
                            <span className="text-sm font-medium text-success-600 dark:text-success-500">
                              {isIncluded ? 'Included' : 'Included'}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-foreground">
                              €{mascotCost}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface-elevated rounded-lg border border-border p-6 text-center mb-6">
                  <BotIcon size={32} className="text-foreground-tertiary mx-auto mb-2" />
                  <p className="text-sm text-foreground-tertiary">
                    No AI assistants in this workspace
                  </p>
                </div>
              )}

              {/* Mascot Cost Summary */}
              {assistants.length > 0 && (
                <div className="bg-background-tertiary rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground-secondary">
                      Mascot Costs
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      €{mascotTotal}/mo
                    </span>
                  </div>
                  <div className="text-xs text-foreground-secondary space-y-1">
                    {assistants.filter(a => getMascotCost(a.id, workspace.plan) > 0).length > 0 ? (
                      assistants
                        .filter(a => getMascotCost(a.id, workspace.plan) > 0)
                        .map(assistant => (
                          <div key={assistant.id} className="flex justify-between">
                            <span>
                              {assistant.name} ({getMascotPricing(assistant.id).studioName})
                            </span>
                            <span>€{getMascotCost(assistant.id, workspace.plan)}</span>
                          </div>
                        ))
                    ) : (
                      <span className="text-success-600 dark:text-success-500">
                        All mascots included in plan or free
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Link href={`/app/${clientSlug}/plans`} className="flex-1">
                    <Button fullWidth>Upgrade Plan</Button>
                  </Link>
                  <Button variant="secondary" className="flex-1">
                    Add Credits
                  </Button>
                </div>
                <Link href={`/app/${clientSlug}/workspace/${workspace.slug}`}>
                  <Button variant="secondary" fullWidth>
                    Manage Workspace →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default WorkspaceBillingCard;
