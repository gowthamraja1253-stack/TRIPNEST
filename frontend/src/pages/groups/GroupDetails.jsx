import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '@stomp/stompjs';
import {
  Users, UserPlus, Crown, Trash2, ArrowLeft, X, Shield, User, Check, Mail,
  Clock, DollarSign, Wallet, CheckCircle2, AlertCircle, Ban, ArrowRightLeft,
  Plus, MapPin, Compass, ArrowRight, LogOut, MessageSquare, Send
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SEO from '../../components/ui/SEO';
import { groupService } from '../../services/groupService';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';
import { useToast } from '../../components/ui/ToastProvider';
import { formatINR } from '../../utils/currency';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [group, setGroup] = useState(null);
  const [trips, setTrips] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'invitations' | 'expenses' | 'chat'
  
  // Group Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const chatEndRef = useRef(null);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMethod, setInviteMethod] = useState('email'); // 'email' | 'username'

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteTripId, setInviteTripId] = useState('');
  const [inviting, setInviting] = useState(false);

  // Group Expenses & Split Calculations State
  const [expenses, setExpenses] = useState([]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const [groupData, userTrips] = await Promise.all([
        groupService.getGroupDetails(groupId),
        tripService.getTrips()
      ]);
      setGroup(groupData);
      setTrips(userTrips || []);

      if (groupData.tripId) {
        setInviteTripId(groupData.tripId);
      }

      // Fetch invitations and trip expenses from DB & shared splits
      const [invData, dbExpenses] = await Promise.all([
        groupService.getGroupInvitations(groupId).catch(() => []),
        groupData.tripId ? expenseService.getExpensesByTrip(groupData.tripId).catch(() => []) : Promise.resolve([])
      ]);
      setInvitations(invData || []);

      const mappedDbExps = (dbExpenses || []).map(e => ({
        ...e,
        title: e.title || e.description || e.category,
        date: e.date || new Date().toISOString(),
        paidByMap: e.paidByMap || null,
        splitSharesMap: e.splitSharesMap || null
      }));

      setExpenses(mappedDbExps);
    } catch (error) {
      console.error('Failed to load group:', error);
      addToast('Failed to load group details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchChatMessages = async () => {
    try {
      const data = await groupService.getGroupMessages(groupId);
      setChatMessages(data || []);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    try {
      const sent = await groupService.sendGroupMessage(groupId, newMessageText.trim());
      setChatMessages(prev => {
        if (prev.some(m => m.id === sent.id)) {
          return prev;
        }
        return [...prev, sent];
      });
      setNewMessageText('');
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (error) {
      console.error("Failed to send message:", error);
      addToast("Failed to send message. Please try again.", "error");
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchChatMessages();
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);

      const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
      const wsBase = baseApiUrl.replace('/api/v1', '').replace('http:', 'ws:').replace('https:', 'wss:');
      const wsUrl = `${wsBase}/ws`;

      const client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('Connected to WebSocket Broker');
        client.subscribe(`/topic/groups/${groupId}`, (message) => {
          try {
            const body = JSON.parse(message.body);
            setChatMessages(prev => {
              if (prev.some(m => m.id === body.id)) {
                return prev;
              }
              return [...prev, body];
            });
            setTimeout(() => {
              chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      };

      client.activate();

      return () => {
        client.deactivate();
      };
    }
  }, [activeTab, groupId]);

  // Extract current logged-in user reliably (sessionStorage for tab isolation)
  const storedUserStr = sessionStorage.getItem('tripnest_user') || localStorage.getItem('tripnest_user');
  const currentUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const currentUsername = currentUser?.username || localStorage.getItem('username');

  const currentMember = group?.members?.find(m => m.username === currentUsername);
  const isCreator = group?.createdByUsername === currentUsername;
  const isAdmin = isCreator || currentMember?.role === 'ADMIN';

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (inviteMethod === 'email' && !inviteEmail.trim()) return;
    if (inviteMethod === 'username' && !inviteUsername.trim()) return;

    try {
      setInviting(true);
      if (inviteMethod === 'email') {
        await groupService.inviteByEmail(groupId, inviteEmail.trim(), inviteTripId || null);
        addToast(`Invitation sent to ${inviteEmail.trim()}!`, 'success');
      } else {
        await groupService.inviteMember(groupId, inviteUsername.trim());
        addToast(`Added ${inviteUsername.trim()} to group!`, 'success');
      }
      setInviteEmail('');
      setInviteUsername('');
      setShowInviteModal(false);
      fetchGroup();
    } catch (error) {
      console.error('Failed to invite member:', error);
      addToast(error.message || error.response?.data?.message || 'Failed to add/invite member. Check username or email.', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await groupService.cancelInvitation(groupId, invitationId);
      addToast('Invitation cancelled', 'info');
      setInvitations(invitations.filter(i => i.id !== invitationId));
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      addToast('Failed to cancel invitation', 'error');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await groupService.updateMemberRole(groupId, memberId, newRole);
      addToast('Member role updated successfully', 'success');
      fetchGroup();
    } catch (error) {
      console.error('Failed to update role:', error);
      addToast('Failed to update role', 'error');
    }
  };

  const handleTransferOwnership = async (memberId, memberName) => {
    if (!window.confirm(`Transfer group ownership to ${memberName}? They will become the main Group Admin.`)) return;
    try {
      await groupService.transferOwnership(groupId, memberId);
      addToast(`Ownership transferred to ${memberName}`, 'success');
      fetchGroup();
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      addToast('Failed to transfer ownership', 'error');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this group?`)) return;
    try {
      await groupService.removeMember(groupId, memberId);
      addToast(`${memberName} removed from group`, 'info');
      fetchGroup();
    } catch (error) {
      console.error('Failed to remove member:', error);
      addToast(error.message || error.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this group? This action cannot be undone.')) return;
    try {
      await groupService.deleteGroup(groupId);
      addToast('Group deleted successfully', 'info');
      navigate('/dashboard/groups');
    } catch (error) {
      addToast(error.message || error.response?.data?.message || 'Failed to delete group', 'error');
    }
  };
  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this travel group?')) return;
    try {
      await groupService.leaveGroup(groupId);
      addToast('You have left the group successfully', 'info');
      navigate('/dashboard/groups');
    } catch (error) {
      console.error('Failed to leave group:', error);
      addToast(error.message || error.response?.data?.message || 'Failed to leave group', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text mb-2">Travel Group Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/dashboard/groups')}>Back to Groups</Button>
      </div>
    );
  }

  const memberCount = group.members?.length || 1;
  const totalGroupExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Advanced Splitwise Balance Calculation per Member
  const memberBalances = (group.members || []).map(member => {
    const memberName = member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.username;
    
    // Calculate total amount paid by this member across all expenses
    let totalPaid = 0;
    let owedShare = 0;

    expenses.forEach(e => {
      // Paid By calculation
      if (e.paidByMap) {
        totalPaid += (parseFloat(e.paidByMap[member.username]) || 0);
      } else if (e.paidBy === member.username || e.paidBy === memberName || e.paidById === member.id) {
        totalPaid += e.amount;
      }

      // Owed Share calculation (taking into account who participated in the expense)
      if (e.splitSharesMap) {
        owedShare += (parseFloat(e.splitSharesMap[member.username]) || 0);
      } else {
        // Equal split fallback among all group members
        owedShare += (e.amount / memberCount);
      }
    });

    const netBalance = totalPaid - owedShare;

    return {
      id: member.id,
      username: member.username,
      name: memberName,
      totalPaid,
      owedShare,
      netBalance
    };
  });

  const getSettlements = () => {
    const debtors = [];
    const creditors = [];

    memberBalances.forEach(mb => {
      if (mb.netBalance < -0.01) {
        debtors.push({ username: mb.username, name: mb.name, owes: Math.abs(mb.netBalance) });
      } else if (mb.netBalance > 0.01) {
        creditors.push({ username: mb.username, name: mb.name, gets: mb.netBalance });
      }
    });

    const settlements = [];
    let dIdx = 0;
    let cIdx = 0;

    // Greedy matching of debtors and creditors to compute minimal transaction settlements
    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const amountToPay = Math.min(debtor.owes, creditor.gets);
      
      settlements.push({
        fromUsername: debtor.username,
        fromName: debtor.name,
        toUsername: creditor.username,
        toName: creditor.name,
        amount: amountToPay
      });

      debtor.owes -= amountToPay;
      creditor.gets -= amountToPay;

      if (debtor.owes < 0.01) {
        dIdx++;
      }
      if (creditor.gets < 0.01) {
        cIdx++;
      }
    }

    return settlements;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full overflow-hidden">
      <SEO title={`${group.name} - Travel Group`} description={group.description || 'Travel group details'} />

      {/* Back Link */}
      <button
        onClick={() => navigate('/dashboard/groups')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-semibold"
      >
        <ArrowLeft size={16} /> Back to Travel Groups
      </button>

      {/* Group Hero Banner */}
      <div className="bg-white rounded-[24px] border border-border overflow-hidden shadow-sm">
        <div className="h-44 bg-gradient-to-r from-primary to-indigo-600 relative p-6 flex flex-col justify-end text-white">
          <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider rounded-full w-fit mb-2 border border-white/20">
            Created by {group.createdByUsername}
          </span>
          <h1 className="text-3xl font-heading font-bold">{group.name}</h1>
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {group.tripDestination && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-2">
                <MapPin size={13} /> Linked Trip: {group.tripDestination} ({group.tripName})
              </div>
            )}
            <p className="text-text-secondary text-sm mt-1">{group.description || 'No description provided.'}</p>
            <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-text-secondary">
              <span className="flex items-center gap-1 text-primary"><Users size={15} /> {memberCount} Members</span>
              <span>•</span>
              <span>Created {new Date(group.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="primary" glow onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 text-xs">
              <UserPlus size={16} /> Invite / Add Trip Mates
            </Button>

            {isAdmin && (
              <Button variant="outline" onClick={handleDeleteGroup} className="text-xs text-red-600 hover:bg-red-50 border-red-200">
                <Trash2 size={16} /> Delete Group
              </Button>
            )}

            {currentMember && !isAdmin && (
              <Button variant="outline" onClick={handleLeaveGroup} className="text-xs text-red-600 hover:bg-red-50 border-red-200 flex items-center gap-1.5">
                <LogOut size={16} /> Leave Group
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border flex gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'members' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <Users size={16} /> Members ({memberCount})
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'invitations' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <Mail size={16} /> Sent Invitations ({invitations.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'expenses' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <Wallet size={16} /> Group Expenses & Debt Settlements
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'chat' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-secondary hover:text-text'
          }`}
        >
          <MessageSquare size={16} /> Group Chat
        </button>
      </div>

      {/* ── TAB 1: MEMBERS LIST ── */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-heading font-bold text-text">Group Trip Mates</h3>
            <Button variant="primary" glow onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 text-xs">
              <UserPlus size={16} /> Add Trip Mate
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.members?.map(member => {
              const isMemberAdmin = member.role === 'ADMIN';
              const isMemberCreator = member.username === group.createdByUsername;
              const displayName = member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.username;

              return (
                <div key={member.id} className="bg-white rounded-[20px] p-5 border border-border shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center shrink-0">
                      {(displayName || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-text truncate">{displayName}</h4>
                        {isMemberAdmin && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 font-bold text-[10px] uppercase rounded-full flex items-center gap-1 shrink-0">
                            <Crown size={10} /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary truncate">@{member.username}</p>
                    </div>
                  </div>

                  {isAdmin && !isMemberCreator && member.username !== currentUsername && (
                    <div className="pt-3 border-t border-border/50 flex flex-wrap items-center gap-2 text-xs">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="p-1.5 bg-gray-50 border border-border rounded-lg text-xs font-semibold outline-none"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Group Admin</option>
                      </select>

                      <button
                        onClick={() => handleTransferOwnership(member.id, displayName)}
                        className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold flex items-center gap-1 border border-amber-200"
                      >
                        <ArrowRightLeft size={12} /> Transfer Admin
                      </button>

                      <button
                        onClick={() => handleRemoveMember(member.id, displayName)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto border border-transparent hover:border-red-200"
                        title="Remove member"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: SENT INVITATIONS STATUS ── */}
      {activeTab === 'invitations' && (
        <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-heading font-bold text-text">Group Invitations Status</h3>
            <Button variant="primary" glow onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 text-xs">
              <UserPlus size={16} /> Send New Invitation
            </Button>
          </div>

          {invitations.length === 0 ? (
            <p className="text-text-secondary text-sm">No pending or sent invitations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Invited User / Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {invitations.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 text-text font-semibold">{inv.invitedUserEmail || inv.invitedUserUsername}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          inv.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600' :
                          inv.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                          inv.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' : 'bg-amber-500/10 text-amber-600 animate-pulse'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelInvitation(inv.id)}
                            className="px-3 py-1 bg-gray-100 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-border"
                          >
                            Cancel Invite
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: GROUP EXPENSE BALANCES & SETTLEMENTS ── */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-heading font-bold text-text">Group Expense Balances & Settlements</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Total Expenses: <span className="font-bold text-primary">{formatINR(totalGroupExpenses)}</span> · Automatically synchronized from Expense Tracker
              </p>
            </div>

            {/* Link to Expense Tracker Page */}
            <Button
              variant="primary"
              glow
              onClick={() => navigate(`/dashboard/expenses?tripId=${group.tripId || ''}`)}
              className="flex items-center gap-1.5 text-xs"
            >
              Go to Expense Tracker Page <ArrowRight size={15} />
            </Button>
          </div>

          {/* Member Net Balances Table */}
          <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm space-y-4">
            <h4 className="font-heading font-bold text-text text-base">Individual Member Balances</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Total Amount Paid</th>
                    <th className="py-3 px-4">Owed Share</th>
                    <th className="py-3 px-4">Net Balance (Owes / Gets)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {memberBalances.map(mb => (
                    <tr key={mb.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-bold text-text">{mb.name}</td>
                      <td className="py-3.5 px-4 text-text">{formatINR(mb.totalPaid)}</td>
                      <td className="py-3.5 px-4 text-text-secondary">{formatINR(mb.owedShare)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            mb.netBalance > 0 ? 'bg-emerald-500/10 text-emerald-600' :
                            mb.netBalance < 0 ? 'bg-red-500/10 text-red-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {mb.netBalance > 0 ? `Gets back ${formatINR(mb.netBalance)}` :
                             mb.netBalance < 0 ? `Owes ${formatINR(Math.abs(mb.netBalance))}` : 'Settled (₹0)'}
                          </span>

                          {mb.netBalance < -0.01 && (
                            <div className="text-[11px] text-red-600 font-semibold space-y-0.5 mt-1 ml-1">
                              {getSettlements()
                                .filter(s => s.fromUsername === mb.username)
                                .map((s, idx) => (
                                  <div key={idx}>Pay {formatINR(s.amount)} to {s.toName}</div>
                                ))
                              }
                            </div>
                          )}

                          {mb.netBalance > 0.01 && (
                            <div className="text-[11px] text-emerald-600 font-semibold space-y-0.5 mt-1 ml-1">
                              {getSettlements()
                                .filter(s => s.toUsername === mb.username)
                                .map((s, idx) => (
                                  <div key={idx}>Gets {formatINR(s.amount)} from {s.fromName}</div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recorded Group Payments List */}
          <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm space-y-4">
            <h4 className="font-heading font-bold text-text text-base">Recorded Shared Payments</h4>
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                No shared group expenses recorded yet. Go to the Expense Tracker Page to record payments with custom member splits.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {expenses.map(exp => (
                  <div key={exp.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-text text-base">{exp.title}</h4>
                      <p className="text-xs text-text-secondary">Paid by <span className="font-semibold text-primary">{exp.paidBy}</span> · {exp.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-text text-lg">{formatINR(exp.amount)}</p>
                      <p className="text-[11px] text-text-secondary">({exp.date ? new Date(exp.date).toLocaleDateString() : 'Today'})</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: GROUP CHAT ── */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-[24px] border border-border p-6 shadow-sm flex flex-col h-[550px]">
          <div className="border-b border-border pb-3 mb-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-heading font-bold text-text">Group Trip Chat</h3>
              <p className="text-xs text-text-secondary">Coordinate plans and share updates with your trip mates.</p>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary text-sm space-y-2">
                <MessageSquare className="w-12 h-12 text-gray-300" />
                <p className="font-semibold text-gray-400">No messages yet. Send a message to start the conversation!</p>
              </div>
            ) : (
              chatMessages.map(msg => {
                const isMe = msg.senderUsername === currentUsername;
                const senderDisplayName = msg.senderFirstName ? `${msg.senderFirstName} ${msg.senderLastName || ''}`.trim() : msg.senderUsername;
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      isMe 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-gray-100 text-text rounded-tl-none border border-gray-200'
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-bold text-primary mb-0.5">
                          {senderDisplayName}
                        </p>
                      )}
                      <p className="break-words font-medium leading-relaxed">{msg.message}</p>
                      <p className={`text-[9px] mt-1 text-right font-semibold ${
                        isMe ? 'text-white/70' : 'text-text-secondary'
                      }`}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-border pt-4 shrink-0">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessageText}
              onChange={e => setNewMessageText(e.target.value)}
              className="flex-1 p-3 bg-gray-50 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary focus:bg-white transition-all"
            />
            <Button variant="primary" glow type="submit" className="flex items-center justify-center p-3 w-12 h-12 shrink-0">
              <Send size={18} />
            </Button>
          </form>
        </div>
      )}

      {/* ── INVITE / ADD MEMBER MODAL ── */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !inviting && setShowInviteModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[24px] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="text-primary" size={24} />
                  <h3 className="text-xl font-heading font-bold text-text">Add Trip Mate</h3>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="p-2 text-gray-400 hover:text-text rounded-full">
                  <X size={18} />
                </button>
              </div>

              {/* Method Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-xl border border-border mb-4">
                <button
                  type="button"
                  onClick={() => setInviteMethod('email')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    inviteMethod === 'email' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  Invite by Email
                </button>
                <button
                  type="button"
                  onClick={() => setInviteMethod('username')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    inviteMethod === 'username' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  Add by Username
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                {inviteMethod === 'email' ? (
                  <Input
                    label="Registered Email Address *"
                    placeholder="e.g. friend@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                ) : (
                  <Input
                    label="Trip Mate Username *"
                    placeholder="e.g. sarah_traveler"
                    value={inviteUsername}
                    onChange={e => setInviteUsername(e.target.value)}
                    required
                  />
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setShowInviteModal(false)} disabled={inviting}>
                    Cancel
                  </Button>
                  <Button variant="primary" glow type="submit" disabled={inviting}>
                    {inviting ? 'Processing...' : inviteMethod === 'email' ? 'Send Invitation' : 'Add Trip Mate'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
