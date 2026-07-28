import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, MessageSquare, Send, ChevronDown, ChevronUp, Clock, Plus, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supportService } from '../../services/supportService';

const faqs = [
  {
    question: "How do I invite friends to my trip?",
    answer: "Go to the Travel Groups page, select your trip, and click 'Invite Members'. You can invite them via email."
  },
  {
    question: "Can I use TripNest offline?",
    answer: "TripNest currently requires an internet connection to sync your itineraries and expenses across devices."
  },
  {
    question: "How do I split an expense?",
    answer: "In the Expenses tab, add a new expense and select 'Split Bill'. You can choose which group members to split the cost with."
  },
  {
    question: "Is my personal data secure?",
    answer: "Yes, we use industry-standard encryption for all data and never share your information with third parties without your consent."
  }
];

export default function HelpSupportPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await supportService.getUserTickets();
      if (res) setTickets(res);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;
    
    try {
      setCreating(true);
      const res = await supportService.createTicket(newTicket);
      if (res) {
        setTickets([res, ...tickets]);
        setNewTicket({ subject: '', description: '' });
        setActiveTab('tickets');
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LifeBuoy size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">How can we help you?</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Search our knowledge base, browse frequently asked questions, or contact our support team.
        </p>
      </div>

      <div className="flex gap-2 justify-center mb-8 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'faq'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'contact'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          Contact Support
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'tickets'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'
          }`}
        >
          My Tickets
        </button>
      </div>

      {activeTab === 'faq' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  activeFaq === index 
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600'
                }`}
              >
                <button
                  className="w-full text-left p-4 flex items-center justify-between focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="text-brand-500 flex-shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-slate-400 flex-shrink-0" size={20} />
                  )}
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'contact' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submit a Ticket</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Can't find the answer in our FAQs? Send us a message and we'll get back to you within 24 hours.
          </p>
          
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <Input
              label="Subject"
              name="subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              placeholder="E.g., Issue with syncing expenses"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Please describe your issue in detail..."
                required
                rows={5}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-colors"
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={creating} className="w-full sm:w-auto">
                {creating ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
                Submit Request
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'tickets' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Support Tickets</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">You haven't submitted any support requests yet.</p>
              <Button onClick={() => setActiveTab('contact')} variant="outline">
                <Plus size={16} className="mr-2" />
                Create Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300 transition-colors cursor-pointer">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{ticket.subject}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{ticket.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
