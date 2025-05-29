import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Users, MessageCircle, Heart, Share, Play, Hash, Video, FileText, Clock, Star, Flame, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface DiscoverySectionProps {
  currentUser: { id: number; username: string };
}

export default function EnhancedDiscovery({ currentUser }: DiscoverySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState("posts");
  const [sortBy, setSortBy] = useState("trending");

  const { data: posts = [] } = useQuery({
    queryKey: ["/api/posts"],
  });

  const { data: trendingPosts = [] } = useQuery({
    queryKey: ["/api/posts/trending"],
  });

  const { data: communities = [] } = useQuery({
    queryKey: ["/api/communities"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Enhanced posts with video and short content types
  const enhancedPosts = posts.map((post: any) => ({
    ...post,
    contentType: post.imageUrl ? (post.imageUrl.includes('video') ? 'video' : 'image') : 'text',
    duration: post.imageUrl?.includes('video') ? `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
    views: Math.floor(Math.random() * 50000) + 1000,
    isShort: Math.random() > 0.7,
  }));

  const getSortedContent = (content: any[]) => {
    switch (sortBy) {
      case "latest":
        return [...content].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "popular":
        return [...content].sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
      case "trending":
      default:
        return trendingPosts.length > 0 ? trendingPosts : content.slice(0, 10);
    }
  };

  const getFilteredContent = () => {
    let filtered = enhancedPosts;
    
    // Filter by content type
    switch (contentType) {
      case "videos":
        filtered = enhancedPosts.filter(post => post.contentType === 'video' && !post.isShort);
        break;
      case "shorts":
        filtered = enhancedPosts.filter(post => post.isShort || (post.contentType === 'video' && Math.random() > 0.5));
        break;
      case "posts":
      default:
        filtered = enhancedPosts.filter(post => post.contentType === 'text' || !post.isShort);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return getSortedContent(filtered);
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case "latest": return <Clock className="h-4 w-4" />;
      case "popular": return <Star className="h-4 w-4" />;
      case "trending": return <Flame className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const renderVideoCard = (post: any) => (
    <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <div className="relative">
            <Play className="h-16 w-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-black/20 rounded-full group-hover:bg-black/10 transition-colors"></div>
          </div>
        </div>
        {post.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
            {post.duration}
          </Badge>
        )}
        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
          {contentType === "shorts" ? "SHORT" : "VIDEO"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{post.title || post.content.slice(0, 50) + "..."}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{post.views.toLocaleString()} views</span>
          </div>
          <span>{format(new Date(post.createdAt), 'MMM d')}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </div>
          </div>
          <Button size="sm" variant="ghost">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPostCard = (post: any) => (
    <Card key={post.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {users.find((u: any) => u.id === post.userId)?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="font-semibold">{users.find((u: any) => u.id === post.userId)?.username || 'User'}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{format(new Date(post.createdAt), 'MMM d, h:mm a')}</span>
                {sortBy === "trending" && <Badge className="bg-orange-500 text-white text-xs">Trending</Badge>}
              </div>
            </div>
          </div>
        </div>
        
        {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
        <p className="text-gray-700 mb-3">{post.content}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
              <Share className="h-4 w-4" />
              <span className="text-sm">{post.shares}</span>
            </button>
          </div>
          {post.views && (
            <div className="flex items-center space-x-1 text-sm">
              <Eye className="h-4 w-4" />
              <span>{post.views.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const content = getFilteredContent();

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts, videos, and shorts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content Type and Sort Controls */}
        <div className="flex items-center space-x-4">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posts">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Posts</span>
                </div>
              </SelectItem>
              <SelectItem value="videos">
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Videos</span>
                </div>
              </SelectItem>
              <SelectItem value="shorts">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Shorts</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <div className="flex items-center space-x-2">
                {getSortIcon()}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4" />
                  <span>Trending</span>
                </div>
              </SelectItem>
              <SelectItem value="latest">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Latest</span>
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Popular</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">
            {sortBy} {contentType}
          </h2>
          <Badge variant="outline">
            {content.length} results
          </Badge>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            contentType === "videos" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : contentType === "shorts"
              ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
              : "space-y-4"
          }>
            {content.map((post: any) => 
              contentType === "videos" || contentType === "shorts" 
                ? renderVideoCard(post)
                : renderPostCard(post)
            )}
          </div>
        )}
      </div>
    </div>
  );
}