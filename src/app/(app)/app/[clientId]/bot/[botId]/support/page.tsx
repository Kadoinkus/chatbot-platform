'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Headphones, Plus, Search, Filter, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';

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
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link 
            href={`/app/${client.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to bots
          </Link>
          
          {/* Bot Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={bot.image} 
                  alt={bot.name}
                  className="w-16 h-16 rounded-full bg-gray-100"
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold">{bot.name}</h1>
                    <StatusBadge status={bot.status} />
                  </div>
                  <p className="text-gray-600 mb-1">Manage support requests and tickets</p>
                  <p className="text-sm text-gray-500">Client: {client.name}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowNewTicket(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Plus size={18} />
                New Ticket
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Open Tickets</span>
                <AlertCircle size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-gray-500 mt-1">2 high priority</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">In Progress</span>
                <Clock size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-gray-500 mt-1">Avg. 2 days</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Resolved</span>
                <CheckCircle size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg. Resolution</span>
                <Headphones size={16} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold">1.8</p>
              <p className="text-xs text-gray-500 mt-1">Days</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                  </button>
                  <select className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <option>All Status</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <span className="font-medium text-gray-900">{ticket.id}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          {ticket.category}
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Created {ticket.created}</span>
                        <span>•</span>
                        <span>Updated {ticket.lastUpdate}</span>
                        <span>•</span>
                        <span>{ticket.assignee}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {showNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Create New Support Ticket</h2>
              <p className="text-sm text-gray-600 mt-1">Submit a request to the development team</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="integration">Integration Issue</option>
                    <option value="performance">Performance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select 
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-lg resize-none"
                  rows={6}
                  placeholder="Provide detailed information about your request..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <MessageSquare size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Drop files here or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">Max 10MB per file</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowNewTicket(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowNewTicket(false);
                  setTicketForm({ subject: '', category: 'bug', priority: 'medium', description: '' });
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}