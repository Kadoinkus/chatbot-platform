'use client';
import { useState } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Plus, Upload, Download, Search, Edit2, Trash2, FileText, Link as LinkIcon, Tag, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  usageCount: number;
  confidence: number;
}

export default function KnowledgeBasePage({ params }: { params: { clientId: string; botId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const bot = client?.mascots.find(m => m.id === params.botId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock knowledge base data
  const [knowledgeItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      question: 'What are your business hours?',
      answer: 'Our business hours are Monday through Friday, 9 AM to 5 PM EST. We are closed on weekends and major holidays.',
      category: 'General',
      tags: ['hours', 'schedule', 'availability'],
      lastUpdated: new Date(Date.now() - 86400000),
      usageCount: 245,
      confidence: 95
    },
    {
      id: '2',
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and clicking on "Order History". You will also receive tracking information via email once your order ships.',
      category: 'Shipping',
      tags: ['tracking', 'order', 'shipping'],
      lastUpdated: new Date(Date.now() - 172800000),
      usageCount: 189,
      confidence: 92
    },
    {
      id: '3',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all products in original condition. To initiate a return, please visit our returns portal or contact customer service.',
      category: 'Returns',
      tags: ['returns', 'refund', 'policy'],
      lastUpdated: new Date(Date.now() - 259200000),
      usageCount: 156,
      confidence: 88
    },
    {
      id: '4',
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination.',
      category: 'Shipping',
      tags: ['international', 'shipping', 'global'],
      lastUpdated: new Date(Date.now() - 345600000),
      usageCount: 98,
      confidence: 90
    },
    {
      id: '5',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and we will send you a password reset link.',
      category: 'Account',
      tags: ['password', 'account', 'login'],
      lastUpdated: new Date(Date.now() - 432000000),
      usageCount: 67,
      confidence: 94
    }
  ]);

  const categories = ['All', 'General', 'Shipping', 'Returns', 'Account', 'Products', 'Payment'];
  
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

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
                <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
                <p className="text-gray-600">Manage Q&A pairs and training data for {bot.name}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Upload size={20} />
                  Import CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Download size={20} />
                  Export
                </button>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  <Plus size={20} />
                  Add Q&A
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <BookOpen size={16} />
                <p className="text-sm">Total Q&A Pairs</p>
              </div>
              <p className="text-2xl font-bold">{knowledgeItems.length}</p>
              <p className="text-xs text-green-600 mt-1">+5 this week</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Tag size={16} />
                <p className="text-sm">Categories</p>
              </div>
              <p className="text-2xl font-bold">{categories.length - 1}</p>
              <p className="text-xs text-gray-600 mt-1">6 active</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <AlertCircle size={16} />
                <p className="text-sm">Avg Confidence</p>
              </div>
              <p className="text-2xl font-bold">91%</p>
              <p className="text-xs text-green-600 mt-1">Above threshold</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FileText size={16} />
                <p className="text-sm">Most Used</p>
              </div>
              <p className="text-2xl font-bold">245</p>
              <p className="text-xs text-gray-600 mt-1">Business hours Q</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search questions, answers, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.toLowerCase()
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Q&A Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Q&A Pair</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <input
                    type="text"
                    placeholder="What question should the bot answer?"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                  <textarea
                    rows={3}
                    placeholder="The bot's response to this question"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                      {categories.slice(1).map(cat => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., shipping, tracking, delivery"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    Add Q&A Pair
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Knowledge Items List */}
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Trash2 size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {item.category}
                    </span>
                    <div className="flex gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>Used {item.usageCount} times</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${
                        item.confidence >= 90 ? 'text-green-600' : 
                        item.confidence >= 70 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {item.confidence}% confidence
                      </span>
                    </div>
                    <div>
                      Updated {Math.floor((Date.now() - item.lastUpdated.getTime()) / 86400000)}d ago
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Training Sources Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Training Sources</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium">FAQ Document</p>
                      <p className="text-xs text-gray-500">company-faq-2024.pdf</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Update</button>
                </div>
                <p className="text-xs text-gray-500">Last synced 2 days ago • 45 Q&A pairs</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <LinkIcon size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium">Website Scrape</p>
                      <p className="text-xs text-gray-500">www.example.com/help</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Resync</button>
                </div>
                <p className="text-xs text-gray-500">Last synced 1 week ago • 23 Q&A pairs</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-center h-full">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <Plus size={20} />
                    Add Training Source
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}