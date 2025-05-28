import { MessageSquare, Users, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeSection: "chat" | "communities" | "discovery" | "profile";
  onSectionChange: (section: "chat" | "communities" | "discovery" | "profile") => void;
}

export default function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  const navItems = [
    {
      id: "chat" as const,
      icon: MessageSquare,
      label: "Chat",
      activeColor: "text-purple-600 bg-purple-50"
    },
    {
      id: "communities" as const,
      icon: Users,
      label: "Communities",
      activeColor: "text-blue-600 bg-blue-50"
    },
    {
      id: "discovery" as const,
      icon: Compass,
      label: "Discover",
      activeColor: "text-green-600 bg-green-50"
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                isActive 
                  ? item.activeColor
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="text-lg mb-1 h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        <button className="flex flex-col items-center py-2 px-3 text-gray-500 hover:text-gray-700 transition-colors">
          <User className="text-lg mb-1 h-5 w-5" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
