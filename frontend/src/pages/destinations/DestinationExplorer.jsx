import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Map, Palmtree, Mountain, Tent, Building2, MapPin, Plus, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { destinationService } from '../../services/destinationService';
import DestinationCard from '../../components/destinations/DestinationCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SEO from '../../components/ui/SEO';
import { useToast } from '../../components/ui/ToastProvider';

const CATEGORIES = [
  { name: 'Beaches', icon: Palmtree, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { name: 'Mountains', icon: Mountain, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Cities', icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { name: 'Historical', icon: MapPin, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { name: 'Camping', icon: Tent, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function DestinationExplorer() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Add Destination Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [destName, setDestName] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destDescription, setDestDescription] = useState('');
  const [destAttractions, setDestAttractions] = useState('');
  const [destImageUrl, setDestImageUrl] = useState('');
  const [destPopular, setDestPopular] = useState(true);

  const { addToast } = useToast();

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationService.getTrendingDestinations();
      setDestinations(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleAddDestination = async () => {
    if (!destName || !destCountry) return;
    setIsSubmitting(true);
    try {
      await destinationService.createDestination({
        name: destName,
        country: destCountry,
        description: destDescription,
        attractions: destAttractions,
        imageUrl: destImageUrl,
        popular: destPopular
      });
      addToast('Destination added successfully!', 'success');
      setShowAddModal(false);
      // Reset form
      setDestName('');
      setDestCountry('');
      setDestDescription('');
      setDestAttractions('');
      setDestImageUrl('');
      setDestPopular(true);
      // Reload destinations
      await fetchDestinations();
    } catch (error) {
      console.error('Failed to add destination:', error);
      addToast('Failed to add destination. Please check the backend connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = (dest.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (dest.country || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || dest.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-12">
      <SEO title="Explore Destinations" description="Discover beautiful destinations around the world." />
      
      {/* ── Hero Search Section ── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[32px] overflow-hidden bg-dark text-white p-10 md:p-16 min-h-[400px] flex flex-col justify-center items-center text-center shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop')] opacity-30 mix-blend-overlay object-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent"></div>
        
        <div className="relative z-10 max-w-3xl w-full">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold tracking-wide uppercase mb-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Explore The World
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 drop-shadow-md">
            Where to next?
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search destinations, countries, or attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/90 backdrop-blur-xl border border-white/20 text-dark placeholder-gray-500 rounded-full py-4 pl-14 pr-6 outline-none focus:ring-4 focus:ring-primary/30 transition-all shadow-xl text-lg font-medium"
            />
          </div>
        </div>
      </motion.section>

      {/* ── Categories & Actions ── */}
      <section className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2 text-text">
            <Compass className="text-primary" /> Popular Categories
          </h2>
          <Button 
            variant="primary" 
            glow 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Add New Destination
          </Button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveCategory('All')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all font-semibold ${
              activeCategory === 'All' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-border/50 text-text-secondary hover:bg-gray-50'
            }`}
          >
            <Map size={18} /> All Destinations
          </button>
          
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all font-semibold border ${
                activeCategory === cat.name ? 'bg-white shadow-md border-primary text-primary' : 'bg-white border-border/50 text-text-secondary hover:bg-gray-50'
              }`}
            >
              <cat.icon size={18} className={cat.color} /> {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Destination Grid ── */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-heading font-bold mb-6 text-text">Trending Destinations</h2>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" className="text-primary" />
          </div>
        ) : filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDestinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-border/50 p-8">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-heading font-bold text-text mb-2">No destinations found</h3>
            <p className="text-text-secondary mb-6">Be the first to add this destination!</p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} className="mr-1" /> Add Destination
            </Button>
          </div>
        )}
      </section>

      {/* ── Add Destination Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !isSubmitting && setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[24px] shadow-2xl border border-border p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-text">Add New Destination</h3>
                    <p className="text-xs text-text-secondary">Save new place details into the database</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  disabled={isSubmitting}
                  className="p-2 rounded-full hover:bg-gray-100 text-text-secondary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Destination Name"
                    value={destName}
                    onChange={e => setDestName(e.target.value)}
                    placeholder="e.g. Kyoto"
                    required
                  />
                  <Input
                    label="Country"
                    value={destCountry}
                    onChange={e => setDestCountry(e.target.value)}
                    placeholder="e.g. Japan"
                    required
                  />
                </div>

                <Input
                  label="Image URL"
                  value={destImageUrl}
                  onChange={e => setDestImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  icon={ImageIcon}
                />

                {destImageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-40 border border-border">
                    <img src={destImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={destDescription}
                    onChange={e => setDestDescription(e.target.value)}
                    placeholder="Describe what makes this destination special..."
                    className="w-full p-3 bg-gray-50 border border-border rounded-xl text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <Input
                  label="Key Attractions (comma separated)"
                  value={destAttractions}
                  onChange={e => setDestAttractions(e.target.value)}
                  placeholder="e.g. Fushimi Inari, Kinkaku-ji, Bamboo Grove"
                />

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="popular-check"
                    checked={destPopular}
                    onChange={e => setDestPopular(e.target.checked)}
                    className="w-4 h-4 text-primary accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="popular-check" className="text-sm font-medium text-text cursor-pointer">
                    Mark as Popular / Featured Destination
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  glow 
                  onClick={handleAddDestination} 
                  disabled={isSubmitting || !destName || !destCountry}
                >
                  {isSubmitting ? 'Adding...' : 'Add Destination'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
