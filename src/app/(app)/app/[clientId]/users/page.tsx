'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import { getUsersByClientId, type User } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
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

  if (loading) {
    return (
      <AuthGuard clientId={params.clientId}>
        <div className="flex min-h-screen bg-background">
          <Sidebar clientId={params.clientId} />
          <main className="flex-1 lg:ml-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={params.clientId} />

      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">User Management</h1>
                <p className="text-foreground-secondary">Manage team members and their access levels</p>
              </div>
              <button className="btn-primary px-4 py-2">
                <UserPlus size={20} />
                Invite User
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 lg:mb-8">
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-info-100 dark:bg-info-700/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-info-600 dark:text-info-500" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-700/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-500" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Active</p>
                    <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'active').length}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warning-100 dark:bg-warning-700/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning-600 dark:text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status === 'pending').length}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-plan-premium-bg rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-plan-premium-text" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-secondary">Admins</p>
                    <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin').length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-tertiary" size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="agent">Agent</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Conversations</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
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
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="text-sm text-foreground capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-foreground-tertiary" />
                          <span className="text-sm text-foreground-secondary">{user.lastActive}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-foreground">{user.conversationsHandled.toLocaleString()}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-foreground-tertiary" />
                          <span className="text-sm text-foreground-secondary">
                            {new Date(user.joinedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-foreground-tertiary hover:text-foreground hover:bg-background-hover rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-foreground-tertiary hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-700/20 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                          <button className="p-2 text-foreground-tertiary hover:text-foreground hover:bg-background-hover rounded-lg transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={24} className="text-foreground-tertiary" />
              </div>
              <h3 className="empty-state-title">No users found</h3>
              <p className="empty-state-message">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}