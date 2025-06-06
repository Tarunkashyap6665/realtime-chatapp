"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  Download,
  FileText,
  ImageIcon,
  Music,
  Video,
  Eye,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { formatFileSize, formatDuration } from "@/lib/file-upload";
import type { Message } from "@/lib/models";
import { Dialog, DialogContent } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { constructDownloadUrl } from "@/lib/utils";
interface MediaMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MediaMessage({
  message,
  isOwnMessage,
}: MediaMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mediaElement = audioRef.current || videoRef.current;
    if (mediaElement) {
      const handleLoadedMetadata = () => {
        setDuration(mediaElement.duration);
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(mediaElement.currentTime);
      };

      const handleError = () => {
        setError("Failed to load media");
        setIsLoading(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      mediaElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      mediaElement.addEventListener("timeupdate", handleTimeUpdate);
      mediaElement.addEventListener("error", handleError);
      mediaElement.addEventListener("ended", handleEnded);

      return () => {
        mediaElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        mediaElement.removeEventListener("timeupdate", handleTimeUpdate);
        mediaElement.removeEventListener("error", handleError);
        mediaElement.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  const handleDownload = async () => {
    if (message.mediaUrl) {
      try {
        const link = document.createElement("a");
        link.href = constructDownloadUrl(message.fileId || "");
        link.download = message.mediaName || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  const togglePlayPause = () => {
    const mediaElement = audioRef.current || videoRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mediaElement = audioRef.current || videoRef.current;
    if (mediaElement) {
      const newTime = Number.parseFloat(e.target.value);
      mediaElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    const mediaElement = audioRef.current || videoRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackRate = () => {
    const mediaElement = audioRef.current || videoRef.current;
    if (mediaElement) {
      const rates = [1, 1.25, 1.5, 2];
      const currentIndex = rates.indexOf(playbackRate);
      const nextRate = rates[(currentIndex + 1) % rates.length];
      mediaElement.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  const getMediaIcon = (isOwnMessage: boolean) => {
    switch (message.type) {
      case "image":
        return (
          <ImageIcon className={`size-4 ${isOwnMessage ? "text-white" : ""}`} />
        );
      case "audio":
        return (
          <Music className={`size-4 ${isOwnMessage ? "text-white" : ""}`} />
        );
      case "video":
        return (
          <Video className={`size-4 ${isOwnMessage ? "text-white" : ""}`} />
        );
      default:
        return (
          <FileText className={`size-4 ${isOwnMessage ? "text-white" : ""}`} />
        );
    }
  };

  const renderImageMessage = () => (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-lg cursor-pointer"
        onClick={() => setShowPreview(true)}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <img
          src={message.mediaUrl || "/placeholder.svg"}
          alt={message.mediaName}
          className={`max-w-xs max-h-64 rounded-lg transition-opacity ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError("Failed to load image");
            setIsLoading(false);
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(true);
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </motion.div>

      {/* Image Preview Modal */}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTitle />
        <DialogContent
          className="rounded-lg border-none p-2 bg-transparent sm:p-0"
          aria-describedby={undefined}
        >
          <div className="relative w-fit mx-auto max-h-[90vh] flex items-center justify-center">
            <img
              src={message.mediaUrl || "/placeholder.svg"}
              alt={message.mediaName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute top-4 left-4 flex space-x-2">
              <Button variant="secondary" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="max-w-xs p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );

  const renderAudioMessage = () => (
    <Card
      className={`p-4 max-w-sm w-full ${
        isOwnMessage ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          disabled={isLoading || !!error}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate max-w-36 sm:max-w-none">
            {message.mediaName || "Audio Message"}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>
              {formatDuration(currentTime)} /{" "}
              {formatDuration(message.mediaDuration || 0)}
            </span>
            <span>•</span>
            <span>{formatFileSize(message.mediaSize || 0)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={changePlaybackRate}
            className="p-1 text-xs"
            title="Playback speed"
          >
            {playbackRate}x
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="p-1"
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="p-1"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <input
          type="range"
          min="0"
          max={message.mediaDuration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={isLoading || !!error}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              (currentTime / (message.mediaDuration || 1)) * 100
            }%, #e5e7eb ${
              (currentTime / (message.mediaDuration || 1)) * 100
            }%, #e5e7eb 100%)`,
          }}
        />
      </div>

      {/* Waveform visualization for playing audio */}
      {isPlaying && (
        <div className="flex items-center justify-center space-x-1 h-6 mb-2">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [4, Math.random() * 16 + 4, 4],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-0.5 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      )}

      <audio
        ref={audioRef}
        src={message.mediaUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        className="hidden"
      />

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </Card>
  );

  const renderVideoMessage = () => (
    <div className="relative max-w-sm group">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center z-10">
          <Video className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <video
        ref={videoRef}
        src={message.mediaUrl}
        poster={message.thumbnailUrl}
        controls
        className={`w-full rounded-lg transition-opacity ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        style={{ maxHeight: "300px" }}
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setError("Failed to load video");
          setIsLoading(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {message.mediaDuration && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {formatDuration(message.mediaDuration || 0)}
        </div>
      )}
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDownload}
      >
        <Download className="w-3 h-3" />
      </Button>

      {error && (
        <div className="max-w-sm p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );

  const renderFileMessage = () => (
    <Card className="p-3 max-w-sm">
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg ${
            isOwnMessage ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          {getMediaIcon(isOwnMessage)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{message.mediaName}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(message.mediaSize || 0)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );

  const renderMediaContent = () => {
    switch (message.type) {
      case "image":
        return renderImageMessage();
      case "audio":
        return renderAudioMessage();
      case "video":
        return renderVideoMessage();
      case "file":
        return renderFileMessage();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {renderMediaContent()}
      {message.content && message.content !== `Sent ${message.type}` && (
        <p
          className={`text-sm ${
            isOwnMessage ? "text-blue-100" : "text-gray-700"
          }`}
        >
          {message.content}
        </p>
      )}
    </div>
  );
}
