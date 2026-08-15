import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Sun, Wallet, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currency';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Mountain lake
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Beach
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80', // Paris/City
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', // Mountains
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80', // Coastal
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80', // City skyline
  'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&w=800&q=80', // Tropical
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80', // Venice/Europe
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80', // Santorini
  'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=800&q=80', // Desert
];

const getFallbackImage = (name) => {
  if (!name) return FALLBACK_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
};

const DestinationCard = ({ destination }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const handleExplore = (e) => {
    e.stopPropagation();
    if (destination?.id) {
      navigate(`/dashboard/destinations/${destination.id}`);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={handleExplore}
      className="group relative flex flex-col w-full h-[500px] rounded-3xl overflow-hidden bg-background border border-border shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
    >
      {/* Image Section (Top 55%) */}
      <div className="relative h-[55%] w-full overflow-hidden">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={destination?.image || getFallbackImage(destination?.name)} 
          alt={destination?.name || 'Destination'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getFallbackImage(destination?.name);
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full glass-card hover:bg-white/20 transition-colors z-10"
          aria-label="Toggle Favorite"
        >
          <Heart 
            size={20} 
            className={`transition-colors ${isFavorite ? 'fill-accent text-accent' : 'text-white'}`} 
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 text-white font-medium text-sm">
          <Star size={16} className="fill-accent text-accent" />
          <span>{destination?.rating || '4.8'}</span>
          <span className="text-white/80 text-xs ml-1">({destination?.reviews || '1.2k'})</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5 justify-between">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-2xl font-heading font-bold text-text truncate pr-2">
              {destination?.name || 'Destination'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary mb-4">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm font-medium">{destination?.country || 'Global'}</span>
          </div>

          {/* Details Grid */}
          <div className="flex flex-col gap-3 mb-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Sun size={16} />
              </div>
              <span className="text-sm font-medium text-text truncate">{destination?.bestSeason || 'Spring & Autumn'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                <Wallet size={16} />
              </div>
              <span className="text-sm font-bold text-text truncate">{destination?.estBudget ? formatINR(destination.estBudget) : '₹1,50,000'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                <Clock size={16} />
              </div>
              <span className="text-sm font-medium text-text truncate">{destination?.duration || '5-7 Days'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleExplore}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Explore Destination <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
