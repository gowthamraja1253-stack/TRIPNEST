import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MapPin, Calendar, Wallet, ShoppingBag, Utensils, RotateCcw, Trash2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import AIMessage from './AIMessage';
import AIInput from './AIInput';
import AITypingIndicator from './AITypingIndicator';

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'Plan a Trip', prompt: 'I want to plan a new trip. Can you help me get started?' },
  { icon: MapPin, label: 'Explore Destinations', prompt: 'What are some great travel destinations for this time of year?' },
  { icon: Calendar, label: 'Build Itinerary', prompt: 'I need help building an itinerary for an upcoming trip.' },
  { icon: Wallet, label: 'Plan Budget', prompt: 'How can I plan and manage a travel budget effectively?' },
  { icon: ShoppingBag, label: 'Packing List', prompt: 'Can you give me a general packing checklist for a 1-week trip?' },
  { icon: Utensils, label: 'Food Recommendations', prompt: 'How do I find the best local food when traveling?' },
];

export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend.trim() };
    
    // Optimistic UI update
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.chat(textToSend.trim(), messages);
      
      if (response.tripCreated) {
        window.dispatchEvent(new Event('trip-created'));
      }
      
      setMessages(prev => [...prev, { role: 'model', content: response.message }]);
    } catch (err) {
      console.error(err);
      setError('Sorry, I couldn\'t reach TripNest AI right now. Please try again.');
      // Remove the user message if it failed completely so they can retry easily? 
      // Actually better to keep it and show a retry button, or just show the error.
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[400px] lg:h-[600px] bg-background lg:rounded-2xl lg:shadow-2xl border-0 lg:border border-border z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface border-b border-border z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-text leading-tight">TripNest AI</h3>
              <p className="text-xs text-text-muted">Your personal travel assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Clear Conversation"
                aria-label="Clear Conversation"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close Assistant"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-bold text-text mb-2">Hi! I'm TripNest AI 👋</h2>
              <p className="text-center text-sm text-text-secondary mb-8 leading-relaxed">
                I can help you plan trips, discover destinations, build itineraries and manage your travel plans.
              </p>
              
              <div className="w-full flex flex-wrap gap-2 justify-center">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(action.prompt)}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface border border-border hover:border-primary hover:text-primary rounded-xl text-xs font-medium text-text-secondary transition-all shadow-sm hover:shadow"
                    >
                      <Icon size={14} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((msg, idx) => (
                <AIMessage key={idx} role={msg.role} content={msg.content} />
              ))}
              
              {isLoading && <AITypingIndicator />}
              
              {error && (
                <div className="flex items-center justify-between p-3 mb-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                  <span>{error}</span>
                  <button 
                    onClick={() => handleSend(messages[messages.length-1]?.content)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <AIInput 
          input={input} 
          setInput={setInput} 
          onSend={() => handleSend()} 
          isLoading={isLoading} 
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
