'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import { getConversationsByClientId, type Conversation as ConversationType } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, Download, Calendar, MessageSquare, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  botId: string;
  botName: string;
  lastMessage: string;
  timestamp: Date;
  status: 'resolved' | 'pending' | 'escalated';
  duration: number;
  messages: number;
  satisfaction?: number;
  tags: string[];
}

export default function ConversationHistoryPage({ params }: { params: { clientId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBot, setSelectedBot] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  // Mock conversation data
  const conversations: Conversation[] = [
    {
      id: 'conv1',
      userId: 'user123',
      userName: 'John Smith',
      botId: client.mascots[0].id,
      botName: client.mascots[0].name,
      lastMessage: 'Thank you for your help!',
      timestamp: new Date(Date.now() - 3600000),
      status: 'resolved',
      duration: 12,
      messages: 8,
      satisfaction: 5,
      tags: ['shipping', 'order-tracking']
    },
    {
      id: 'conv2',
      userId: 'user456',
      userName: 'Sarah Johnson',
      botId: client.mascots[0].id,
      botName: client.mascots[0].name,
      lastMessage: 'I need to speak with a human agent',
      timestamp: new Date(Date.now() - 7200000),
      status: 'escalated',
      duration: 25,
      messages: 15,
      satisfaction: 3,
      tags: ['returns', 'complaint']
    },
    {
      id: 'conv3',
      userId: 'user789',
      userName: 'Mike Williams',
      botId: client.mascots[1]?.id || client.mascots[0].id,
      botName: client.mascots[1]?.name || client.mascots[0].name,
      lastMessage: 'When will my order arrive?',
      timestamp: new Date(Date.now() - 10800000),
      status: 'pending',
      duration: 5,
      messages: 3,
      tags: ['delivery']
    },
    {
      id: 'conv4',
      userId: 'user321',
      userName: 'Emma Davis',
      botId: client.mascots[0].id,
      botName: client.mascots[0].name,
      lastMessage: 'Perfect, that solved my issue',
      timestamp: new Date(Date.now() - 14400000),
      status: 'resolved',
      duration: 8,
      messages: 6,
      satisfaction: 5,
      tags: ['product-info']
    },
    {
      id: 'conv5',
      userId: 'user654',
      userName: 'Robert Brown',
      botId: client.mascots[1]?.id || client.mascots[0].id,
      botName: client.mascots[1]?.name || client.mascots[0].name,
      lastMessage: 'How do I reset my password?',
      timestamp: new Date(Date.now() - 18000000),
      status: 'resolved',
      duration: 3,
      messages: 4,
      satisfaction: 4,
      tags: ['account', 'technical']
    }
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.tags.some(tag => tag.includes(searchTerm.toLowerCase()));
    const matchesBot = selectedBot === 'all' || conv.botId === selectedBot;
    const matchesStatus = selectedStatus === 'all' || conv.status === selectedStatus;
    return matchesSearch && matchesBot && matchesStatus;
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'escalated':
        return <AlertCircle size={16} className="text-orange-600" />;
      case 'pending':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 ml-16">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Conversations</h1>
            <p className="text-gray-600">View and manage all customer conversations</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              
              <select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Bots</option>
                {client.mascots.map(bot => (
                  <option key={bot.id} value={bot.id}>{bot.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter size={20} />
                More filters
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                <Download size={20} />
                Export
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total Conversations</p>
              <p className="text-2xl font-bold">{conversations.length}</p>
              <p className="text-xs text-green-600 mt-1">+12% from last period</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold">{conversations.filter(c => c.status === 'resolved').length}</p>
              <p className="text-xs text-gray-600 mt-1">60% resolution rate</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
              <p className="text-2xl font-bold">10.6 min</p>
              <p className="text-xs text-gray-600 mt-1">-2 min from last week</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Satisfaction</p>
              <p className="text-2xl font-bold">4.5/5</p>
              <p className="text-xs text-green-600 mt-1">Above average</p>
            </div>
          </div>

          {/* Conversations Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">User</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Bot</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Last Message</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Duration</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Time</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Rating</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.map((conv) => (
                  <tr key={conv.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{conv.userName}</p>
                          <p className="text-xs text-gray-500">ID: {conv.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{conv.botName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 truncate max-w-xs">{conv.lastMessage}</p>
                      <div className="flex gap-1 mt-1">
                        {conv.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conv.status)}
                        <span className="text-sm capitalize">{conv.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{conv.duration} min</p>
                      <p className="text-xs text-gray-500">{conv.messages} msgs</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{formatTimestamp(conv.timestamp)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {conv.satisfaction && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{conv.satisfaction}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/app/${client.id}/conversations/${conv.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        <button className="text-sm text-gray-600 hover:text-gray-800">
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing 1 to {filteredConversations.length} of {conversations.length} results
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-white">
                  Previous
                </button>
                <button className="px-3 py-1 bg-black text-white rounded-lg text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-white">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-white">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-white">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}