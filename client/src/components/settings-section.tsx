import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Bell, Shield, Globe, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SettingsSectionProps {
  onClose: () => void;
}

export default function SettingsSection({ onClose }: SettingsSectionProps) {
  const { user, updateSettingsMutation, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [showLastSeen, setShowLastSeen] = useState(user?.showLastSeen || false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(user?.showOnlineStatus || false);

  const handleSaveProfile = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        username,
        bio,
        location,
        website,
        showLastSeen,
        showOnlineStatus,
      });
      toast({
        title: "Profile updated!",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close Settings
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                  {user?.isVerified && (
                    <Badge variant="default" className="bg-blue-500">
                      Verified
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Update your profile information and how others see you on Verser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Your location"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <div className="text-sm text-gray-600">
                    <strong>Followers:</strong> {user?.followersCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Following:</strong> {user?.followingCount || 0}
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>
                  Control who can see your information and activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-last-seen">Show Last Seen</Label>
                    <p className="text-sm text-gray-600">Let others see when you were last active</p>
                  </div>
                  <Switch
                    id="show-last-seen"
                    checked={showLastSeen}
                    onCheckedChange={setShowLastSeen}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-online-status">Show Online Status</Label>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                  <Switch
                    id="show-online-status"
                    checked={showOnlineStatus}
                    onCheckedChange={setShowOnlineStatus}
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Messages</Label>
                    <p className="text-sm text-gray-600">Get notified when someone sends you a message</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Post Likes</Label>
                    <p className="text-sm text-gray-600">Get notified when someone likes your posts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Followers</Label>
                    <p className="text-sm text-gray-600">Get notified when someone follows you</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Trending Topics</Label>
                    <p className="text-sm text-gray-600">Get notified about trending topics you might be interested in</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>
                  Customize how Verser looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-gray-600 mb-3">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" className="h-20 flex flex-col">
                      <div className="w-8 h-8 bg-white border rounded mb-2"></div>
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <div className="w-8 h-8 bg-gray-800 rounded mb-2"></div>
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col">
                      <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
                      <span className="text-xs">Auto</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Font Size</Label>
                  <p className="text-sm text-gray-600 mb-3">Adjust text size for better readability</p>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="default" size="sm">Medium</Button>
                    <Button variant="outline" size="sm">Large</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Account Management</span>
                </CardTitle>
                <CardDescription>
                  Manage your account settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email} disabled className="bg-gray-50" />
                  <p className="text-sm text-gray-600 mt-1">Contact support to change your email address</p>
                </div>

                <Separator />

                <div>
                  <Label>Account Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={user?.isVerified ? "default" : "secondary"}>
                      {user?.isVerified ? "Verified Account" : "Unverified Account"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.isVerified 
                      ? "Your account is verified and has access to all Verser features"
                      : "Verify your account to access premium features"
                    }
                  </p>
                </div>

                <Separator />

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-600 mb-4">
                    These actions are permanent and cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log Out"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}