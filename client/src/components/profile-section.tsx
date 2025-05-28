import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Heart, 
  MessageCircle, 
  Share,
  Eye,
  EyeOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProfileSectionProps {
  currentUser: { id: number; username: string };
}

export default function ProfileSection({ currentUser }: ProfileSectionProps) {
  const { user, updateSettingsMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: user?.bio || "",
    about: user?.about || "",
    avatar: user?.avatar || "",
    showLastSeen: user?.showLastSeen ?? true,
    showOnlineStatus: user?.showOnlineStatus ?? true,
  });

  // Fetch user posts
  const { data: userPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "posts"],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${user?.id}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const handleSaveProfile = () => {
    updateSettingsMutation.mutate(editForm, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancelEdit = () => {
    setEditForm({
      bio: user?.bio || "",
      about: user?.about || "",
      avatar: user?.avatar || "",
      showLastSeen: user?.showLastSeen ?? true,
      showOnlineStatus: user?.showOnlineStatus ?? true,
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={isEditing ? editForm.avatar : user.avatar || ""} />
                <AvatarFallback className="text-2xl">
                  {user.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.status === "online" ? "default" : "secondary"}>
                        {user.status === "online" ? "Online" : "Offline"}
                      </Badge>
                      {user.lastSeen && user.showLastSeen && (
                        <span className="text-sm text-gray-500">
                          Last seen {formatDistanceToNow(new Date(user.lastSeen))} ago
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                  >
                    {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="avatar">Profile Image URL</Label>
                      <Input
                        id="avatar"
                        value={editForm.avatar}
                        onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                        placeholder="https://example.com/your-image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Tell us about yourself in a few words"
                      />
                    </div>
                    <div>
                      <Label htmlFor="about">About</Label>
                      <Textarea
                        id="about"
                        value={editForm.about}
                        onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                        placeholder="Share more details about yourself"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.bio && (
                      <p className="text-gray-700 font-medium">{user.bio}</p>
                    )}
                    {user.about && (
                      <p className="text-gray-600">{user.about}</p>
                    )}
                    {!user.bio && !user.about && (
                      <p className="text-gray-500 italic">No bio added yet</p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(user.createdAt))} ago</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Last Seen</Label>
                  <div className="text-sm text-gray-500">
                    Let others see when you were last active
                  </div>
                </div>
                <Switch
                  checked={editForm.showLastSeen}
                  onCheckedChange={(checked) => 
                    setEditForm({ ...editForm, showLastSeen: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Online Status</Label>
                  <div className="text-sm text-gray-500">
                    Display your online/offline status to others
                  </div>
                </div>
                <Switch
                  checked={editForm.showOnlineStatus}
                  onCheckedChange={(checked) => 
                    setEditForm({ ...editForm, showOnlineStatus: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userPosts.length}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Likes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userPosts.reduce((sum, post) => sum + (post.comments || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Comments</div>
            </CardContent>
          </Card>
        </div>

        {/* User Posts */}
        <Card>
          <CardHeader>
            <CardTitle>My Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No posts yet</p>
                <p className="text-sm">Start sharing your thoughts with the community!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || ""} />
                        <AvatarFallback>
                          {user.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.username}</span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                          </span>
                          {post.isTrending && (
                            <Badge variant="secondary">Trending</Badge>
                          )}
                        </div>
                        {post.title && (
                          <h3 className="font-semibold mt-1">{post.title}</h3>
                        )}
                        <p className="text-gray-700 mt-2">{post.content}</p>
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl} 
                            alt="Post image" 
                            className="mt-3 rounded-lg max-w-full h-auto"
                          />
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share className="h-4 w-4" />
                            <span>{post.shares || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}