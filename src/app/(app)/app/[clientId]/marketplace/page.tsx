'use client';
import { useState, useEffect } from 'react';
import { getClientById } from '@/lib/dataService';
import { useCart } from '@/contexts/CartContext';
import Sidebar from '@/components/Sidebar';
import { Star, Zap, MessageCircle, Gamepad, Heart, ShoppingCart, CheckCircle, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/lib/dataService';

type BotTemplate = {
  id: string;
  name: string;
  appearance: string;
  studio: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  animations: number;
  expressions: number;
  features: string[];
  price: 'Free' | number;
  popular: boolean;
  new: boolean;
};

const botTemplates: BotTemplate[] = [
  {
    id: 'template-1',
    name: 'Maya Professional',
    appearance: 'Humanoid',
    studio: 'Notso (In-house)',
    description: 'Elegant humanoid mascot with professional business attire and warm expressions',
    image: '/images/marketplace/mascots/maya-professional.png',
    rating: 4.8,
    reviews: 2847,
    animations: 35,
    expressions: 24,
    features: ['Business Attire', '24 Expressions', 'Hand Gestures', '4K Textures'],
    price: 'Free',
    popular: true,
    new: false
  },
  {
    id: 'template-2',
    name: 'Zara Blob Companion',
    appearance: 'Blob',
    studio: 'Berlin Studio',
    description: 'Friendly blob mascot with smooth morphing animations and playful expressions',
    image: '/images/marketplace/mascots/zara-blob-companion.png',
    rating: 4.9,
    reviews: 1923,
    animations: 28,
    expressions: 16,
    features: ['Morphing Animations', 'Bounce Physics', 'Color Shifting', 'Cute Expressions'],
    price: 39,
    popular: true,
    new: false
  },
  {
    id: 'template-3',
    name: 'Geometric Navigator',
    appearance: 'Geometric',
    studio: 'Notso (In-house)',
    description: 'Abstract geometric mascot with crystalline structure and dynamic transformations',
    image: '/images/marketplace/mascots/geometric-navigator.png',
    rating: 4.7,
    reviews: 3421,
    animations: 42,
    expressions: 12,
    features: ['Crystal Transforms', 'Light Refraction', 'Faceted Design', 'Holographic Effects'],
    price: 'Free',
    popular: false,
    new: false
  },
  {
    id: 'template-4',
    name: 'Rex the Retriever',
    appearance: 'Animal (4-legged)',
    studio: 'Animation Works',
    description: 'Adorable golden retriever mascot with realistic fur and tail wagging animations',
    image: '/images/marketplace/mascots/rex-the-retriever.png',
    rating: 4.6,
    reviews: 892,
    animations: 22,
    expressions: 18,
    features: ['Fur Physics', 'Tail Wagging', 'Panting Animation', 'Playful Gestures'],
    price: 25,
    popular: false,
    new: true
  },
  {
    id: 'template-5',
    name: 'Phoenix the Firebird',
    appearance: 'Fantasy',
    studio: 'Pixel Dreams',
    description: 'Majestic phoenix with flame particles and soaring flight animations',
    image: '/images/marketplace/mascots/phoenix-the-firebird.png',
    rating: 4.9,
    reviews: 1567,
    animations: 31,
    expressions: 20,
    features: ['Particle Effects', 'Wing Flapping', 'Fire Trails', 'Mythical Presence'],
    price: 49,
    popular: false,
    new: true
  },
  {
    id: 'template-6',
    name: 'Pip the Penguin',
    appearance: 'Animal (2-legged)',
    studio: 'Creative Labs',
    description: 'Cheerful penguin mascot with sliding animations and winter-themed expressions',
    image: '/images/marketplace/mascots/pip-the-penguin.png',
    rating: 4.8,
    reviews: 2156,
    animations: 45,
    expressions: 26,
    features: ['Ice Sliding', 'Flipper Gestures', 'Snow Effects', 'Waddle Walk'],
    price: 35,
    popular: true,
    new: false
  },
  {
    id: 'template-7',
    name: 'Orion Mech Unit',
    appearance: 'Robot/Mech',
    studio: 'Digital Mascots Co',
    description: 'Futuristic robot mascot with LED displays and mechanical transformation sequences',
    image: '/images/marketplace/mascots/orion-mech-unit.png',
    rating: 4.5,
    reviews: 743,
    animations: 26,
    expressions: 14,
    features: ['LED Displays', 'Mechanical Sounds', 'Transformation', 'Holographic UI'],
    price: 19,
    popular: false,
    new: false
  },
  {
    id: 'template-8',
    name: 'Flux Abstract Form',
    appearance: 'Abstract',
    studio: 'Berlin Studio',
    description: 'Flowing abstract mascot with liquid-like movements and color-shifting properties',
    image: '/images/marketplace/mascots/flux-abstract-form.png',
    rating: 4.7,
    reviews: 1834,
    animations: 38,
    expressions: 10,
    features: ['Fluid Dynamics', 'Color Morphing', 'Abstract Forms', 'Particle Systems'],
    price: 32,
    popular: false,
    new: true
  }
];

const appearanceTypes = [
  'All Types',
  'Humanoid',
  'Blob',
  'Abstract', 
  'Animal (4-legged)',
  'Animal (2-legged)',
  'Robot/Mech',
  'Fantasy',
  'Geometric'
];

const studioFilters = [
  'All Studios',
  'Notso (In-house)',
  'Berlin Studio',
  'Animation Works',
  'Pixel Dreams',
  'Creative Labs',
  'Digital Mascots Co'
];

const pricingFilters = [
  'All Pricing',
  'Free',
  'Premium'
];

export default function MarketplacePage({ params }: { params: { clientId: string } }) {
  const [client, setClient] = useState<Client | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedAppearance, setSelectedAppearance] = useState('All Types');
  const [selectedStudio, setSelectedStudio] = useState('All Studios');
  const [selectedPricing, setSelectedPricing] = useState('All Pricing');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  
  const { addItem, totalItems } = useCart();

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
    const matchesAppearance = selectedAppearance === 'All Types' || template.appearance === selectedAppearance;
    const matchesStudio = selectedStudio === 'All Studios' || template.studio === selectedStudio;
    const matchesPricing = selectedPricing === 'All Pricing' || 
      (selectedPricing === 'Free' && template.price === 'Free') ||
      (selectedPricing === 'Premium' && template.price !== 'Free');
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAppearance && matchesStudio && matchesPricing && matchesSearch;
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
      
      <main className="flex-1 lg:ml-16">
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">3D Mascot Marketplace</h1>
            <p className="text-gray-600">Choose from our collection of animated 3D mascots for your chatbots</p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search 3D mascot templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 placeholder-gray-500 bg-white"
                />
              </div>
            </div>

            {/* Filter Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Appearance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appearance</label>
                <div className="flex gap-2 flex-wrap">
                  {appearanceTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedAppearance(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedAppearance === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Studio Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Studio</label>
                <div className="flex gap-2 flex-wrap">
                  {studioFilters.map(studio => (
                    <button
                      key={studio}
                      onClick={() => setSelectedStudio(studio)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedStudio === studio
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {studio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
                <div className="flex gap-2 flex-wrap">
                  {pricingFilters.map(pricing => (
                    <button
                      key={pricing}
                      onClick={() => setSelectedPricing(pricing)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPricing === pricing
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pricing}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col h-full">
                {/* Header with badges */}
                <div className="relative">
                  <div className="absolute top-3 left-3 flex gap-2 z-10">
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
                  <div className="p-6 pt-10">
                    <div className="w-20 h-20 mx-auto">
                      <img 
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 pt-2 flex-1 flex flex-col">
                  {/* Top Content */}
                  <div className="flex-1">
                    <div className="text-center mb-3">
                      <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{template.appearance}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{template.studio}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
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
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Zap size={12} className="text-blue-500" />
                        <span className="text-gray-600">{template.animations} animations</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Heart size={12} className="text-pink-500" />
                        <span className="text-gray-600">{template.expressions} expressions</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-3">
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
                  </div>

                  {/* Price and Action - Always at bottom */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div>
                      {template.price === 'Free' ? (
                        <span className="text-lg font-bold text-green-600">Free</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold">€{template.price}</span>
                          <span className="text-sm text-gray-500">/month</span>
                        </div>
                      )}
                    </div>
                    {addedItems.has(template.id) ? (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2" disabled>
                        <CheckCircle size={14} />
                        Added
                      </button>
                    ) : (
                      <button 
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                        onClick={() => {
                          addItem({
                            id: template.id,
                            type: 'template',
                            name: template.name,
                            description: template.description,
                            price: template.price,
                            image: template.image,
                            appearance: template.appearance,
                            studio: template.studio,
                            originalData: template
                          });
                          setAddedItems(prev => new Set(prev).add(template.id));
                          setTimeout(() => {
                            setAddedItems(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(template.id);
                              return newSet;
                            });
                          }, 2000);
                        }}
                      >
                        {template.price === 'Free' ? (
                          <><Plus size={14} />Install</>
                        ) : (
                          <><ShoppingCart size={14} />Add to Cart</>
                        )}
                      </button>
                    )}
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