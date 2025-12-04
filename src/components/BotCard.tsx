import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Progress from '@/components/ui/Progress';
import { BarChart3, Palette, Brain, Headphones, Play, Pause, Server, MessageCircle, AlertTriangle, MoreVertical, Settings, Trash2, Copy, Box, Square } from 'lucide-react';
import type { Bot } from '@/types';
import { getClientBrandColor } from '@/lib/brandColors';

interface BotCardProps {
  bot: Bot;
  clientId: string;
  workspaceName?: string;
}

export default function BotCard({ bot, clientId, workspaceName }: BotCardProps) {
  const brandColor = getClientBrandColor(bot.clientId);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showModeWarning, setShowModeWarning] = useState(false);
  const [manualMode, setManualMode] = useState<'3d' | '2d' | null>(null);

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement actual status toggle API call
    console.log(`Toggling bot ${bot.id} from ${bot.status} to ${bot.status === 'Live' ? 'Paused' : 'Live'}`);
  };

  const handleModeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If bundle limit exceeded, can only go to 2D
    if (bundleLoads.percentage > 90) {
      alert('Bundle limit exceeded. Bot is automatically in 2D mode until usage decreases.');
      return;
    }
    
    // If currently in 3D, show warning before switching to 2D
    if (is3DMode) {
      setShowModeWarning(true);
    } else {
      // If in 2D, switch back to 3D immediately
      setManualMode('3d');
    }
  };

  const confirmModeSwitch = () => {
    setManualMode('2d');
    setShowModeWarning(false);
  };

  const cancelModeSwitch = () => {
    setShowModeWarning(false);
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

  // Mock bundle loads and chat usage - in production from server metrics
  const bundleLoads = {
    current: Math.floor(Math.random() * 800) + 200,
    limit: 1000,
    percentage: 0
  };
  bundleLoads.percentage = Math.round((bundleLoads.current / bundleLoads.limit) * 100);
  
  const chatUsage = {
    current: Math.floor(Math.random() * 40000) + 5000,
    limit: 50000,
    percentage: 0
  };
  chatUsage.percentage = Math.round((chatUsage.current / chatUsage.limit) * 100);

  // Mock billing plan data - in production this would come from props or API
  const plans = ['Pro Plan', 'Starter', 'Pay-as-you-go', 'Prepaid Credits'];
  const billingTypes = ['subscription', 'prepaid'];
  const randomPlan = plans[Math.floor(Math.random() * plans.length)];
  const randomBillingType = billingTypes[Math.floor(Math.random() * billingTypes.length)];
  
  // Determine 2D/3D mode - in production this would come from props or API
  const autoFallback = bundleLoads.percentage > 90; // Auto switch to 2D if bundle limit exceeded
  const is3DMode = !autoFallback && manualMode !== '2d';
  
  const getBillingBadgeStyle = (plan: string, type: string) => {
    if (type === 'prepaid') {
      return 'badge-plan-enterprise';
    }
    if (plan === 'Pro Plan') {
      return 'badge-plan-premium';
    }
    if (plan === 'Basic') {
      return 'badge-plan-basic';
    }
    return 'badge-plan-starter';
  };



  return (
    <div className="card-hover group relative flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={bot.image}
                alt={bot.name}
                className="w-24 h-24 rounded-full group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: brandColor }}
              />
              {/* 2D/3D Mode Indicator */}
              <button
                onClick={handleModeToggle}
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-surface-elevated flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all duration-200 hover:scale-110 ${
                  is3DMode ? 'bg-success-600 hover:bg-success-700' : 'bg-warning-600 hover:bg-warning-700'
                }`}
                title={`${is3DMode ? '3D Mode Active' : '2D Mode Active'} - Click to ${is3DMode ? 'switch to 2D' : 'switch to 3D'}`}
              >
                {is3DMode ? (
                  <Box size={12} />
                ) : (
                  <Square size={12} />
                )}
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-2xl text-foreground">{bot.name}</h3>
                <StatusBadge status={bot.status} />
              </div>
              <div className="h-10 flex items-start mt-1">
                <p className="text-sm text-foreground-secondary leading-5 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>{bot.description}</p>
              </div>
              <div className="mt-2">
                <span className={`badge ${getBillingBadgeStyle(randomPlan, randomBillingType)}`}>
                  {randomBillingType === 'prepaid' ? 'Prepaid Credits' : randomPlan}
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
                  href={`/app/${clientId}/bot/${bot.id}/support`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background-hover"
                >
                  <Headphones size={14} />
                  Support & Tickets
                </Link>
                <Link
                  href={`/app/${clientId}/bot/${bot.id}/settings`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background-hover"
                >
                  <Settings size={14} />
                  Operations
                </Link>
                <div className="border-t border-border my-1" />
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:bg-background-hover w-full text-left">
                  <Copy size={14} />
                  Duplicate Bot
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-700/20 w-full text-left">
                  <Trash2 size={14} />
                  Delete Bot
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Usage Indicators */}
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
              {!is3DMode && (
                <span className="text-xs text-warning-600 dark:text-warning-500 font-medium flex items-center gap-1">
                  <Square size={10} />
                  2D mode active
                </span>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-foreground-secondary flex items-center gap-1.5">
                <MessageCircle size={14} className="text-foreground-tertiary" />
                Chat Messages
              </span>
              <span className="text-xs text-foreground-secondary">
                {chatUsage.percentage}%
              </span>
            </div>
            <Progress percentage={chatUsage.percentage} />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-foreground-tertiary">
                {(chatUsage.current / 1000).toFixed(1)}k / {(chatUsage.limit / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {bot.status === 'Live' && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-foreground-tertiary">
              {bot.conversations} conversations today
            </span>
            {workspaceName && (
              <span className="text-xs text-foreground-disabled">
                {workspaceName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-t border-border flex items-center">
        <Link
          href={`/app/${clientId}/bot/${bot.id}/analytics`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-background-hover transition-all duration-150 group/link"
        >
          <BarChart3 size={16} className="text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150" />
          <span className="text-sm font-medium text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150">Analytics</span>
        </Link>

        <div className="w-px h-8 bg-border" />

        <Link
          href={`/app/${clientId}/bot/${bot.id}/mascot`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-background-hover transition-all duration-150 group/link"
        >
          <Palette size={16} className="text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150" />
          <span className="text-sm font-medium text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150">Customize</span>
        </Link>

        <div className="w-px h-8 bg-border" />

        <Link
          href={`/app/${clientId}/bot/${bot.id}/brain`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-background-hover transition-all duration-150 group/link"
        >
          <Brain size={16} className="text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150" />
          <span className="text-sm font-medium text-foreground-secondary group-hover/link:text-foreground transition-colors duration-150">Persona</span>
        </Link>

        <div className="w-px h-8 bg-border" />

        <button
          onClick={handleToggleStatus}
          className={`px-4 py-3 hover:bg-background-hover transition-all duration-150 flex items-center justify-center group/pause ${
            bot.status === 'Needs finalization' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={bot.status === 'Needs finalization'}
          title={bot.status === 'Needs finalization' ? 'Complete setup to enable controls' : bot.status === 'Live' ? 'Pause bot' : 'Resume bot'}
        >
          {bot.status === 'Live' ? (
            <Pause size={16} className="text-error-600 group-hover/pause:scale-110 transition-transform duration-150" />
          ) : (
            <Play size={16} className="text-success-600 group-hover/pause:scale-110 transition-transform duration-150" />
          )}
        </button>
      </div>
      
      {/* Mode Switch Warning Modal */}
      {showModeWarning && (
        <div className="fixed inset-0 bg-surface-overlay flex items-center justify-center z-50">
          <div className="bg-surface-elevated rounded-xl p-6 max-w-md mx-4 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-700/30 rounded-full flex items-center justify-center">
                <Square size={20} className="text-warning-600 dark:text-warning-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Switch to 2D Mode?</h3>
                <p className="text-sm text-foreground-secondary">This will reduce visual quality</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-foreground-secondary mb-3">
                Switching to 2D mode will:
              </p>
              <ul className="text-sm text-foreground-tertiary space-y-1 ml-4">
                <li>Reduce bandwidth usage by ~85%</li>
                <li>Use simpler chat interface</li>
                <li>Maintain full functionality</li>
                <li>You can switch back anytime</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelModeSwitch}
                className="btn-secondary flex-1 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeSwitch}
                className="flex-1 px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors"
              >
                Switch to 2D
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}