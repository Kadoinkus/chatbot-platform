'use client';
import { useState } from 'react';
import { Upload, Bot, Zap, MessageSquare } from 'lucide-react';
import Modal from './Modal';

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (botData: any) => void;
}

export default function CreateBotModal({ isOpen, onClose, onCreate }: CreateBotModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: 'professional',
    category: 'customer-service',
    avatar: '',
    welcomeMessage: '',
    fallbackMessage: "I&apos;m not sure I understand. Could you please rephrase that?",
    language: 'english'
  });

  const personalities = [
    { id: 'professional', name: 'Professional', desc: 'Formal and business-focused' },
    { id: 'friendly', name: 'Friendly', desc: 'Warm and approachable' },
    { id: 'casual', name: 'Casual', desc: 'Relaxed and conversational' },
    { id: 'playful', name: 'Playful', desc: 'Fun and energetic' }
  ];

  const categories = [
    { id: 'customer-service', name: 'Customer Service', icon: MessageSquare, desc: 'Handle support inquiries' },
    { id: 'sales', name: 'Sales Assistant', icon: Zap, desc: 'Generate leads and sales' },
    { id: 'technical', name: 'Technical Support', icon: Bot, desc: 'Provide technical help' },
    { id: 'general', name: 'General Purpose', icon: MessageSquare, desc: 'Multi-purpose assistant' }
  ];

  const handleSubmit = () => {
    onCreate({
      ...formData,
      id: `bot_${Date.now()}`,
      status: 'Needs finalization',
      conversations: 0,
      image: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
    });
    onClose();
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      personality: 'professional',
      category: 'customer-service',
      avatar: '',
      welcomeMessage: '',
      fallbackMessage: "I&apos;m not sure I understand. Could you please rephrase that?",
      language: 'english'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Create New Bot - Step ${currentStep} of 3`} 
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 ${currentStep > step ? 'bg-black' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bot Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Customer Support Bot"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what this bot does..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFormData({...formData, category: category.id})}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.category === category.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm opacity-80">{category.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
              <div className="flex items-center gap-4">
                {formData.avatar && (
                  <img 
                    src={formData.avatar} 
                    alt="Bot avatar"
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Upload size={16} />
                  Upload Image
                </button>
                <span className="text-sm text-gray-500">Or leave empty for auto-generated avatar</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Personality */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Personality</label>
              <div className="grid grid-cols-2 gap-3">
                {personalities.map(personality => (
                  <button
                    key={personality.id}
                    onClick={() => setFormData({...formData, personality: personality.id})}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.personality === personality.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium">{personality.name}</h3>
                    <p className="text-sm opacity-80">{personality.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
              <textarea
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
                placeholder={`Hi! I&apos;m ${formData.name || 'your bot'}. How can I help you today?`}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fallback Message</label>
              <textarea
                value={formData.fallbackMessage}
                onChange={(e) => setFormData({...formData, fallbackMessage: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">Message shown when the bot doesn't understand</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select 
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="dutch">Dutch</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Review Your Bot</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`}
                    alt="Bot avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{formData.name}</h4>
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium capitalize">{categories.find(c => c.id === formData.category)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Personality</p>
                    <p className="font-medium capitalize">{personalities.find(p => p.id === formData.personality)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Language</p>
                    <p className="font-medium capitalize">{formData.language}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your bot will be created with "Needs finalization" status</li>
                <li>• You can add knowledge base content and train responses</li>
                <li>• Test conversations before going live</li>
                <li>• Configure integrations and channels</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          
          <button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={currentStep === 1 && !formData.name}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 3 ? 'Create Bot' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  );
}