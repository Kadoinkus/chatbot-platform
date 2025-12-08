'use client';
import { getClientById, getAssistantById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Headphones, Plus, Search, Filter, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Client, Assistant } from '@/lib/dataService';
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
  Modal,
  Badge,
} from '@/components/ui';

export default function SupportPage({ params }: { params: { clientId: string; assistantId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [assistant, setAssistant] = useState<Assistant | undefined>();
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
        const [clientData, assistantData] = await Promise.all([
          getClientById(params.clientId),
          getAssistantById(params.assistantId)
        ]);
        setClient(clientData);
        setAssistant(assistantData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.assistantId]);

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  if (!client || !assistant) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Headphones size={48} />}
            title="AI Assistant not found"
            message="The requested AI assistant could not be found."
          />
        </PageContent>
      </Page>
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
    <Page>
      <PageContent>
            <PageHeader
              title={`${assistant.name} Support`}
              description="Manage support requests and tickets"
              backLink={
                <Link
                  href={`/app/${client.id}`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft size={16} />
                  Back to AI Assistants
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
                    src={assistant.image}
                    alt={assistant.name}
                    className="w-16 h-16 rounded-full bg-background-tertiary"
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-foreground">{assistant.name}</h1>
                      <StatusBadge status={assistant.status} />
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
                  <Input
                    icon={<Search size={18} />}
                    placeholder="Search tickets..."
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={<Filter size={16} />}>
                      Filter
                    </Button>
                    <Select fullWidth={false} options={statusOptions} />
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
                          <Badge variant={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'default'}>
                            {ticket.priority}
                          </Badge>
                          <Badge>{ticket.category}</Badge>
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

      <Modal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        title="Create New Support Ticket"
        description="Submit a request to the development team"
        size="lg"
        footer={
          <>
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
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            value={ticketForm.subject}
            onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
            placeholder="Brief description of the issue"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={ticketForm.category}
              onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
              options={[
                { value: 'bug', label: 'Bug Report' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'integration', label: 'Integration Issue' },
                { value: 'performance', label: 'Performance' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <Select
              label="Priority"
              value={ticketForm.priority}
              onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </div>

          <Textarea
            label="Description"
            value={ticketForm.description}
            onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
            rows={6}
            placeholder="Provide detailed information about your request..."
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Attachments</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <MessageSquare size={24} className="mx-auto mb-2 text-foreground-tertiary" />
              <p className="text-sm text-foreground-secondary">Drop files here or click to browse</p>
              <p className="text-xs text-foreground-tertiary mt-1">Max 10MB per file</p>
            </div>
          </div>
        </div>
      </Modal>
    </Page>
  );
}
