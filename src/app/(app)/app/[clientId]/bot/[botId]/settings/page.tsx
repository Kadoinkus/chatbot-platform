'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, Key, Clock, Shield, Bell, AlertTriangle, Database, Webhook, Download, CreditCard } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';

export default function BotSettingsPage({ params }: { params: { clientId: string; botId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const bot = client?.mascots.find(m => m.id === params.botId);
  const [activeTab, setActiveTab] = useState('api');
  const [hasChanges, setHasChanges] = useState(false);

  // Form states for administrative settings
  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk-live-xxx...xxx',
    webhookUrl: '',
    rateLimit: 1000,
  });
  
  const [businessHours, setBusinessHours] = useState({
    enabled: true,
    timezone: 'America/New_York',
    schedule: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' },
    }
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    allowedDomains: '',
    ipWhitelist: '',
    encryption: true,
    dataRetention: 30
  });

  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  const tabs = [
    { id: 'api', label: 'API & Keys', icon: Key },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: AlertTriangle },
  ];

  const handleSave = () => {
    // Mock save functionality
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 ml-16">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="mb-6">
            <Link 
              href={`/app/${client.id}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} />
              Back to bots
            </Link>
          </div>

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
                  <p className="text-gray-600 mb-1">Technical configuration and administration</p>
                  <p className="text-sm text-gray-500">Client: {client.name}</p>
                </div>
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
              {activeTab === 'api' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">API Configuration</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={apiSettings.apiKey}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          Regenerate
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Use this key to authenticate API requests
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Widget ID
                      </label>
                      <input
                        type="text"
                        value={`widget-${bot.id}`}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Unique identifier for embedding the chat widget
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limiting
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={apiSettings.rateLimit}
                          onChange={(e) => {
                            setApiSettings({...apiSettings, rateLimit: parseInt(e.target.value)});
                            setHasChanges(true);
                          }}
                          className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <span className="text-sm text-gray-600">requests per hour</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Embed Code
                      </label>
                      <textarea
                        readOnly
                        rows={4}
                        value={`<script src="https://api.chatbot.com/widget.js"\n  data-bot-id="${bot.id}"\n  data-client-id="${client.id}">\n</script>`}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <button className="mt-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Copy Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed Domains
                      </label>
                      <textarea
                        value={securitySettings.allowedDomains}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, allowedDomains: e.target.value});
                          setHasChanges(true);
                        }}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                        placeholder="example.com\napp.example.com"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        One domain per line. Widget will only load on these domains.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IP Whitelist
                      </label>
                      <textarea
                        value={securitySettings.ipWhitelist}
                        onChange={(e) => {
                          setSecuritySettings({...securitySettings, ipWhitelist: e.target.value});
                          setHasChanges(true);
                        }}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                        placeholder="192.168.1.1\n10.0.0.0/8"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Restrict API access to specific IP addresses or ranges
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={securitySettings.encryption}
                          onChange={(e) => {
                            setSecuritySettings({...securitySettings, encryption: e.target.checked});
                            setHasChanges(true);
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          End-to-end encryption
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-7">
                        Encrypt all messages between users and the bot
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Retention Period
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={securitySettings.dataRetention}
                          onChange={(e) => {
                            setSecuritySettings({...securitySettings, dataRetention: parseInt(e.target.value)});
                            setHasChanges(true);
                          }}
                          className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Automatically delete conversation data after this period
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'availability' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Availability Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-3 mb-4">
                        <input 
                          type="checkbox" 
                          checked={businessHours.enabled}
                          onChange={(e) => {
                            setBusinessHours({...businessHours, enabled: e.target.checked});
                            setHasChanges(true);
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Enable business hours
                        </span>
                      </label>
                      
                      {businessHours.enabled && (
                        <>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Timezone
                            </label>
                            <select 
                              value={businessHours.timezone}
                              onChange={(e) => {
                                setBusinessHours({...businessHours, timezone: e.target.value});
                                setHasChanges(true);
                              }}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="America/New_York">Eastern Time (ET)</option>
                              <option value="America/Chicago">Central Time (CT)</option>
                              <option value="America/Denver">Mountain Time (MT)</option>
                              <option value="America/Los_Angeles">Pacific Time (PT)</option>
                              <option value="Europe/London">London (GMT)</option>
                              <option value="Europe/Amsterdam">Amsterdam (CET)</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            {Object.entries(businessHours.schedule).map(([day, hours]) => (
                              <div key={day} className="flex items-center gap-4">
                                <label className="flex items-center gap-2 w-32">
                                  <input 
                                    type="checkbox" 
                                    checked={hours.enabled}
                                    onChange={() => setHasChanges(true)}
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className="text-sm capitalize">{day}</span>
                                </label>
                                {hours.enabled && (
                                  <>
                                    <input
                                      type="time"
                                      value={hours.start}
                                      onChange={() => setHasChanges(true)}
                                      className="px-3 py-1 border border-gray-200 rounded-lg"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                      type="time"
                                      value={hours.end}
                                      onChange={() => setHasChanges(true)}
                                      className="px-3 py-1 border border-gray-200 rounded-lg"
                                    />
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        After-hours message
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        placeholder="Message shown outside business hours"
                        defaultValue="Thanks for reaching out! We're currently closed but will respond as soon as we're back online."
                        onChange={() => setHasChanges(true)}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          className="w-4 h-4 rounded"
                          onChange={() => setHasChanges(true)}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Allow users to leave messages when offline
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'webhooks' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Webhook Configuration</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={apiSettings.webhookUrl}
                        onChange={(e) => {
                          setApiSettings({...apiSettings, webhookUrl: e.target.value});
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="https://your-server.com/webhook"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Receive real-time updates when events occur
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Events to Subscribe
                      </label>
                      <div className="space-y-2">
                        {['New conversation', 'Message received', 'Conversation ended', 'Human handoff requested', 'Error occurred'].map(event => (
                          <label key={event} className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              defaultChecked 
                              className="w-4 h-4 rounded"
                              onChange={() => setHasChanges(true)}
                            />
                            <span className="text-sm text-gray-700">{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key
                      </label>
                      <input
                        type="text"
                        value="whsec_xxx...xxx"
                        readOnly
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Use this to verify webhook signatures
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Billing & Usage</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                        <p className="text-xl font-semibold">Pro Plan</p>
                        <p className="text-sm text-gray-500">$299/month</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Usage This Month</p>
                        <p className="text-xl font-semibold">823 / 1,000</p>
                        <p className="text-sm text-gray-500">Bundle loads</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usage Alerts
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">Alert when usage reaches 80%</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">Alert when usage reaches 100%</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Link 
                        href={`/app/${client.id}/billing`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <CreditCard size={16} />
                        Manage Billing
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Data & Export</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Export Data
                      </label>
                      <div className="space-y-3">
                        <button className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <span>Export conversations (CSV)</span>
                          <Download size={16} />
                        </button>
                        <button className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <span>Export training data (JSON)</span>
                          <Download size={16} />
                        </button>
                        <button className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <span>Export analytics report (PDF)</span>
                          <Download size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Schedule
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Disabled</option>
                      </select>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-red-600 mb-4">Danger Zone</h3>
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                        Delete All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Advanced Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-sm font-medium text-gray-700">Debug Mode</span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-7">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-sm font-medium text-gray-700">Beta Features</span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-7">
                        Try experimental features before they're released
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom CSS
                      </label>
                      <textarea
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                        placeholder="/* Add custom styles for the chat widget */"
                      />
                    </div>
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