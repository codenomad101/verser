import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { useLocation } from 'wouter';
import { Shield, Bell, Users, Eye, EyeOff, Volume2, VolumeX, Globe, Lock } from 'lucide-react';
import { UniversalHeader } from '@/components/universal-header';
import { UniversalFooter } from '@/components/universal-footer';

export function PreferencesPage() {
  const { user, logoutMutation } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [, setLocation] = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check admin by role (admin or superuser)
  const isAdmin = !!user && ((user as any).role === 'admin' || (user as any).role === 'superuser');

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock notifications data
  const notifications = [
    { id: 1, type: "message", text: "New message from Sarah", time: "2m ago" },
    { id: 2, type: "like", text: "John liked your post", time: "5m ago" },
    { id: 3, type: "follow", text: "Emma started following you", time: "10m ago" },
  ];

  const handleLogout = () => {
    setShowProfileMenu(false);
    logoutMutation.mutate();
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not authenticated</h1>
          <p className="text-gray-600">Please log in to access preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-inter ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Universal Header */}
      <UniversalHeader 
        title="Preferences"
        subtitle="Customize your experience and privacy settings"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Preferences</h1>
          
          {/* Preferences Sections */}
          <div className="space-y-8">
            {/* Notifications Section */}
            <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications for new messages and activities</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Get notified via email about important updates</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Community Updates</h3>
                    <p className="text-sm text-gray-500">Notifications about communities you follow</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Privacy</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                    <p className="text-sm text-gray-500">Control who can see your profile information</p>
                  </div>
                  <select className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Public</option>
                    <option>Friends Only</option>
                    <option>Private</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Activity Status</h3>
                    <p className="text-sm text-gray-500">Show when you're online or offline</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Data Collection</h3>
                    <p className="text-sm text-gray-500">Allow collection of usage data for improvements</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="w-6 h-6 text-purple-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Theme</h3>
                    <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleDarkMode}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={toggleDarkMode}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Language</h3>
                    <p className="text-sm text-gray-500">Select your preferred language</p>
                  </div>
                  <select className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Font Size</h3>
                    <p className="text-sm text-gray-500">Adjust text size for better readability</p>
                  </div>
                  <select className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                    <option>Extra Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-orange-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Username</h3>
                    <p className="text-sm text-gray-500">Your unique identifier on the platform</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{user.username}</span>
                    <button className="text-blue-600 text-sm hover:text-blue-800">Change</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <p className="text-sm text-gray-500">Your account email address</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{user.email}</span>
                    <button className="text-blue-600 text-sm hover:text-blue-800">Change</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Change Password</button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Enable</button>
                </div>
              </div>
            </div>

            {/* Advanced Section */}
            <div className={`rounded-lg shadow-sm border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-indigo-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advanced</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Time Zone</h3>
                    <p className="text-sm text-gray-500">Set your local time zone</p>
                  </div>
                  <select className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>UTC-8 (Pacific)</option>
                    <option>UTC-5 (Eastern)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (Central European)</option>
                    <option>UTC+8 (China Standard)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Cache Management</h3>
                    <p className="text-sm text-gray-500">Clear cached data to free up space</p>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Clear Cache</button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
                    <p className="text-sm text-gray-500">Download a copy of your data</p>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-800">Export</button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="text-red-600 text-sm hover:text-red-800">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}