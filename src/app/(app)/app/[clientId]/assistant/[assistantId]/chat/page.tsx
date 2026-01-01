'use client';
import { useState, useRef, useEffect, use } from 'react';
import { getMascotColor } from '@/lib/brandColors';
import { getClientById, getAssistantById } from '@/lib/dataService';
import type { Client, Assistant } from '@/types';
import { ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, Info, Smile, Mic, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  Page,
  PageContent,
  Button,
  EmptyState,
} from '@/components/ui';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
  attachments?: { name: string; size: string; type: string }[];
}

export default function AssistantChatPage({ params }: { params: Promise<{ clientId: string; assistantId: string }> }) {
  const { clientId, assistantId } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  useEffect(() => {
    async function loadData() {
      const [clientData, assistantData] = await Promise.all([
        getClientById(clientId),
        getAssistantById(assistantId, clientId),
      ]);
      setClient(clientData || null);
      setAssistant(assistantData || null);
    }
    loadData();
  }, [clientId, assistantId]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      content: `Hi! I'm ${assistant?.name}. How can I help you today?`,
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

  if (!client || !assistant) {
    return (
      <Page>
        <PageContent>
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="AI Assistant not found"
            message="The requested AI assistant could not be found."
          />
        </PageContent>
      </Page>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-surface-elevated border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={`/app/${client.slug}/assistant/${assistant.id}`}
                  className="text-foreground-secondary hover:text-foreground"
                >
                  <ArrowLeft size={20} />
                </Link>
                <img
                  src={assistant.image}
                  alt={assistant.name}
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: getMascotColor(assistant.id, assistant.clientId, 'primary', assistant.colors, client.brandColors) }}
                />
                <div>
                  <h1 className="font-semibold text-foreground">{assistant.name}</h1>
                  <p className="text-xs text-success-600 dark:text-success-500">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-background-hover rounded-lg">
                  <Phone size={20} className="text-foreground-secondary" />
                </button>
                <button className="p-2 hover:bg-background-hover rounded-lg">
                  <Video size={20} className="text-foreground-secondary" />
                </button>
                <button className="p-2 hover:bg-background-hover rounded-lg">
                  <Info size={20} className="text-foreground-secondary" />
                </button>
                <button className="p-2 hover:bg-background-hover rounded-lg">
                  <MoreVertical size={20} className="text-foreground-secondary" />
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
                    <img
                      src={assistant.image}
                      alt={assistant.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getMascotColor(assistant.id, assistant.clientId, 'primary', assistant.colors, client.brandColors) }}
                    />
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
                          ? 'bg-interactive text-foreground-inverse'
                          : message.sender === 'agent'
                          ? 'bg-info-100 dark:bg-info-900/30 text-foreground'
                          : 'bg-background-secondary text-foreground'
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
                    <p className="text-xs text-foreground-tertiary mt-1 px-1">
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
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0.5"
                    style={{ backgroundColor: getMascotColor(assistant.id, assistant.clientId, 'primary', assistant.colors, client.brandColors) }}
                  >
                    <img src={assistant.image} alt={assistant.name} className="w-7 h-7 object-contain" />
                  </div>
                  <div className="bg-background-secondary rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-foreground-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-sm whitespace-nowrap hover:bg-background-hover text-foreground"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-surface-elevated border-t border-border p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-2">
                <button className="p-2 hover:bg-background-hover rounded-lg">
                  <Paperclip size={20} className="text-foreground-secondary" />
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
                    className="w-full px-4 py-3 bg-background-secondary text-foreground rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-border-focus"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                  />
                  <button className="absolute right-2 bottom-3 p-1 hover:bg-background-tertiary rounded">
                    <Smile size={20} className="text-foreground-secondary" />
                  </button>
                </div>
                <button className="p-2 hover:bg-background-hover rounded-lg">
                  <Mic size={20} className="text-foreground-secondary" />
                </button>
                <Button onClick={handleSendMessage}>
                  <Send size={20} />
                </Button>
              </div>
              <p className="text-xs text-foreground-tertiary mt-2">
                {assistant.name} typically replies instantly • Powered by AI
              </p>
            </div>
          </div>
    </main>
  );
}
