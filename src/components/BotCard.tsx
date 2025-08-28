import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { MessageSquare, Clock, TrendingUp, BarChart3, Palette, Brain, Headphones, Play, Pause } from 'lucide-react';
import type { Mascot } from '@/lib/data';

interface BotCardProps {
  bot: Mascot;
  clientId: string;
}

export default function BotCard({ bot, clientId }: BotCardProps) {
  const handleActionClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = path;
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement actual status toggle API call
    console.log(`Toggling bot ${bot.id} from ${bot.status} to ${bot.status === 'Live' ? 'Paused' : 'Live'}`);
  };

  // Mock usage data - in production this would come from props or API
  const usage = Math.floor(Math.random() * 100);
  const getUsageColor = () => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Mock billing plan data - in production this would come from props or API
  const plans = ['Pro Plan', 'Starter', 'Pay-as-you-go', 'Prepaid Credits'];
  const billingTypes = ['subscription', 'prepaid'];
  const randomPlan = plans[Math.floor(Math.random() * plans.length)];
  const randomBillingType = billingTypes[Math.floor(Math.random() * billingTypes.length)];
  
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
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all group">
      <Link href={`/app/${clientId}/bot/${bot.id}/analytics`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={bot.image} 
                alt={bot.name}
                className="w-16 h-16 rounded-full bg-gray-100 group-hover:scale-105 transition-transform"
              />
              {usage > 80 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{bot.name}</h3>
              <p className="text-sm text-gray-600">{bot.description}</p>
              {/* Billing plan badge */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getBillingBadgeStyle(randomPlan, randomBillingType)}`}>
                  {randomBillingType === 'prepaid' ? 'Prepaid Credits' : randomPlan}
                </span>
              </div>
            </div>
          </div>
          <StatusBadge status={bot.status} />
        </div>
        
        {/* Usage Indicator */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-600">Usage Limit</span>
            <span className="font-medium">{usage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all ${getUsageColor()}`}
              style={{ width: `${usage}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <MessageSquare size={14} />
              <span className="text-xs">Conversations</span>
            </div>
            <p className="font-semibold text-xl">{bot.conversations}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <Clock size={14} />
              <span className="text-xs">Response</span>
            </div>
            <p className="font-semibold text-xl">{bot.metrics.responseTime}s</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
              <TrendingUp size={14} />
              <span className="text-xs">Resolution</span>
            </div>
            <p className="font-semibold text-xl">{bot.metrics.resolutionRate}%</p>
          </div>
        </div>
      </Link>
      
      <div className="border-t border-gray-100">
        <div className="grid grid-cols-5 divide-x divide-gray-100">
          <Link
            href={`/app/${clientId}/bot/${bot.id}/analytics`}
            onClick={(e) => handleActionClick(e, `/app/${clientId}/bot/${bot.id}/analytics`)}
            className="flex flex-col items-center justify-center py-3 px-2 hover:bg-gray-50 transition-colors group/btn"
          >
            <BarChart3 size={18} className="text-gray-600 group-hover/btn:text-gray-900 mb-1" />
            <span className="text-xs text-gray-600 group-hover/btn:text-gray-900 font-medium">Analytics</span>
          </Link>
          
          <Link
            href={`/app/${clientId}/bot/${bot.id}/mascot`}
            onClick={(e) => handleActionClick(e, `/app/${clientId}/bot/${bot.id}/mascot`)}
            className="flex flex-col items-center justify-center py-3 px-2 hover:bg-gray-50 transition-colors group/btn"
          >
            <Palette size={18} className="text-gray-600 group-hover/btn:text-gray-900 mb-1" />
            <span className="text-xs text-gray-600 group-hover/btn:text-gray-900 font-medium">Mascot</span>
          </Link>
          
          <Link
            href={`/app/${clientId}/bot/${bot.id}/brain`}
            onClick={(e) => handleActionClick(e, `/app/${clientId}/bot/${bot.id}/brain`)}
            className="flex flex-col items-center justify-center py-3 px-2 hover:bg-gray-50 transition-colors group/btn"
          >
            <Brain size={18} className="text-gray-600 group-hover/btn:text-gray-900 mb-1" />
            <span className="text-xs text-gray-600 group-hover/btn:text-gray-900 font-medium">Brain</span>
          </Link>
          
          <Link
            href={`/app/${clientId}/bot/${bot.id}/support`}
            onClick={(e) => handleActionClick(e, `/app/${clientId}/bot/${bot.id}/support`)}
            className="flex flex-col items-center justify-center py-3 px-2 hover:bg-gray-50 transition-colors group/btn"
          >
            <Headphones size={18} className="text-gray-600 group-hover/btn:text-gray-900 mb-1" />
            <span className="text-xs text-gray-600 group-hover/btn:text-gray-900 font-medium">Support</span>
          </Link>
          
          <button
            onClick={handleToggleStatus}
            className={`flex flex-col items-center justify-center py-3 px-2 hover:bg-gray-50 transition-colors group/btn border-l border-gray-200 ${
              bot.status === 'Needs finalization' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={bot.status === 'Needs finalization'}
            title={bot.status === 'Needs finalization' ? 'Complete setup to enable controls' : bot.status === 'Live' ? 'Pause bot' : 'Resume bot'}
          >
            {bot.status === 'Live' ? (
              <Pause size={18} className="text-red-600 group-hover/btn:text-red-700 mb-1" />
            ) : (
              <Play size={18} className="text-green-600 group-hover/btn:text-green-700 mb-1" />
            )}
            <span className="text-xs font-medium">
              <span className={bot.status === 'Live' ? 'text-red-600 group-hover/btn:text-red-700' : 'text-green-600 group-hover/btn:text-green-700'}>
                {bot.status === 'Live' ? 'Pause' : 'Resume'}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}