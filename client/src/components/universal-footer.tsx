import React from 'react';
import { useLocation } from 'wouter';
import { 
  Users, 
  Compass, 
  Settings, 
  Heart,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

interface UniversalFooterProps {
  className?: string;
}

export function UniversalFooter({ className = "" }: UniversalFooterProps) {
  const [, setLocation] = useLocation();

  const navigationItems = [
    { id: 'communities', label: 'Communities', path: '/communities/home', icon: Users },
    { id: 'discovery', label: 'Discovery', path: '/discovery/home', icon: Compass },
    { id: 'preferences', label: 'Preferences', path: '/preferences', icon: Settings },
  ];

  const quickLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Help Center', path: '/help' },
    { label: 'Community Guidelines', path: '/guidelines' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Verser</span>
            </div>
            <p className="text-gray-300 text-sm">
              Connect, discover, and share with communities around the world. 
              Your gateway to meaningful connections and endless possibilities.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setLocation(item.path)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => setLocation(link.path)}
                  className="block text-gray-300 hover:text-white transition-colors text-sm text-left"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Mail className="h-4 w-4" />
                <span>support@verser.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Globe className="h-4 w-4" />
                <span>www.verser.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Made with love for the community</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Verser. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
