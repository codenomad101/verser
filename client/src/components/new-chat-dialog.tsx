import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: { id: number; username: string };
  onRequestSent?: () => void;
}

export default function NewChatDialog({ open, onOpenChange, currentUser, onRequestSent }: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    select: (data) => Array.isArray(data) ? data : [],
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (payload: { receiverId: number; content: string }) => {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to send chat request');
      }
      return res.json();
    },
    onSuccess: () => {
      onRequestSent && onRequestSent();
      onOpenChange(false);
      setSearchQuery("");
      setMessage("");
    },
  });

  const filteredUsers = users.filter((user: any) => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartChat = (user: any) => {
    if (!message.trim()) return;
    sendRequestMutation.mutate({ receiverId: user.id, content: message });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start New Chat
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Message Input */}
          <div>
            <Input
              placeholder="Write a message request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No users found' : 'Loading users...'}
              </div>
            ) : (
              filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => handleStartChat(user)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <AvatarFallback>
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-500">{user.bio}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
disabled={sendRequestMutation.isPending}
                  >
                    Chat
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}