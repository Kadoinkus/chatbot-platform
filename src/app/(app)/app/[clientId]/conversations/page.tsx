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
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <main className="flex-1 lg:ml-16 p-6">
          <p className="text-foreground-secondary">Client not found</p>
        </main>
      </div>
    );
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
        return <CheckCircle size={16} className="text-success-600 dark:text-success-500" />;
      case 'escalated':
        return <AlertCircle size={16} className="text-warning-600 dark:text-warning-500" />;
      case 'pending':
        return <Clock size={16} className="text-info-600 dark:text-info-500" />;
      default:
        return null;
    }
  };

  return (
    <AuthGuard clientId={params.clientId}>
    <div className="flex min-h-screen bg-background">
      <Sidebar clientId={client.id} />

      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Conversations</h1>
            <p className="text-foreground-secondary">View and manage all customer conversations</p>
          </div>

          {/* Filters Bar */}
          <div className="card p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary" size={20} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <select
                value={selectedBot}
                onChange={(e) => setSelectedBot(e.target.value)}
                className="select"
              >
                <option value="all">All Bots</option>
                {client.mascots.map(bot => (
                  <option key={bot.id} value={bot.id}>{bot.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="select"
              >
                <option value="all">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="select"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>

              <button className="btn-secondary">
                <Filter size={18} />
                More filters
              </button>

              <button className="btn-primary">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-sm text-foreground-secondary mb-1">Total Conversations</p>
              <p className="text-2xl font-bold text-foreground">{conversations.length}</p>
              <p className="text-xs text-success-600 dark:text-success-500 mt-1">+12% from last period</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-foreground-secondary mb-1">Resolved</p>
              <p className="text-2xl font-bold text-foreground">{conversations.filter(c => c.status === 'resolved').length}</p>
              <p className="text-xs text-foreground-tertiary mt-1">60% resolution rate</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-foreground-secondary mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-foreground">10.6 min</p>
              <p className="text-xs text-foreground-tertiary mt-1">-2 min from last week</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-foreground-secondary mb-1">Satisfaction</p>
              <p className="text-2xl font-bold text-foreground">4.5/5</p>
              <p className="text-xs text-success-600 dark:text-success-500 mt-1">Above average</p>
            </div>
          </div>

          {/* Conversations Table */}
          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Bot</th>
                  <th>Last Message</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Time</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.map((conv) => (
                  <tr key={conv.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar-placeholder">
                          <User size={16} className="text-foreground-tertiary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{conv.userName}</p>
                          <p className="text-xs text-foreground-tertiary">ID: {conv.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-foreground">{conv.botName}</p>
                    </td>
                    <td>
                      <p className="text-sm text-foreground-secondary truncate max-w-xs">{conv.lastMessage}</p>
                      <div className="flex gap-1 mt-1">
                        {conv.tags.map(tag => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conv.status)}
                        <span className="text-sm text-foreground capitalize">{conv.status}</span>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-foreground">{conv.duration} min</p>
                      <p className="text-xs text-foreground-tertiary">{conv.messages} msgs</p>
                    </td>
                    <td>
                      <p className="text-sm text-foreground">{formatTimestamp(conv.timestamp)}</p>
                    </td>
                    <td>
                      {conv.satisfaction && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-foreground">{conv.satisfaction}</span>
                          <span className="text-warning-500">★</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link
                          href={`/app/${client.id}/conversations/${conv.id}`}
                          className="link text-sm"
                        >
                          View
                        </Link>
                        <button className="link-subtle text-sm">
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between bg-background-secondary border-t border-border">
              <p className="text-sm text-foreground-secondary">
                Showing 1 to {filteredConversations.length} of {conversations.length} results
              </p>
              <div className="pagination">
                <button className="pagination-btn">
                  Previous
                </button>
                <button className="pagination-btn-active">
                  1
                </button>
                <button className="pagination-btn">
                  2
                </button>
                <button className="pagination-btn">
                  3
                </button>
                <button className="pagination-btn">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}