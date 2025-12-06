


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Globe, LogOut, Loader2, Edit3, Check, X, Camera } from "lucide-react";
import { useAuth } from "../service/AuthContext";

const Profile = () => {
  const { user, loading: authLoading, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    avatarUrl: "",
    preferredLanguage: "en",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        avatarUrl: user.avatarUrl || "",
        preferredLanguage: user.preferredLanguage || "en",
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setMessage("");
    try {
      const data = await updateProfile(formData);
      if (data?.user) {
        setIsEditing(false);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100 to-orange-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          {/* <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Profile</h1>
            <p className="text-slate-600 mt-1">Manage your personal information</p>
          </div> */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-2xl shadow-sm font-medium flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
          {/* Profile Header Section */}
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center overflow-hidden ring-4 ring-slate-700/50 shadow-2xl">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-slate-300" />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-slate-900/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                <p className="text-slate-300 text-sm flex items-center gap-2 justify-center sm:justify-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => setIsEditing((s) => !s)}
                className="px-6 py-3 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Edit profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Content Section */}
          <div className="p-8">
            {isEditing ? (
              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400 outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Bio Textarea */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    onFocus={() => setFocusedField('bio')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400 outline-none resize-none"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Location and Language Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Location</label>
                    <div className="relative">
                      <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'location' ? 'text-slate-900' : 'text-slate-400'
                      }`} />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        onFocus={() => setFocusedField('location')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400 outline-none"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Language</label>
                    <div className="relative">
                      <Globe className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'language' ? 'text-slate-900' : 'text-slate-400'
                      }`} />
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                        onFocus={() => setFocusedField('language')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-200 text-slate-900 outline-none appearance-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 ml-1">Avatar URL</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    onFocus={() => setFocusedField('avatar')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-200 text-slate-900 placeholder:text-slate-400 outline-none"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 rounded-2xl font-semibold hover:from-slate-800 hover:to-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Save changes</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Bio Section */}
                {user.bio && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">About</h3>
                    <p className="text-slate-700 leading-relaxed text-base">{user.bio}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.location && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</p>
                          <p className="text-slate-900 font-medium">{user.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</p>
                        <p className="text-slate-900 font-medium">{user.preferredLanguage?.toUpperCase() || 'EN'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;