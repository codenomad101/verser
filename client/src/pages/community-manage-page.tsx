import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversalHeader } from '@/components/universal-header';
import { UniversalFooter } from '@/components/universal-footer';
import { 
  Users, 
  Settings,
  Shield,
  UserPlus,
  UserMinus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Filter,
  MoreHorizontal,
  Crown,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

export function CommunityManagePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Community data
  const { data: community, isLoading: communityLoading, error: communityError } = useQuery({
    queryKey: [`/api/communities/${id}`],
    enabled: !!id,
  });

  // Community members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: [`/api/communities/${id}/members`],
    enabled: !!id,
  });

  // User's role in community
  const { data: userRole } = useQuery({
    queryKey: [`/api/communities/${id}/role`],
    enabled: !!id && !!user,
  });

  // Pending applications (if any)
  const { data: pendingApplications } = useQuery({
    queryKey: [`/api/communities/${id}/applications`],
    enabled: !!id,
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number; newRole: string }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${id}/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/members`] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to remove member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${id}/members`] });
    },
  });

  // Delete community mutation
  const deleteCommunityMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/communities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete community');
      return response.json();
    },
    onSuccess: () => {
      setLocation('/communities/home');
    },
  });

  const isAdmin = userRole === 'admin';
  const isMaintainer = userRole === 'maintainer';
  const canManage = isAdmin || isMaintainer;

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <UniversalHeader showBackButton={true} backButtonText="Back to Community" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community management...</p>
          </div>
        </div>
        <UniversalFooter />
      </div>
    );
  }

  if (communityError || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <UniversalHeader showBackButton={true} backButtonText="Back to Community" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Community not found</h1>
            <p className="text-gray-600 mb-4">The community you're trying to manage doesn't exist.</p>
            <Button onClick={() => setLocation('/communities/home')}>Go to Communities</Button>
          </div>
        </div>
        <UniversalFooter />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
        <UniversalHeader showBackButton={true} backButtonText="Back to Community" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to manage this community.</p>
            <Button onClick={() => setLocation(`/community/${id}`)}>View Community</Button>
          </div>
        </div>
        <UniversalFooter />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', icon: Crown },
      maintainer: { color: 'bg-blue-100 text-blue-800', icon: Shield },
      member: { color: 'bg-green-100 text-green-800', icon: UserCheck },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{role}</span>
      </Badge>
    );
  };

  const filteredMembers = members?.filter((member: any) => {
    const matchesSearch = member.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleUpdateRole = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const handleRemoveMember = (userId: number) => {
    if (confirm('Are you sure you want to remove this member from the community?')) {
      removeMemberMutation.mutate(userId);
    }
  };

  const handleDeleteCommunity = () => {
    if (confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      deleteCommunityMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Universal Header */}
      <UniversalHeader 
        showBackButton={true}
        backButtonText="Back to Community"
        title={`Manage ${community.name}`}
        subtitle="Community administration and member management"
      />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Community Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Community Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl font-bold">
                      {community.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <p className="text-sm text-gray-600">{community.description}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Members:</span>
                    <span className="font-medium">{members?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admins:</span>
                    <span className="font-medium">
                      {members?.filter((m: any) => m.role === 'admin').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maintainers:</span>
                    <span className="font-medium">
                      {members?.filter((m: any) => m.role === 'maintainer').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">
                      {members?.filter((m: any) => m.role === 'member').length || 0}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowEditCommunity(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Community
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleDeleteCommunity}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Community
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation(`/community/${id}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Community
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('applications')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Review Applications
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Management Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-6">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Label htmlFor="search">Search Members</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="search"
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="w-48">
                        <Label htmlFor="role-filter">Filter by Role</Label>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All roles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                            <SelectItem value="maintainer">Maintainers</SelectItem>
                            <SelectItem value="member">Members</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Members List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Community Members ({filteredMembers.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {membersLoading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredMembers.length > 0 ? (
                        <div className="space-y-2">
                          {filteredMembers.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatar || ""} />
                                  <AvatarFallback>
                                    {member.username?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-gray-900 truncate">
                                      {member.username}
                                    </p>
                                    {getRoleBadge(member.role)}
                                  </div>
                                  <p className="text-sm text-gray-500 truncate">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {canManage && member.id !== user?.id && (
                                  <>
                                    <Select
                                      value={member.role}
                                      onValueChange={(newRole) => handleUpdateRole(member.id, newRole)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="maintainer">Maintainer</SelectItem>
                                        {isAdmin && <SelectItem value="admin">Admin</SelectItem>}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMember(member.id)}
                                      disabled={removeMemberMutation.isPending}
                                    >
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                          <p className="text-gray-500">
                            {searchQuery ? 'Try adjusting your search criteria.' : 'This community has no members yet.'}
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingApplications && pendingApplications.length > 0 ? (
                      <div className="space-y-4">
                        {pendingApplications.map((application: any) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={application.user?.avatar || ""} />
                                <AvatarFallback>
                                  {application.user?.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{application.user?.username}</p>
                                <p className="text-sm text-gray-500">
                                  Applied {formatDistanceToNow(new Date(application.createdAt))} ago
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive">
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                        <p className="text-gray-500">All applications have been reviewed.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="community-name">Community Name</Label>
                      <Input id="community-name" defaultValue={community.name} />
                    </div>
                    <div>
                      <Label htmlFor="community-description">Description</Label>
                      <Textarea 
                        id="community-description" 
                        defaultValue={community.description}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="community-location">Location</Label>
                      <Input id="community-location" defaultValue={community.location || ""} />
                    </div>
                    <div>
                      <Label htmlFor="community-website">Website</Label>
                      <Input id="community-website" defaultValue={community.website || ""} />
                    </div>
                    <Button className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
