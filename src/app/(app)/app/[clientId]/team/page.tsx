'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import type { Client } from '@/types';
import { Search, Mail, Shield, MoreVertical, UserPlus, Settings, Key, Activity, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Badge,
  Modal,
  EmptyState,
} from '@/components/ui';

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
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    async function loadClient() {
      try {
        setError(null);
        const data = await getClientById(params.clientId);
        setClient(data ?? null);
      } catch (err) {
        console.error('Failed to load client:', err);
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [params.clientId]);

  // Mock team data - uses client slug for email domains
  const clientSlug = client?.slug || 'company';
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Anderson',
      email: 'john@' + clientSlug + '.com',
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
      email: 'sarah@' + clientSlug + '.com',
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
      email: 'mike@' + clientSlug + '.com',
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
      email: 'emily@' + clientSlug + '.com',
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
      email: 'david@' + clientSlug + '.com',
      role: 'viewer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      status: 'invited',
      lastActive: new Date(),
      joinedDate: new Date(),
      permissions: ['view_analytics']
    }
  ];

  // Role icons mapping (colors now come from Badge component)
  const roleIcons = {
    owner: Shield,
    admin: Settings,
    agent: Activity,
    viewer: Activity
  };

  const roleSelectOptions = [
    { value: 'admin', label: 'Admin - Manage bots and settings' },
    { value: 'agent', label: 'Agent - Handle conversations' },
    { value: 'viewer', label: 'Viewer - View analytics only' },
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <Page>
        <PageContent>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
          </div>
        </PageContent>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Users size={48} />}
            title="Error loading team"
            message={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        </PageContent>
      </Page>
    );
  }

  if (!client) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<Users size={48} />}
            title="Client not found"
            message="The requested client could not be found."
          />
        </PageContent>
      </Page>
    );
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
    <Page>
      <PageContent>
            <PageHeader
              title="Team Members"
              description="Manage your team and their permissions"
              backLink={
                <Link
                  href={`/app/${params.clientId}/settings`}
                  className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Settings
                </Link>
              }
              actions={
                <Button icon={<UserPlus size={20} />} onClick={() => setShowInviteModal(true)}>
                  Invite Member
                </Button>
              }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Total Members</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
                <p className="text-xs text-foreground-tertiary mt-1">2 seats available</p>
              </Card>
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Active Now</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.filter(m => m.status === 'active').length}</p>
                <p className="text-xs text-success-600 dark:text-success-500 mt-1">All systems operational</p>
              </Card>
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Pending Invites</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.filter(m => m.status === 'invited').length}</p>
                <p className="text-xs text-warning-600 dark:text-warning-500 mt-1">Awaiting acceptance</p>
              </Card>
              <Card padding="sm">
                <p className="text-sm text-foreground-secondary mb-1">Admins</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}</p>
                <p className="text-xs text-foreground-tertiary mt-1">Can manage settings</p>
              </Card>
            </div>

            {/* Filters */}
            <Card padding="sm" className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    icon={<Search size={20} />}
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRole('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === 'all' ? 'bg-interactive text-foreground-inverse' : 'bg-background-tertiary text-foreground-secondary hover:bg-background-hover'
                    }`}
                  >
                    All Roles
                  </button>
                  {(['owner', 'admin', 'agent', 'viewer'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedRole === role ? 'bg-interactive text-foreground-inverse' : 'bg-background-tertiary text-foreground-secondary hover:bg-background-hover'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}s
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Team Members Grid */}
            <div className="grid gap-4">
              {filteredMembers.map(member => {
                const Icon = roleIcons[member.role];

                return (
                  <Card key={member.id}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg text-foreground">{member.name}</h3>
                            {member.status === 'invited' && (
                              <Badge variant="warning">
                                Pending Invite
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground-secondary">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="text-right">
                          <Badge role={member.role} className="inline-flex items-center gap-2">
                            <Icon size={14} />
                          </Badge>
                          <p className="text-xs text-foreground-tertiary mt-1">
                            {member.role === 'owner' ? 'Full access' : `${member.permissions.length} permissions`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-foreground">{formatLastActive(member.lastActive)}</p>
                          <p className="text-xs text-foreground-tertiary">
                            Joined {Math.floor((Date.now() - member.joinedDate.getTime()) / (24 * 60 * 60 * 1000))} days ago
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-background-hover rounded-lg transition-colors" aria-label="Send email">
                            <Mail size={16} className="text-foreground-secondary" />
                          </button>
                          <button className="p-2 hover:bg-background-hover rounded-lg transition-colors" aria-label="Manage permissions">
                            <Key size={16} className="text-foreground-secondary" />
                          </button>
                          <button className="p-2 hover:bg-background-hover rounded-lg transition-colors" aria-label="More options">
                            <MoreVertical size={16} className="text-foreground-secondary" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {member.role !== 'owner' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-medium text-foreground mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-2">
                          {member.permissions.map(permission => (
                            <Badge key={permission} variant="default">
                              {permission.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {filteredMembers.length === 0 && (
              <EmptyState
                icon={<Users size={48} />}
                title="No team members found"
                message="Try adjusting your search or filters"
              />
            )}

            {/* Invite Modal */}
            <Modal
              isOpen={showInviteModal}
              onClose={() => setShowInviteModal(false)}
              title="Invite Team Member"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowInviteModal(false)}>
                    Send Invitation
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="colleague@company.com"
                />

                <Select
                  label="Role"
                  options={roleSelectOptions}
                />

                <Textarea
                  label="Message (optional)"
                  rows={3}
                  placeholder="Add a personal message to the invitation..."
                />
              </div>
            </Modal>
      </PageContent>
    </Page>
  );
}
