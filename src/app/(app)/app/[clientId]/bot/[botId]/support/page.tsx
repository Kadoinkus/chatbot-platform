'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Headphones, Plus, Search, Filter, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function SupportPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'bug',
    priority: 'medium',
    description: ''
  });

  const [tickets] = useState([
    { 
      id: 'TKT-001', 
      subject: 'Bot not responding to greeting messages', 
      category: 'Bug',
      priority: 'high',
      status: 'in_progress',
      created: '2 hours ago',
      lastUpdate: '30 min ago',
      assignee: 'Dev Team'
    },
    { 
      id: 'TKT-002', 
      subject: 'Request: Add multilingual support', 
      category: 'Feature',
      priority: 'medium',
      status: 'open',
      created: '1 day ago',
      lastUpdate: '1 day ago',
      assignee: 'Unassigned'
    },
    { 
      id: 'TKT-003', 
      subject: 'Slow response time during peak hours', 
      category: 'Performance',
      priority: 'high',
      status: 'resolved',
      created: '3 days ago',
      lastUpdate: '2 days ago',
      assignee: 'Backend Team'
    },
    { 
      id: 'TKT-004', 
      subject: 'Integration with CRM system', 
      category: 'Integration',
      priority: 'low',
      status: 'open',
      created: '1 week ago',
      lastUpdate: '5 days ago',
      assignee: 'Integration Team'
    }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, botData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId)
        ]);
        setClient(clientData);
        setBot(botData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.botId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <Page className="flex items-center justify-center">
          <Spinner size="lg" />
        </Page>
      </div>
    );
  }

  if (!client || !bot) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />
        <Page>
          <PageContent>
            <EmptyState
              icon={<Headphones size={48} />}
              title="Bot not found"
              message="The requested bot could not be found."
            />
          </PageContent>
        </Page>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'resolved':
        return <CheckCircle size={16} className="text-success-600 dark:text-success-500" />;
      case 'in_progress':
        return <Clock size={16} className="text-info-600 dark:text-info-500" />;
      default:
        return <AlertCircle size={16} className="text-foreground-secondary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400 border-error-200 dark:border-error-800';
      case 'medium':
        return 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 border-warning-200 dark:border-warning-800';
      case 'low':
        return 'bg-background-secondary text-foreground-secondary border-border';
      default:
        return 'bg-background-secondary text-foreground-secondary border-border';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client.id} />

        <Page>
          <PageContent>
            <PageHeader
              title={`${bot.name} Support`}
              description="Manage support requests and tickets"
              backLink={
                <Link
                  href={`/app/${client.id}`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to bots
                </Link>
              }
              actions={
                <Button onClick={() => setShowNewTicket(true)} icon={<Plus size={18} />}>
                  New Ticket
                </Button>
              }
            />

            {/* Bot Header */}
            <Card className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={bot.image}
                    alt={bot.name}
                    className="w-16 h-16 rounded-full bg-background-tertiary"
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">{bot.name}</h1>
                      <StatusBadge status={bot.status} />
                    </div>
                    <p className="text-foreground-secondary mb-1">Manage support requests and tickets</p>
                    <p className="text-sm text-foreground-tertiary">Client: {client.name}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card padding="sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground-secondary">Open Tickets</span>
                <AlertCircle size={16} className="text-foreground-tertiary" />
              </div>
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-xs text-foreground-tertiary mt-1">2 high priority</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">In Progress</span>
                  <Clock size={16} className="text-info-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-foreground-tertiary mt-1">Avg. 2 days</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Resolved</span>
                  <CheckCircle size={16} className="text-success-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-xs text-foreground-tertiary mt-1">This month</p>
              </Card>

              <Card padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground-secondary">Avg. Resolution</span>
                  <Headphones size={16} className="text-foreground-tertiary" />
                </div>
                <p className="text-2xl font-bold text-foreground">1.8</p>
                <p className="text-xs text-foreground-tertiary mt-1">Days</p>
              </Card>
            </div>

            <Card padding="none">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-border-focus"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" icon={<Filter size={16} />}>
                    Filter
                  </Button>
                  <Select options={statusOptions} />
                </div>
              </div>
            </div>

            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-background-hover transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <span className="font-medium text-foreground">{ticket.id}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-background-secondary text-foreground-secondary rounded">
                          {ticket.category}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                        <span>Created {ticket.created}</span>
                        <span>•</span>
                        <span>Updated {ticket.lastUpdate}</span>
                        <span>•</span>
                        <span>{ticket.assignee}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
            </Card>
          </PageContent>
        </Page>
      
      {showNewTicket && (
        <div className="fixed inset-0 bg-surface-overlay flex items-center justify-center z-50 p-4">
          <div className="bg-surface-elevated rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Create New Support Ticket</h2>
              <p className="text-sm text-foreground-secondary mt-1">Submit a request to the development team</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                  className="input"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                    className="select"
                  >
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="integration">Integration Issue</option>
                    <option value="performance">Performance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                    className="select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  className="input resize-none"
                  rows={6}
                  placeholder="Provide detailed information about your request..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Attachments</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <MessageSquare size={24} className="mx-auto mb-2 text-foreground-tertiary" />
                  <p className="text-sm text-foreground-secondary">Drop files here or click to browse</p>
                  <p className="text-xs text-foreground-tertiary mt-1">Max 10MB per file</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowNewTicket(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowNewTicket(false);
                  setTicketForm({ subject: '', category: 'bug', priority: 'medium', description: '' });
                }}
              >
                Submit Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}