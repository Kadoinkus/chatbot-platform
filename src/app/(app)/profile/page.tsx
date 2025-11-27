'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, Building, MapPin, Key, Bell, Palette, Globe, Shield, Download, Upload, Save, Edit2 } from 'lucide-react';

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

      <main className="flex-1 lg:ml-16 min-h-screen">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">Profile Settings</h1>
                <p className="text-foreground-secondary">Manage your account settings and preferences</p>
              </div>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2 px-4 py-2"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64">
              <nav className="card p-2">
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
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <div className="card p-6">
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
                        <button className="btn-secondary flex items-center gap-2 px-4 py-2">
                          <Upload size={16} />
                          Change Photo
                        </button>
                        <p className="text-sm text-foreground-tertiary mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => {
                            setProfileData({...profileData, firstName: e.target.value});
                            setHasChanges(true);
                          }}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => {
                            setProfileData({...profileData, lastName: e.target.value});
                            setHasChanges(true);
                          }}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData({...profileData, email: e.target.value});
                          setHasChanges(true);
                        }}
                        className="input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => {
                            setProfileData({...profileData, phone: e.target.value});
                            setHasChanges(true);
                          }}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Position</label>
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => {
                            setProfileData({...profileData, position: e.target.value});
                            setHasChanges(true);
                          }}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Location</label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => {
                            setProfileData({...profileData, location: e.target.value});
                            setHasChanges(true);
                          }}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground-secondary mb-2">Timezone</label>
                        <select
                          value={profileData.timezone}
                          onChange={(e) => {
                            setProfileData({...profileData, timezone: e.target.value});
                            setHasChanges(true);
                          }}
                          className="select"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Amsterdam">Amsterdam</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">Bio</label>
                      <textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => {
                          setProfileData({...profileData, bio: e.target.value});
                          setHasChanges(true);
                        }}
                        className="input resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Chat & Conversations</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'newConversations', label: 'New conversations', desc: 'Get notified when someone starts a new chat' },
                          { key: 'escalations', label: 'Escalations', desc: 'When a conversation is escalated to human agents' },
                          { key: 'botOffline', label: 'Bot offline', desc: 'When your bots go offline or encounter errors' }
                        ].map(setting => (
                          <label key={setting.key} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onChange={(e) => {
                                setNotificationSettings({
                                  ...notificationSettings,
                                  [setting.key]: e.target.checked
                                });
                                setHasChanges(true);
                              }}
                              className="w-5 h-5 rounded mt-0.5 border-border"
                            />
                            <div>
                              <span className="font-medium text-foreground">{setting.label}</span>
                              <p className="text-sm text-foreground-tertiary">{setting.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Reports & Analytics</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'weeklyReports', label: 'Weekly reports', desc: 'Summary of your bot performance and metrics' },
                          { key: 'monthlyReports', label: 'Monthly reports', desc: 'Detailed monthly analytics and insights' }
                        ].map(setting => (
                          <label key={setting.key} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onChange={(e) => {
                                setNotificationSettings({
                                  ...notificationSettings,
                                  [setting.key]: e.target.checked
                                });
                                setHasChanges(true);
                              }}
                              className="w-5 h-5 rounded mt-0.5 border-border"
                            />
                            <div>
                              <span className="font-medium text-foreground">{setting.label}</span>
                              <p className="text-sm text-foreground-tertiary">{setting.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">Product & Marketing</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'productUpdates', label: 'Product updates', desc: 'New features and platform improvements' },
                          { key: 'marketing', label: 'Marketing communications', desc: 'Tips, best practices, and promotional content' }
                        ].map(setting => (
                          <label key={setting.key} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onChange={(e) => {
                                setNotificationSettings({
                                  ...notificationSettings,
                                  [setting.key]: e.target.checked
                                });
                                setHasChanges(true);
                              }}
                              className="w-5 h-5 rounded mt-0.5 border-border"
                            />
                            <div>
                              <span className="font-medium text-foreground">{setting.label}</span>
                              <p className="text-sm text-foreground-tertiary">{setting.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg bg-background-secondary">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                          <p className="text-sm text-foreground-tertiary">Add an extra layer of security to your account</p>
                        </div>
                        <button className="btn-primary px-4 py-2 text-sm">
                          {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">Session Timeout</label>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, sessionTimeout: e.target.value});
                          setHasChanges(true);
                        }}
                        className="select"
                      >
                        <option value="1">1 hour</option>
                        <option value="4">4 hours</option>
                        <option value="8">8 hours</option>
                        <option value="24">24 hours</option>
                        <option value="never">Never</option>
                      </select>
                      <p className="text-sm text-foreground-tertiary mt-1">Automatically log out after this period of inactivity</p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={securitySettings.apiAccess}
                          onChange={(e) => {
                            setSecuritySettings({...securitySettings, apiAccess: e.target.checked});
                            setHasChanges(true);
                          }}
                          className="w-5 h-5 rounded border-border"
                        />
                        <div>
                          <span className="font-medium text-foreground">API Access</span>
                          <p className="text-sm text-foreground-tertiary">Allow third-party applications to access your data</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={securitySettings.loginAlerts}
                          onChange={(e) => {
                            setSecuritySettings({...securitySettings, loginAlerts: e.target.checked});
                            setHasChanges(true);
                          }}
                          className="w-5 h-5 rounded border-border"
                        />
                        <div>
                          <span className="font-medium text-foreground">Login Alerts</span>
                          <p className="text-sm text-foreground-tertiary">Get notified of suspicious login attempts</p>
                        </div>
                      </label>
                    </div>

                    <div className="p-4 border border-error-200 dark:border-error-800 rounded-lg bg-error-50 dark:bg-error-900/20">
                      <h3 className="font-medium text-error-800 dark:text-error-400 mb-2">Danger Zone</h3>
                      <p className="text-sm text-error-600 dark:text-error-500 mb-3">These actions cannot be undone</p>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/40 text-sm transition-colors">
                          Change Password
                        </button>
                        <button className="px-4 py-2 border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 rounded-lg hover:bg-error-100 dark:hover:bg-error-900/40 text-sm transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'account' || activeTab === 'appearance' || activeTab === 'data') && (
                <div className="card p-6">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}