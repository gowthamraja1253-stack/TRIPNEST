import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Save, Camera, Globe, Loader2, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { userService } from '../../services/userService';
import { mediaService } from '../../services/mediaService';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    travelPreferences: '',
    favoriteDestinations: '',
    profilePictureUrl: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userService.getUserProfile();
      if (res) {
        setProfile({
          firstName: res.firstName || '',
          lastName: res.lastName || '',
          email: res.email || '',
          phoneNumber: res.phoneNumber || '',
          dateOfBirth: res.dateOfBirth ? res.dateOfBirth.split('T')[0] : '',
          travelPreferences: res.travelPreferences || '',
          favoriteDestinations: res.favoriteDestinations || '',
          profilePictureUrl: res.profilePictureUrl || ''
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.updateUserProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth || null,
        travelPreferences: profile.travelPreferences,
        favoriteDestinations: profile.favoriteDestinations,
        profilePictureUrl: profile.profilePictureUrl
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your personal information and travel preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg bg-slate-100 dark:bg-slate-800">
                  {profile.profilePictureUrl ? (
                    <img 
                      src={profile.profilePictureUrl.startsWith('http') ? profile.profilePictureUrl : `http://localhost:8080${profile.profilePictureUrl}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        // eslint-disable-next-line no-undef
                        const res = await mediaService.uploadFile(file);
                        setProfile(prev => ({ ...prev, profilePictureUrl: res.fileDownloadUri }));
                        setSuccess(false);
                      } catch (error) {
                        console.error('Failed to upload image:', error);
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => document.getElementById('avatar-upload').click()}
                  className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors shadow-md"
                >
                  <Camera size={16} />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{profile.email}</p>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-3 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span>{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-3 text-sm">
                  <Phone size={16} className="text-slate-400" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <User size={18} className="text-brand-500" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    icon={<Phone size={16} />}
                  />
                  <Input
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                    icon={<Calendar size={16} />}
                  />
                </div>
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled
                  helperText="Email cannot be changed."
                  icon={<Mail size={16} />}
                />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <Globe size={18} className="text-brand-500" />
                  Travel Preferences
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Favorite Destinations
                  </label>
                  <textarea
                    name="favoriteDestinations"
                    value={profile.favoriteDestinations}
                    onChange={handleChange}
                    placeholder="E.g., Tokyo, Paris, New York..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Travel Style & Preferences
                  </label>
                  <textarea
                    name="travelPreferences"
                    value={profile.travelPreferences}
                    onChange={handleChange}
                    placeholder="E.g., I prefer window seats, luxury hotels, and adventure sports."
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      Saved successfully
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    className="min-w-[120px]"
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
