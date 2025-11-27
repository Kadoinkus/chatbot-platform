'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { Search, Filter, Download, MessageSquare, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Select,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '@/components/ui';

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
        <Page>
          <PageContent>
            <EmptyState
              icon={<MessageSquare size={48} />}
              title="Client not found"
              message="The requested client could not be found."
            />
          </PageContent>
        </Page>
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

  const botOptions = [
    { value: 'all', label: 'All Bots' },
    ...client.mascots.map(bot => ({ value: bot.id, label: bot.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'pending', label: 'Pending' },
    { value: 'escalated', label: 'Escalated' },
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client.id} />

        <Page>
          <PageContent>
            <PageHeader
              title="Conversations"
              description="View and manage all customer conversations"
            />

            {/* Filters Bar */}
            <Card className="mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <Input
                    icon={<Search size={20} />}
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  options={botOptions}
                  value={selectedBot}
                  onChange={(e) => setSelectedBot(e.target.value)}
                />

                <Select
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />

                <Select
                  options={dateRangeOptions}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                />

                <Button variant="secondary" icon={<Filter size={18} />}>
                  More filters
                </Button>

                <Button icon={<Download size={18} />}>
                  Export
                </Button>
              </div>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Total Conversations</p>
                <p className="text-2xl font-bold text-foreground">{conversations.length}</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">+12% from last period</p>
              </Card>
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{conversations.filter(c => c.status === 'resolved').length}</p>
                <p className="text-xs text-foreground-tertiary mt-1">60% resolution rate</p>
              </Card>
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Avg Duration</p>
                <p className="text-2xl font-bold text-foreground">10.6 min</p>
                <p className="text-xs text-foreground-tertiary mt-1">-2 min from last week</p>
              </Card>
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Satisfaction</p>
                <p className="text-2xl font-bold text-foreground">4.5/5</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">Above average</p>
              </Card>
            </div>

            {/* Conversations Table */}
            <Card padding="none" className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Bot</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-background-tertiary rounded-full flex items-center justify-center">
                            <User size={16} className="text-foreground-tertiary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{conv.userName}</p>
                            <p className="text-xs text-foreground-tertiary">ID: {conv.userId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{conv.botName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground-secondary truncate max-w-xs">{conv.lastMessage}</p>
                        <div className="flex gap-1 mt-1">
                          {conv.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-background-tertiary text-foreground-secondary text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(conv.status)}
                          <span className="text-sm text-foreground capitalize">{conv.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{conv.duration} min</p>
                        <p className="text-xs text-foreground-tertiary">{conv.messages} msgs</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{formatTimestamp(conv.timestamp)}</p>
                      </TableCell>
                      <TableCell>
                        {conv.satisfaction && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-foreground">{conv.satisfaction}</span>
                            <span className="text-warning-500">★</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link
                            href={`/app/${client.id}/conversations/${conv.id}`}
                            className="text-sm text-info-600 dark:text-info-500 hover:text-info-700 dark:hover:text-info-400"
                          >
                            View
                          </Link>
                          <button className="text-sm text-foreground-secondary hover:text-foreground">
                            Export
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between bg-background-secondary border-t border-border">
                <p className="text-sm text-foreground-secondary">
                  Showing 1 to {filteredConversations.length} of {conversations.length} results
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    Previous
                  </Button>
                  <Button size="sm">
                    1
                  </Button>
                  <Button variant="ghost" size="sm">
                    2
                  </Button>
                  <Button variant="ghost" size="sm">
                    3
                  </Button>
                  <Button variant="ghost" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </Card>

            {filteredConversations.length === 0 && (
              <EmptyState
                icon={<MessageSquare size={48} />}
                title="No conversations found"
                message="Try adjusting your search or filters"
              />
            )}
          </PageContent>
        </Page>
      </div>
    </AuthGuard>
  );
}
