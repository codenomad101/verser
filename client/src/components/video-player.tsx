import { useState } from "react";
import { X, Maximize, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  video: any;
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
}

export default function VideoPlayer({ video, isFullscreen, onClose, onToggleFullscreen }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={`${
      isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative bg-gray-900 rounded-lg overflow-hidden'
    } transition-all duration-300`}>
      {/* Video Content */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center`}>
        {/* Placeholder for video content */}
        <div className="text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </div>
          <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
          <p className="text-sm text-gray-300">{video.duration} • {video.views.toLocaleString()} views</p>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="absolute top-4 right-4 flex gap-2">
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Play/Pause Control */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/20 w-16 h-16 rounded-full"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            {isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                Exit Fullscreen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Video Info (only shown when not fullscreen) */}
      {!isFullscreen && (
        <div className="p-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{video.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{video.views.toLocaleString()} views</span>
                <span>{video.likes.toLocaleString()} likes</span>
                <span>{video.comments.toLocaleString()} comments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}