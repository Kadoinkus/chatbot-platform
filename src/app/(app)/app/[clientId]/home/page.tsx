'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { 
  Bot, MessageSquare, Users, TrendingUp, Plus, Store, 
  ArrowRight, Activity, Clock, CheckCircle, Zap
} from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/lib/dataService';

export default function HomePage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);

  const [dashboardStats] = useState({
    totalBots: 3,
    totalConversations: 12847,
    activeUsers: 2156,
    responseRate: 94.2,
    recentActivity: [
      { type: 'conversation', user: 'John D.', bot: 'Customer Support', time: '2 min ago' },
      { type: 'bot_created', user: 'You', bot: 'Sales Assistant', time: '1 hour ago' },
      { type: 'conversation', user: 'Sarah M.', bot: 'FAQ Bot', time: '3 hours ago' },
      { type: 'user_joined', user: 'Mike R.', time: '5 hours ago' },
    ],
    topBots: [
      { name: 'Customer Support', conversations: 8234, growth: '+12%' },
      { name: 'Sales Assistant', conversations: 3421, growth: '+8%' },
      { name: 'FAQ Bot', conversations: 1192, growth: '+24%' },
    ]
  });

  useEffect(() => {
    async function loadData() {
      try {
        const clientData = await getClientById(params.clientId);
        setClient(clientData);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-gray-600">Here's what's happening with your chatbots today.</p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Bots</span>
                <Bot size={16} className="text-gray-400" />
              </div>
              <p className="text-3xl font-bold">{dashboardStats.totalBots}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Conversations</span>
                <MessageSquare size={16} className="text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{dashboardStats.totalConversations.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Users</span>
                <Users size={16} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold">{dashboardStats.activeUsers.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Response Rate</span>
                <TrendingUp size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold">{dashboardStats.responseRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/app/${client.id}?create=true`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center">
                        <Plus size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Create New Bot</p>
                        <p className="text-sm text-gray-600">Start from scratch</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                  
                  <Link
                    href={`/app/${client.id}/marketplace`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Browse Templates</p>
                        <p className="text-sm text-gray-600">Pre-built solutions</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                  
                  <Link
                    href={`/app/${client.id}/analytics`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="font-medium">View Analytics</p>
                        <p className="text-sm text-gray-600">Performance insights</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Top Performing Bots */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Top Performing Bots</h3>
                  <Link href={`/app/${client.id}`} className="text-sm text-gray-600 hover:text-gray-900">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {dashboardStats.topBots.map((bot, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Bot size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{bot.name}</p>
                          <p className="text-xs text-gray-600">{bot.conversations} conversations</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-green-600">{bot.growth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Recent Activity</h3>
                  <Link href={`/app/${client.id}/conversations`} className="text-sm text-gray-600 hover:text-gray-900">
                    View all
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {dashboardStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'conversation' && (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare size={16} className="text-blue-600" />
                          </div>
                        )}
                        {activity.type === 'bot_created' && (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-green-600" />
                          </div>
                        )}
                        {activity.type === 'user_joined' && (
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-purple-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            {activity.type === 'conversation' && (
                              <p className="font-medium">
                                <span className="text-gray-900">{activity.user}</span> started a conversation with{' '}
                                <span className="text-gray-900">{activity.bot}</span>
                              </p>
                            )}
                            {activity.type === 'bot_created' && (
                              <p className="font-medium">
                                <span className="text-gray-900">{activity.user}</span> created{' '}
                                <span className="text-gray-900">{activity.bot}</span>
                              </p>
                            )}
                            {activity.type === 'user_joined' && (
                              <p className="font-medium">
                                <span className="text-gray-900">{activity.user}</span> joined your team
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Getting Started for New Users */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Ready to supercharge your customer support?</h4>
                      <p className="text-gray-600 mb-4">
                        Get started by creating your first bot or browse our marketplace for ready-to-use templates.
                      </p>
                      <div className="flex gap-3">
                        <Link
                          href={`/app/${client.id}/marketplace`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Browse Templates
                        </Link>
                        <Link
                          href="/help"
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white text-sm font-medium"
                        >
                          View Guide
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}