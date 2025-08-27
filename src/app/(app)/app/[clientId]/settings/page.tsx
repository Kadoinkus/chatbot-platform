'use client';
import { useState, useEffect } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { 
  Settings, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Users, 
  Globe, 
  Mail,
  Key,
  Database,
  Zap,
  FileText,
  Save,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Upload,
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export default function SettingsPage({ params }: { params: { clientId: string } }) {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  
  const client = clients.find(c => c.id === params.clientId);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: client?.name || '',
    companyEmail: 'contact@' + (client?.slug || 'company') + '.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Ave, New York, NY 10001',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewConversations: true,
    emailEscalations: true,
    emailDailyReport: false,
    emailWeeklyReport: true,
    emailMonthlyReport: true,
    pushNewConversations: true,
    pushEscalations: true,
    pushBotOffline: true,
    slackIntegration: false,
    slackWebhook: ''
  });

  // Security settings
  const [security, setSecurity] = useState({
    requireTwoFactor: false,
    sessionTimeout: '8',
    ipWhitelist: false,
    ipAddresses: '',
    passwordPolicy: 'medium',
    ssoEnabled: false,
    ssoProvider: 'none',
    apiAccess: true,
    auditLog: true
  });

  // Billing settings
  const [billing, setBilling] = useState({
    plan: 'Professional',
    billingEmail: 'billing@' + (client?.slug || 'company') + '.com',
    billingCycle: 'monthly',
    paymentMethod: 'Credit Card',
    cardLast4: '4242',
    nextBilling: '2025-09-01',
    autoRenew: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API & Webhooks', icon: Zap },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'team', label: 'Team Settings', icon: Users }
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setHasChanges(false);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleChange = (section: string, field: string, value: any) => {
    switch(section) {
      case 'general':
        setGeneralSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotifications(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecurity(prev => ({ ...prev, [field]: value }));
        break;
      case 'billing':
        setBilling(prev => ({ ...prev, [field]: value }));
        break;
    }
    setHasChanges(true);
  };

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <AuthGuard clientId={params.clientId}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar clientId={params.clientId} />
        
        <main className="flex-1 lg:ml-16 min-h-screen">
          <div className="max-w-7xl mx-auto p-3 lg:p-8 pt-20 lg:pt-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">Settings</h1>
                  <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 lg:px-4 py-3 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Alert */}
            {showAlert && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <span className="text-green-800">Settings saved successfully!</span>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Responsive Tabs Navigation */}
              <div className="w-full lg:w-64">
                {/* Mobile Dropdown */}
                <div className="lg:hidden relative">
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-left"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const activeTabData = tabs.find(t => t.id === activeTab);
                        const Icon = activeTabData?.icon || Settings;
                        return (
                          <>
                            <Icon size={18} />
                            <span className="font-medium">{activeTabData?.label || 'Settings'}</span>
                          </>
                        );
                      })()}
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setMobileDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              activeTab === tab.id ? 'bg-gray-50 text-black font-medium' : 'text-gray-700'
                            }`}
                          >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop Sidebar */}
                <nav className="hidden lg:block bg-white rounded-xl border border-gray-200 p-2">
                  <div className="flex flex-col gap-1">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-black text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} />
                            <span className="font-medium">{tab.label}</span>
                          </div>
                          <ChevronRight size={14} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">General Settings</h2>
                    
                    <div className="space-y-4 lg:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                          <input
                            type="text"
                            value={generalSettings.companyName}
                            onChange={(e) => handleChange('general', 'companyName', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                          <input
                            type="email"
                            value={generalSettings.companyEmail}
                            onChange={(e) => handleChange('general', 'companyEmail', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={generalSettings.companyPhone}
                            onChange={(e) => handleChange('general', 'companyPhone', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                          <select
                            value={generalSettings.timezone}
                            onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Amsterdam">Amsterdam</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                        <textarea
                          rows={3}
                          value={generalSettings.companyAddress}
                          onChange={(e) => handleChange('general', 'companyAddress', e.target.value)}
                          className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none text-base lg:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select
                            value={generalSettings.language}
                            onChange={(e) => handleChange('general', 'language', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          >
                            <option value="en">English</option>
                            <option value="nl">Dutch</option>
                            <option value="de">German</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                          <select
                            value={generalSettings.dateFormat}
                            onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select
                            value={generalSettings.currency}
                            onChange={(e) => handleChange('general', 'currency', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'emailNewConversations', label: 'New conversations', desc: 'Get notified when new conversations start' },
                            { key: 'emailEscalations', label: 'Escalations', desc: 'When conversations are escalated to human agents' },
                            { key: 'emailDailyReport', label: 'Daily report', desc: 'Summary of daily activity and metrics' },
                            { key: 'emailWeeklyReport', label: 'Weekly report', desc: 'Comprehensive weekly performance report' },
                            { key: 'emailMonthlyReport', label: 'Monthly report', desc: 'Monthly analytics and insights' }
                          ].map(setting => (
                            <label key={setting.key} className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={notifications[setting.key as keyof typeof notifications] as boolean}
                                onChange={(e) => handleChange('notifications', setting.key, e.target.checked)}
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
                        <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                        <div className="space-y-3">
                          {[
                            { key: 'pushNewConversations', label: 'New conversations', desc: 'Browser notifications for new chats' },
                            { key: 'pushEscalations', label: 'Escalations', desc: 'Urgent notifications for escalated conversations' },
                            { key: 'pushBotOffline', label: 'Bot offline', desc: 'Alert when a bot goes offline' }
                          ].map(setting => (
                            <label key={setting.key} className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={notifications[setting.key as keyof typeof notifications] as boolean}
                                onChange={(e) => handleChange('notifications', setting.key, e.target.checked)}
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
                        <h3 className="text-lg font-medium mb-4">Slack Integration</h3>
                        <label className="flex items-start gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={notifications.slackIntegration}
                            onChange={(e) => handleChange('notifications', 'slackIntegration', e.target.checked)}
                            className="w-5 h-5 rounded mt-0.5"
                          />
                          <div>
                            <span className="font-medium text-gray-700">Enable Slack notifications</span>
                            <p className="text-sm text-gray-500">Send notifications to your Slack workspace</p>
                          </div>
                        </label>
                        {notifications.slackIntegration && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                            <input
                              type="text"
                              value={notifications.slackWebhook}
                              onChange={(e) => handleChange('notifications', 'slackWebhook', e.target.value)}
                              placeholder="https://hooks.slack.com/services/..."
                              className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Security Settings</h2>
                    
                    <div className="space-y-4 lg:space-y-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500">Require 2FA for all team members</p>
                          </div>
                          <button
                            onClick={() => handleChange('security', 'requireTwoFactor', !security.requireTwoFactor)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              security.requireTwoFactor ? 'bg-black' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              security.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => handleChange('security', 'sessionTimeout', e.target.value)}
                          className="w-full px-4 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="1">1 hour</option>
                          <option value="4">4 hours</option>
                          <option value="8">8 hours</option>
                          <option value="24">24 hours</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                        <select
                          value={security.passwordPolicy}
                          onChange={(e) => handleChange('security', 'passwordPolicy', e.target.value)}
                          className="w-full px-4 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="low">Low - 6+ characters</option>
                          <option value="medium">Medium - 8+ chars, mixed case</option>
                          <option value="high">High - 10+ chars, mixed case, numbers, symbols</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={security.ipWhitelist}
                            onChange={(e) => handleChange('security', 'ipWhitelist', e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="font-medium text-gray-700">IP Whitelist</span>
                            <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                          </div>
                        </div>
                        {security.ipWhitelist && (
                          <textarea
                            rows={3}
                            value={security.ipAddresses}
                            onChange={(e) => handleChange('security', 'ipAddresses', e.target.value)}
                            placeholder="Enter IP addresses, one per line"
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none text-base lg:text-sm"
                          />
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={security.apiAccess}
                            onChange={(e) => handleChange('security', 'apiAccess', e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="font-medium text-gray-700">API Access</span>
                            <p className="text-sm text-gray-500">Allow API access for integrations</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={security.auditLog}
                            onChange={(e) => handleChange('security', 'auditLog', e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <span className="font-medium text-gray-700">Audit Logging</span>
                            <p className="text-sm text-gray-500">Track all security-related events</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Settings */}
                {activeTab === 'billing' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">Billing & Subscription</h2>
                    
                    <div className="space-y-4 lg:space-y-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg">Current Plan: {billing.plan}</h3>
                            <p className="text-sm text-gray-600">Next billing date: {billing.nextBilling}</p>
                          </div>
                          <button className="px-4 lg:px-4 py-3 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                            Upgrade Plan
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
                          <input
                            type="email"
                            value={billing.billingEmail}
                            onChange={(e) => handleChange('billing', 'billingEmail', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Cycle</label>
                          <select
                            value={billing.billingCycle}
                            onChange={(e) => handleChange('billing', 'billingCycle', e.target.value)}
                            className="w-full px-3 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base lg:text-sm"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly (20% discount)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-3">Payment Method</h3>
                        <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard size={24} className="text-gray-400" />
                            <div>
                              <p className="font-medium">•••• •••• •••• {billing.cardLast4}</p>
                              <p className="text-sm text-gray-500">Expires 12/2025</p>
                            </div>
                          </div>
                          <button className="px-4 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            Update Card
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium">Auto-Renew</h3>
                          <p className="text-sm text-gray-500">Automatically renew subscription</p>
                        </div>
                        <button
                          onClick={() => handleChange('billing', 'autoRenew', !billing.autoRenew)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            billing.autoRenew ? 'bg-black' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            billing.autoRenew ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <Download size={16} />
                          Download Invoice
                        </button>
                        <button className="flex items-center gap-2 px-4 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <FileText size={16} />
                          Billing History
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Settings */}
                {activeTab === 'api' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">API & Webhooks</h2>
                    
                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <h3 className="font-medium mb-3">API Keys</h3>
                        <div className="space-y-3">
                          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="font-mono text-sm">sk_live_••••••••••••••••••••••••••••••••</p>
                              <p className="text-sm text-gray-500 mt-1">Created on Jan 15, 2024</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <RefreshCw size={16} />
                              </button>
                              <button className="p-2 text-red-400 hover:text-red-600">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button className="mt-3 px-4 lg:px-4 py-3 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                          Generate New API Key
                        </button>
                      </div>

                      <div>
                        <h3 className="font-medium mb-3">Webhook Endpoints</h3>
                        <div className="space-y-3">
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">Conversation Started</p>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                            </div>
                            <p className="text-sm text-gray-600 font-mono">https://your-app.com/webhook/conversation</p>
                          </div>
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">Bot Offline Alert</p>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                            </div>
                            <p className="text-sm text-gray-600 font-mono">https://your-app.com/webhook/bot-status</p>
                          </div>
                        </div>
                        <button className="mt-3 px-4 lg:px-4 py-3 lg:py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                          Add Webhook Endpoint
                        </button>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-3">
                          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">API Documentation</p>
                            <p className="text-sm text-blue-800 mt-1">
                              View our complete API documentation and integration guides at{' '}
                              <a href="#" className="underline">docs.chatbot-platform.com/api</a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Settings */}
                {(activeTab === 'data' || activeTab === 'team') && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6 capitalize">{activeTab} Settings</h2>
                    <div className="text-center py-8 lg:py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        {activeTab === 'data' && <Database size={32} className="text-gray-400" />}
                        {activeTab === 'team' && <Users size={32} className="text-gray-400" />}
                      </div>
                      <p className="text-gray-500">
                        {activeTab === 'data' && 'Data export and privacy settings will be available soon'}
                        {activeTab === 'team' && 'Team role and permission settings will be available soon'}
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