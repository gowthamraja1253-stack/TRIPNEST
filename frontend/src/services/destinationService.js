import { apiClient } from './apiClient';

// Helper to determine destination images based on name
const getDestinationImage = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('bali')) return '/images/destinations/bali_destination_1783347854372.jpg';
  if (n.includes('dubai')) return '/images/destinations/dubai_destination_1783347868029.jpg';
  if (n.includes('paris')) return '/images/destinations/paris_destination_1783347842867.jpg';
  if (n.includes('santorini')) return '/images/destinations/santorini_destination_1783347901421.jpg';
  if (n.includes('switzer')) return '/images/destinations/switzerland_destination_1783347889687.jpg';
  if (n.includes('tokyo') || n.includes('kyoto')) return '/images/destinations/tokyo_destination_1783347878638.jpg';
  return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop';
};

// Map backend DestinationResponse to frontend destination model
const mapBackendDestination = (d) => {
  if (!d) return null;
  return {
    id: String(d.id),
    name: d.name,
    country: d.country,
    rating: 4.8, // static rating since backend doesn't track rating
    reviews: 1250,
    bestSeason: 'Spring & Autumn',
    estBudget: 150000,
    duration: '5-7 Days',
    image: d.imageUrl || getDestinationImage(d.name),
    category: d.popular ? 'Popular' : 'Trending',
    description: d.description,
    attractionsList: d.attractions ? d.attractions.split(',').map(s => s.trim()) : []
  };
};

const mockHotels = [
  { id: 'h1', name: 'Ritz-Carlton Kyoto', rating: 4.9, pricePerNight: 85000, distance: '1.2 km from center', image: 'https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=400&auto=format&fit=crop', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'] },
  { id: 'h2', name: 'Kyoto Granbell Hotel', rating: 4.6, pricePerNight: 12500, distance: '0.5 km from center', image: 'https://images.unsplash.com/photo-1551882547-ff40c0d5b5df?q=80&w=400&auto=format&fit=crop', amenities: ['WiFi', 'Restaurant'] },
];

const mockRestaurants = [
  { id: 'r1', name: 'Kikunoi', cuisine: 'Traditional Kaiseki', rating: 4.9, costForTwo: 35000, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=400&auto=format&fit=crop' },
  { id: 'r2', name: 'Gion Kyoto Ramen', cuisine: 'Local Ramen', rating: 4.7, costForTwo: 1800, distance: '0.8 km', image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=400&auto=format&fit=crop' },
];

export const destinationService = {
  getTrendingDestinations: async () => {
    try {
      const data = await apiClient.get('/destinations');
      return (data || []).map(mapBackendDestination);
    } catch (error) {
      console.error("Failed to load destinations", error);
      return [];
    }
  },
  
  getDestinationDetails: async (id) => {
    try {
      const cleanId = parseInt(String(id).replace(/[^\d]/g, ''), 10);
      const destId = isNaN(cleanId) ? 1 : cleanId;

      const data = await apiClient.get(`/destinations/${destId}`);
      return mapBackendDestination(data);
    } catch (error) {
      console.error("Failed to load destination details", error);
      return null;
    }
  },

  createDestination: async (destData) => {
    const payload = {
      name: destData.name,
      country: destData.country,
      description: destData.description || '',
      attractions: destData.attractions || '',
      popular: Boolean(destData.popular),
      imageUrl: destData.imageUrl || ''
    };
    const data = await apiClient.post('/destinations', payload);
    return mapBackendDestination(data);
  },
  
  getAttractions: async (destId) => {
    try {
      const cleanId = parseInt(String(destId).replace(/[^\d]/g, ''), 10);
      const idVal = isNaN(cleanId) ? 1 : cleanId;
      const data = await apiClient.get(`/destinations/${idVal}`);
      if (data && data.attractions) {
        return data.attractions.split(',').map((att, idx) => ({
          id: `att-${destId}-${idx}`,
          name: att.trim(),
          rating: 4.8,
          timeRequired: '2-3 hours',
          entryFee: 0,
          description: `Famous attraction in the region.`,
          image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=400&auto=format&fit=crop'
        }));
      }
    } catch (e) {
      console.warn("Failed to get attractions", e);
    }
    return [];
  },
  
  getHotels: async (destId) => {
    return mockHotels;
  },
  
  getRestaurants: async (destId) => {
    return mockRestaurants;
  }
};
