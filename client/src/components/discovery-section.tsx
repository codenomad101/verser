import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  Search, 
  Plus, 
  Play, 
  Camera,
  Video,
  Upload,
  TrendingUp,
  Clock,
  Flame
} from "lucide-react";
import { format } from "date-fns";
import NewPostDialog from "@/components/new-post-dialog";

interface DiscoverySectionProps {
  currentUser: { id: number; username: string };
}

export default function DiscoverySection({ currentUser }: DiscoverySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"trending" | "recent" | "following">("trending");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ["/api/posts", selectedTab],
    queryFn: () => {
      const endpoint = selectedTab === "trending" ? "/api/posts/trending" : "/api/posts";
      return fetch(endpoint).then(res => res.json());
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("PATCH", `/api/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const filteredPosts = (posts && Array.isArray(posts)) ? posts.filter((post: any) =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "image": return <Camera className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "short": return <Play className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-white/30">
            <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
              {currentUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{currentUser.username}</h3>
            <p className="text-xs text-purple-100">Discovery</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
              onClick={() => setShowNewPostDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs">Discover</span>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="p-4 bg-white border-b">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search posts, creators, hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedTab === "trending" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab("trending")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={selectedTab === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab("recent")}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Recent
          </Button>
          <Button
            variant={selectedTab === "following" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab("following")}
            className="flex items-center gap-2"
          >
            <Flame className="h-4 w-4" />
            Following
          </Button>
        </div>
      </div>

      {/* Create Post Area */}
      {!isMobile && (
        <div className="p-4 bg-white border-b">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {currentUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-gray-500"
              onClick={() => setShowNewPostDialog(true)}
            >
              Share your moment with the world...
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => setShowNewPostDialog(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:bg-red-50"
              onClick={() => setShowNewPostDialog(true)}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:bg-purple-50"
              onClick={() => setShowNewPostDialog(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Shorts
            </Button>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <ScrollArea className="flex-1 bg-gray-50">
        <div className="p-4 space-y-4">
          {filteredPosts.length > 0 ? filteredPosts.map((post: any) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {post.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {post.user?.username || 'User'}
                      </span>
                      {post.type && post.type !== "text" && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          {getPostTypeIcon(post.type)}
                          {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(post.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                {post.title && (
                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                )}
                <p className="text-gray-700 mb-3">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Content */}
              {post.imageUrl && (
                <div className="relative">
                  <img 
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}

              {post.videoUrl && (
                <div className="relative bg-black">
                  <video 
                    src={post.videoUrl}
                    className="w-full h-64 md:h-80 object-cover"
                    controls
                    poster={post.imageUrl}
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button 
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                      onClick={() => likePostMutation.mutate(post.id)}
                    >
                      <Heart className="h-5 w-5" />
                      <span className="text-sm">{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{post.comments || 0}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Share className="h-5 w-5" />
                      <span className="text-sm">{post.shares || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">Be the first to share something amazing!</p>
              <Button onClick={() => setShowNewPostDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* New Post Dialog */}
      <NewPostDialog 
        open={showNewPostDialog}
        onOpenChange={setShowNewPostDialog}
        currentUser={currentUser}
        onPostCreated={() => {
          setShowNewPostDialog(false);
        }}
      />
    </div>
  );
}