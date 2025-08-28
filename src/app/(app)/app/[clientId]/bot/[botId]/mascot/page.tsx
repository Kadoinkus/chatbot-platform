'use client';
import { getClientById, getBotById } from '@/lib/dataService';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Palette, Sparkles, Image, Type, Monitor, Smartphone } from 'lucide-react';
import Link from 'next/link';
import type { Client, Bot } from '@/lib/dataService';

export default function MascotStudioPage({ params }: { params: { clientId: string; botId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [bot, setBot] = useState<Bot | undefined>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#0066FF');
  const [chatTheme, setChatTheme] = useState('modern');

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
              <h1 className="text-3xl font-bold mb-2">Mascot Studio</h1>
              <p className="text-gray-600">Customize {bot.name}'s appearance and chat interface</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Preview
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
                      onClick={() => setActiveTab('appearance')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'appearance' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      3D Mascot
                    </button>
                    <button
                      onClick={() => setActiveTab('colors')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'colors' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Colors & Branding
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`pb-2 px-1 font-medium transition-colors relative ${
                        activeTab === 'chat' 
                          ? 'text-black border-b-2 border-black' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Chat Interface
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Sparkles size={18} />
                          3D Model Customization
                        </h3>
                        <div className="bg-gray-100 rounded-lg p-8 text-center mb-4">
                          <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4" />
                          <p className="text-sm text-gray-600">3D Model Preview</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Body Type</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Humanoid</option>
                              <option>Robot</option>
                              <option>Animal</option>
                              <option>Abstract</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Animation Style</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Energetic</option>
                              <option>Calm</option>
                              <option>Professional</option>
                              <option>Playful</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Facial Expression</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Friendly Smile</option>
                              <option>Neutral</option>
                              <option>Excited</option>
                              <option>Thoughtful</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Accessories</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>None</option>
                              <option>Glasses</option>
                              <option>Hat</option>
                              <option>Headphones</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'colors' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Palette size={18} />
                          Brand Colors
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Primary Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="h-10 w-20 border border-gray-200 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 p-2 border border-gray-200 rounded-lg"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Accent Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="h-10 w-20 border border-gray-200 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="flex-1 p-2 border border-gray-200 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Image size={18} />
                          Logo & Branding
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Image size={32} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">Drop your logo here or click to browse</p>
                          <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                            Upload Logo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'chat' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Monitor size={18} />
                          Chat Widget Theme
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {['modern', 'classic', 'minimal'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setChatTheme(theme)}
                              className={`p-4 border-2 rounded-lg transition-all ${
                                chatTheme === theme 
                                  ? 'border-black bg-gray-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="bg-gray-200 rounded h-20 mb-2" />
                              <p className="text-sm font-medium capitalize">{theme}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Type size={18} />
                          Typography
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Font Family</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Inter</option>
                              <option>Roboto</option>
                              <option>Open Sans</option>
                              <option>Lato</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Message Style</label>
                            <select className="w-full p-2 border border-gray-200 rounded-lg">
                              <option>Chat Bubbles</option>
                              <option>Cards</option>
                              <option>Minimal</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Smartphone size={18} />
                          Widget Position
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="p-4 border-2 border-black rounded-lg bg-gray-50">
                            <p className="text-sm font-medium">Bottom Right</p>
                          </button>
                          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300">
                            <p className="text-sm font-medium">Bottom Left</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h3 className="font-semibold mb-4">Live Preview</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={bot.image} 
                        alt={bot.name}
                        className="w-8 h-8 rounded-full"
                        style={{ borderColor: primaryColor, borderWidth: 2 }}
                      />
                      <span className="font-medium">{bot.name}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                        <p className="text-sm">Hello! How can I help you today?</p>
                      </div>
                      <div 
                        className="text-white rounded-lg p-2 max-w-[80%] ml-auto"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <p className="text-sm">I have a question about your product</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button 
                      className="px-4 py-2 text-white rounded-full text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Start Conversation
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">Pro Tip</p>
                  <p className="text-sm text-blue-700">
                    Keep your mascot's appearance consistent with your brand identity for better recognition.
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