'use client';
import { useState, useRef, useEffect } from 'react';
import { clients } from '@/lib/data';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, Info, Smile, Mic } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
  attachments?: { name: string; size: string; type: string }[];
}

export default function ChatInterfacePage({ params }: { params: { clientId: string; botId: string } }) {
  const client = clients.find(c => c.id === params.clientId);
  const bot = client?.mascots.find(m => m.id === params.botId);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      content: `Hi! I'm ${bot?.name}. How can I help you today?`,
      timestamp: new Date(Date.now() - 3600000),
      status: 'read'
    },
    {
      id: '2', 
      sender: 'user',
      content: 'I need help with my recent order',
      timestamp: new Date(Date.now() - 3000000),
      status: 'read'
    },
    {
      id: '3',
      sender: 'bot',
      content: 'I\'d be happy to help you with your order! Can you please provide your order number?',
      timestamp: new Date(Date.now() - 2940000),
      status: 'read'
    },
    {
      id: '4',
      sender: 'user',
      content: 'It\'s #ORD-2024-1234',
      timestamp: new Date(Date.now() - 2880000),
      status: 'read'
    },
    {
      id: '5',
      sender: 'bot',
      content: 'Thank you! I can see your order #ORD-2024-1234 was shipped yesterday and should arrive by Friday. Is there anything specific you\'d like to know about it?',
      timestamp: new Date(Date.now() - 2820000),
      status: 'read'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        content: inputMessage,
        timestamp: new Date(),
        status: 'sending'
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      // Simulate bot response
      setIsTyping(true);
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          content: 'Thank you for your message. I\'m processing your request...',
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  if (!client || !bot) {
    return <div className="p-6">Bot not found</div>;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar clientId={client.id} />
      
      <main className="flex-1 ml-16 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/app/${client.id}/bot/${bot.id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
              </Link>
              <img 
                src={bot.image} 
                alt={bot.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="font-semibold">{bot.name}</h1>
                <p className="text-xs text-green-600">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Info size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-lg ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.sender === 'bot' && (
                    <img src={bot.image} alt={bot.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                  )}
                  {message.sender === 'agent' && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                      AG
                    </div>
                  )}
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-black text-white'
                          : message.sender === 'agent'
                          ? 'bg-blue-100 text-gray-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.attachments && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs opacity-80">
                              <Paperclip size={12} />
                              <span>{file.name}</span>
                              <span>({file.size})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {formatTime(message.timestamp)}
                      {message.sender === 'user' && message.status && (
                        <span className="ml-2">
                          {message.status === 'read' && '✓✓'}
                          {message.status === 'sent' && '✓'}
                          {message.status === 'sending' && '⏱'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-lg">
                  <img src={bot.image} alt={bot.name} className="w-8 h-8 rounded-full" />
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Replies */}
        <div className="px-6 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Track my order', 'Shipping info', 'Return policy', 'Contact support'].map((reply) => (
                <button
                  key={reply}
                  onClick={() => setInputMessage(reply)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip size={20} className="text-gray-600" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black"
                  rows={1}
                  style={{ maxHeight: '120px' }}
                />
                <button className="absolute right-2 bottom-3 p-1 hover:bg-gray-200 rounded">
                  <Smile size={20} className="text-gray-600" />
                </button>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Mic size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-3 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bot.name} typically replies instantly • Powered by AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}