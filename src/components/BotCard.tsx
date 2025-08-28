import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { BarChart3, Palette, Brain, Headphones, Play, Pause, Server, MessageCircle, AlertTriangle, MoreVertical, Settings, Trash2, Copy, Box, Square } from 'lucide-react';
import type { Mascot } from '@/lib/data';

interface BotCardProps {
  bot: Mascot;
  clientId: string;
}

export default function BotCard({ bot, clientId }: BotCardProps) {
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
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    if (plan === 'Pro Plan') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (plan === 'Starter') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group relative flex flex-col">
      {/* Header Section */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={bot.image} 
                alt={bot.name}
                className="w-24 h-24 rounded-full bg-gray-100 group-hover:scale-105 transition-transform duration-300"
              />
              {/* 2D/3D Mode Indicator */}
              <button 
                onClick={handleModeToggle}
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all duration-200 hover:scale-110 ${
                  is3DMode ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
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
                <h3 className="font-semibold text-2xl">{bot.name}</h3>
                <StatusBadge status={bot.status} />
              </div>
              <p className="text-sm text-gray-600 mt-1">{bot.description}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${getBillingBadgeStyle(randomPlan, randomBillingType)}`}>
                  {randomBillingType === 'prepaid' ? 'Prepaid Credits' : randomPlan}
                </span>
              </div>
            </div>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:rotate-90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <MoreVertical size={18} className="text-gray-400 transition-transform duration-200" />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <Link 
                  href={`/app/${clientId}/bot/${bot.id}/support`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Headphones size={14} />
                  Support & Tickets
                </Link>
                <Link 
                  href={`/app/${clientId}/bot/${bot.id}/settings`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={14} />
                  Operations
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                  <Copy size={14} />
                  Duplicate Bot
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
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
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Server size={14} className="text-gray-500" />
                Bundle Loads
              </span>
              <span className="text-xs text-gray-600">
                {bundleLoads.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  bundleLoads.percentage < 70 ? 'bg-gray-900' :
                  bundleLoads.percentage < 90 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${bundleLoads.percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {bundleLoads.current.toLocaleString()} / {bundleLoads.limit.toLocaleString()}
              </span>
              {!is3DMode && (
                <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                  <Square size={10} />
                  2D mode active
                </span>
              )}
            </div>
          </div>
          
          {/* Chat Messages */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <MessageCircle size={14} className="text-gray-500" />
                Chat Messages
              </span>
              <span className="text-xs text-gray-600">
                {chatUsage.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  chatUsage.percentage < 70 ? 'bg-gray-900' :
                  chatUsage.percentage < 90 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${chatUsage.percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {(chatUsage.current / 1000).toFixed(1)}k / {(chatUsage.limit / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        {bot.status === 'Live' && (
          <div className="mt-4">
            <span className="text-xs text-gray-500">
              {bot.conversations} conversations today
            </span>
          </div>
        )}
      </div>
      
      {/* Action Bar */}
      <div className="border-t border-gray-100 flex items-center">
        <Link
          href={`/app/${clientId}/bot/${bot.id}/analytics`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-all duration-150 group/link"
        >
          <BarChart3 size={16} className="text-gray-600 group-hover/link:text-gray-900 transition-colors duration-150" />
          <span className="text-sm font-medium text-gray-700 group-hover/link:text-gray-900 transition-colors duration-150">Analytics</span>
        </Link>
        
        <div className="w-px h-8 bg-gray-100" />
        
        <Link
          href={`/app/${clientId}/bot/${bot.id}/mascot`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-all duration-150 group/link"
        >
          <Palette size={16} className="text-gray-600 group-hover/link:text-gray-900 transition-colors duration-150" />
          <span className="text-sm font-medium text-gray-700 group-hover/link:text-gray-900 transition-colors duration-150">Customize</span>
        </Link>
        
        <div className="w-px h-8 bg-gray-100" />
        
        <Link
          href={`/app/${clientId}/bot/${bot.id}/brain`}
          className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-all duration-150 group/link"
        >
          <Brain size={16} className="text-gray-600 group-hover/link:text-gray-900 transition-colors duration-150" />
          <span className="text-sm font-medium text-gray-700 group-hover/link:text-gray-900 transition-colors duration-150">Persona</span>
        </Link>
        
        <div className="w-px h-8 bg-gray-100" />
        
        <button
          onClick={handleToggleStatus}
          className={`px-4 py-3 hover:bg-gray-50 transition-all duration-150 flex items-center justify-center group/pause ${
            bot.status === 'Needs finalization' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={bot.status === 'Needs finalization'}
          title={bot.status === 'Needs finalization' ? 'Complete setup to enable controls' : bot.status === 'Live' ? 'Pause bot' : 'Resume bot'}
        >
          {bot.status === 'Live' ? (
            <Pause size={16} className="text-red-600 group-hover/pause:scale-110 transition-transform duration-150" />
          ) : (
            <Play size={16} className="text-green-600 group-hover/pause:scale-110 transition-transform duration-150" />
          )}
        </button>
      </div>
      
      {/* Mode Switch Warning Modal */}
      {showModeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Square size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Switch to 2D Mode?</h3>
                <p className="text-sm text-gray-600">This will reduce visual quality</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-3">
                Switching to 2D mode will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Reduce bandwidth usage by ~85%</li>
                <li>• Use simpler chat interface</li>
                <li>• Maintain full functionality</li>
                <li>• You can switch back anytime</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelModeSwitch}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeSwitch}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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