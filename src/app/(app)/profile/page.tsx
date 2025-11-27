'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { User, Key, Bell, Palette, Shield, Download, Upload, Save, Edit2 } from 'lucide-react';
import {
  Page,
  PageContent,
  PageHeader,
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Toggle,
} from '@/components/ui';

export default function UserProfilePage() {
  const { session } = useAuth();
  const client = clients.find(c => c.id === session?.clientId);
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);

  // Profile form states
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Anderson',
    email: 'john@' + (client?.slug || 'company') + '.com',
    phone: '+1 (555) 123-4567',
    company: client?.name || 'Company Inc',
    position: 'Customer Success Manager',
    location: 'New York, NY',
    timezone: 'America/New_York',
    bio: 'Passionate about creating exceptional customer experiences through AI-powered solutions.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newConversations: true,
    escalations: true,
    botOffline: true,
    weeklyReports: true,
    monthlyReports: false,
    productUpdates: true,
    marketing: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '8',
    apiAccess: true,
    loginAlerts: true
  });


  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ];

  const handleSave = () => {
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  return (
    <AuthGuard clientId={client?.id} showSidebar={false}>
      <div className="flex min-h-screen bg-background">
        <Sidebar clientId={client?.id} />

        <Page>
          <PageContent>
            <PageHeader
              title="Profile Settings"
              description="Manage your account settings and preferences"
              actions={
                hasChanges && (
                  <Button icon={<Save size={20} />} onClick={handleSave}>
                    Save Changes
                  </Button>
                )
              }
            />

            <div className="flex gap-6">
              {/* Sidebar Navigation */}
              <div className="w-64">
                <Card padding="sm">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-interactive text-foreground-inverse'
                          : 'hover:bg-background-hover text-foreground-secondary'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
                </Card>
              </div>

            {/* Settings Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img
                          src={profileData.avatar}
                          alt="Profile"
                          className="w-24 h-24 rounded-full bg-background-tertiary"
                        />
                        <button className="absolute bottom-0 right-0 p-2 bg-interactive text-foreground-inverse rounded-full hover:bg-interactive-primary-hover transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </div>
                      <div>
                        <Button variant="secondary" icon={<Upload size={16} />}>
                          Change Photo
                        </Button>
                        <p className="text-sm text-foreground-tertiary mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        value={profileData.firstName}
                        onChange={(e) => {
                          setProfileData({...profileData, firstName: e.target.value});
                          setHasChanges(true);
                        }}
                      />
                      <Input
                        label="Last Name"
                        value={profileData.lastName}
                        onChange={(e) => {
                          setProfileData({...profileData, lastName: e.target.value});
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData({...profileData, email: e.target.value});
                        setHasChanges(true);
                      }}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => {
                          setProfileData({...profileData, phone: e.target.value});
                          setHasChanges(true);
                        }}
                      />
                      <Input
                        label="Position"
                        value={profileData.position}
                        onChange={(e) => {
                          setProfileData({...profileData, position: e.target.value});
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Location"
                        value={profileData.location}
                        onChange={(e) => {
                          setProfileData({...profileData, location: e.target.value});
                          setHasChanges(true);
                        }}
                      />
                      <Select
                        label="Timezone"
                        value={profileData.timezone}
                        onChange={(e) => {
                          setProfileData({...profileData, timezone: e.target.value});
                          setHasChanges(true);
                        }}
                        options={[
                          { value: 'America/New_York', label: 'Eastern Time' },
                          { value: 'America/Chicago', label: 'Central Time' },
                          { value: 'America/Denver', label: 'Mountain Time' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time' },
                          { value: 'Europe/London', label: 'London' },
                          { value: 'Europe/Amsterdam', label: 'Amsterdam' },
                        ]}
                      />
                    </div>

                    <Textarea
                      label="Bio"
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => {
                        setProfileData({...profileData, bio: e.target.value});
                        setHasChanges(true);
                      }}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Chat & Conversations</h3>
                      <div className="space-y-3">
                        <Toggle
                          label="New conversations"
                          description="Get notified when someone starts a new chat"
                          checked={notificationSettings.newConversations}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, newConversations: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                        <Toggle
                          label="Escalations"
                          description="When a conversation is escalated to human agents"
                          checked={notificationSettings.escalations}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, escalations: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                        <Toggle
                          label="Bot offline"
                          description="When your bots go offline or encounter errors"
                          checked={notificationSettings.botOffline}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, botOffline: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Reports & Analytics</h3>
                      <div className="space-y-3">
                        <Toggle
                          label="Weekly reports"
                          description="Summary of your bot performance and metrics"
                          checked={notificationSettings.weeklyReports}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, weeklyReports: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                        <Toggle
                          label="Monthly reports"
                          description="Detailed monthly analytics and insights"
                          checked={notificationSettings.monthlyReports}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, monthlyReports: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Product & Marketing</h3>
                      <div className="space-y-3">
                        <Toggle
                          label="Product updates"
                          description="New features and platform improvements"
                          checked={notificationSettings.productUpdates}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, productUpdates: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                        <Toggle
                          label="Marketing communications"
                          description="Tips, best practices, and promotional content"
                          checked={notificationSettings.marketing}
                          onChange={(e) => {
                            setNotificationSettings({...notificationSettings, marketing: e.target.checked});
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg bg-background-secondary">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                          <p className="text-sm text-foreground-tertiary">Add an extra layer of security to your account</p>
                        </div>
                        <Button size="sm">
                          {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>

                    <Select
                      label="Session Timeout"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, sessionTimeout: e.target.value});
                        setHasChanges(true);
                      }}
                      options={[
                        { value: '1', label: '1 hour' },
                        { value: '4', label: '4 hours' },
                        { value: '8', label: '8 hours' },
                        { value: '24', label: '24 hours' },
                        { value: 'never', label: 'Never' },
                      ]}
                      helperText="Automatically log out after this period of inactivity"
                    />

                    <div className="space-y-3">
                      <Toggle
                        label="API Access"
                        description="Allow third-party applications to access your data"
                        checked={securitySettings.apiAccess}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, apiAccess: e.target.checked});
                          setHasChanges(true);
                        }}
                      />
                      <Toggle
                        label="Login Alerts"
                        description="Get notified of suspicious login attempts"
                        checked={securitySettings.loginAlerts}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, loginAlerts: e.target.checked});
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="p-4 border border-error-200 dark:border-error-800 rounded-lg bg-error-50 dark:bg-error-900/20">
                      <h3 className="font-medium text-error-800 dark:text-error-400 mb-2">Danger Zone</h3>
                      <p className="text-sm text-error-600 dark:text-error-500 mb-3">These actions cannot be undone</p>
                      <div className="flex gap-3">
                        <Button variant="danger" size="sm">
                          Change Password
                        </Button>
                        <Button variant="danger" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {(activeTab === 'account' || activeTab === 'appearance' || activeTab === 'data') && (
                <Card>
                  <h2 className="text-xl font-semibold text-foreground mb-6 capitalize">{activeTab} Settings</h2>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-background-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                      {activeTab === 'account' && <Key size={32} className="text-foreground-tertiary" />}
                      {activeTab === 'appearance' && <Palette size={32} className="text-foreground-tertiary" />}
                      {activeTab === 'data' && <Download size={32} className="text-foreground-tertiary" />}
                    </div>
                    <p className="text-foreground-secondary">
                      {activeTab === 'account' && 'Account settings will be available soon'}
                      {activeTab === 'appearance' && 'Appearance customization will be available soon'}
                      {activeTab === 'data' && 'Data export and privacy settings will be available soon'}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
          </PageContent>
        </Page>
      </div>
    </AuthGuard>
  );
}