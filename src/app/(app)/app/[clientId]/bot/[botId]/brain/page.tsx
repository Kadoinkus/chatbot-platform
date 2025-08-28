'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Brain, Sliders, BookOpen, MessageSquare, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';

export default function BrainStudioPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personality');
  
  const [personality, setPersonality] = useState({
    friendly: 80,
    professional: 60,
    humorous: 40,
    empathetic: 70,
    concise: 50,
    creative: 65
  });

  const [knowledge, setKnowledge] = useState([
    { id: 1, title: 'Product Documentation', items: 245, status: 'active', lastUpdated: '2 hours ago' },
    { id: 2, title: 'FAQ Database', items: 89, status: 'active', lastUpdated: '1 day ago' },
    { id: 3, title: 'Company Policies', items: 34, status: 'active', lastUpdated: '3 days ago' },
    { id: 4, title: 'Technical Support', items: 156, status: 'draft', lastUpdated: '1 week ago' }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [clientData, botData] = await Promise.all([
          getClientById(params.clientId),
          getBotById(params.botId)
        ]);
        setClient(clientData);
        setBot(botData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId, params.botId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  const handleSliderChange = (trait: string, value: number) => {
    setPersonality(prev => ({ ...prev, [trait]: value }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <Link 
            href={`/app/${client.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to bots
          </Link>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Brain Studio</h1>
              <p className="text-gray-600">Configure {bot.name}'s personality and knowledge base</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Test Responses
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                  <div className="flex gap-6 p-6">
                    <button
                      onClick={() => setActiveTab('personality')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'personality' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Personality
                    </button>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'knowledge' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Knowledge Base
                    </button>
                    <button
                      onClick={() => setActiveTab('responses')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'responses' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Response Templates
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === 'personality' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Sliders size={18} />
                          Personality Traits
                        </h3>
                        <div className="space-y-6">
                          {Object.entries(personality).map(([trait, value]) => (
                            <div key={trait}>
                              <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium capitalize">{trait}</label>
                                <span className="text-sm text-gray-600">{value}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) => handleSliderChange(trait, Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #000 0%, #000 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Less</span>
                                <span>More</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <MessageSquare size={18} />
                          Communication Style
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="style" defaultChecked className="text-black" />
                            <div>
                              <p className="font-medium">Conversational</p>
                              <p className="text-sm text-gray-600">Natural, friendly dialogue style</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="style" className="text-black" />
                            <div>
                              <p className="font-medium">Assistant</p>
                              <p className="text-sm text-gray-600">Helpful and service-oriented</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="style" className="text-black" />
                            <div>
                              <p className="font-medium">Expert</p>
                              <p className="text-sm text-gray-600">Knowledgeable and authoritative</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'knowledge' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <BookOpen size={18} />
                          Knowledge Sources
                        </h3>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                          Add Source
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {knowledge.map((source) => (
                          <div key={source.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <BookOpen size={18} className="text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{source.title}</p>
                                <p className="text-sm text-gray-600">{source.items} items • Updated {source.lastUpdated}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                source.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {source.status}
                              </span>
                              <button className="p-2 hover:bg-gray-100 rounded">
                                <Sliders size={16} className="text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <BookOpen size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Drop files here or click to browse</p>
                        <p className="text-xs text-gray-500 mb-4">Support for PDF, DOCX, TXT, CSV</p>
                        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                          Upload Documents
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'responses' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Zap size={18} />
                          Quick Responses
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Greeting</p>
                              <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                            </div>
                            <p className="text-sm text-gray-600">Hello! I'm {bot.name}, your virtual assistant. How can I help you today?</p>
                          </div>
                          
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Fallback</p>
                              <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                            </div>
                            <p className="text-sm text-gray-600">I'm not sure I understand. Could you please rephrase your question?</p>
                          </div>
                          
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium">Transfer to Human</p>
                              <button className="text-sm text-gray-600 hover:text-gray-900">Edit</button>
                            </div>
                            <p className="text-sm text-gray-600">I'll connect you with a human agent who can better assist you. One moment please...</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Shield size={18} />
                          Response Guidelines
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Always maintain a positive tone</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Avoid technical jargon when possible</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm">Provide sources when sharing information</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Use emojis in responses</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={18} />
                  Test Playground
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Input</label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                      rows={3}
                      placeholder="Type a message to test..."
                    />
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    Generate Response
                  </button>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Bot Response:</p>
                    <p className="text-sm text-gray-600">Response will appear here...</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-900 font-medium mb-1">Remember</p>
                  <p className="text-sm text-amber-700">
                    Changes to personality traits will affect all future conversations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}