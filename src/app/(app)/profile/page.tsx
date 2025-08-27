'use client';
import { useState } from 'react';
import { getSession } from '@/lib/auth';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { User, Mail, Phone, Building, MapPin, Key, Bell, Palette, Globe, Shield, Download, Upload, Save, Edit2 } from 'lucide-react';

export default function UserProfilePage() {
  const session = getSession();
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

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return null;
  }

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client?.id} />
      
      <main className="flex-1 ml-16">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </div>
              {hasChanges && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
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
              <nav className="bg-white rounded-xl border border-gray-200 p-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100 text-gray-700'
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
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img 
                          src={profileData.avatar} 
                          alt="Profile"
                          className="w-24 h-24 rounded-full"
                        />
                        <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full hover:bg-gray-800">
                          <Edit2 size={14} />
                        </button>
                      </div>
                      <div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Upload size={16} />
                          Change Photo
                        </button>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => {
                            setProfileData({...profileData, firstName: e.target.value});
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => {
                            setProfileData({...profileData, lastName: e.target.value});
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData({...profileData, email: e.target.value});
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => {
                            setProfileData({...profileData, phone: e.target.value});
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => {
                            setProfileData({...profileData, position: e.target.value});
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => {
                            setProfileData({...profileData, location: e.target.value});
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select 
                          value={profileData.timezone}
                          onChange={(e) => {
                            setProfileData({...profileData, timezone: e.target.value});
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => {
                          setProfileData({...profileData, bio: e.target.value});
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Chat & Conversations</h3>
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
                              className="w-5 h-5 rounded mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-gray-700">{setting.label}</span>
                              <p className="text-sm text-gray-500">{setting.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Reports & Analytics</h3>
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
                              className="w-5 h-5 rounded mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-gray-700">{setting.label}</span>
                              <p className="text-sm text-gray-500">{setting.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Product & Marketing</h3>
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
                              className="w-5 h-5 rounded mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-gray-700">{setting.label}</span>
                              <p className="text-sm text-gray-500">{setting.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                          {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                      <select 
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, sessionTimeout: e.target.value});
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="1">1 hour</option>
                        <option value="4">4 hours</option>
                        <option value="8">8 hours</option>
                        <option value="24">24 hours</option>
                        <option value="never">Never</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Automatically log out after this period of inactivity</p>
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
                          className="w-5 h-5 rounded"
                        />
                        <div>
                          <span className="font-medium text-gray-700">API Access</span>
                          <p className="text-sm text-gray-500">Allow third-party applications to access your data</p>
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
                          className="w-5 h-5 rounded"
                        />
                        <div>
                          <span className="font-medium text-gray-700">Login Alerts</span>
                          <p className="text-sm text-gray-500">Get notified of suspicious login attempts</p>
                        </div>
                      </label>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-medium text-red-800 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-600 mb-3">These actions cannot be undone</p>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 text-sm">
                          Change Password
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 text-sm">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'account' || activeTab === 'appearance' || activeTab === 'data') && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6 capitalize">{activeTab} Settings</h2>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {activeTab === 'account' && <Key size={32} className="text-gray-400" />}
                      {activeTab === 'appearance' && <Palette size={32} className="text-gray-400" />}
                      {activeTab === 'data' && <Download size={32} className="text-gray-400" />}
                    </div>
                    <p className="text-gray-500">
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
  );
}