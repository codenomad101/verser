import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NewCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: { id: number; username: string };
  onCommunityCreated?: (communityId: number) => void;
}

export default function NewCommunityDialog({ 
  open, 
  onOpenChange, 
  currentUser, 
  onCommunityCreated 
}: NewCommunityDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💻");
  const [color, setColor] = useState("#3B82F6");
  const [type, setType] = useState("public");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCommunityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/communities", data);
      return response.json();
    },
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: ["/api/communities"] });
      onCommunityCreated?.(community.id);
      onOpenChange(false);
      resetForm();
      toast({
        title: "Community created",
        description: `${community.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("💻");
    setColor("#3B82F6");
    setType("public");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCommunityMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      type,
      memberCount: 1,
      onlineCount: 1,
    });
  };

  const iconOptions = [
    { value: "💻", label: "💻 Technology" },
    { value: "🎨", label: "🎨 Creative" },
    { value: "🚀", label: "🚀 Startup" },
    { value: "📸", label: "📸 Photography" },
    { value: "🎵", label: "🎵 Music" },
    { value: "🏋️", label: "🏋️ Fitness" },
    { value: "🍳", label: "🍳 Cooking" },
    { value: "📚", label: "📚 Learning" },
    { value: "🎮", label: "🎮 Gaming" },
    { value: "🌍", label: "🌍 Travel" },
  ];

  const colorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Yellow" },
    { value: "#EF4444", label: "Red" },
    { value: "#06B6D4", label: "Cyan" },
    { value: "#F97316", label: "Orange" },
    { value: "#84CC16", label: "Lime" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter community name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your community"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color Theme</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: option.value }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Community Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Public - Anyone can find and request to join
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Private - Only visible to members
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCommunityMutation.isPending || !name.trim()}
            >
              {createCommunityMutation.isPending ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}