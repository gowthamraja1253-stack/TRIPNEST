import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Crown, Trash2, LogOut, ArrowLeft, Edit3, X,
  Loader2, MoreVertical, Shield, User, Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { groupService } from '../../services/groupService';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [editData, setEditData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroupDetails(groupId);
      setGroup(data);
      setEditData({ name: data.name, description: data.description || '' });
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    try {
      setInviting(true);
      setInviteError('');
      setInviteSuccess('');
      await groupService.inviteMember(groupId, inviteInput.trim());
      setInviteSuccess(`${inviteInput.trim()} has been invited!`);
      setInviteInput('');
      fetchGroup();
    } catch (error) {
      setInviteError(error.response?.data?.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this group?`)) return;
    try {
      await groupService.removeMember(groupId, memberId);
      fetchGroup();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await groupService.leaveGroup(groupId);
      navigate('/dashboard/groups');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this group? This action cannot be undone.')) return;
    try {
      await groupService.deleteGroup(groupId);
      navigate('/dashboard/groups');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await groupService.updateGroup(groupId, editData);
      setShowEditModal(false);
      fetchGroup();
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Group not found</h2>
        <Button variant="primary" onClick={() => navigate('/dashboard/groups')}>Back to Groups</Button>
      </div>
    );
  }

  // Determine current user's role
  const currentUsername = localStorage.getItem('username');
  const currentMember = group.members?.find(m => m.username === currentUsername);
  const isAdmin = currentMember?.role === 'ADMIN';
  const isCreator = group.createdByUsername === currentUsername;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/groups')}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Groups
      </button>

      {/* Group Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="h-40 bg-gradient-to-br from-brand-500 to-indigo-600 relative">
          {group.coverImageUrl && (
            <img src={group.coverImageUrl} alt={group.name} className="w-full h-full object-cover absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="p-6 -mt-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-slate-900 md:dark:text-white mb-1">{group.name}</h1>
              {group.description && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{group.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
                <Users size={14} />
                <span>{group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}</span>
                <span className="mx-1">•</span>
                <span>Created by {group.createdByUsername}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <>
                  <Button variant="ghost" onClick={() => setShowEditModal(true)} className="flex items-center gap-1.5 text-sm">
                    <Edit3 size={14} /> Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 text-sm">
                    <UserPlus size={14} /> Invite
                  </Button>
                </>
              )}
              {!isCreator && (
                <Button variant="ghost" onClick={handleLeaveGroup} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600">
                  <LogOut size={14} /> Leave
                </Button>
              )}
              {isCreator && (
                <Button variant="ghost" onClick={handleDeleteGroup} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600">
                  <Trash2 size={14} /> Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-brand-500" />
            Members ({group.members?.length || 0})
          </h2>
          {isAdmin && (
            <Button variant="primary" onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5">
              <UserPlus size={14} /> Invite
            </Button>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {group.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {member.profilePictureUrl ? (
                    <img src={member.profilePictureUrl} alt={member.username} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.username}
                    </span>
                    {member.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                        <Crown size={10} /> Admin
                      </span>
                    )}
                    {member.username === group.createdByUsername && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-medium">
                        <Shield size={10} /> Creator
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">@{member.username}</span>
                </div>
              </div>

              {isAdmin && member.username !== currentUsername && member.username !== group.createdByUsername && (
                <button
                  onClick={() => handleRemoveMember(member.id, member.username)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite a Member</h2>
                <button onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="p-6 space-y-4">
                <Input
                  label="Username or Email"
                  placeholder="Enter username or email address"
                  value={inviteInput}
                  onChange={(e) => { setInviteInput(e.target.value); setInviteError(''); setInviteSuccess(''); }}
                  required
                />

                {inviteError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    {inviteError}
                  </motion.p>
                )}
                {inviteSuccess && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg flex items-center gap-1.5">
                    <Check size={14} /> {inviteSuccess}
                  </motion.p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost"
                    onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={inviting || !inviteInput.trim()}>
                    {inviting ? <Loader2 size={18} className="animate-spin" /> : 'Send Invite'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Group</h2>
                <button onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateGroup} className="p-6 space-y-4">
                <Input
                  label="Group Name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={saving || !editData.name.trim()}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
