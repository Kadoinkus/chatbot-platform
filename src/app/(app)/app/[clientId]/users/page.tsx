'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import { getUsersByClientId, type User } from '@/lib/dataService';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Crown,
  Mail,
  Phone,
  Calendar,
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
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
  Spinner,
  EmptyState,
} from '@/components/ui';

export default function UsersPage({ params }: { params: { clientId: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const client = clients.find(c => c.id === params.clientId);

  useEffect(() => {
    async function loadUsers() {
      try {
        const clientUsers = await getUsersByClientId(params.clientId);
        setUsers(clientUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [params.clientId]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-plan-premium-bg text-plan-premium-text border-plan-premium-border';
      case 'manager': return 'bg-info-100 dark:bg-info-700/30 text-info-700 dark:text-info-500 border-info-100 dark:border-info-700';
      case 'agent': return 'bg-success-100 dark:bg-success-700/30 text-success-700 dark:text-success-500 border-success-100 dark:border-success-700';
      case 'viewer': return 'bg-background-tertiary text-foreground-secondary border-border';
      default: return 'bg-background-tertiary text-foreground-secondary border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-success-600 dark:text-success-500" />;
      case 'inactive': return <XCircle size={16} className="text-error-600 dark:text-error-500" />;
      case 'pending': return <Clock size={16} className="text-warning-600 dark:text-warning-500" />;
      default: return <Clock size={16} className="text-foreground-tertiary" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-plan-premium-text" />;
      case 'manager': return <Shield size={16} className="text-info-600 dark:text-info-500" />;
      default: return <Users size={16} className="text-foreground-tertiary" />;
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'agent', label: 'Agent' },
    { value: 'viewer', label: 'Viewer' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];

  if (loading) {
    return (
      <Page className="flex items-center justify-center">
        <Spinner size="lg" />
      </Page>
    );
  }

  return (
    <Page>
      <PageContent>
            <PageHeader
              title="User Management"
              description="Manage team members and their access levels"
              actions={
                <Button icon={<UserPlus size={20} />}>
                  Invite User
                </Button>
              }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-info-100 dark:bg-info-700/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-info-600 dark:text-info-500" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-700/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-500" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Active</p>
                    <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warning-100 dark:bg-warning-700/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning-600 dark:text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'pending').length}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-plan-premium-bg rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-plan-premium-text" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Admins</p>
                    <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin').length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    icon={<Search size={20} />}
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Select
                    fullWidth={false}
                    options={roleOptions}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  />

                  <Select
                    fullWidth={false}
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Users Table */}
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Conversations</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-foreground">{user.name}</p>
                              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                                <Mail size={14} />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                                  <Phone size={14} />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(user.status)}
                            <span className="text-sm text-foreground capitalize">{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity size={14} className="text-foreground-tertiary" />
                            <span className="text-sm text-foreground-secondary">{user.lastActive}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">{user.conversationsHandled.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-foreground-tertiary" />
                            <span className="text-sm text-foreground-secondary">
                              {(user.joinedAt || user.joinedDate) ? new Date(user.joinedAt || user.joinedDate!).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 text-foreground-tertiary hover:text-foreground hover:bg-background-hover rounded-lg transition-colors"
                              aria-label="Edit user"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-2 text-foreground-tertiary hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-700/20 rounded-lg transition-colors"
                              aria-label="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              className="p-2 text-foreground-tertiary hover:text-foreground hover:bg-background-hover rounded-lg transition-colors"
                              aria-label="More options"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {filteredUsers.length === 0 && (
              <EmptyState
                icon={<Users size={48} />}
                title="No users found"
                message="Try adjusting your search or filters"
              />
            )}
      </PageContent>
    </Page>
  );
}
