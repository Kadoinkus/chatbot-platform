'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { Plus, Search, Mail, Shield, Clock, MoreVertical, UserPlus, Settings, Trash2, Key, Activity } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  avatar: string;
  status: 'active' | 'invited' | 'inactive';
  lastActive: Date;
  joinedDate: Date;
  permissions: string[];
}

export default function TeamManagementPage({ params }: { params: { clientId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock team data
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Anderson',
      email: 'john@' + (client?.slug || 'company') + '.com',
      role: 'owner',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      status: 'active',
      lastActive: new Date(),
      joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Sarah Mitchell',
      email: 'sarah@' + (client?.slug || 'company') + '.com',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      status: 'active',
      lastActive: new Date(Date.now() - 3600000),
      joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      permissions: ['manage_bots', 'view_analytics', 'manage_team']
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@' + (client?.slug || 'company') + '.com',
      role: 'agent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      status: 'active',
      lastActive: new Date(Date.now() - 7200000),
      joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      permissions: ['view_conversations', 'respond_to_chats']
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily@' + (client?.slug || 'company') + '.com',
      role: 'agent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      status: 'active',
      lastActive: new Date(Date.now() - 86400000),
      joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      permissions: ['view_conversations', 'respond_to_chats']
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david@' + (client?.slug || 'company') + '.com',
      role: 'viewer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      status: 'invited',
      lastActive: new Date(),
      joinedDate: new Date(),
      permissions: ['view_analytics']
    }
  ]);

  const roleConfig = {
    owner: { label: 'Owner', color: 'bg-purple-100 text-purple-700', icon: Shield },
    admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700', icon: Settings },
    agent: { label: 'Agent', color: 'bg-green-100 text-green-700', icon: Activity },
    viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700', icon: Activity }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Active now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 ml-16">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold mb-2">Team Members</h1>
                <p className="text-gray-600">Manage your team and their permissions</p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <UserPlus size={20} />
                Invite Member
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
              <p className="text-xs text-gray-500 mt-1">2 seats available</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Active Now</p>
              <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</p>
              <p className="text-xs text-green-600 mt-1">All systems operational</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Pending Invites</p>
              <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'invited').length}</p>
              <p className="text-xs text-orange-600 mt-1">Awaiting acceptance</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Admins</p>
              <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}</p>
              <p className="text-xs text-gray-500 mt-1">Can manage settings</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRole('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedRole === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Roles
                </button>
                {Object.entries(roleConfig).map(([role, config]) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedRole === role ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid gap-4">
            {filteredMembers.map(member => {
              const config = roleConfig[member.role];
              const Icon = config.icon;
              
              return (
                <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          {member.status === 'invited' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                              Pending Invite
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${config.color}`}>
                          <Icon size={14} />
                          {config.label}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {member.role === 'owner' ? 'Full access' : `${member.permissions.length} permissions`}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-700">{formatLastActive(member.lastActive)}</p>
                        <p className="text-xs text-gray-500">
                          Joined {Math.floor((Date.now() - member.joinedDate.getTime()) / (24 * 60 * 60 * 1000))} days ago
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Mail size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Key size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {member.role !== 'owner' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-gray-700 mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {member.permissions.map(permission => (
                          <span key={permission} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {permission.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Invite Team Member</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                      <option value="admin">Admin - Manage bots and settings</option>
                      <option value="agent">Agent - Handle conversations</option>
                      <option value="viewer">Viewer - View analytics only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Add a personal message to the invitation..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                      Send Invitation
                    </button>
                    <button 
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}