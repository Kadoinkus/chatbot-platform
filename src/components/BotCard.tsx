import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { MessageSquare, Clock, TrendingUp } from 'lucide-react';
import type { Mascot } from '@/lib/data';

interface BotCardProps {
  bot: Mascot;
  clientId: string;
}

export default function BotCard({ bot, clientId }: BotCardProps) {
  return (
    <Link href={`/app/${clientId}/bot/${bot.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img 
              src={bot.image} 
              alt={bot.name}
              className="w-16 h-16 rounded-full bg-gray-100 group-hover:scale-110 transition-transform"
            />
            <div>
              <h3 className="font-semibold text-lg">{bot.name}</h3>
              <p className="text-sm text-gray-600">{bot.description}</p>
            </div>
          </div>
          <StatusBadge status={bot.status} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
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
      </div>
    </Link>
  );
}