import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Users, MessageSquare, Users2, BarChart3, Trash2, Shield, Eye } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCommunities: number;
  totalPosts: number;
  totalConversations: number;
  onlineUsers: number;
  trendingPosts: number;
  recentUsers: Array<{
    id: number;
    username: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
  recentPosts: Array<{
    id: number;
    content: string;
    likes: number;
    comments: number;
    createdAt: string;
  }>;
}

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  bio?: string;
  createdAt: string;
  avatar?: string;
}

interface Post {
  id: number;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  isTrending: boolean;
  createdAt: string;
  userId: number;
}

interface Community {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  onlineCount: number;
  createdAt: string;
}

type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';
interface FoodOrder {
  id: number;
  userId: number;
  items: Array<{ id: number; name: string; price: number; quantity: number }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
interface TravelBooking {
  id: number;
  userId: number;
  type: 'bus' | 'train' | 'hotel' | string;
  from?: string | null;
  to?: string | null;
  location?: string | null;
  travelDate?: string | null;
  details?: any;
  price: number;
  status: BookingStatus;
  createdAt: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, postsRes, communitiesRes, ordersRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/posts', { headers }),
        fetch('/api/admin/communities', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/travel-bookings', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
      if (communitiesRes.ok) setCommunities(await communitiesRes.json());

      // Check current user role
      const meToken = localStorage.getItem('auth_token');
      if (meToken) {
        const meRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${meToken}` } });
        if (meRes.ok) {
          const me = await meRes.json();
          setIsSuperuser(me.role === 'superuser');
        }
      }
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status } : user
        ));
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const updateUserRole = async (userId: number, role: 'user' | 'admin' | 'superuser') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/superuser/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      }
    } catch (e) {
      console.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: BookingStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/travel-bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your community platform</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.onlineUsers} online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communities</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommunities}</div>
              <p className="text-xs text-muted-foreground">
                Active communities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.trendingPosts} trending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                Active chats
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                            ) : (
                              <span className="text-sm font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'online' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isSuperuser ? (
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={(user as any).role || 'user'}
                            onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="superuser">superuser</option>
                          </select>
                        ) : (
                          <Badge variant="secondary">{(user as any).role || 'user'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatus(user.id, user.status === 'online' ? 'offline' : 'online')}
                          >
                            {user.status === 'online' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Management</CardTitle>
              <CardDescription>
                Monitor and moderate community posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {post.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>❤️ {post.likes}</div>
                          <div>💬 {post.comments}</div>
                          <div>🔄 {post.shares}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.isTrending && (
                          <Badge variant="default">Trending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Management</CardTitle>
              <CardDescription>
                Oversee community growth and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Community</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Online</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((community) => (
                    <TableRow key={community.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{community.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {community.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{community.memberCount}</TableCell>
                      <TableCell>{community.onlineCount}</TableCell>
                      <TableCell>
                        {new Date(community.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>Manage food orders created by users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="text-sm">
                          {order.items?.slice(0, 3).map((i) => i.name).join(', ')}
                          {order.items && order.items.length > 3 ? '…' : ''}
                        </div>
                      </TableCell>
                      <TableCell>{order.userId}</TableCell>
                      <TableCell>₹{order.total}</TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'preparing')}>Preparing</Button>
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'delivered')}>Delivered</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>Cancel</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Bookings</CardTitle>
              <CardDescription>Manage user travel bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Route / Location</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="capitalize">{b.type}</TableCell>
                      <TableCell>
                        {b.type === 'hotel' ? (
                          <span>{b.location}</span>
                        ) : (
                          <span>{b.from} → {b.to}</span>
                        )}
                      </TableCell>
                      <TableCell>{b.userId}</TableCell>
                      <TableCell>₹{b.price}</TableCell>
                      <TableCell><Badge>{b.status}</Badge></TableCell>
                      <TableCell>{b.travelDate ? new Date(b.travelDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'completed')}>Complete</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(b.id, 'cancelled')}>Cancel</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
