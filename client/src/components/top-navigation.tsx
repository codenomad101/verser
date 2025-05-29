import { MessageCircle, Users, Compass, User } from "lucide-react";

interface TopNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function TopNavigation({ activeSection, onSectionChange }: TopNavigationProps) {
  const navigationItems = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "communities", label: "Communities", icon: Users },
    { id: "discovery", label: "Discovery", icon: Compass },
    { id: "profile", label: "Profile", icon: User }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="text-white h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-blue-600">Verser</span>
          </h1>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-6">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:scale-105'
                }`}
                title={item.label}
              >
                <IconComponent className="h-5 w-5" />
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
                
                {/* Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right side - can add notifications, search, etc. */}
        <div className="w-24"></div>
      </div>
    </div>
  );
}