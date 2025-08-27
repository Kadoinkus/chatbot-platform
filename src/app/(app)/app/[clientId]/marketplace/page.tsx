'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { Star, Zap, MessageCircle, Gamepad, Heart, ShoppingCart } from 'lucide-react';
import type { Client } from '@/lib/dataService';

type BotTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  animations: number;
  minigames: number;
  features: string[];
  price: 'Free' | number;
  popular: boolean;
  new: boolean;
};

const botTemplates: BotTemplate[] = [
  {
    id: 'template-1',
    name: 'Customer Support Pro',
    category: 'Customer Service',
    description: 'Professional customer support bot with advanced problem-solving capabilities',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CustomerPro&backgroundColor=3B82F6',
    rating: 4.8,
    reviews: 2847,
    animations: 35,
    minigames: 2,
    features: ['24/7 Support', 'Multilingual', 'Escalation Flow', 'Analytics'],
    price: 29,
    popular: true,
    new: false
  },
  {
    id: 'template-2',
    name: 'Sales Assistant',
    category: 'Sales & Marketing',
    description: 'Boost your sales with this intelligent sales assistant bot',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SalesBot&backgroundColor=10B981',
    rating: 4.9,
    reviews: 1923,
    animations: 28,
    minigames: 1,
    features: ['Lead Generation', 'Product Recommendations', 'Booking System', 'CRM Integration'],
    price: 39,
    popular: true,
    new: false
  },
  {
    id: 'template-3',
    name: 'E-commerce Helper',
    category: 'E-commerce',
    description: 'Perfect for online stores with order tracking and product assistance',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EcommerceBot&backgroundColor=F59E0B',
    rating: 4.7,
    reviews: 3421,
    animations: 42,
    minigames: 3,
    features: ['Order Tracking', 'Product Search', 'Cart Recovery', 'Payment Help'],
    price: 'Free',
    popular: false,
    new: false
  },
  {
    id: 'template-4',
    name: 'HR Assistant',
    category: 'Human Resources',
    description: 'Streamline HR processes with automated employee assistance',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HRBot&backgroundColor=8B5CF6',
    rating: 4.6,
    reviews: 892,
    animations: 22,
    minigames: 0,
    features: ['Employee Onboarding', 'Policy Q&A', 'Leave Management', 'Training'],
    price: 25,
    popular: false,
    new: true
  },
  {
    id: 'template-5',
    name: 'Healthcare Guide',
    category: 'Healthcare',
    description: 'Provide medical information and appointment scheduling',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HealthBot&backgroundColor=EF4444',
    rating: 4.9,
    reviews: 1567,
    animations: 31,
    minigames: 1,
    features: ['Symptom Checker', 'Appointment Booking', 'Medicine Reminders', 'Health Tips'],
    price: 49,
    popular: false,
    new: true
  },
  {
    id: 'template-6',
    name: 'Education Tutor',
    category: 'Education',
    description: 'Interactive learning companion with gamified education',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EduBot&backgroundColor=06B6D4',
    rating: 4.8,
    reviews: 2156,
    animations: 45,
    minigames: 5,
    features: ['Interactive Lessons', 'Quiz Games', 'Progress Tracking', 'Certificates'],
    price: 35,
    popular: true,
    new: false
  },
  {
    id: 'template-7',
    name: 'Restaurant Host',
    category: 'Food & Dining',
    description: 'Perfect for restaurants with menu assistance and reservations',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RestaurantBot&backgroundColor=F97316',
    rating: 4.5,
    reviews: 743,
    animations: 26,
    minigames: 2,
    features: ['Menu Display', 'Table Booking', 'Order Taking', 'Dietary Info'],
    price: 19,
    popular: false,
    new: false
  },
  {
    id: 'template-8',
    name: 'Travel Companion',
    category: 'Travel & Tourism',
    description: 'Your ultimate travel guide with booking and recommendations',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TravelBot&backgroundColor=EC4899',
    rating: 4.7,
    reviews: 1834,
    animations: 38,
    minigames: 4,
    features: ['Trip Planning', 'Hotel Booking', 'Local Guides', 'Weather Updates'],
    price: 32,
    popular: false,
    new: true
  }
];

const categories = [
  'All Categories',
  'Customer Service',
  'Sales & Marketing', 
  'E-commerce',
  'Human Resources',
  'Healthcare',
  'Education',
  'Food & Dining',
  'Travel & Tourism'
];

export default function MarketplacePage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const clientData = await getClientById(params.clientId);
        setClient(clientData);
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.clientId]);

  const filteredTemplates = botTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All Categories' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 ml-16">
        <div className="container max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bot Marketplace</h1>
            <p className="text-gray-600">Choose from our collection of pre-built bot templates</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search bot templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
                {/* Header with badges */}
                <div className="relative">
                  <div className="absolute top-3 left-3 flex gap-2">
                    {template.popular && (
                      <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        🔥 Popular
                      </span>
                    )}
                    {template.new && (
                      <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ✨ New
                      </span>
                    )}
                  </div>
                  
                  {/* Large Avatar */}
                  <div className="p-8 pt-12">
                    <div className="w-32 h-32 mx-auto mb-4">
                      <img 
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-0">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{template.category}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={`${
                            i < Math.floor(template.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{template.rating}</span>
                    <span className="text-xs text-gray-500">({template.reviews.toLocaleString()})</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap size={14} className="text-blue-500" />
                      <span className="text-gray-600">{template.animations}+ animations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gamepad size={14} className="text-purple-500" />
                      <span className="text-gray-600">{template.minigames} mini games</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 2).map(feature => (
                        <span key={feature} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{template.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      {template.price === 'Free' ? (
                        <span className="text-lg font-bold text-green-600">Free</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold">${template.price}</span>
                          <span className="text-sm text-gray-500">/month</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                      onClick={() => {
                        // TODO: Add to cart or install logic
                        alert(`Adding ${template.name} to your bots...`);
                      }}
                    >
                      <ShoppingCart size={14} />
                      {template.price === 'Free' ? 'Install' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <MessageCircle size={48} className="mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}