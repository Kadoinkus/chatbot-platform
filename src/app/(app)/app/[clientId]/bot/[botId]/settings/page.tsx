'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, Upload, Globe, Clock, MessageSquare, Zap, Shield, Bell, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function BotSettingsPage({ params }: { params: { clientId: string; botId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const bot = client?.mascots.find(m => m.id === params.botId);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Form states
  const [botName, setBotName] = useState(bot?.name || '');
  const [description, setDescription] = useState(bot?.description || '');
  const [welcomeMessage, setWelcomeMessage] = useState(`Hi! I'm ${bot?.name}. How can I help you today?`);
  const [fallbackMessage, setFallbackMessage] = useState("I&apos;m not sure I understand. Could you please rephrase that?");
  const [personality, setPersonality] = useState('professional');
  const [responseSpeed, setResponseSpeed] = useState('instant');
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

  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  const tabs = [
    { id: 'general', label: 'General', icon: MessageSquare },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
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
              href={`/app/${client.id}/bot/${bot.id}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} />
              Back to analytics
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Bot Settings</h1>
                <p className="text-gray-600">Configure {bot.name}'s behavior and appearance</p>
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
              {activeTab === 'general' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot Avatar
                      </label>
                      <div className="flex items-center gap-4">
                        <img 
                          src={bot.image} 
                          alt={bot.name}
                          className="w-20 h-20 rounded-full"
                        />
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Upload size={16} />
                          Change Avatar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bot Name
                      </label>
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => {
                          setBotName(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setHasChanges(true);
                        }}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Welcome Message
                      </label>
                      <textarea
                        value={welcomeMessage}
                        onChange={(e) => {
                          setWelcomeMessage(e.target.value);
                          setHasChanges(true);
                        }}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        placeholder="The first message users see when they start a conversation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fallback Message
                      </label>
                      <textarea
                        value={fallbackMessage}
                        onChange={(e) => {
                          setFallbackMessage(e.target.value);
                          setHasChanges(true);
                        }}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        placeholder="Message shown when the bot doesn't understand the user"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Dutch</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'behavior' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Behavior Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Personality
                      </label>
                      <select 
                        value={personality}
                        onChange={(e) => {
                          setPersonality(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                        <option value="playful">Playful</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Defines how the bot communicates with users
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Speed
                      </label>
                      <select 
                        value={responseSpeed}
                        onChange={(e) => {
                          setResponseSpeed(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="instant">Instant</option>
                        <option value="natural">Natural (1-2 seconds)</option>
                        <option value="thoughtful">Thoughtful (3-5 seconds)</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Simulates typing time for more natural conversations
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confidence Threshold
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="70"
                        className="w-full"
                        onChange={() => setHasChanges(true)}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Low (More responses)</span>
                        <span>High (More accurate)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Conversation Length
                      </label>
                      <input
                        type="number"
                        defaultValue="50"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        onChange={() => setHasChanges(true)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum number of messages before suggesting human handoff
                      </p>
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
                          Enable small talk
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-7">
                        Allow the bot to engage in casual conversation
                      </p>
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
                          Use emojis
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-1 ml-7">
                        Include emojis in responses for friendlier interactions
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

              {(activeTab === 'security' || activeTab === 'notifications' || activeTab === 'advanced') && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6 capitalize">{activeTab} Settings</h2>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {activeTab === 'security' && <Shield size={32} className="text-gray-400" />}
                      {activeTab === 'notifications' && <Bell size={32} className="text-gray-400" />}
                      {activeTab === 'advanced' && <AlertTriangle size={32} className="text-gray-400" />}
                    </div>
                    <p className="text-gray-500">
                      {activeTab === 'security' && 'Security settings will be available soon'}
                      {activeTab === 'notifications' && 'Notification settings will be available soon'}
                      {activeTab === 'advanced' && 'Advanced settings will be available soon'}
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