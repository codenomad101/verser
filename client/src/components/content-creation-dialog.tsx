import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Image, 
  Video, 
  Camera, 
  Type, 
  Hash, 
  Upload,
  Plus,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Globe,
  Users,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDarkMode } from '@/hooks/use-dark-mode';

interface ContentCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: 'post' | 'short' | 'video';
}

type ContentType = 'post' | 'short' | 'video';

export function ContentCreationDialog({ isOpen, onClose, contentType = 'post' }: ContentCreationDialogProps) {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<ContentType>(contentType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/trending'] });
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating post:', error);
    },
  });

  const handleClose = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setMediaFile(null);
    setMediaPreview(null);
    setIsUploading(false);
    setPrivacy('public');
    setIsPlaying(false);
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrl = null;
      
      // In a real app, you would upload the file to a cloud service
      // For now, we'll simulate the upload
      if (mediaFile) {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        mediaUrl = URL.createObjectURL(mediaFile); // In real app, this would be the uploaded URL
      }

      const postData = {
        userId: user?.id,
        title: title.trim() || null,
        content: content.trim(),
        type: selectedType,
        imageUrl: selectedType === 'post' && mediaUrl ? mediaUrl : null,
        videoUrl: (selectedType === 'video' || selectedType === 'short') && mediaUrl ? mediaUrl : null,
        tags: tags.length > 0 ? tags : null,
      };

      await createPostMutation.mutateAsync(postData);
    } catch (error) {
      console.error('Error creating content:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'post': return <Image className="h-5 w-5" />;
      case 'short': return <Camera className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      default: return <Type className="h-5 w-5" />;
    }
  };

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'post': return 'Photo Post';
      case 'short': return 'Short Video';
      case 'video': return 'Video';
      default: return 'Text Post';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-2xl max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Create Content</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Content Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['post', 'short', 'video'] as ContentType[]).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className="flex flex-col items-center space-y-2 h-20"
                  onClick={() => setSelectedType(type)}
                >
                  {getContentTypeIcon(type)}
                  <span className="text-xs">{getContentTypeLabel(type)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{user?.username}</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setPrivacy(privacy === 'public' ? 'followers' : privacy === 'followers' ? 'private' : 'public')}
                >
                  {privacy === 'public' && <Globe className="h-3 w-3 mr-1" />}
                  {privacy === 'followers' && <Users className="h-3 w-3 mr-1" />}
                  {privacy === 'private' && <Lock className="h-3 w-3 mr-1" />}
                  {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
                </Button>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title (Optional)</label>
            <Input
              placeholder="Add a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {selectedType === 'post' ? 'Photo' : selectedType === 'short' ? 'Short Video' : 'Video'}
            </label>
            
            {!mediaFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload {selectedType === 'post' ? 'a photo' : 'a video'}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedType === 'post' ? 'JPG, PNG up to 10MB' : 'MP4, MOV up to 100MB'}
                </p>
              </div>
            ) : (
              <div className="relative">
                {selectedType === 'post' ? (
                  <div className="relative">
                    <img
                      src={mediaPreview || ''}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveMedia}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={mediaPreview || ''}
                      className="w-full h-64 object-cover rounded-lg"
                      controls={false}
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                        }
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveMedia}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 left-2"
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                          } else {
                            videoRef.current.play();
                          }
                          setIsPlaying(!isPlaying);
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept={selectedType === 'post' ? 'image/*' : 'video/*'}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Content Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleAddTag} disabled={!tagInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <Hash className="h-3 w-3" />
                    <span>{tag}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={(!content.trim() && !mediaFile) || isUploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create {getContentTypeLabel(selectedType)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
