import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { MessageSquare, Clock, TrendingUp, BarChart3, Palette, Brain, Headphones } from 'lucide-react';
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

  // Mock usage data - in production this would come from props or API
  const usage = Math.floor(Math.random() * 100);
  const getUsageColor = () => {
    if (usage < 70) return 'bg-green-500';
    if (usage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
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
        <div className="grid grid-cols-4 divide-x divide-gray-100">
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
        </div>
      </div>
    </div>
  );
}