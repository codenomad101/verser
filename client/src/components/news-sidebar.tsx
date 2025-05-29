import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  MessageCircle, 
  Users, 
  Compass, 
  User,
  Clock,
  DollarSign
} from "lucide-react";

interface NewsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function NewsSidebar({ activeSection, onSectionChange }: NewsSidebarProps) {
  // Top news of the day
  const topNews = [
    {
      id: 1,
      title: "Major Tech Breakthrough in AI Development",
      source: "TechCrunch",
      time: "2h ago",
      category: "Technology"
    },
    {
      id: 2, 
      title: "Global Markets See Significant Growth",
      source: "Bloomberg",
      time: "3h ago",
      category: "Finance"
    },
    {
      id: 3,
      title: "New Social Platform Gains Million Users",
      source: "VentureBeat", 
      time: "5h ago",
      category: "Startups"
    }
  ];

  // Stock data
  const stocks = [
    { symbol: "AAPL", price: 182.31, change: +2.45, changePercent: +1.36 },
    { symbol: "GOOGL", price: 138.21, change: -1.23, changePercent: -0.88 },
    { symbol: "TSLA", price: 248.50, change: +5.67, changePercent: +2.33 },
    { symbol: "MSFT", price: 378.85, change: +0.94, changePercent: +0.25 },
    { symbol: "NVDA", price: 875.28, change: +12.43, changePercent: +1.44 }
  ];

  // User notifications
  const notifications = [
    {
      id: 1,
      type: "like",
      message: "Sarah liked your post",
      time: "5m ago",
      unread: true
    },
    {
      id: 2,
      type: "follow", 
      message: "New follower: @techguru_2024",
      time: "15m ago",
      unread: true
    },
    {
      id: 3,
      type: "comment",
      message: "3 new comments on your photo",
      time: "1h ago", 
      unread: false
    },
    {
      id: 4,
      type: "mention",
      message: "You were mentioned in a post",
      time: "2h ago",
      unread: false
    }
  ];

  const getStockIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getStockColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const navigationItems = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "communities", label: "Communities", icon: Users },
    { id: "discovery", label: "Discovery", icon: Compass },
    { id: "profile", label: "Profile", icon: User }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 space-y-6">
        {/* Top News */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Newspaper className="h-5 w-5 text-blue-600" />
              <span>Top News Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topNews.map((news) => (
                <div key={news.id} className="group cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {news.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {news.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{news.source}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{news.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {news.id < topNews.length && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stocks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Market Watch</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStockIcon(stock.change)}
                    <div>
                      <div className="font-semibold text-sm">{stock.symbol}</div>
                      <div className="text-xs text-gray-600">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className={`text-right ${getStockColor(stock.change)}`}>
                    <div className="text-sm font-medium">
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </div>
                    <div className="text-xs">
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <span>Notifications</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                {notifications.filter(n => n.unread).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    notification.unread ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollArea>

      {/* Horizontal Navigation Menu */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 h-auto py-2 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}