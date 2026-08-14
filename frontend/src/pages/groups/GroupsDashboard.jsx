import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Crown, UserPlus, Trash2, LogOut, X, Loader2, 
  ChevronRight, MailCheck, Check, Ban, BellRing, MapPin, Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { groupService } from '../../services/groupService';
import { tripService } from '../../services/tripService';
import { useToast } from '../../components/ui/ToastProvider';
import SEO from '../../components/ui/SEO';

export default function GroupsDashboard() {
  const [groups, setGroups] = useState([]);
  const [trips, setTrips] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroup, setNewGroup] = useState({ name: '', description: '', tripId: '' });

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, invitationsData, userTrips] = await Promise.all([
        groupService.getUserGroups(),
        groupService.getPendingInvitations(),
        tripService.getTrips()
      ]);
      setGroups(groupsData || []);
      setPendingInvitations(invitationsData || []);
      setTrips(userTrips || []);

      if (userTrips && userTrips.length > 0 && !newGroup.tripId) {
        setNewGroup(prev => ({ ...prev, tripId: userTrips[0].id }));
      }
    } catch (error) {
      console.error('Failed to load groups data:', error);
      addToast('Failed to load groups data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;
    try {
      setCreating(true);
      await groupService.createGroup(newGroup);
      addToast('Travel Group created successfully!', 'success');
      setNewGroup({ name: '', description: '', tripId: '' });
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create group:', error);
      addToast(error.message || error.response?.data?.message || 'Failed to create travel group', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptInvite = async (invitationId) => {
    try {
      await groupService.acceptInvitation(invitationId);
      addToast('Joined group successfully!', 'success');
      fetchData();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      addToast(error.message || error.response?.data?.message || 'Failed to accept invitation', 'error');
    }
  };

  const handleRejectInvite = async (invitationId) => {
    try {
      await groupService.rejectInvitation(invitationId);
      addToast('Invitation declined', 'info');
      setPendingInvitations(pendingInvitations.filter(i => i.id !== invitationId));
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      addToast(error.message || error.response?.data?.message || 'Failed to decline invitation', 'error');
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.tripDestination || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-12 w-full overflow-hidden"
    >
      <SEO title="Travel Groups" description="Collaborate with friends, share itineraries, and manage group travel expenses." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Travel Groups
          </h1>
          <p className="text-text-secondary mt-1">
            Collaborate with trip mates, plan day-by-day itineraries, and split group expenses effortlessly.
          </p>
        </div>
        <Button variant="primary" glow onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 shrink-0">
          <Plus size={18} />
          Create Travel Group
        </Button>
      </div>

      {/* ── Pending Group Invitations Banner ── */}
      {pendingInvitations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/30 rounded-[20px] p-5 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
            <BellRing size={20} className="animate-bounce" />
            Pending Group Invitations ({pendingInvitations.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="bg-surface rounded-xl p-4 border border-border flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-text text-base">{inv.groupName}</h4>
                  <p className="text-xs text-text-secondary">
                    Invited by <span className="font-semibold text-primary">{inv.invitedByName}</span>
                    {inv.tripDestination ? ` for trip "${inv.tripDestination}"` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAcceptInvite(inv.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    onClick={() => handleRejectInvite(inv.id)}
                    className="px-3 py-1.5 bg-black/10 dark:bg-white/10 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition-colors border border-border flex items-center gap-1"
                  >
                    <Ban size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search */}
      {groups.length > 0 && (
        <div className="max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search travel groups or destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
            />
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-surface rounded-[24px] border border-border p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-heading font-bold text-text">No Travel Groups Yet</h3>
          <p className="text-text-secondary text-sm">
            Create a group linked to your trip to invite trip mates, share day-wise plans, and track shared expenses.
          </p>
          <Button variant="primary" glow onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-1" /> Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate(`/dashboard/groups/${group.id}`)}
              className="bg-surface rounded-[20px] border border-border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-heading font-bold text-text truncate group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                </div>

                {group.tripDestination && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
                    <MapPin size={12} /> Linked Trip: {group.tripDestination}
                  </span>
                )}

                <p className="text-text-secondary text-xs line-clamp-2 mt-1">
                  {group.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-text-secondary">
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <Users size={14} /> {group.members?.length || 0} Members
                </span>
                <span>Created {new Date(group.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !creating && setShowCreateModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-[24px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-primary" size={24} />
                  <h3 className="text-xl font-heading font-bold text-text">Create Travel Group</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-text rounded-full">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <Input
                  label="Group Name *"
                  placeholder="e.g. Goa Trip Crew"
                  value={newGroup.name}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Link to Planned Trip *</label>
                  <select
                    value={newGroup.tripId}
                    onChange={e => setNewGroup({ ...newGroup, tripId: e.target.value })}
                    required
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary"
                  >
                    <option value="">Select a Planned Trip</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>{t.destination || t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Group Description</label>
                  <textarea
                    placeholder="Describe your travel group and plans..."
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} disabled={creating}>
                    Cancel
                  </Button>
                  <Button variant="primary" glow type="submit" disabled={creating || !newGroup.name.trim()}>
                    {creating ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
